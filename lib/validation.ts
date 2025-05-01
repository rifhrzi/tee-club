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
