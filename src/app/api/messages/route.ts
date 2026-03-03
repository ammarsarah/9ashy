import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { messageSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get all unique conversations
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: authUser.userId },
          { receiverId: authUser.userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        listing: { select: { id: true, title: true, images: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, {
      userId: string;
      user: { id: string; name: string; avatar: string | null };
      lastMessage: typeof messages[0];
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === authUser.userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === authUser.userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partnerId,
            receiverId: authUser.userId,
            read: false,
          },
        });
        conversationsMap.set(partnerId, {
          userId: partnerId,
          user: partner,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { content, receiverId, listingId } = result.data;

    if (receiverId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: authUser.userId,
        receiverId,
        listingId: listingId || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        listing: { select: { id: true, title: true, images: true, price: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
