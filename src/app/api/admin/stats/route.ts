import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request as Parameters<typeof getAuthUserFromRequest>[0]);
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [totalUsers, totalListings, activeListings, soldListings, totalMessages, totalReviews, pendingReports] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'AVAILABLE' } }),
      prisma.listing.count({ where: { status: 'SOLD' } }),
      prisma.message.count(),
      prisma.review.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    // Recent signups in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await prisma.user.count({ where: { createdAt: { gte: weekAgo } } });
    const recentListings = await prisma.listing.count({ where: { createdAt: { gte: weekAgo } } });

    return NextResponse.json({
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      totalMessages,
      totalReviews,
      pendingReports,
      recentUsers,
      recentListings,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
