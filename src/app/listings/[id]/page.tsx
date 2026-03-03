import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ListingDetail from './ListingDetail';
import { parseImages, formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { title: true, description: true, price: true, images: true },
    });
    if (!listing) return { title: 'Listing Not Found' };

    const images = parseImages(listing.images);
    return {
      title: listing.title,
      description: listing.description.substring(0, 160),
      openGraph: {
        title: listing.title,
        description: listing.description.substring(0, 160),
        images: images.length > 0 ? [images[0]] : [],
      },
    };
  } catch {
    return { title: 'Listing' };
  }
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;

  try {
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

    if (!listing) notFound();

    // Get seller reviews
    const sellerReviews = await prisma.review.findMany({
      where: { revieweeId: listing.sellerId },
      select: { rating: true },
    });

    const avgRating = sellerReviews.length > 0
      ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
      : 0;

    const isTrustedSeller = avgRating >= 4.5 && sellerReviews.length >= 5;

    return (
      <ListingDetail
        listing={JSON.parse(JSON.stringify(listing))}
        sellerStats={{ averageRating: avgRating, totalReviews: sellerReviews.length, isTrustedSeller }}
      />
    );
  } catch {
    notFound();
  }
}
