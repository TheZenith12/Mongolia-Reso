'use client';

import Link from 'next/link';
import { Calendar, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  activeTab: 'bookings' | 'favorites';
  bookingCount: number;
  favoriteCount: number;
}

export default function ProfileTabs({ activeTab, bookingCount, favoriteCount }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-forest-50 rounded-xl mb-8 w-fit">
      <Link
        href="/profile/bookings?tab=bookings"
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          activeTab === 'bookings'
            ? 'bg-white text-forest-900 shadow-sm'
            : 'text-forest-500 hover:text-forest-700'
        )}
      >
        <Calendar size={15} />
        Захиалгууд
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full font-semibold',
          activeTab === 'bookings' ? 'bg-forest-100 text-forest-700' : 'bg-forest-100/60 text-forest-400'
        )}>
          {bookingCount}
        </span>
      </Link>
      <Link
        href="/profile/bookings?tab=favorites"
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          activeTab === 'favorites'
            ? 'bg-white text-forest-900 shadow-sm'
            : 'text-forest-500 hover:text-forest-700'
        )}
      >
        <Heart size={15} />
        Дуртай газрууд
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full font-semibold',
          activeTab === 'favorites' ? 'bg-red-50 text-red-600' : 'bg-forest-100/60 text-forest-400'
        )}>
          {favoriteCount}
        </span>
      </Link>
    </div>
  );
}
