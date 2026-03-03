'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { timeAgo } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count?: { listings: number };
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    fetch(`/api/admin/users?page=${page}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  const handleAction = async (userId: string, action: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setUsers(users.map((u) => u.id === userId ? { ...u, role: action === 'block' ? 'BLOCKED' : 'USER' } : u));
    } catch {
      // ignore
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      <div className="flex gap-3 mb-8">
        <Link href="/admin" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Overview</Link>
        <Link href="/admin/users" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Users</Link>
        <Link href="/admin/listings" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Listings</Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                    <div className="text-gray-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' :
                      u.role === 'MODERATOR' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'BLOCKED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{timeAgo(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.id !== user.id && (
                      <div className="flex gap-2">
                        {u.role === 'BLOCKED' ? (
                          <button
                            onClick={() => handleAction(u.id, 'unblock')}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(u.id, 'block')}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Block
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
