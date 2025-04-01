import { z } from 'zod'

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    variantId: z.string().optional(),
  })),
  shippingDetails: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/),
    address: z.string().min(10),
    city: z.string(),
    postalCode: z.string().regex(/^\d{5}$/),
  }),
  paymentMethod: z.enum(['bank_transfer', 'ewallet', 'cod']),
})

export type OrderInput = z.infer<typeof orderSchema>