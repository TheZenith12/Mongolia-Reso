import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import PlaceCard from '@/components/places/PlaceCard';
import type { Place } from '@/lib/types';

interface FeaturedSectionProps {
  places: Place[];
}

export default function FeaturedSection({ places }: FeaturedSectionProps) {
  if (!places.length) return null;

  return (
    <section className="page-container py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-amber-600 text-sm font-medium font-body tracking-wide uppercase">
              Онцлох газрууд
            </span>
          </div>
          <h2 className="section-title">Хамгийн их сонирхолтой</h2>
          <p className="text-forest-500 mt-2 font-body">
            Хэрэглэгчдийн хамгийн өндөр үнэлгээ авсан газрууд
          </p>
        </div>
        <Link href="/places" className="btn-secondary hidden sm:flex items-center gap-2 text-sm">
          Бүгдийг үзэх <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => (
          <div
            key={place.id}
            className="animate-fade-up opacity-0"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
          >
            <PlaceCard place={place} />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8 sm:hidden">
        <Link href="/places" className="btn-secondary">
          Бүгдийг үзэх <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
