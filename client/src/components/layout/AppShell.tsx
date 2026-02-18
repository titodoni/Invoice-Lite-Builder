import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Settings, 
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
          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer group min-h-[48px]",
          active 
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-medium" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

// Mobile Bottom Navigation Item
function MobileNavItem({ href, icon: Icon, label, active }: { href: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}>
        <Icon className={cn("w-5 h-5", active && "fill-current")} />
        <span className="text-[10px] mt-0.5 font-medium">{label}</span>
      </div>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  const { profile } = useCompanyProfile();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Beranda", mobileLabel: "Beranda" },
    { href: "/invoices", icon: FileText, label: "Tagihan", mobileLabel: "Tagihan" },
    { href: "/clients", icon: Users, label: "Klien", mobileLabel: "Klien" },
    { href: "/items", icon: Package, label: "Produk", mobileLabel: "Produk" },
    { href: "/settings", icon: Settings, label: "Pengaturan", mobileLabel: "Setelan" },
  ];

  const currentPage = navItems.find(i => i.href === location);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Mobile Header - Fixed at top */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-base">{profile.companyName || "InvoiceLite"}</span>
          </div>
          <Link href="/invoices/new">
            <Button size="sm" className="h-8 px-3 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Baru
            </Button>
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:block w-64 bg-card border-r sticky top-0 h-screen shrink-0">
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              {profile.logo ? (
                <img src={profile.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <FileText className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base leading-tight truncate">{profile.companyName || "InvoiceLite"}</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Pembuat Tagihan</p>
            </div>
          </div>

          <div className="flex-1 space-y-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={location === item.href}
              />
            ))}
          </div>

          <div className="pt-4 border-t">
            <Link href="/invoices/new">
              <Button className="w-full rounded-xl shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" />
                Buat Tagihan
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen md:min-h-0">
        {/* Desktop Header */}
        <header className={cn(
          "hidden md:flex h-16 items-center justify-between px-6 lg:px-8 transition-all duration-200",
          scrolled ? "bg-background/80 backdrop-blur-md border-b sticky top-0 z-30" : "bg-transparent"
        )}>
          <h2 className="font-display font-semibold text-xl lg:text-2xl">
            {currentPage?.label || "InvoiceLite"}
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
        <div className="flex-1 overflow-auto pt-14 md:pt-0">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <MobileNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.mobileLabel}
              active={location === item.href}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
