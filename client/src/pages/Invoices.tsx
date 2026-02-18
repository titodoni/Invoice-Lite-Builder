import { useInvoices, useClients } from "@/lib/storage";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Trash2, 
  Pencil,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { format } from "date-fns";
import { Invoice } from "@/lib/schema";
import { formatCurrency } from "@/lib/utils";

export default function Invoices() {
  const { invoices, deleteInvoice, updateInvoice } = useInvoices();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const searchString = `${inv.invoiceNumber} ${client?.name || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "paid": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "unpaid": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      default: return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "paid": return "Lunas";
      case "unpaid": return "Belum";
      default: return "Draf";
    }
  };

  const handleStatusChange = (invoice: Invoice, newStatus: "paid" | "unpaid" | "draft") => {
    updateInvoice(invoice.id, { status: newStatus });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Header - Desktop only */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight font-display">Tagihan</h2>
          <p className="text-muted-foreground text-sm">Kelola dan pantau semua tagihan Anda.</p>
        </div>
        <Link href="/invoices/new">
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Buat Tagihan
          </Button>
        </Link>
      </div>

      {/* Mobile Title */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold font-display">Daftar Tagihan</h1>
        <p className="text-sm text-muted-foreground">{filteredInvoices.length} tagihan</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Cari nomor tagihan atau nama klien..." 
          className="pl-10 h-11 md:h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchTerm ? "Tidak ada hasil" : "Belum ada tagihan"}
            </p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
            const client = clients.find(c => c.id === invoice.clientId);
            return (
              <Card key={invoice.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
                      <h3 className="font-semibold text-sm mt-0.5">{client?.name || "Tidak Dikenal"}</h3>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Jatuh tempo: {format(new Date(invoice.dueDate), 'dd MMM')}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-bold text-base">
                      {formatCurrency(invoice.grandTotal, invoice.currency)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Link href={`/invoices/${invoice.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice, "paid")}>
                            Tandai Lunas
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice, "unpaid")}>
                            Tandai Belum Lunas
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteInvoice(invoice.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[120px]">No. Tagihan</TableHead>
                <TableHead>Klien</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jatuh Tempo</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    {searchTerm ? "Tidak ada tagihan yang cocok" : "Belum ada tagihan"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  return (
                    <TableRow key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <div className="font-medium">{client?.name || "Tidak Dikenal"}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{client?.email}</div>
                      </TableCell>
                      <TableCell>{format(new Date(invoice.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell className="text-right font-bold">
                         {formatCurrency(invoice.grandTotal, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={getStatusColor(invoice.status)}>
                          {invoice.status === "paid" ? "Terbayar" : invoice.status === "unpaid" ? "Belum Bayar" : "Draf"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                            <Link href={`/invoices/${invoice.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => window.location.href = `/invoices/${invoice.id}`}>
                              <Download className="mr-2 h-4 w-4" /> Unduh PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice, "paid")}>
                              Tandai Sudah Bayar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice, "unpaid")}>
                              Tandai Belum Bayar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteInvoice(invoice.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
