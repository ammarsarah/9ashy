'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';

interface Stats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalMessages: number;
  totalReviews: number;
  pendingReports: number;
  recentUsers: number;
  recentListings: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR'))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) return;
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: `+${stats.recentUsers} this week`, colorClass: 'text-indigo-600' },
    { label: 'Total Listings', value: stats.totalListings, sub: `+${stats.recentListings} this week`, colorClass: 'text-blue-600' },
    { label: 'Active Listings', value: stats.activeListings, sub: `${stats.soldListings} sold`, colorClass: 'text-green-600' },
    { label: 'Total Messages', value: stats.totalMessages, sub: 'All time', colorClass: 'text-purple-600' },
    { label: 'Total Reviews', value: stats.totalReviews, sub: 'All time', colorClass: 'text-yellow-600' },
    { label: 'Pending Reports', value: stats.pendingReports, sub: 'Needs attention', colorClass: stats.pendingReports > 0 ? 'text-red-600' : 'text-gray-600' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mb-8">
        <Link href="/admin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Overview</Link>
        <Link href="/admin/users" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Users</Link>
        <Link href="/admin/listings" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Listings</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${card.colorClass}`}>{card.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
