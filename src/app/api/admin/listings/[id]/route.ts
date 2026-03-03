import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ message: 'Listing removed successfully' });
  } catch (error) {
    console.error('Admin delete listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
