import { useParams, useLocation } from "wouter";
import { useInvoices, useClients, useItems, useCompanyProfile } from "@/lib/storage";
import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type Invoice, type InvoiceItem } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Trash2, Plus, Save, ArrowLeft, Download, Printer, Settings2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import InvoicePDF from "@/components/shared/InvoicePDF";

export default function InvoiceBuilder() {
  const { id } = useParams(); // if id exists, it's edit mode
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { invoices, addInvoice, updateInvoice, getNextInvoiceNumber } = useInvoices();
  const { clients } = useClients();
  const { items: savedItems } = useItems();
  const { profile } = useCompanyProfile();
  
  const isEditMode = id && id !== "new";
  const existingInvoice = isEditMode ? invoices.find(inv => inv.id === id) : null;
  
  const [template, setTemplate] = useState<"modern" | "corporate" | "minimal">("modern");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const form = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: existingInvoice || {
      id: uuidv4(),
      invoiceNumber: getNextInvoiceNumber(),
      date: new Date().toISOString(),
      dueDate: addDays(new Date(), 14).toISOString(),
      clientId: "",
      items: [{ id: uuidv4(), name: "", quantity: 1, price: 0, description: "" }],
      notes: "",
      subtotal: 0,
      taxTotal: 0,
      discountType: "fixed",
      discountValue: 0,
      taxType: "exclude",
      discountCalculation: "before_tax",
      grandTotal: 0,
      status: "draft",
      currency: profile.currency,
    }
  });

  const { fields,append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Calculations Effect
  const watchedItems = form.watch("items");
  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");
  const taxType = form.watch("taxType");
  const discountCalculation = form.watch("discountCalculation");

  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let baseForTax = subtotal;
    let discountAmount = 0;

    // 1. Calculate Discount
    if (discountType === "fixed") {
      discountAmount = discountValue;
    } else {
      discountAmount = subtotal * (discountValue / 100);
    }

    // 2. Calculate Tax
    let taxAmount = 0;
    const taxRate = profile.defaultVat / 100;

    if (taxType === "include") {
      // If tax is included, it's already in the subtotal
      taxAmount = subtotal - (subtotal / (1 + taxRate));
    } else {
      // If tax is excluded, calculate it based on subtotal (adjusted for discount if before_tax)
      const calculationBase = discountCalculation === "before_tax" 
        ? (subtotal - discountAmount) 
        : subtotal;
      taxAmount = Math.max(0, calculationBase * taxRate);
    }

    const grandTotal = taxType === "include" 
      ? (subtotal - discountAmount)
      : (subtotal - discountAmount + taxAmount);

    form.setValue("subtotal", subtotal);
    form.setValue("taxTotal", taxAmount);
    form.setValue("grandTotal", grandTotal);
  }, [JSON.stringify(watchedItems), discountType, discountValue, taxType, discountCalculation, profile.defaultVat, form.setValue]);

  const onSubmit = (data: Invoice) => {
    if (isEditMode) {
      updateInvoice(data.id, data);
    } else {
      addInvoice(data);
    }
    setLocation("/invoices");
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${form.getValues("invoiceNumber")}.pdf`);
      
      toast({ title: "PDF Downloaded", description: "Invoice saved successfully." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  // Pre-fill item details when selecting from saved items
  const handleItemSelect = (index: number, itemId: string) => {
    const item = savedItems.find(i => i.id === itemId);
    if (item) {
      form.setValue(`items.${index}.name`, item.name);
      form.setValue(`items.${index}.description`, item.description || "");
      form.setValue(`items.${index}.price`, item.price);
      form.setValue(`items.${index}.itemId`, item.id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/invoices")}>
               <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-display">
                {isEditMode ? "Edit Tagihan" : "Tagihan Baru"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isEditMode ? `Mengedit ${existingInvoice?.invoiceNumber}` : "Buat tagihan baru untuk klien Anda"}
              </p>
            </div>
         </div>
         <div className="flex gap-2">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
               <DialogTrigger asChild>
                  <Button variant="outline">
                    <Printer className="w-4 h-4 mr-2" /> Pratinjau
                  </Button>
               </DialogTrigger>
               <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-4 sticky top-0 bg-background z-10 py-2 border-b">
                    <div className="flex items-center gap-4">
                       <h3 className="font-bold">Pratinjau</h3>
                       <Tabs value={template} onValueChange={(v: any) => setTemplate(v)}>
                          <TabsList>
                             <TabsTrigger value="modern">Modern</TabsTrigger>
                             <TabsTrigger value="corporate">Korporat</TabsTrigger>
                             <TabsTrigger value="minimal">Minimal</TabsTrigger>
                          </TabsList>
                       </Tabs>
                    </div>
                    <Button onClick={handleDownloadPDF}>
                       <Download className="w-4 h-4 mr-2" /> Unduh PDF
                    </Button>
                 </div>
                 <div className="bg-slate-100 p-8 rounded-lg overflow-auto flex justify-center">
                    <InvoicePDF 
                       ref={pdfRef}
                       invoice={form.getValues()} 
                       company={profile} 
                       client={clients.find(c => c.id === form.watch("clientId"))}
                       template={template}
                    />
                 </div>
               </DialogContent>
            </Dialog>
            <Button onClick={form.handleSubmit(onSubmit)} className="shadow-lg shadow-primary/20">
              <Save className="w-4 h-4 mr-2" /> Simpan Tagihan
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Basic Info */}
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label>Nomor Tagihan</Label>
                 <Input {...form.register("invoiceNumber")} className="font-mono" />
               </div>
               <div className="space-y-2">
                 <Label>Mata Uang</Label>
                 <Select 
                   value={form.watch("currency")} 
                   onValueChange={(val: any) => form.setValue("currency", val)}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Pilih mata uang" />
                   </SelectTrigger>
                   <SelectContent>
                     {["IDR", "USD", "EUR", "SGD", "MYR"].map(c => (
                       <SelectItem key={c} value={c}>{c}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Tanggal Terbit</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("date") ? format(new Date(form.watch("date")), "dd MMM yyyy") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={form.watch("date") ? new Date(form.watch("date")) : undefined}
                        onSelect={(date) => date && form.setValue("date", date.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                 </Popover>
               </div>
               <div className="space-y-2">
                 <Label>Jatuh Tempo</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("dueDate") ? format(new Date(form.watch("dueDate")), "dd MMM yyyy") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={form.watch("dueDate") ? new Date(form.watch("dueDate")) : undefined}
                        onSelect={(date) => date && form.setValue("dueDate", date.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                 </Popover>
               </div>
            </CardContent>
          </Card>

          {/* Card 2: Items */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Item</h3>
                <Button variant="outline" size="sm" onClick={() => append({ id: uuidv4(), name: "", quantity: 1, price: 0, description: "" })}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-muted/30 p-4 rounded-lg border border-transparent hover:border-border transition-all">
                     <div className="col-span-12 md:col-span-5 space-y-2">
                        <Label className="text-xs text-muted-foreground">Nama Item / Deskripsi</Label>
                        <div className="flex gap-2">
                           <Select onValueChange={(val) => handleItemSelect(index, val)}>
                              <SelectTrigger className="w-[40px] px-0 justify-center">
                                 <Plus className="w-4 h-4" />
                              </SelectTrigger>
                              <SelectContent>
                                 {savedItems.map(item => (
                                   <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <Input placeholder="Nama Item" {...form.register(`items.${index}.name`)} />
                        </div>
                        <Textarea 
                          placeholder="Deskripsi (opsional)" 
                          className="h-10 min-h-[40px] resize-none text-xs" 
                          {...form.register(`items.${index}.description`)} 
                        />
                     </div>
                     <div className="col-span-4 md:col-span-2 space-y-2">
                        <Label className="text-xs text-muted-foreground">Jml</Label>
                        <Input type="number" min="1" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                     </div>
                     <div className="col-span-4 md:col-span-3 space-y-2">
                        <Label className="text-xs text-muted-foreground">Harga</Label>
                        <Input type="number" min="0" step="0.01" {...form.register(`items.${index}.price`, { valueAsNumber: true })} />
                     </div>
                     <div className="col-span-4 md:col-span-2 flex flex-col items-end justify-between h-full pt-6">
                        <div className="font-bold text-sm mb-2">
                           {formatCurrency(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.price`), form.watch("currency"))}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
               <Label>Catatan</Label>
               <Textarea 
                 placeholder="Syarat pembayaran, ucapan terima kasih, dll." 
                 className="mt-2"
                 {...form.register("notes")} 
               />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Client Selection */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Klien</h3>
              <Select 
                value={form.watch("clientId")} 
                onValueChange={(val) => form.setValue("clientId", val)}
              >
                <SelectTrigger>
                   <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                   {clients.map(client => (
                     <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
              
              {form.watch("clientId") && (
                <div className="bg-muted/50 p-3 rounded text-sm text-muted-foreground">
                   {clients.find(c => c.id === form.watch("clientId"))?.email}
                </div>
              )}

              <Button variant="link" className="px-0 text-primary h-auto" onClick={() => window.location.href = "/clients"}>
                 + Tambah Klien Baru
              </Button>
            </CardContent>
          </Card>
          
          {/* Summary */}
          <Card className="bg-slate-900 text-slate-50 border-slate-800">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Ringkasan</h3>
              
              <div className="space-y-2 text-sm text-slate-400">
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(form.watch("subtotal"), form.watch("currency"))}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span>Diskon</span>
                    <div className="flex gap-2 w-32">
                       <Input 
                         type="number" 
                         className="h-6 bg-slate-800 border-slate-700 text-right px-1" 
                         {...form.register("discountValue", { valueAsNumber: true })}
                       />
                       <Select 
                         value={form.watch("discountType")} 
                         onValueChange={(v: any) => form.setValue("discountType", v)}
                       >
                          <SelectTrigger className="h-6 w-16 bg-slate-800 border-slate-700 px-1">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="fixed">Rp</SelectItem>
                             <SelectItem value="percentage">%</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
                 
                 <div className="pt-2 space-y-2 border-t border-slate-800 mt-2">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] uppercase text-slate-500">Mode Pajak</Label>
                       <Tabs 
                         value={form.watch("taxType")} 
                         onValueChange={(v: any) => form.setValue("taxType", v)}
                         className="h-6"
                       >
                          <TabsList className="h-6 bg-slate-800 p-0.5">
                             <TabsTrigger value="exclude" className="text-[10px] h-5 px-2">Exclude</TabsTrigger>
                             <TabsTrigger value="include" className="text-[10px] h-5 px-2">Include</TabsTrigger>
                          </TabsList>
                       </Tabs>
                    </div>
                    
                    {form.watch("taxType") === "exclude" && (
                       <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase text-slate-500">Hitung Diskon</Label>
                          <Tabs 
                            value={form.watch("discountCalculation")} 
                            onValueChange={(v: any) => form.setValue("discountCalculation", v)}
                            className="h-6"
                          >
                             <TabsList className="h-6 bg-slate-800 p-0.5">
                                <TabsTrigger value="before_tax" className="text-[10px] h-5 px-2">Sblm Pajak</TabsTrigger>
                                <TabsTrigger value="after_tax" className="text-[10px] h-5 px-2">Stlh Pajak</TabsTrigger>
                             </TabsList>
                          </Tabs>
                       </div>
                    )}
                 </div>

                 <div className="flex justify-between pt-2">
                    <span>Pajak ({profile.defaultVat}%)</span>
                    <span>{formatCurrency(form.watch("taxTotal"), form.watch("currency"))}</span>
                 </div>
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="flex justify-between items-center">
                 <span className="font-bold text-lg">Total</span>
                 <span className="font-bold text-2xl">{formatCurrency(form.watch("grandTotal"), form.watch("currency"))}</span>
              </div>
              
              <div className="pt-4">
                 <Label className="text-slate-400 mb-2 block">Status</Label>
                 <Select 
                    value={form.watch("status")} 
                    onValueChange={(v: any) => form.setValue("status", v)}
                 >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="draft">Draf</SelectItem>
                       <SelectItem value="paid">Terbayar</SelectItem>
                       <SelectItem value="unpaid">Belum Bayar</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
