import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // You'll need to set up your database connection

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });
  
  return NextResponse.json(product);
}

