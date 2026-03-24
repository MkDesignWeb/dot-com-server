import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

export const prisma = new PrismaClient();

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ SQLite (Prisma) conectado");
  } catch (error) {
    console.error("❌ Erro ao conectar SQLite (Prisma):", error);
    process.exit(1);
  }
}