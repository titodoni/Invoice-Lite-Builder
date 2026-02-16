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
import { useState } from "react";
import { format } from "date-fns";
import { Invoice } from "@shared/schema";

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

  const handleStatusChange = (invoice: Invoice, newStatus: "paid" | "unpaid" | "draft") => {
    updateInvoice(invoice.id, { status: newStatus });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Invoices</h2>
          <p className="text-muted-foreground">Manage and track all your invoices.</p>
        </div>
        <Link href="/invoices/new">
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      <div className="flex items-center py-4 bg-card rounded-lg border px-4 shadow-sm">
        <Search className="w-5 h-5 text-muted-foreground mr-3" />
        <Input 
          placeholder="Search by invoice # or client name..." 
          className="border-none shadow-none focus-visible:ring-0 bg-transparent p-0 h-auto text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[100px]">Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {searchTerm ? "No invoices found matching your search." : "No invoices created yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const client = clients.find(c => c.id === invoice.clientId);
                return (
                  <TableRow key={invoice.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{client?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">{client?.email}</div>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right font-bold">
                       {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.grandTotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/invoices/${invoice.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => window.location.href = `/invoices/${invoice.id}`}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice, "paid")}>
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice, "unpaid")}>
                            Mark as Unpaid
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteInvoice(invoice.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
  );
}
