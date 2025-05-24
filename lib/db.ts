import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

// Use global instance in development to prevent multiple connections
export const db = global.prisma || createPrismaClient();

// Save the client in global scope to prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
