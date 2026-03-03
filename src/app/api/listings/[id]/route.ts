import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { listingSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: { id: true, name: true, avatar: true, bio: true, createdAt: true },
        },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== authUser.userId && authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Allow status update separately
    if (body.status && Object.keys(body).length === 1) {
      const updated = await prisma.listing.update({
        where: { id },
        data: { status: body.status },
      });
      return NextResponse.json({ listing: updated });
    }

    const result = listingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { title, description, price, category, location, condition, images } = result.data;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        price,
        category,
        location,
        condition,
        images: JSON.stringify(images),
        status: body.status || listing.status,
      },
      include: {
        seller: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ listing: updated });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId !== authUser.userId && authUser.role !== 'ADMIN' && authUser.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
