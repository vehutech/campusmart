// app/api/vendor/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VENDOR")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { vendorId: session.user.id },
    include: { category: true, _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VENDOR")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, price, categoryId, condition, stock, location, images } = body;

  if (!title || !description || !price || !categoryId)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      title, description,
      price: parseFloat(price),
      categoryId, condition: condition || "NEW",
      stock: parseInt(stock) || 1,
      location: location || null,
      images: images || [],
      vendorId: session.user.id,
    },
    include: { category: true },
  });
  return NextResponse.json(product, { status: 201 });
}