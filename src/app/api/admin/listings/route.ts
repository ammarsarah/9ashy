import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        include: { seller: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.listing.count(),
    ]);

    return NextResponse.json({ listings, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('Admin listings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
