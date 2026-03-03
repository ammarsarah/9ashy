export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  condition: string;
  status: string;
  images: string; // JSON string
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  seller?: User;
  reviews?: Review[];
  _count?: {
    reviews?: number;
  };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  listingId?: string | null;
  read: boolean;
  createdAt: Date;
  sender?: User;
  receiver?: User;
  listing?: Listing | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  reviewerId: string;
  revieweeId: string;
  listingId?: string | null;
  createdAt: Date;
  reviewer?: User;
  reviewee?: User;
  listing?: Listing | null;
}

export interface Report {
  id: string;
  reason: string;
  reporterId: string;
  listingId: string;
  status: string;
  createdAt: Date;
  reporter?: User;
  listing?: Listing;
}

export interface ListingWithSeller extends Listing {
  seller: User;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListingFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  pageSize?: number;
}
