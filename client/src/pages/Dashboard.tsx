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
  Clock,
  Receipt
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
import { formatCurrency } from "@/lib/utils";

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

  const stats = [
    {
      title: "Pendapatan",
      value: totalRevenue,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      desc: "Tagihan terbayar"
    },
    {
      title: "Tertunda",
      value: pendingAmount,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      desc: "Belum & Draf"
    },
    {
      title: "Klien",
      value: clients.length,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      desc: "Total klien"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold font-display">Beranda</h1>
        <p className="text-sm text-muted-foreground">Ringkasan bisnis Anda</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <h2 className="text-3xl font-bold tracking-tight font-display">Dasbor</h2>
        <p className="text-muted-foreground">Ikhtisar performa bisnis Anda.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-lg md:text-2xl font-bold truncate">
                    {typeof stat.value === 'number' && stat.value > 999 
                      ? formatCurrency(stat.value).replace(/[^0-9.,]/g, '')
                      : stat.value}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{stat.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 md:gap-6">
        {/* Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-base md:text-lg">Pendapatan 6 Bulan</CardTitle>
            <CardDescription className="text-xs md:text-sm">Trend pendapatan terakhir</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(0)}jt` : value >= 1000 ? `${(value/1000).toFixed(0)}rb` : value}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {chartData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === chartData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="lg:col-span-3">
          <CardHeader className="p-4 md:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Tagihan Terakhir</CardTitle>
                <CardDescription className="text-xs md:text-sm">Transaksi terbaru</CardDescription>
              </div>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Lihat Semua
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {recentInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada tagihan</p>
                  <Link href="/invoices/new">
                    <Button variant="ghost" size="sm" className="mt-2">Buat tagihan pertama</Button>
                  </Link>
                </div>
              ) : (
                recentInvoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.clientId);
                  return (
                    <Link key={inv.id} href={`/invoices/${inv.id}`}>
                      <div className="flex items-center justify-between p-3 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{client?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground font-mono">{inv.invoiceNumber}</p>
                          </div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <p className="text-sm font-bold">{formatCurrency(inv.grandTotal, inv.currency).replace(/[^0-9.,]/g, '')}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              inv.status === "paid" ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
                              inv.status === "unpaid" ? "text-amber-600 border-amber-200 bg-amber-50" :
                              "text-slate-600 border-slate-200 bg-slate-50"
                            }`}
                          >
                            {inv.status === "paid" ? "Lunas" : inv.status === "unpaid" ? "Belum" : "Draf"}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Only */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        <Link href="/invoices/new">
          <Button className="w-full h-12" variant="default">
            <Receipt className="w-4 h-4 mr-2" />
            Buat Tagihan
          </Button>
        </Link>
        <Link href="/clients">
          <Button className="w-full h-12" variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Tambah Klien
          </Button>
        </Link>
      </div>
    </div>
  );
}
