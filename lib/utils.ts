import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (!price) return 'Үнэгүй';
  return '₮' + price.toLocaleString('en-US');
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Өнөөдөр';
  if (diffDays === 1) return 'Өчигдөр';
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} долоо хоногийн өмнө`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} сарын өмнө`;
  return `${Math.floor(diffDays / 365)} жилийн өмнө`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diffTime = outDate.getTime() - inDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getPlaceTypeLabel(type: string): string {
  return type === 'resort' ? 'Амралтын газар' : 'Байгалийн үзэсгэлэнт газар';
}

export function getPlaceTypeColor(type: string): string {
  return type === 'resort'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-forest-100 text-forest-800 border-forest-200';
}

export function getBookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending:   'Хүлээгдэж буй',
    confirmed: 'Батлагдсан',
    cancelled: 'Цуцлагдсан',
    completed: 'Дууссан',
  };
  return labels[status] ?? status;
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending:  'Хүлээгдэж буй',
    paid:     'Төлөгдсөн',
    failed:   'Амжилтгүй',
    refunded: 'Буцаагдсан',
  };
  return labels[status] ?? status;
}

export function buildCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  const { width = 800, height, quality = 80 } = options;
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : '',
    `q_${quality}`,
    'f_auto',
    'c_fill',
  ]
    .filter(Boolean)
    .join(',');
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms}/${publicId}`;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
