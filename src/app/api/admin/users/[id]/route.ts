import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, role } = body; // action: 'block' | 'unblock', role: 'USER' | 'MODERATOR'

    const updateData: Record<string, unknown> = {};
    if (action === 'block') {
      updateData.role = 'BLOCKED';
    } else if (action === 'unblock') {
      updateData.role = 'USER';
    } else if (role) {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
