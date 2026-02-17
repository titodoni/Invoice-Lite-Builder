import { useClients } from "@/lib/storage";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type Client } from "@shared/schema";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Pencil,
  Mail,
  Phone,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const form = useForm<Client>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      company: "",
      phone: "",
      address: "",
      taxId: ""
    }
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleNew = () => {
    setEditingClient(null);
    form.reset({ id: "", name: "", email: "", company: "", phone: "", address: "", taxId: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Klien</h2>
          <p className="text-muted-foreground">Kelola basis data pelanggan Anda.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button onClick={handleNew} className="shadow-lg shadow-primary/20">
               <Plus className="mr-2 h-4 w-4" /> Tambah Klien
             </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Klien" : "Klien Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Nama Lengkap</Label>
                 <Input {...form.register("name")} placeholder="Budi Santoso" />
                 {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
               </div>
               <div className="space-y-2">
                 <Label>Perusahaan</Label>
                 <Input {...form.register("company")} placeholder="PT. Maju Mundur" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...form.register("email")} placeholder="budi@contoh.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telepon</Label>
                    <Input {...form.register("phone")} placeholder="+62 812 3456 7890" />
                  </div>
               </div>
               <div className="space-y-2">
                 <Label>Alamat</Label>
                 <Input {...form.register("address")} placeholder="Jl. Sudirman No. 123, Jakarta" />
               </div>
               <DialogFooter>
                 <Button type="submit">Simpan Klien</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center py-4 bg-card rounded-lg border px-4 shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground mr-3" />
        <Input 
          placeholder="Cari klien..." 
          className="border-none shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="group hover:border-primary/50 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl shadow-inner">
                  {client.name.charAt(0)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                       <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(client)}>
                       <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deleteClient(client.id)}>
                       <Trash2 className="w-4 h-4 mr-2" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{client.company || "Mandiri"}</p>
              
              <div className="space-y-2 text-sm text-slate-600">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
             Klien tidak ditemukan. Tambahkan klien pertama Anda untuk memulai.
          </div>
        )}
      </div>
    </div>
  );
}
