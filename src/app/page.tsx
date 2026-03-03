import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/listings/ListingCard';
import { CATEGORIES } from '@/lib/utils';

async function getFeaturedListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: 'AVAILABLE' },
      include: { seller: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
  } catch {
    return [];
  }
}

const MOCK_LISTINGS = [
  { id: '1', title: 'iPhone 13 Pro - Excellent Condition', price: 650, category: 'ELECTRONICS', location: 'New York, NY', condition: 'LIKE_NEW', status: 'AVAILABLE', images: '[]', createdAt: new Date(), updatedAt: new Date(), sellerId: '1', seller: { id: '1', name: 'Alice M.' } },
  { id: '2', title: 'Vintage Leather Sofa', price: 280, category: 'FURNITURE', location: 'Brooklyn, NY', condition: 'GOOD', status: 'AVAILABLE', images: '[]', createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(), sellerId: '2', seller: { id: '2', name: 'Bob K.' } },
  { id: '3', title: 'Mountain Bike Trek 820', price: 350, category: 'SPORTS', location: 'Chicago, IL', condition: 'GOOD', status: 'AVAILABLE', images: '[]', createdAt: new Date(Date.now() - 7200000), updatedAt: new Date(), sellerId: '3', seller: { id: '3', name: 'Carol S.' } },
  { id: '4', title: 'Complete Harry Potter Book Set', price: 45, category: 'BOOKS', location: 'Austin, TX', condition: 'GOOD', status: 'AVAILABLE', images: '[]', createdAt: new Date(Date.now() - 10800000), updatedAt: new Date(), sellerId: '4', seller: { id: '4', name: 'Dan R.' } },
];

export default async function HomePage() {
  const dbListings = await getFeaturedListings();
  const listings = dbListings.length > 0 ? dbListings : MOCK_LISTINGS;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Buy &amp; Sell with <span className="text-yellow-300">Confidence</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
            Discover amazing deals on used goods from trusted sellers in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="bg-white text-indigo-700 font-semibold px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors"
            >
              Browse Listings
            </Link>
            <Link
              href="/listings/new"
              className="bg-yellow-400 text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Start Selling
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { label: 'Active Listings', value: '10K+' },
              { label: 'Happy Users', value: '5K+' },
              { label: 'Categories', value: '8' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-indigo-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/listings?category=${cat.value}`}
                className="flex flex-col items-center p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group"
              >
                <span className="text-3xl mb-2">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-indigo-700 text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {dbListings.length > 0 ? 'Recent Listings' : 'Sample Listings'}
            </h2>
            <Link href="/listings" className="text-indigo-600 font-medium hover:text-indigo-700 text-sm">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {dbListings.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-4">No listings yet. Be the first to sell something!</p>
              <Link
                href="/listings/new"
                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors"
              >
                Post Your First Listing
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create a Listing', desc: 'Post your item with photos, description and price in minutes.', icon: '📸' },
              { step: '2', title: 'Connect with Buyers', desc: 'Receive messages and negotiate directly with interested buyers.', icon: '💬' },
              { step: '3', title: 'Make the Sale', desc: 'Meet up safely and complete your transaction. Leave a review!', icon: '🤝' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start?</h2>
          <p className="text-gray-600 mb-8">Join thousands of people buying and selling in your community.</p>
          <Link
            href="/auth/register"
            className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
