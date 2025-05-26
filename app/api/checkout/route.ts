import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createPayment } from "@/lib/payment";
import { orderSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { ZodError } from "zod";
import { Variant } from "@/store/types";
import { validateCartStock } from "@/lib/services/orderProcessing";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success } = await rateLimit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    console.log("Checkout API - POST request received");

    // Use getServerSession for consistent authentication (same as profile API)
    const session = await getServerSession(authOptions);
    console.log("Checkout API - Session:", session ? `User: ${session.user?.email}` : "No session");

    if (!session?.user?.id) {
      console.log("Checkout API - No session or user ID, returning 401");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required. Please log in to continue with checkout.",
          code: "AUTH_REQUIRED",
        },
        {
          status: 401,
          headers: {
            "X-Auth-Required": "true",
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    console.log("Checkout API - Looking up user with ID:", session.user.id);

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.log("Checkout API - User not found in database");
      return NextResponse.json(
        {
          error: "User not found",
          message: "The user associated with this authentication could not be found",
          code: "USER_NOT_FOUND",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        }
      );
    }

    console.log("Checkout API - User found, proceeding with checkout for:", user.email);

    // Validate request body
    const body = await request.json();
    const { saveAddress, ...orderData } = body;
    const validatedData = orderSchema.parse(orderData);

    // Validate stock availability before proceeding
    console.log("Checkout API - Validating stock for", validatedData.items.length, "items");
    const stockValidation = await validateCartStock(
      validatedData.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
      }))
    );

    if (!stockValidation.isValid) {
      const errorMessages = stockValidation.invalidItems.map(
        (item) =>
          `${item.productName}${item.variantName ? ` (${item.variantName})` : ""}: requested ${
            item.requestedQuantity
          }, available ${item.availableStock}`
      );

      return NextResponse.json(
        {
          error: "Insufficient stock",
          message: "Some items in your cart are no longer available in the requested quantities.",
          invalidItems: stockValidation.invalidItems,
          details: errorMessages,
        },
        { status: 400 }
      );
    }

    console.log("Checkout API - Stock validation passed");

    // Get the origin from the request headers
    const origin = request.headers.get("origin") || "http://localhost:3000";
    console.log("Checkout API - Request origin:", origin);

    // Create payment with the origin as the base URL
    const payment = await createPayment(validatedData, user, origin);

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

              let validVariant: Variant | null = null;
              let price = product.price;

              if (item.variantId) {
                validVariant =
                  product.variants.find((v: Variant) => v.id === item.variantId) || null;
                if (validVariant) {
                  price = validVariant.price;
                }
              }

              const orderItem: any = {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
              };

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

              let validVariant: Variant | null = null;
              let price = product.price;

              if (item.variantId) {
                validVariant =
                  product.variants.find((v: Variant) => v.id === item.variantId) || null;
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

    console.log("Checkout API - Order created successfully:", order.id);

    // Save address to user profile if requested
    if (saveAddress && validatedData.shippingDetails) {
      try {
        await db.user.update({
          where: { id: user.id },
          data: {
            defaultAddressName: validatedData.shippingDetails.name,
            defaultAddressPhone: validatedData.shippingDetails.phone,
            defaultAddressAddress: validatedData.shippingDetails.address,
            defaultAddressCity: validatedData.shippingDetails.city,
            defaultAddressPostalCode: validatedData.shippingDetails.postalCode,
            updatedAt: new Date(),
          },
        });
        console.log("Checkout API - Saved address to user profile");
      } catch (addressError) {
        console.error("Checkout API - Failed to save address:", addressError);
        // Don't fail the checkout if address saving fails
      }
    }

    return NextResponse.json({
      orderId: order.id,
      redirectUrl: payment.redirect_url,
    });
  } catch (error) {
    console.error("Checkout API - Error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Checkout failed", message: errorMessage }, { status: 500 });
  }
}
