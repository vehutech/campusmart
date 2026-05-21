// app/api/cart/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          vendor: { select: { id: true, name: true } },
          category: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity = 1 } = await req.json();

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.user.id, productId, quantity },
    include: { product: true },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  await prisma.cartItem.delete({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  return NextResponse.json({ message: "Removed from cart" });
}
