// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, name: true, avatar: true, phone: true, createdAt: true } },
      category: true,
    },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // increment view count
  await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.vendorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.product.update({ where: { id }, data: body, include: { category: true } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.vendorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}