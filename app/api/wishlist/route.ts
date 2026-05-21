// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { userId_productId: { userId: session.user.id, productId } } });
    return NextResponse.json({ wishlisted: false });
  }

  await prisma.wishlist.create({ data: { userId: session.user.id, productId } });
  return NextResponse.json({ wishlisted: true });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (productId) {
    const item = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });
    return NextResponse.json({ wishlisted: !!item });
  }

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { vendor: { select: { name: true } }, category: true } } },
  });
  return NextResponse.json(items);
}