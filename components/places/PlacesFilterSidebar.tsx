'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { MONGOLIAN_PROVINCES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlacesFilterSidebarProps {
  current: {
    type?: string; province?: string; minPrice?: string; maxPrice?: string; search?: string;
  };
}

export default function PlacesFilterSidebar({ current }: PlacesFilterSidebarProps) {
  const router = useRouter();
  const [type, setType] = useState(current.type ?? '');
  const [province, setProvince] = useState(current.province ?? '');
  const [minPrice, setMinPrice] = useState(current.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(current.maxPrice ?? '');
  const [priceOpen, setPriceOpen] = useState(true);
  const [provOpen, setProvOpen] = useState(true);

  const activeCount = [type, province, minPrice, maxPrice].filter(Boolean).length;

  function apply() {
    const params = new URLSearchParams();
    if (type)     params.set('type', type);
    if (province) params.set('province', province);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (current.search) params.set('search', current.search);
    router.push(`/places?${params.toString()}`);
  }

  function reset() {
    setType(''); setProvince(''); setMinPrice(''); setMaxPrice('');
    router.push('/places');
  }

  return (
    <div className="card p-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-semibold text-forest-900">
          <SlidersHorizontal size={16} /> Шүүлтүүр
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-forest-700 text-white text-[10px] flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={12} /> Цэвэрлэх
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5">
          Газрын төрөл
        </label>
        <div className="space-y-2">
          {[
            { value: '',       label: 'Бүгд',            icon: '🗺️' },
            { value: 'resort', label: 'Амралтын газар',  icon: '🏕' },
            { value: 'nature', label: 'Байгалийн газар', icon: '🌿' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all',
                type === opt.value
                  ? 'bg-forest-700 text-white font-medium'
                  : 'text-forest-600 hover:bg-forest-50'
              )}
            >
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Province filter */}
      <div className="mb-5 border-t border-forest-100 pt-5">
        <button
          onClick={() => setProvOpen(!provOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5"
        >
          Аймаг
          {provOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {provOpen && (
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="">Бүх аймаг</option>
            {MONGOLIAN_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Price range */}
      <div className="mb-5 border-t border-forest-100 pt-5">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5"
        >
          Үнийн хязгаар
          {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {priceOpen && (
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 text-xs">₮</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Доод үнэ"
                className="input-field pl-7 text-sm py-2"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 text-xs">₮</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Дээд үнэ"
                className="input-field pl-7 text-sm py-2"
              />
            </div>
          </div>
        )}
      </div>

      <button onClick={apply} className="btn-primary w-full text-sm">
        Шүүлтүүр хэрэглэх
      </button>
    </div>
  );
}
