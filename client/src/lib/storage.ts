import { useState, useEffect, useCallback } from "react";
import { 
  type CompanyProfile, 
  type Client, 
  type Item, 
  type Invoice,
  companyProfileSchema,
  clientSchema,
  itemSchema,
  invoiceSchema 
} from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const KEYS = {
  COMPANY: "invoicelite_company",
  CLIENTS: "invoicelite_clients",
  ITEMS: "invoicelite_items",
  INVOICES: "invoicelite_invoices",
};

// --- Generic Storage Hook ---
function useLocalStorage<T>(key: string, initialValue: T, schema?: z.ZodSchema<T>) {
  // Initialize state function to avoid reading localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Validate if schema is provided
        if (schema) {
          const result = schema.safeParse(parsed);
          return result.success ? result.data : initialValue;
        }
        return parsed;
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
           const parsed = JSON.parse(item);
           if (schema) {
             const result = schema.safeParse(parsed);
             if (result.success) setStoredValue(result.data);
           } else {
             setStoredValue(parsed);
           }
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
  }, [key, schema]);

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
    },
    companyProfileSchema
  );

  const updateProfile = (data: CompanyProfile) => {
    setProfile(data);
    toast({ title: "Profile updated", description: "Company settings saved successfully." });
  };

  return { profile, updateProfile };
}

export function useClients() {
  const { toast } = useToast();
  const [clients, setClients] = useLocalStorage<Client[]>(KEYS.CLIENTS, [], z.array(clientSchema));

  const addClient = (client: Client) => {
    setClients((prev) => [...prev, client]);
    toast({ title: "Client added", description: `${client.name} has been added.` });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    toast({ title: "Client updated", description: "Client details saved." });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Client deleted", description: "Client removed from database." });
  };

  return { clients, addClient, updateClient, deleteClient };
}

export function useItems() {
  const { toast } = useToast();
  const [items, setItems] = useLocalStorage<Item[]>(KEYS.ITEMS, [], z.array(itemSchema));

  const addItem = (item: Item) => {
    setItems((prev) => [...prev, item]);
    toast({ title: "Item added", description: `${item.name} has been added.` });
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    toast({ title: "Item updated", description: "Item details saved." });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Item deleted", description: "Item removed from database." });
  };

  return { items, addItem, updateItem, deleteItem };
}

export function useInvoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>(KEYS.INVOICES, [], z.array(invoiceSchema));

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice]);
    toast({ title: "Invoice created", description: `${invoice.invoiceNumber} saved successfully.` });
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
    toast({ title: "Invoice updated", description: "Invoice details saved." });
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    toast({ title: "Invoice deleted", description: "Invoice removed from database." });
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
