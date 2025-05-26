import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Force dynamic API route
export const dynamic = "force-dynamic";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    console.log("Admin Upload API - Processing file upload");

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log(`Admin Upload API - Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log(`Admin Upload API - File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    console.log(
      `Admin Upload API - Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`
    );

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "products");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, which is fine
      console.log("Upload directory already exists or created");
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Generate the URL for the uploaded file
    const fileUrl = `/uploads/products/${uniqueFilename}`;

    console.log(`Admin Upload API - File uploaded successfully: ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Admin Upload API - Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

// Optional: Add DELETE endpoint to remove uploaded files
export async function DELETE(request: NextRequest) {
  try {
    console.log("Admin Upload API - Processing file deletion");

    // Get authentication headers from middleware
    const userEmail = request.headers.get("x-nextauth-user-email");
    const userRole = request.headers.get("x-nextauth-user-role");

    // Check if user is authenticated and is admin
    if (!userEmail) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Validate filename to prevent directory traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = join(process.cwd(), "public", "uploads", "products", filename);

    try {
      const fs = require("fs").promises;
      await fs.unlink(filePath);
      console.log(`Admin Upload API - File deleted successfully: ${filename}`);

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      console.error("Admin Upload API - Delete error:", error);
      return NextResponse.json(
        { error: "File not found or could not be deleted" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Admin Upload API - Delete error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
