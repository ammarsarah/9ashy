import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/components/layout/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: '9ashy - Buy & Sell Used Goods',
    template: '%s | 9ashy',
  },
  description: 'The best marketplace for buying and selling used goods in your community.',
  keywords: ['marketplace', 'buy', 'sell', 'used goods', 'secondhand', 'C2C'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: '9ashy',
    title: '9ashy - Buy & Sell Used Goods',
    description: 'The best marketplace for buying and selling used goods in your community.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-indigo-400">9ashy</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    The trusted marketplace for buying and selling used goods in your community.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Browse</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/listings" className="hover:text-white transition-colors">All Listings</a></li>
                    <li><a href="/listings?category=ELECTRONICS" className="hover:text-white transition-colors">Electronics</a></li>
                    <li><a href="/listings?category=CLOTHING" className="hover:text-white transition-colors">Clothing</a></li>
                    <li><a href="/listings?category=FURNITURE" className="hover:text-white transition-colors">Furniture</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Account</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/auth/login" className="hover:text-white transition-colors">Sign In</a></li>
                    <li><a href="/auth/register" className="hover:text-white transition-colors">Register</a></li>
                    <li><a href="/listings/new" className="hover:text-white transition-colors">Sell Item</a></li>
                    <li><a href="/profile" className="hover:text-white transition-colors">My Profile</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} 9ashy. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
