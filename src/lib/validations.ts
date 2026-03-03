import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  price: z.number().min(0, 'Price must be positive'),
  category: z.enum(['ELECTRONICS', 'CLOTHING', 'FURNITURE', 'VEHICLES', 'BOOKS', 'SPORTS', 'HOME', 'OTHER']),
  location: z.string().min(2, 'Location is required'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  images: z.array(z.string()).max(5, 'Maximum 5 images allowed').default([]),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000),
  receiverId: z.string(),
  listingId: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  revieweeId: z.string(),
  listingId: z.string().optional(),
});

export const reportSchema = z.object({
  reason: z.string().min(10, 'Please provide more detail').max(500),
  listingId: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
