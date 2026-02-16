import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Invoices from "@/pages/Invoices";
import InvoiceBuilder from "@/pages/InvoiceBuilder";
import Clients from "@/pages/Clients";
import Items from "@/pages/Items";
import Settings from "@/pages/Settings";
import AppShell from "@/components/layout/AppShell";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/invoices/new" component={InvoiceBuilder} />
        <Route path="/invoices/:id" component={InvoiceBuilder} />
        <Route path="/clients" component={Clients} />
        <Route path="/items" component={Items} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
