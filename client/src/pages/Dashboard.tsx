import { useInvoices, useClients } from "@/lib/storage";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  FileText, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const { invoices } = useInvoices();
  const { clients } = useClients();

  // Stats Calculations
  const totalRevenue = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
  
  const pendingAmount = invoices
    .filter(inv => inv.status === "unpaid" || inv.status === "draft")
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Chart Data: Last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = format(d, 'MMM');
    const monthYear = format(d, 'MM-yyyy');
    
    const revenue = invoices
      .filter(inv => inv.status === "paid" && format(new Date(inv.date), 'MM-yyyy') === monthYear)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
      
    return { name: month, total: revenue };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-display">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your business performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
              Paid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
              Unpaid & Drafts
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1 text-blue-500" />
              Total customer base
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="total" 
                  radius={[4, 4, 0, 0]} 
                  className="fill-primary"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="col-span-3 hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest transactions created.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {recentInvoices.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">
                   No invoices yet. Create your first one!
                 </div>
              ) : (
                recentInvoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.clientId);
                  return (
                    <div key={inv.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                         </div>
                         <div>
                           <p className="text-sm font-medium leading-none">{client?.name || 'Unknown Client'}</p>
                           <p className="text-xs text-muted-foreground mt-1">{inv.invoiceNumber}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${inv.grandTotal.toLocaleString()}</p>
                        <Badge 
                          variant="outline" 
                          className={
                            inv.status === "paid" ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" :
                            inv.status === "unpaid" ? "text-amber-500 border-amber-500/30 bg-amber-500/10" :
                            "text-slate-500 border-slate-500/30 bg-slate-500/10"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t text-center">
              <Link href="/invoices">
                <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-foreground">
                  View All Invoices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
