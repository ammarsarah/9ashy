'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { timeAgo, parseImages, formatPrice } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string | null };
  listing?: { id: string; title: string; images: string; price: number } | null;
}

interface Partner {
  id: string;
  name: string;
  avatar?: string | null;
  bio?: string | null;
}

export default function ConversationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const fetchMessages = async () => {
    if (!user || !userId) return;
    try {
      const res = await fetch(`/api/messages/${userId}`);
      const data = await res.json();
      setMessages(data.messages || []);
      setPartner(data.partner);

      // Mark as read
      await fetch(`/api/messages/${userId}/read`, { method: 'PUT' });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim(), receiverId: userId }),
      });

      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Link href="/messages" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {partner ? (
            <Link href={`/profile/${partner.id}`} className="flex items-center gap-2 hover:opacity-80">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                {partner.avatar ? (
                  <img src={partner.avatar} alt={partner.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  partner.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-medium text-gray-900">{partner.name}</span>
            </Link>
          ) : (
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === user.id;
              const listingImages = msg.listing ? parseImages(msg.listing.images) : [];

              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {msg.listing && (
                      <Link
                        href={`/listings/${msg.listing.id}`}
                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs hover:bg-gray-100 transition-colors mb-1"
                      >
                        {listingImages.length > 0 && (
                          <img src={listingImages[0]} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">{msg.listing.title}</div>
                          <div className="text-indigo-600 font-semibold">{formatPrice(msg.listing.price)}</div>
                        </div>
                      </Link>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
