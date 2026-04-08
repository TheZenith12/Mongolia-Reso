'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Eye, Heart, Tent, Leaf, ArrowRight } from 'lucide-react';
import { cn, formatPrice, getPlaceTypeLabel } from '@/lib/utils';
import type { Place } from '@/lib/types';

interface PlaceCardProps {
  place: Place;
  liked?: boolean;
  onLike?: (id: string) => void;
  className?: string;
}

export default function PlaceCard({ place, liked = false, onLike, className }: PlaceCardProps) {
  const isResort = place.type === 'resort';

  return (
    <article className={cn('card card-hover group relative', className)}>
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-forest-100">
        {place.cover_image ? (
          <Image
            src={place.cover_image}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-forest-100">
            {isResort
              ? <Tent size={48} className="text-forest-300" />
              : <Leaf size={48} className="text-forest-300" />}
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />

        {/* Type badge */}
        <div className={cn(
          'absolute top-3 left-3 badge text-[11px]',
          isResort
            ? 'bg-amber-50/90 text-amber-800 border-amber-200/60'
            : 'bg-forest-50/90 text-forest-700 border-forest-200/60'
        )}>
          {isResort ? '🏕' : '🌿'} {getPlaceTypeLabel(place.type)}
        </div>

        {/* Like button */}
        {onLike && (
          <button
            onClick={(e) => { e.preventDefault(); onLike(place.id); }}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
              'transition-all duration-200 backdrop-blur-sm',
              liked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-forest-400 hover:text-red-500'
            )}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Price badge (resort only) */}
        {isResort && place.price_per_night && (
          <div className="absolute bottom-3 left-3 glass px-2.5 py-1 rounded-lg">
            <span className="text-forest-900 text-xs font-semibold">
              {formatPrice(place.price_per_night)}
              <span className="text-forest-500 font-normal"> / шөнө</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-xl font-semibold text-forest-900 leading-tight mb-1.5 line-clamp-1">
          {place.name}
        </h3>

        {/* Location */}
        {place.province && (
          <div className="flex items-center gap-1.5 text-forest-500 text-xs mb-2">
            <MapPin size={12} />
            <span>{place.province}{place.district ? `, ${place.district}` : ''}</span>
          </div>
        )}

        {/* Description */}
        {place.short_desc && (
          <p className="text-forest-600 text-sm leading-relaxed line-clamp-2 mb-3">
            {place.short_desc}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-forest-100">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1 text-xs">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-forest-800">
                {place.rating_avg > 0 ? place.rating_avg.toFixed(1) : '—'}
              </span>
              {place.rating_count > 0 && (
                <span className="text-forest-400">({place.rating_count})</span>
              )}
            </div>

            {/* Views */}
            <div className="flex items-center gap-1 text-xs text-forest-400">
              <Eye size={12} />
              <span>{place.view_count.toLocaleString()}</span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1 text-xs text-forest-400">
              <Heart size={12} />
              <span>{place.like_count}</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/places/${place.id}`}
            className="flex items-center gap-1 text-forest-700 text-xs font-medium hover:text-forest-900 transition-colors group/link"
          >
            Дэлгэрэнгүй
            <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Skeleton loader
export function PlaceCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-52 shimmer-loading" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-3/4 shimmer-loading rounded-lg" />
        <div className="h-4 w-1/2 shimmer-loading rounded-lg" />
        <div className="h-4 w-full shimmer-loading rounded-lg" />
        <div className="h-4 w-2/3 shimmer-loading rounded-lg" />
      </div>
    </div>
  );
}
