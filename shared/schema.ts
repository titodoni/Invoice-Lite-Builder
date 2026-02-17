import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We are using localStorage, but we define schemas here for type safety and validation
// These tables won't actually be used in a DB for this specific localStorage-only app
// but they serve as the "Source of Truth" for our data structures.

// === COMPONENT SCHEMAS ===

export const companyProfileSchema = z.object({
  id: z.string().default("default"),
  companyName: z.string().min(1, "Company name is required"),
  logo: z.string().optional(), // base64
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  taxId: z.string().optional(),
  defaultVat: z.coerce.number().min(0).default(0),
  currency: z.enum(["IDR", "USD", "EUR", "SGD", "MYR"]).default("IDR"),
});

export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Client name is required"),
  company: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  taxId: z.string().optional(),
});

export const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  unit: z.string().optional(),
  price: z.coerce.number().min(0),
  tax: z.coerce.number().min(0).default(0),
});

export const invoiceItemSchema = z.object({
  id: z.string(),
  itemId: z.string().optional(), // Link to saved item if applicable
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
});

export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  date: z.string(), // ISO date string
  dueDate: z.string(), // ISO date string
  clientId: z.string().min(1, "Client is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  subtotal: z.number(),
  taxTotal: z.number(),
  discountType: z.enum(["percentage", "fixed"]).default("fixed"),
  discountValue: z.number().default(0),
  taxType: z.enum(["exclude", "include"]).default("exclude"),
  discountCalculation: z.enum(["before_tax", "after_tax"]).default("before_tax"),
  grandTotal: z.number(),
  status: z.enum(["draft", "paid", "unpaid"]).default("draft"),
  currency: z.enum(["IDR", "USD", "EUR", "SGD", "MYR"]).default("USD"),
  signature: z.string().optional(), // base64
});

// === TYPES ===
export type CompanyProfile = z.infer<typeof companyProfileSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Item = z.infer<typeof itemSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

// === DUMMY DB SCHEMA (Required for backend scaffolding to not break) ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
