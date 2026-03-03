import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ userId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { userId } = await params;
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: authUser.userId, receiverId: userId },
          { senderId: userId, receiverId: authUser.userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        listing: { select: { id: true, title: true, images: true, price: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const partner = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, avatar: true, bio: true },
    });

    return NextResponse.json({ messages, partner });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
