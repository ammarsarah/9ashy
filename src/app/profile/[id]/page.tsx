import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PublicProfileClient from './PublicProfileClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { name: true } });
    return { title: user ? `${user.name}'s Profile` : 'Profile' };
  } catch {
    return { title: 'Profile' };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, avatar: true, bio: true, createdAt: true },
    });

    if (!user) notFound();

    const [listings, reviews] = await Promise.all([
      prisma.listing.findMany({
        where: { sellerId: id, status: 'AVAILABLE' },
        include: { seller: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.review.findMany({
        where: { revieweeId: id },
        include: { reviewer: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return (
      <PublicProfileClient
        user={JSON.parse(JSON.stringify(user))}
        listings={JSON.parse(JSON.stringify(listings))}
        reviews={JSON.parse(JSON.stringify(reviews))}
        averageRating={avgRating}
        isTrustedSeller={avgRating >= 4.5 && reviews.length >= 5}
      />
    );
  } catch {
    notFound();
  }
}
