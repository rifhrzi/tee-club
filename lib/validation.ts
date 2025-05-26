import { z } from "zod";

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      variantId: z.string().optional(),
    })
  ),
  shippingDetails: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, {
      message:
        "Phone number must be a valid Indonesian phone number format (e.g., 08123456789, +628123456789, or 628123456789)",
    }),
    address: z.string().min(10),
    city: z.string(),
    postalCode: z.string().regex(/^\d{5}$/, { message: "Postal code must be 5 digits" }),
  }),
  paymentMethod: z.enum(["bank_transfer", "ewallet", "cod"]).default("bank_transfer"),
});

export type OrderInput = z.infer<typeof orderSchema>;

// Product validation schemas
export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  images: z
    .array(
      z.string().refine(
        (value) => {
          // Allow URLs or local file paths starting with /uploads/
          try {
            new URL(value);
            return true;
          } catch {
            return value.startsWith("/uploads/") || value.startsWith("/");
          }
        },
        { message: "Invalid image URL or file path" }
      )
    )
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
  variants: z.array(productVariantSchema).optional(),
});

export const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid("Invalid product ID"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
