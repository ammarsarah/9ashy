'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/layout/AuthProvider';
import StarRating from '@/components/ui/StarRating';
import ListingCard from '@/components/listings/ListingCard';
import { timeAgo } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer: { id: string; name: string; avatar?: string | null };
  listing?: { id: string; title: string } | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<unknown[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isTrustedSeller, setIsTrustedSeller] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    // Fetch user's listings
    fetch(`/api/listings?sellerId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => {});

    // Fetch reviews
    fetch(`/api/reviews/${user.id}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || []);
        setAverageRating(d.averageRating || 0);
        setIsTrustedSeller(d.isTrustedSeller || false);
      })
      .catch(() => {});

    setBio(user.bio || '');
    setName(user.name || '');
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      });
      setIsEditing(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

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
              <p className="text-sm text-gray-500">{user.email}</p>

              {averageRating > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <StarRating rating={Math.round(averageRating)} size="sm" />
                  <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell buyers about yourself..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-sm font-medium">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-gray-200 py-1.5 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {user.bio && <p className="text-sm text-gray-600 text-center mb-3">{user.bio}</p>}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full border border-gray-200 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </button>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link href="/listings/new" className="block w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                + Post New Listing
              </Link>
            </div>
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
                My Listings ({listings.length})
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
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven&apos;t posted any listings yet.</p>
                    <Link href="/listings/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      Post Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(listings as Parameters<typeof ListingCard>[0]['listing'][]).map((listing) => (
                      <ListingCard key={(listing as {id: string}).id} listing={listing} />
                    ))}
                  </div>
                )
              ) : (
                reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 flex-shrink-0">
                            {review.reviewer.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">{review.reviewer.name}</span>
                              <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                            {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                            {review.listing && (
                              <Link href={`/listings/${review.listing.id}`} className="text-xs text-indigo-600 hover:underline mt-1 block">
                                Re: {review.listing.title}
                              </Link>
                            )}
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
