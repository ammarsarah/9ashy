import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ userId: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { userId } = await params;
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: authUser.userId,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
