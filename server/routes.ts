import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // This is a client-side only app using localStorage.
  // We don't need any API routes for the invoice logic.
  // The server just serves the static frontend.

  return httpServer;
}
