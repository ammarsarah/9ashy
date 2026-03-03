import { Suspense } from 'react';
import ListingsClient from './ListingsClient';

export const metadata = {
  title: 'Browse Listings',
  description: 'Find great deals on used goods near you.',
};

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ListingsClient />
    </Suspense>
  );
}
