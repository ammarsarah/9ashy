import { NextResponse } from 'next/server';
import { getAuthUser, getAuthUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, email: true, avatar: true, role: true, bio: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        name: name ? String(name).trim().substring(0, 50) : undefined,
        bio: bio !== undefined ? String(bio).trim().substring(0, 500) : undefined,
      },
      select: { id: true, name: true, email: true, avatar: true, role: true, bio: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
