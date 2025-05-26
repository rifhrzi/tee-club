import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schema for signup data
const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(request: NextRequest) {
  try {
    console.log("Signup API - POST request received");

    // Parse and validate request body
    const body = await request.json();
    console.log("Signup API - Request body received for email:", body.email);

    // Validate input data
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("Signup API - Validation failed:", validationResult.error.errors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log("Signup API - User already exists:", email);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    console.log("Signup API - Hashing password for:", email);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log("Signup API - Creating user:", email);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "USER", // Default role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("Signup API - User created successfully:", user.email);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup API - Error:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      // Handle Prisma unique constraint errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Failed to create account",
        message: "An internal server error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
