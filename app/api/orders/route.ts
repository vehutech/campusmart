// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isVendor = session.user.role === "VENDOR";

  const orders = await prisma.order.findMany({
    where: isVendor ? { vendorId: session.user.id } : { buyerId: session.user.id },
    include: {
      buyer:  { select: { id: true, name: true, email: true, phone: true } },
      vendor: { select: { id: true, name: true, email: true, phone: true } },
      items:  { include: { product: { select: { id: true, title: true, images: true, price: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BUYER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, note } = await req.json();
  // items: [{ productId, quantity, price, vendorId }]

  if (!items?.length)
    return NextResponse.json({ error: "No items provided" }, { status: 400 });

  // Group items by vendor and create one order per vendor
  const byVendor: Record<string, typeof items> = {};
  for (const item of items) {
    if (!byVendor[item.vendorId]) byVendor[item.vendorId] = [];
    byVendor[item.vendorId].push(item);
  }

  const orders = await Promise.all(
    Object.entries(byVendor).map(([vendorId, vendorItems]) => {
      const total = vendorItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
      return prisma.order.create({
        data: {
          buyerId: session.user.id,
          vendorId,
          totalAmount: total,
          note: note || null,
          items: {
            create: vendorItems.map((i: any) => ({
              productId: i.productId,
              quantity:  i.quantity,
              price:     i.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
    })
  );

  // Clear buyer's cart after order
  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json(orders, { status: 201 });
}