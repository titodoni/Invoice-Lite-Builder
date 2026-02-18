import { useItems } from "@/lib/storage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type Item } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency } from "@/lib/utils";

export default function Items() {
  const { items, addItem, updateItem, deleteItem } = useItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: editingItem || {
      id: "",
      name: "",
      description: "",
      unit: "",
      price: 0,
      tax: 0,
    }
  });

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

  const handleAdd = () => {
    setEditingItem(null);
    form.reset({ id: "", name: "", description: "", unit: "", price: 0, tax: 0 });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold font-display">Produk & Jasa</h1>
        <p className="text-sm text-muted-foreground">{items.length} item</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">Produk/Jasa</h2>
          <p className="text-muted-foreground text-sm">Kelola katalog produk dan jasa.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Cari produk atau jasa..." 
          className="pl-10 h-11 md:h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchTerm ? "Tidak ada hasil" : "Belum ada item"}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-lg font-bold">{formatCurrency(item.price)}</span>
                  {item.unit && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      per {item.unit}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Nama</th>
                <th className="text-left p-4 text-sm font-medium">Deskripsi</th>
                <th className="text-left p-4 text-sm font-medium">Unit</th>
                <th className="text-right p-4 text-sm font-medium">Harga</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate">
                    {item.description || "-"}
                  </td>
                  <td className="p-4 text-muted-foreground">{item.unit || "-"}</td>
                  <td className="p-4 text-right font-bold">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <Button size="lg" className="rounded-full shadow-lg h-14 w-14" onClick={handleAdd}>
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Tambah Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama Item *</Label>
              <Input {...form.register("name")} placeholder="Nama produk atau jasa" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input {...form.register("description")} placeholder="Deskripsi singkat" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Harga *</Label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  {...form.register("price", { valueAsNumber: true })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input {...form.register("unit")} placeholder="pcs, jam, dll" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingItem ? "Simpan" : "Tambah"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
