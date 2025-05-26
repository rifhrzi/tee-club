import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    console.log("Profile API - GET request received");
    const session = await getServerSession(authOptions);
    console.log("Profile API - Session:", session ? `User: ${session.user?.email}` : "No session");

    if (!session?.user?.id) {
      console.log("Profile API - No session or user ID, returning 401");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log("Profile API - Looking up user with ID:", session.user.id);
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        defaultAddressName: true,
        defaultAddressPhone: true,
        defaultAddressAddress: true,
        defaultAddressCity: true,
        defaultAddressPostalCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log("Profile API - User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Profile API - User found, returning profile data");
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      defaultAddressName,
      defaultAddressPhone,
      defaultAddressAddress,
      defaultAddressCity,
      defaultAddressPostalCode,
      currentPassword,
      newPassword,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone: phone || null,
      defaultAddressName: defaultAddressName || null,
      defaultAddressPhone: defaultAddressPhone || null,
      defaultAddressAddress: defaultAddressAddress || null,
      defaultAddressCity: defaultAddressCity || null,
      defaultAddressPostalCode: defaultAddressPostalCode || null,
      updatedAt: new Date(),
    };

    // Handle password change if requested
    if (newPassword && currentPassword) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedNewPassword;
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        defaultAddressName: true,
        defaultAddressPhone: true,
        defaultAddressAddress: true,
        defaultAddressCity: true,
        defaultAddressPostalCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`Profile updated for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      {
        error: "Failed to update profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/profile - Delete user account (optional feature)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmDelete } = body;

    if (!confirmDelete || confirmDelete !== "DELETE_MY_ACCOUNT") {
      return NextResponse.json({ error: "Account deletion not confirmed" }, { status: 400 });
    }

    // Verify password before deletion
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
    }

    // Delete user account (this will cascade delete related records)
    await db.user.delete({
      where: { id: session.user.id },
    });

    console.log(`User account deleted: ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Profile DELETE error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete account",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
