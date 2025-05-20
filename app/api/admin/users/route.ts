import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Endpoint untuk melihat daftar pengguna (hanya untuk admin)
export async function GET(request: Request) {
  try {
    // Periksa autentikasi (idealnya menggunakan middleware)
    // Ini hanya contoh sederhana, sebaiknya gunakan middleware autentikasi yang tepat
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua pengguna
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      users,
      count: users.length,
      adminCount: users.filter((user: { role: string }) => user.role === "ADMIN").length,
      userCount: users.filter((user: { role: string }) => user.role !== "ADMIN").length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
