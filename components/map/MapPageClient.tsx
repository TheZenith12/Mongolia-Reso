'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Tent, Leaf, X, ArrowRight, Star } from 'lucide-react';
import { formatPrice, getPlaceTypeLabel, cn } from '@/lib/utils';
import type { Place } from '@/lib/types';

interface MapPageClientProps {
  places: Place[];
}

export default function MapPageClient({ places }: MapPageClientProps) {
  const [selected, setSelected]   = useState<Place | null>(null);
  const [filter, setFilter]       = useState<'all' | 'resort' | 'nature'>('all');
  const [search, setSearch]       = useState('');

  // Places with coordinates only
  const mappablePlaces = useMemo(() =>
    places.filter((p) =>
      p.latitude && p.longitude &&
      (filter === 'all' || p.type === filter) &&
      (search ? p.name.toLowerCase().includes(search.toLowerCase()) : true)
    ),
    [places, filter, search]
  );

  // Build Google Maps embed with multiple markers
  const center = selected
    ? `${selected.latitude},${selected.longitude}`
    : '47.9077,106.8832'; // Ulaanbaatar

  const zoom = selected ? 13 : 5;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top controls */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-forest-100 flex-wrap">
        <h1 className="font-display text-xl font-semibold text-forest-900">🗺️ Газрын зураг</h1>

        <div className="flex gap-1.5 ml-4">
          {[
            { value: 'all',    label: 'Бүгд' },
            { value: 'resort', label: '🏕 Амралт' },
            { value: 'nature', label: '🌿 Байгаль' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === opt.value
                  ? 'bg-forest-700 text-white'
                  : 'bg-forest-50 text-forest-600 hover:bg-forest-100'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Газар хайх..."
          className="ml-auto input-field w-48 text-sm py-1.5"
        />

        <span className="text-xs text-forest-500">
          {mappablePlaces.length} газар
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Place list */}
        <div className="w-72 bg-white border-r border-forest-100 overflow-y-auto flex-shrink-0">
          {mappablePlaces.length === 0 ? (
            <div className="p-6 text-center text-forest-400 text-sm">
              <MapPin size={28} className="mx-auto mb-2 opacity-40" />
              Газар олдсонгүй
            </div>
          ) : (
            <div className="divide-y divide-forest-50">
              {mappablePlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelected(selected?.id === place.id ? null : place)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left transition-all hover:bg-forest-50',
                    selected?.id === place.id ? 'bg-forest-50 border-l-2 border-forest-600' : ''
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm',
                    place.type === 'resort' ? 'bg-amber-50' : 'bg-forest-50'
                  )}>
                    {place.type === 'resort' ? '🏕' : '🌿'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-forest-900 text-sm leading-tight truncate">
                      {place.name}
                    </div>
                    {place.province && (
                      <div className="flex items-center gap-1 text-forest-400 text-xs mt-0.5">
                        <MapPin size={10} /> {place.province}
                      </div>
                    )}
                    {place.rating_avg > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                        <Star size={10} fill="currentColor" /> {place.rating_avg.toFixed(1)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <iframe
            title="Монгол Нутаг газрын зураг"
            src={`https://maps.google.com/maps?q=${center}&z=${zoom}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            className="absolute inset-0"
          />

          {/* Selected place popup */}
          {selected && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 bg-white rounded-2xl shadow-2xl border border-forest-100 p-4 z-10">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-500 hover:bg-forest-200"
              >
                <X size={12} />
              </button>

              <div className="flex gap-3 mb-3">
                {selected.cover_image ? (
                  <img src={selected.cover_image} alt={selected.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-forest-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {selected.type === 'resort' ? '🏕' : '🌿'}
                  </div>
                )}
                <div>
                  <div className="font-display text-lg font-semibold text-forest-900 leading-tight">
                    {selected.name}
                  </div>
                  <div className="text-xs text-forest-500 mt-0.5">
                    {getPlaceTypeLabel(selected.type)}
                  </div>
                  {selected.price_per_night && (
                    <div className="text-sm font-semibold text-amber-600 mt-1">
                      {formatPrice(selected.price_per_night)}/шөнө
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-secondary text-xs py-2 text-center"
                >
                  Замын заалт
                </a>
                <Link href={`/places/${selected.id}`} className="flex-1 btn-primary text-xs py-2 justify-center">
                  Дэлгэрэнгүй <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
