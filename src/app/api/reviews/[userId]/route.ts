import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { userId } = await params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
      isTrustedSeller: avg >= 4.5 && reviews.length >= 5,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
