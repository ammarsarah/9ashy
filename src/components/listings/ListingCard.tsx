import Link from 'next/link';
import { formatPrice, getCategoryLabel, getConditionLabel, timeAgo, parseImages } from '@/lib/utils';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    location: string;
    condition: string;
    status: string;
    images: string;
    createdAt: Date | string;
    seller?: { name: string; id: string };
  };
}

const conditionColors: Record<string, string> = {
  NEW: 'bg-green-100 text-green-700',
  LIKE_NEW: 'bg-blue-100 text-blue-700',
  GOOD: 'bg-yellow-100 text-yellow-700',
  FAIR: 'bg-orange-100 text-orange-700',
  POOR: 'bg-red-100 text-red-700',
};

export default function ListingCard({ listing }: ListingCardProps) {
  const images = parseImages(listing.images);
  const imageUrl = images.length > 0 ? images[0] : null;

  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {listing.status !== 'AVAILABLE' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">
                {listing.status === 'SOLD' ? 'Sold' : 'Reserved'}
              </span>
            </div>
          )}
          <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-700'}`}>
            {getConditionLabel(listing.condition)}
          </span>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-lg font-bold text-indigo-600 mb-2">
            {formatPrice(listing.price)}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-[80px]">{listing.location}</span>
            </div>
            <span className="text-gray-400">{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
