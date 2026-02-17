import { useItems } from "@/lib/storage";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type Item } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Trash2, 
  Pencil,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Items() {
  const { items, addItem, updateItem, deleteItem } = useItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const form = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      unit: "hr",
      price: 0,
      tax: 0
    }
  });

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: Item) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem({ ...data, id: uuidv4() });
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    form.reset({ id: "", name: "", description: "", unit: "hr", price: 0, tax: 0 });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Produk & Jasa</h2>
          <p className="text-muted-foreground">Kelola item yang sering digunakan dalam tagihan.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button onClick={handleNew} className="shadow-lg shadow-primary/20">
               <Plus className="mr-2 h-4 w-4" /> Tambah Item
             </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Item Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Nama Item</Label>
                 <Input {...form.register("name")} placeholder="Pengembangan Web" />
                 {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
               </div>
               <div className="space-y-2">
                 <Label>Deskripsi</Label>
                 <Textarea {...form.register("description")} placeholder="Detail tentang layanan..." />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harga</Label>
                    <Input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit (misal: jam, pc)</Label>
                    <Input {...form.register("unit")} />
                  </div>
               </div>
               <DialogFooter>
                 <Button type="submit">Simpan Item</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center py-4 bg-card rounded-lg border px-4 shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground mr-3" />
        <Input 
          placeholder="Cari item..." 
          className="border-none shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
         <Table>
            <TableHeader className="bg-muted/40">
               <TableRow>
                  <TableHead className="w-[300px]">Item</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {filteredItems.map(item => (
                  <TableRow key={item.id} className="group hover:bg-muted/30">
                     <TableCell>
                        <div className="flex items-start gap-3">
                           <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mt-1">
                              <Tag className="w-4 h-4 text-primary" />
                           </div>
                           <div>
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                           </div>
                        </div>
                     </TableCell>
                     <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                     <TableCell className="text-right font-medium">{formatCurrency(item.price)}</TableCell>
                     <TableCell>
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                              <Pencil className="w-4 h-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
               {filteredItems.length === 0 && (
                  <TableRow>
                     <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        Item tidak ditemukan.
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>
    </div>
  );
}
