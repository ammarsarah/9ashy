import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';
import { reviewSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { rating, comment, revieweeId, listingId } = result.data;

    if (revieweeId === authUser.userId) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
    }

    // Check for duplicate review on same listing
    if (listingId) {
      const existing = await prisma.review.findFirst({
        where: { reviewerId: authUser.userId, listingId },
      });
      if (existing) {
        return NextResponse.json({ error: 'You have already reviewed this listing' }, { status: 409 });
      }
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        reviewerId: authUser.userId,
        revieweeId,
        listingId: listingId || null,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
