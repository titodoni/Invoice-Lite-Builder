import { z } from "zod";

// This file defines the types for our data, but since we are using localStorage,
// we don't need actual API routes for CRUD. 
// However, we export these for consistency if we ever move to a backend.

export const api = {};

// We don't really need a buildUrl for localStorage, but keeping it for compatibility
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
