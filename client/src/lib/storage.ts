import { useState, useEffect, useCallback } from "react";
import { 
  type CompanyProfile, 
  type Client, 
  type Item, 
  type Invoice,
} from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";

const KEYS = {
  COMPANY: "invoicelite_company",
  CLIENTS: "invoicelite_clients",
  ITEMS: "invoicelite_items",
  INVOICES: "invoicelite_invoices",
};

// --- Generic Storage Hook ---
function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state function to avoid reading localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch a custom event so other hooks can update
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs/hooks
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
           setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(error);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}

// --- Specific Hooks ---

export function useCompanyProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = useLocalStorage<CompanyProfile>(
    KEYS.COMPANY,
    {
      id: "default",
      companyName: "Perusahaan Saya",
      email: "halo@contoh.com",
      currency: "IDR",
      defaultVat: 0,
      taxEnabled: true,
      discountEnabled: true
    }
  );

  const updateProfile = (data: CompanyProfile) => {
    setProfile(data);
    toast({ title: "Tersimpan", description: "Pengaturan perusahaan diperbarui." });
  };

  return { profile, updateProfile };
}

export function useClients() {
  const { toast } = useToast();
  const [clients, setClients] = useLocalStorage<Client[]>(KEYS.CLIENTS, []);

  const addClient = (client: Client) => {
    setClients((prev) => [...prev, client]);
    toast({ title: "Klien ditambahkan", description: `${client.name} telah ditambahkan.` });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    toast({ title: "Klien diperbarui", description: "Data klien telah disimpan." });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Klien dihapus", description: "Klien telah dihapus dari database." });
  };

  return { clients, addClient, updateClient, deleteClient };
}

export function useItems() {
  const { toast } = useToast();
  const [items, setItems] = useLocalStorage<Item[]>(KEYS.ITEMS, []);

  const addItem = (item: Item) => {
    setItems((prev) => [...prev, item]);
    toast({ title: "Item ditambahkan", description: `${item.name} telah ditambahkan.` });
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    toast({ title: "Item diperbarui", description: "Data item telah disimpan." });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Item dihapus", description: "Item telah dihapus dari database." });
  };

  return { items, addItem, updateItem, deleteItem };
}

export function useInvoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>(KEYS.INVOICES, []);

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice]);
    toast({ title: "Tagihan dibuat", description: `${invoice.invoiceNumber} berhasil disimpan.` });
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
    toast({ title: "Tagihan diperbarui", description: "Data tagihan telah disimpan." });
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    toast({ title: "Tagihan dihapus", description: "Tagihan telah dihapus dari database." });
  };

  const getNextInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;
    
    const yearInvoices = invoices.filter(inv => inv.invoiceNumber.startsWith(prefix));
    
    if (yearInvoices.length === 0) {
      return `${prefix}001`;
    }

    // Extract numbers, sort, and increment max
    const numbers = yearInvoices
      .map(inv => parseInt(inv.invoiceNumber.replace(prefix, "")))
      .filter(n => !isNaN(n));
      
    if (numbers.length === 0) return `${prefix}001`;
    
    const maxNum = Math.max(...numbers);
    return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
  };

  return { invoices, addInvoice, updateInvoice, deleteInvoice, getNextInvoiceNumber };
}
