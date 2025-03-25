// app/api/products/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Simulated product data
  const products = [
    { id: 1, name: "T-Shirt", price: 25 },
    { id: 2, name: "Hoodie", price: 40 },
    { id: 3, name: "Sweatpants", price: 30 },
  ];

  return NextResponse.json(products);
}
