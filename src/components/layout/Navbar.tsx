'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { CATEGORIES } from '@/lib/utils';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/messages')
        .then((r) => r.json())
        .then((d) => {
          if (d.conversations) {
            const total = d.conversations.reduce(
              (sum: number, c: { unreadCount: number }) => sum + c.unreadCount,
              0
            );
            setUnreadCount(total);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold text-indigo-600">9ashy</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/listings/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Sell
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 hover:bg-gray-100 rounded-full py-1 px-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                          My Profile
                        </Link>
                        <Link href="/messages" className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                          )}
                        </Link>
                        {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                            Admin Dashboard
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors">
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Category bar */}
        <div className="hidden md:flex items-center space-x-1 pb-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/listings?category=${cat.value}`}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 whitespace-nowrap transition-colors"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="px-4 py-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
          <div className="px-4 pb-3 space-y-1">
            <Link href="/listings" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Browse Listings</Link>
            <Link href="/listings/new" className="block py-2 text-sm text-indigo-600 font-medium" onClick={() => setMenuOpen(false)}>+ Post Listing</Link>
            {user ? (
              <>
                <Link href="/profile" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link href="/messages" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Messages {unreadCount > 0 && `(${unreadCount})`}</Link>
                <button onClick={() => { setMenuOpen(false); logout(); }} className="block w-full text-left py-2 text-sm text-red-600">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link href="/auth/register" className="block py-2 text-sm text-indigo-600 font-medium" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
