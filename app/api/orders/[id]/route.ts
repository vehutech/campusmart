// app/api/orders/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Vendors can confirm/complete, buyers can cancel
  const allowed =
    (session.user.role === "VENDOR" && order.vendorId === session.user.id && ["CONFIRMED","COMPLETED"].includes(status)) ||
    (session.user.role === "BUYER"  && order.buyerId  === session.user.id && status === "CANCELLED");

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      buyer:  { select: { id: true, name: true, email: true } },
      vendor: { select: { id: true, name: true, email: true } },
      items:  { include: { product: { select: { id: true, title: true, images: true } } } },
    },
  });

  return NextResponse.json(updated);
}