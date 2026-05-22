// app/api/messages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Get all messages involving the user, grouped into conversations
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender:   { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      product:  { select: { id: true, title: true, images: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build unique conversation list (keyed by other user + product)
  const convoMap = new Map<string, any>();
  for (const msg of messages) {
    const otherId  = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const other    = msg.senderId === userId ? msg.receiver   : msg.sender;
    const key      = `${otherId}_${msg.productId || "general"}`;

    if (!convoMap.has(key)) {
      convoMap.set(key, {
        key,
        otherId,
        other,
        product:   msg.product,
        lastMsg:   msg.content,
        lastTime:  msg.createdAt,
        unread:    msg.receiverId === userId && !msg.isRead ? 1 : 0,
      });
    } else {
      const c = convoMap.get(key);
      if (msg.receiverId === userId && !msg.isRead) c.unread++;
    }
  }

  return NextResponse.json(Array.from(convoMap.values()));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content, productId } = await req.json();

  if (!receiverId || !content?.trim())
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      senderId:   session.user.id,
      receiverId,
      content:    content.trim(),
      productId:  productId || null,
    },
    include: {
      sender:   { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
      product:  { select: { id: true, title: true, images: true, price: true } },
    },
  });

  // Trigger Pusher event
  try {
    const Pusher = (await import("pusher")).default;
    const pusher = new Pusher({
      appId:   process.env.PUSHER_APP_ID!,
      key:     process.env.PUSHER_APP_KEY!,
      secret:  process.env.PUSHER_APP_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS:  true,
    });

    const channelName = [session.user.id, receiverId].sort().join("_");
    await pusher.trigger(`chat-${channelName}`, "new-message", message);
  } catch (e) {
    // Pusher failure shouldn't break message saving
    console.error("Pusher error:", e);
  }

  return NextResponse.json(message, { status: 201 });
}