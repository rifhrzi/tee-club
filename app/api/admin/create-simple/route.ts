import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Secret key untuk mengamankan endpoint ini
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "teelite-admin-secret";

export async function POST(request: Request) {
  try {
    // Hanya tersedia di mode development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development mode" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password, secretKey } = body;

    // Validasi secret key
    if (secretKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: "Invalid secret key" },
        { status: 401 }
      );
    }

    // Validasi input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Periksa apakah email sudah digunakan
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Buat user admin baru dengan role sebagai string
    const newAdmin = await db.user.create({
      data: {
        id: uuidv4(),
        email,
        name,
        password: hashedPassword,
        role: "ADMIN", // Gunakan string "ADMIN" alih-alih enum
      },
    });

    // Hapus password dari respons
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return NextResponse.json({
      message: "Admin user created successfully",
      user: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create admin user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
