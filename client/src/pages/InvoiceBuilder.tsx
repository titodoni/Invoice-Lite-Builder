import { useParams, useLocation } from "wouter";
import { useInvoices, useClients, useItems, useCompanyProfile } from "@/lib/storage";
import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type Invoice } from "@/lib/schema";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CalendarIcon, Trash2, Plus, Save, ArrowLeft, Download, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import InvoicePDF from "@/components/shared/InvoicePDF";

export default function InvoiceBuilder() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { invoices, addInvoice, updateInvoice, getNextInvoiceNumber } = useInvoices();
  const { clients } = useClients();
  const { items: savedItems } = useItems();
  const { profile } = useCompanyProfile();
  
  const isEditMode = id && id !== "new";
  const existingInvoice = isEditMode ? invoices.find(inv => inv.id === id) : null;
  
  type TemplateType = "modern" | "corporate" | "minimal" | "modern-minimal" | "corporate-pro" | "creative" | "elegant" | "simple";
  const [template, setTemplate] = useState<TemplateType>(existingInvoice?.template || "modern");
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
      template: "modern",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedItems = form.watch("items");
  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");
  const taxType = form.watch("taxType");
  const discountCalculation = form.watch("discountCalculation");

  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountAmount = discountType === "fixed" ? discountValue : subtotal * (discountValue / 100);
    let taxAmount = 0;
    const taxRate = profile.taxEnabled ? (profile.defaultVat / 100) : 0;

    if (profile.taxEnabled) {
      if (taxType === "include") {
        taxAmount = subtotal - (subtotal / (1 + taxRate));
      } else {
        const calculationBase = discountCalculation === "before_tax" ? (subtotal - discountAmount) : subtotal;
        taxAmount = Math.max(0, calculationBase * taxRate);
      }
    }

    const grandTotal = taxType === "include" ? (subtotal - discountAmount) : (subtotal - discountAmount + taxAmount);

    form.setValue("subtotal", subtotal);
    form.setValue("taxTotal", taxAmount);
    form.setValue("grandTotal", grandTotal);
  }, [JSON.stringify(watchedItems), discountType, discountValue, taxType, discountCalculation, profile.defaultVat, form.setValue]);

  useEffect(() => {
    form.setValue("template", template);
  }, [template, form.setValue]);

  const onSubmit = (data: Invoice) => {
    const dataWithTemplate = { ...data, template };
    if (isEditMode) {
      updateInvoice(data.id, dataWithTemplate);
    } else {
      addInvoice(dataWithTemplate);
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
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    }
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const item = savedItems.find(i => i.id === itemId);
    if (item) {
      form.setValue(`items.${index}.name`, item.name);
      form.setValue(`items.${index}.description`, item.description || "");
      form.setValue(`items.${index}.price`, item.price);
      form.setValue(`items.${index}.itemId`, item.id);
    }
  };

  const totalAmount = form.watch("grandTotal");
  const currency = form.watch("currency");

  return (
    <div className="pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setLocation("/invoices")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {form.watch("invoiceNumber")}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/invoices")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold font-display">
              {isEditMode ? "Edit Tagihan" : "Tagihan Baru"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isEditMode ? existingInvoice?.invoiceNumber : "Buat tagihan baru"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Printer className="w-4 h-4 mr-2" /> Pratinjau
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="w-4 h-4 mr-2" /> Simpan
          </Button>
        </div>
      </div>

      {/* Mobile Page Title */}
      <div className="md:hidden pt-24 pb-4">
        <h1 className="text-lg font-bold">{isEditMode ? "Edit Tagihan" : "Tagihan Baru"}</h1>
      </div>

      {/* Mobile Summary Card (Sticky) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-background border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Tagihan</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount, currency)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Printer className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)}>
              <Save className="w-4 h-4 mr-1" /> Simpan
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Nomor Tagihan</Label>
                  <Input {...form.register("invoiceNumber")} className="font-mono h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Mata Uang</Label>
                  <Select value={form.watch("currency")} onValueChange={(val: any) => form.setValue("currency", val)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["IDR", "USD", "EUR", "SGD", "MYR"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Tanggal Terbit</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("date") ? format(new Date(form.watch("date")), "dd MMM yyyy") : <span>Pilih</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar 
                        mode="single" 
                        selected={form.watch("date") ? new Date(form.watch("date")) : undefined}
                        onSelect={(date) => date && form.setValue("date", date.toISOString())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Jatuh Tempo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("dueDate") ? format(new Date(form.watch("dueDate")), "dd MMM yyyy") : <span>Pilih</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar 
                        mode="single" 
                        selected={form.watch("dueDate") ? new Date(form.watch("dueDate")) : undefined}
                        onSelect={(date) => date && form.setValue("dueDate", date.toISOString())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Selection - Mobile First */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <Label className="text-xs md:text-sm mb-2 block">Klien</Label>
              <Select value={form.watch("clientId")} onValueChange={(val) => form.setValue("clientId", val)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih klien" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.watch("clientId") && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">{clients.find(c => c.id === form.watch("clientId"))?.name}</p>
                  <p className="text-muted-foreground text-xs">{clients.find(c => c.id === form.watch("clientId"))?.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm md:text-base">Item Tagihan</h3>
                <Button variant="outline" size="sm" onClick={() => append({ id: uuidv4(), name: "", quantity: 1, price: 0, description: "" })}>
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-muted/30 p-3 md:p-4 rounded-lg border">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex gap-2">
                        <Select onValueChange={(val) => handleItemSelect(index, val)}>
                          <SelectTrigger className="w-10 px-0 justify-center shrink-0">
                            <Plus className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Nama item" {...form.register(`items.${index}.name`)} className="h-10" />
                      </div>
                      
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Label className="text-[10px] text-muted-foreground mb-1 block">Jml</Label>
                          <Input type="number" min="1" className="h-10" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-[10px] text-muted-foreground mb-1 block">Harga</Label>
                          <Input type="number" min="0" step="0.01" className="h-10" {...form.register(`items.${index}.price`, { valueAsNumber: true })} />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-[10px] text-muted-foreground mb-1 block">Total</Label>
                          <div className="h-10 flex items-center text-sm font-medium">
                            {formatCurrency(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.price`), currency)}
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-destructive"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Notes */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <Label className="text-xs md:text-sm mb-2 block">Catatan</Label>
              <Textarea 
                placeholder="Syarat pembayaran, ucapan terima kasih..." 
                className="min-h-[80px] resize-none"
                {...form.register("notes")} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Summary */}
          <Card className="bg-slate-900 text-slate-50 border-slate-800 sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Ringkasan</h3>
              
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(form.watch("subtotal"), currency)}</span>
                </div>
                
                {profile.discountEnabled && (
                  <div className="flex justify-between items-center">
                    <span>Diskon</span>
                    <div className="flex gap-2 w-32">
                      <Input 
                        type="number" 
                        className="h-7 bg-slate-800 border-slate-700 text-right text-sm"
                        {...form.register("discountValue", { valueAsNumber: true })}
                      />
                      <Select value={form.watch("discountType")} onValueChange={(v: any) => form.setValue("discountType", v)}>
                        <SelectTrigger className="h-7 w-16 bg-slate-800 border-slate-700 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Rp</SelectItem>
                          <SelectItem value="percentage">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {profile.taxEnabled && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[10px] uppercase text-slate-500">Pajak</Label>
                      <Tabs value={form.watch("taxType")} onValueChange={(v: any) => form.setValue("taxType", v)} className="h-6">
                        <TabsList className="h-6 bg-slate-800 p-0.5">
                          <TabsTrigger value="exclude" className="text-[10px] h-5 px-2">Exclude</TabsTrigger>
                          <TabsTrigger value="include" className="text-[10px] h-5 px-2">Include</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak ({profile.defaultVat}%)</span>
                      <span>{formatCurrency(form.watch("taxTotal"), currency)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="bg-slate-700" />
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl">{formatCurrency(totalAmount, currency)}</span>
              </div>
              
              <div className="pt-2">
                <Label className="text-slate-400 text-xs mb-2 block">Status</Label>
                <Select value={form.watch("status")} onValueChange={(v: any) => form.setValue("status", v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draf</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="unpaid">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">Pratinjau Invoice</DialogTitle>
          <div className="sticky top-0 bg-background z-10 p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-bold text-lg">Pratinjau</h3>
              <Tabs value={template} onValueChange={(v: any) => setTemplate(v)}>
                <TabsList className="flex-wrap h-auto gap-1">
                  <TabsTrigger value="modern" className="text-xs">Modern</TabsTrigger>
                  <TabsTrigger value="corporate" className="text-xs">Korporat</TabsTrigger>
                  <TabsTrigger value="minimal" className="text-xs">Minimal</TabsTrigger>
                  <TabsTrigger value="modern-minimal" className="text-xs">Minimal+</TabsTrigger>
                  <TabsTrigger value="corporate-pro" className="text-xs">Pro</TabsTrigger>
                  <TabsTrigger value="creative" className="text-xs">Kreatif</TabsTrigger>
                  <TabsTrigger value="elegant" className="text-xs">Mewah</TabsTrigger>
                  <TabsTrigger value="simple" className="text-xs">Sederhana</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="p-4 bg-slate-100 overflow-auto">
            <div className="flex justify-center">
              <InvoicePDF 
                ref={pdfRef}
                invoice={form.getValues()} 
                company={profile} 
                client={clients.find(c => c.id === form.watch("clientId"))}
                template={template}
              />
            </div>
          </div>
          <div className="sticky bottom-0 bg-background p-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Tutup</Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" /> Unduh PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
