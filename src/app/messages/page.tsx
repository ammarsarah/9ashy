'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { timeAgo } from '@/lib/utils';

interface Conversation {
  userId: string;
  user: { id: string; name: string; avatar?: string | null };
  lastMessage: { content: string; createdAt: string; senderId: string };
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/messages');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/messages')
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-sm mb-4">When you contact sellers, your conversations will appear here.</p>
            <Link href="/listings" className="text-indigo-600 font-medium hover:text-indigo-700 text-sm">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {conversations.map((conv) => (
              <Link
                key={conv.userId}
                href={`/messages/${conv.userId}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
                  {conv.user.avatar ? (
                    <img src={conv.user.avatar} alt={conv.user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    conv.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {conv.user.name}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(conv.lastMessage.createdAt)}</span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {conv.lastMessage.senderId === user.id ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
