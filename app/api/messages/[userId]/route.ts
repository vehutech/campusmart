// app/api/messages/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId: otherId } = await params;
  const { searchParams }    = new URL(req.url);
  const productId           = searchParams.get("productId");
  const myId                = session.user.id;

  const where: any = {
    OR: [
      { senderId: myId,    receiverId: otherId },
      { senderId: otherId, receiverId: myId    },
    ],
  };
  if (productId) where.productId = productId;

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender:   { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      product:  { select: { id: true, title: true, images: true, price: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: myId, isRead: false },
    data:  { isRead: true },
  });

  // Get other user info
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { id: true, name: true, avatar: true, role: true },
  });

  return NextResponse.json({ messages, other });
}