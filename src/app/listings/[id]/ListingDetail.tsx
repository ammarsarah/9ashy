'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import StarRating from '@/components/ui/StarRating';
import { formatPrice, getCategoryLabel, getCategoryIcon, getConditionLabel, timeAgo, parseImages } from '@/lib/utils';

interface ListingDetailProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    location: string;
    condition: string;
    status: string;
    images: string;
    sellerId: string;
    createdAt: string;
    seller: { id: string; name: string; avatar?: string | null; bio?: string | null; createdAt: string };
    reviews: Array<{
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: string;
      reviewer: { id: string; name: string; avatar?: string | null };
    }>;
    _count: { reviews: number };
  };
  sellerStats: {
    averageRating: number;
    totalReviews: number;
    isTrustedSeller: boolean;
  };
}

const conditionColors: Record<string, string> = {
  NEW: 'bg-green-100 text-green-700',
  LIKE_NEW: 'bg-blue-100 text-blue-700',
  GOOD: 'bg-yellow-100 text-yellow-700',
  FAIR: 'bg-orange-100 text-orange-700',
  POOR: 'bg-red-100 text-red-700',
};

export default function ListingDetail({ listing, sellerStats }: ListingDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const images = parseImages(listing.images);
  const isOwner = user?.id === listing.sellerId;

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/auth/login?redirect=/listings/${listing.id}`);
      return;
    }
    if (!messageText.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          receiverId: listing.sellerId,
          listingId: listing.id,
        }),
      });

      if (res.ok) {
        setMessageSent(true);
        setMessageText('');
        router.push(`/messages/${listing.sellerId}`);
      }
    } catch {
      // ignore
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/profile');
    } catch {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await fetch(`/api/listings/${listing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      // ignore
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, listingId: listing.id }),
      });
      setReportSent(true);
      setShowReport(false);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="aspect-video bg-gray-100 relative">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">{getCategoryIcon(listing.category)}</span>
                </div>
              )}
              {listing.status !== 'AVAILABLE' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full text-xl">
                    {listing.status === 'SOLD' ? 'SOLD' : 'RESERVED'}
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-indigo-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing details */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                    {getCategoryIcon(listing.category)} {getCategoryLabel(listing.category)}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${conditionColors[listing.condition] || 'bg-gray-100 text-gray-700'}`}>
                    {getConditionLabel(listing.condition)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-3xl font-bold text-indigo-600 mb-4">{formatPrice(listing.price)}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </span>
              <span>Posted {timeAgo(listing.createdAt)}</span>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>

            {isOwner && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Manage Listing</h3>
                <div className="flex gap-2 flex-wrap">
                  {['AVAILABLE', 'RESERVED', 'SOLD'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        listing.status === s
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s === 'AVAILABLE' ? '✓ Available' : s === 'RESERVED' ? '⏸ Reserved' : '✓ Mark Sold'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          {listing.reviews.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reviews for this listing</h3>
              <div className="space-y-4">
                {listing.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
                        {review.reviewer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.reviewer.name}</div>
                        <div className="flex items-center gap-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 ml-10">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Seller info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Seller</h3>
            <Link href={`/profile/${listing.sellerId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {listing.seller.avatar ? (
                  <img src={listing.seller.avatar} alt={listing.seller.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  listing.seller.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900">{listing.seller.name}</span>
                  {sellerStats.isTrustedSeller && (
                    <span className="bg-indigo-50 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full font-medium">✓ Trusted</span>
                  )}
                </div>
                {sellerStats.totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating rating={Math.round(sellerStats.averageRating)} size="sm" />
                    <span className="text-xs text-gray-500">({sellerStats.totalReviews})</span>
                  </div>
                )}
              </div>
            </Link>
            {listing.seller.bio && (
              <p className="mt-3 text-sm text-gray-500 line-clamp-2">{listing.seller.bio}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Member since {new Date(listing.seller.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Contact seller */}
          {!isOwner && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Seller</h3>
              {messageSent ? (
                <div className="text-center text-sm text-green-600 py-2">
                  Message sent! <Link href={`/messages/${listing.sellerId}`} className="underline">View conversation</Link>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-3">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Hi, I'm interested in "${listing.title}"...`}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !messageText.trim()}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {sendingMessage ? 'Sending...' : user ? 'Send Message' : 'Sign in to Contact'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Report */}
          {!isOwner && user && (
            <div>
              {reportSent ? (
                <p className="text-xs text-gray-400 text-center">Report submitted. Thank you.</p>
              ) : showReport ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Report Listing</h3>
                  <form onSubmit={handleReport} className="space-y-3">
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Describe the issue..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                        Submit Report
                      </button>
                      <button type="button" onClick={() => setShowReport(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full text-sm text-gray-400 hover:text-red-500 py-2 transition-colors"
                >
                  🚩 Report this listing
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
