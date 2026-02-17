import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Settings, 
  Menu,
  X,
  Plus
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompanyProfile } from "@/lib/storage";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarItem({ href, icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Link href={href}>
      <div 
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
          active 
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-medium" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        <span>{label}</span>
      </div>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useCompanyProfile();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Beranda" },
    { href: "/invoices", icon: FileText, label: "Tagihan" },
    { href: "/clients", icon: Users, label: "Klien" },
    { href: "/items", icon: Package, label: "Produk/Jasa" },
    { href: "/settings", icon: Settings, label: "Pengaturan" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">InvoiceLite</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen sticky top-0",
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              {profile.logo ? (
                <img src={profile.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <FileText className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">{profile.companyName || "InvoiceLite"}</h1>
              <p className="text-xs text-muted-foreground mt-1">Pembuat Tagihan Gratis</p>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href}
                {...item}
                active={location === item.href}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>

          <div className="mt-auto pt-6 border-t">
            {/* Help button removed */}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className={cn(
          "h-16 flex items-center justify-between px-4 md:px-8 transition-all duration-200 z-30",
          scrolled ? "bg-background/80 backdrop-blur-md border-b sticky top-0" : "bg-transparent"
        )}>
          <h2 className="font-display font-semibold text-xl md:text-2xl truncate">
            {navItems.find(i => i.href === location)?.label || "InvoiceLite"}
          </h2>
          
          <div className="flex items-center gap-3">
             <Link href="/invoices/new">
               <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                 <Plus className="w-4 h-4 mr-2" />
                 Buat Tagihan
               </Button>
             </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
