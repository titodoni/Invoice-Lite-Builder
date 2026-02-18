import { useClients } from "@/lib/storage";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, User, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type Client } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const form = useForm<Client>({
    resolver: zodResolver(clientSchema),
    defaultValues: editingClient || {
      id: "",
      name: "",
      company: "",
      email: "",
      phone: "",
      address: "",
      taxId: "",
    }
  });

  const onSubmit = (data: Client) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient({ ...data, id: uuidv4() });
    }
    setIsDialogOpen(false);
    setEditingClient(null);
    form.reset();
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset(client);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    form.reset({ id: "", name: "", company: "", email: "", phone: "", address: "", taxId: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold font-display">Daftar Klien</h1>
        <p className="text-sm text-muted-foreground">{clients.length} klien</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display">Klien</h2>
          <p className="text-muted-foreground text-sm">Kelola data klien Anda.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Klien
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Klien" : "Tambah Klien Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama *</Label>
                <Input {...form.register("name")} placeholder="Nama klien" />
              </div>
              <div className="space-y-2">
                <Label>Perusahaan</Label>
                <Input {...form.register("company")} placeholder="Nama perusahaan (opsional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register("email")} type="email" placeholder="email@contoh.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telepon</Label>
                  <Input {...form.register("phone")} placeholder="Nomor telepon" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input {...form.register("address")} placeholder="Alamat lengkap" />
              </div>
              <div className="space-y-2">
                <Label>NPWP/Tax ID</Label>
                <Input {...form.register("taxId")} placeholder="Nomor pajak (opsional)" />
              </div>
              <Button type="submit" className="w-full">
                {editingClient ? "Simpan Perubahan" : "Tambah Klien"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Cari klien..." 
          className="pl-10 h-11 md:h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchTerm ? "Tidak ada hasil" : "Belum ada klien"}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      {client.company && <p className="text-xs text-muted-foreground">{client.company}</p>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(client)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteClient(client.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {(client.email || client.phone) && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                )}
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
                <th className="text-left p-4 text-sm font-medium">Perusahaan</th>
                <th className="text-left p-4 text-sm font-medium">Kontak</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{client.company || "-"}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      {client.email && <div>{client.email}</div>}
                      {client.phone && <div className="text-muted-foreground">{client.phone}</div>}
                    </div>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteClient(client.id)}
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

      {/* Mobile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Klien" : "Tambah Klien"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama *</Label>
              <Input {...form.register("name")} placeholder="Nama klien" />
            </div>
            <div className="space-y-2">
              <Label>Perusahaan</Label>
              <Input {...form.register("company")} placeholder="Nama perusahaan" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...form.register("email")} type="email" placeholder="email@contoh.com" />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input {...form.register("phone")} placeholder="Nomor telepon" />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input {...form.register("address")} placeholder="Alamat lengkap" />
            </div>
            <Button type="submit" className="w-full">
              {editingClient ? "Simpan" : "Tambah"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
