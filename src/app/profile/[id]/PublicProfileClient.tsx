'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import StarRating from '@/components/ui/StarRating';
import ListingCard from '@/components/listings/ListingCard';
import { timeAgo } from '@/lib/utils';

interface Props {
  user: { id: string; name: string; avatar?: string | null; bio?: string | null; createdAt: string };
  listings: unknown[];
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    reviewer: { id: string; name: string; avatar?: string | null };
  }>;
  averageRating: number;
  isTrustedSeller: boolean;
}

export default function PublicProfileClient({ user, listings, reviews, averageRating, isTrustedSeller }: Props) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) { router.push('/auth/login'); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment, revieweeId: user.id }),
      });
      if (res.ok) {
        setShowReviewForm(false);
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-3">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                {isTrustedSeller && (
                  <span className="bg-indigo-50 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">✓ Trusted</span>
                )}
              </div>
              {averageRating > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <StarRating rating={Math.round(averageRating)} size="sm" />
                  <span className="text-sm text-gray-500">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>

            {user.bio && <p className="text-sm text-gray-600 text-center mb-4">{user.bio}</p>}

            {authUser && authUser.id !== user.id && (
              <div className="space-y-2">
                <Link
                  href={`/messages/${user.id}`}
                  className="block w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
                >
                  Send Message
                </Link>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full border border-gray-200 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Leave a Review
                </button>
              </div>
            )}

            {showReviewForm && (
              <form onSubmit={handleReview} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating</label>
                  <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Comment (optional)</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'listings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Listings ({listings.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Reviews ({reviews.length})
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'listings' ? (
                listings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No active listings</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(listings as Parameters<typeof ListingCard>[0]['listing'][]).map((listing) => (
                      <ListingCard key={(listing as {id: string}).id} listing={listing} />
                    ))}
                  </div>
                )
              ) : (
                reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No reviews yet</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 flex-shrink-0">
                            {review.reviewer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{review.reviewer.name}</span>
                              <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                            {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
