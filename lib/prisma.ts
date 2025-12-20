import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { getDbPath } from "./db-config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: any;
};

function getAdapter() {
  if (!globalForPrisma.adapter) {
    // Use configured database path
    const dbPath = getDbPath();

    const db = new Database(dbPath);
    globalForPrisma.adapter = new PrismaBetterSqlite3(db);
  }
  return globalForPrisma.adapter;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: getAdapter(),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
