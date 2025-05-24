import { NextResponse } from "next/server";
import { createPayment } from "@/lib/payment";
import { orderSchema } from "@/lib/validation";
import { verifyToken } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Check for authentication token (optional)
    let user = null;
    const token = request.headers.get("authorization")?.split(" ")[1];

    // If token exists, verify it and get the user
    if (token) {
      try {
        const decoded = verifyToken(token);
        user = await db.user.findUnique({
          where: { id: decoded.userId },
        });
        console.log("Authenticated checkout for user:", user?.email);
      } catch (error) {
        console.log("Invalid token, proceeding with guest checkout");
      }
    } else {
      console.log("No token provided, proceeding with guest checkout");
    }

    // Validate request body
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Create a guest user if not authenticated
    if (!user) {
      // Check if a user with this email already exists
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.shippingDetails.email },
      });

      if (existingUser) {
        // Use the existing user
        user = existingUser;
        console.log("Using existing user account:", user.email);
      } else {
        // Create a temporary guest user
        user = await db.user.create({
          data: {
            email: validatedData.shippingDetails.email,
            name: validatedData.shippingDetails.name,
            password: Math.random().toString(36).substring(2, 15), // Random password
          },
        });
        console.log("Created guest user:", user.email);
      }
    }

    // Get the origin from the request headers
    const origin = request.headers.get("origin") || "http://localhost:3001";
    console.log("Checkout API - Request origin:", origin);

    // Use the origin for the base URL in the payment process
    // Note: We can't modify process.env at runtime in Next.js

    // Create payment
    const payment = await createPayment(validatedData, user);

    // Create order in database
    const order = await db.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        items: {
          create: await Promise.all(
            validatedData.items.map(async (item) => {
              const product = await db.product.findUnique({
                where: { id: item.productId },
                include: { variants: true },
              });

              if (!product) {
                throw new Error(`Product ${item.productId} not found`);
              }

              // Check if the variant exists and is valid
              let validVariant = null;
              let price = product.price;

              if (item.variantId) {
                validVariant = product.variants.find(
                  (v: { id: string; price: number }) => v.id === item.variantId
                );
                if (validVariant) {
                  price = validVariant.price;
                }
              }

              // Create the order item with or without variantId
              const orderItem: any = {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
              };

              // Only add variantId if it's a valid variant
              if (validVariant) {
                orderItem.variantId = item.variantId;
              }

              return orderItem;
            })
          ),
        },
        totalAmount: (
          await Promise.all(
            validatedData.items.map(async (item) => {
              const product = await db.product.findUnique({
                where: { id: item.productId },
                include: { variants: true },
              });
              if (!product) throw new Error(`Product ${item.productId} not found`);

              // Calculate price based on variant if it exists and is valid
              let price = product.price;
              if (item.variantId) {
                const validVariant = product.variants.find(
                  (v: { id: string; price: number }) => v.id === item.variantId
                );
                if (validVariant) {
                  price = validVariant.price;
                }
              }

              return price * item.quantity;
            })
          )
        ).reduce((sum, price) => sum + price, 0),
        shippingDetails: {
          create: validatedData.shippingDetails,
        },
        paymentMethod: validatedData.paymentMethod,
        paymentToken: payment.token,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      redirectUrl: payment.redirect_url,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
          message: "Please check your input data and try again.",
        },
        { status: 400 }
      );
    }

    // Handle Prisma database errors
    if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
      const prismaError = error as any;
      console.error(`Prisma error ${prismaError.code}:`, prismaError.message);

      // Handle specific Prisma error codes
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "Database constraint violation", code: prismaError.code },
          { status: 400 }
        );
      } else if (prismaError.code === "P2025") {
        return NextResponse.json(
          { error: "Record not found", code: prismaError.code },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Database error",
          message: "There was an issue processing your order in our database.",
        },
        { status: 500 }
      );
    }

    // Handle payment provider errors
    if (error instanceof Error && error.message.includes("payment")) {
      return NextResponse.json(
        {
          error: "Payment processing error",
          message:
            "There was an issue processing your payment. Please try again or use a different payment method.",
        },
        { status: 502 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Checkout failed",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred during checkout.",
      },
      { status: 500 }
    );
  }
}
