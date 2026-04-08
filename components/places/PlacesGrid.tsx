'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import PlaceCard from './PlaceCard';
import { toggleLike } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import type { Place } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlacesGridProps {
  places: Place[];
  likedIds: string[];
  pagination: { page: number; totalPages: number; count: number };
  searchParams: Record<string, string | undefined>;
}

export default function PlacesGrid({ places, likedIds, pagination, searchParams }: PlacesGridProps) {
  const router = useRouter();
  const [liked, setLiked] = useState<Set<string>>(new Set(likedIds));

  async function handleLike(placeId: string) {
    try {
      const result = await toggleLike(placeId);
      setLiked((prev) => {
        const next = new Set(prev);
        if (result) next.add(placeId); else next.delete(placeId);
        return next;
      });
      toast.success(result ? '❤️ Хадгаллаа' : 'Хадгалалтаас хасагдлаа');
    } catch {
      toast.error('Нэвтрэх шаардлагатай');
      router.push('/auth/login');
    }
  }

  if (!places.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <SearchX size={48} className="text-forest-200 mb-4" />
        <h3 className="font-display text-2xl font-semibold text-forest-700 mb-2">
          Газар олдсонгүй
        </h3>
        <p className="text-forest-500 text-sm">
          Хайлтын нөхцөлийг өөрчлөөд дахин оролдоно уу
        </p>
      </div>
    );
  }

  function buildPageUrl(page: number) {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v != null)) as Record<string, string>
    );
    params.set('page', String(page));
    return `/?${params.toString()}`;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => (
          <div
            key={place.id}
            className="animate-fade-up opacity-0"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
          >
            <PlaceCard
              place={place}
              liked={liked.has(place.id)}
              onLike={handleLike}
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <a
            href={buildPageUrl(pagination.page - 1)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
              pagination.page <= 1
                ? 'border-forest-100 text-forest-300 cursor-not-allowed pointer-events-none'
                : 'border-forest-200 text-forest-600 hover:bg-forest-50'
            )}
          >
            <ChevronLeft size={18} />
          </a>

          {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
            const p = i + 1;
            return (
              <a
                key={p}
                href={buildPageUrl(p)}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors',
                  p === pagination.page
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'border-forest-200 text-forest-600 hover:bg-forest-50'
                )}
              >
                {p}
              </a>
            );
          })}

          <a
            href={buildPageUrl(pagination.page + 1)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
              pagination.page >= pagination.totalPages
                ? 'border-forest-100 text-forest-300 cursor-not-allowed pointer-events-none'
                : 'border-forest-200 text-forest-600 hover:bg-forest-50'
            )}
          >
            <ChevronRight size={18} />
          </a>
        </div>
      )}
    </>
  );
}
