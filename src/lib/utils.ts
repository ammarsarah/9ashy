export const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics', icon: '📱' },
  { value: 'CLOTHING', label: 'Clothing', icon: '👕' },
  { value: 'FURNITURE', label: 'Furniture', icon: '🪑' },
  { value: 'VEHICLES', label: 'Vehicles', icon: '🚗' },
  { value: 'BOOKS', label: 'Books', icon: '📚' },
  { value: 'SPORTS', label: 'Sports', icon: '⚽' },
  { value: 'HOME', label: 'Home & Garden', icon: '🏠' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
] as const;

export const CONDITIONS = [
  { value: 'NEW', label: 'New', color: 'green' },
  { value: 'LIKE_NEW', label: 'Like New', color: 'blue' },
  { value: 'GOOD', label: 'Good', color: 'yellow' },
  { value: 'FAIR', label: 'Fair', color: 'orange' },
  { value: 'POOR', label: 'Poor', color: 'red' },
] as const;

export const LISTING_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  RESERVED: 'RESERVED',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getCategoryIcon(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? '📦';
}

export function getConditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return then.toLocaleDateString();
}

export function parseImages(imagesJson: string): string[] {
  try {
    const parsed = JSON.parse(imagesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
