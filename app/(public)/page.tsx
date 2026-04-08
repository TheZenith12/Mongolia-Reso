import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import PlacesSection from '@/components/home/PlacesSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import { getFeaturedPlaces, getSiteStats } from '@/lib/actions/places';
import type { SiteStats } from '@/lib/types';

const defaultStats: SiteStats = {
  total_views: 0,
  total_places: 0,
  total_resorts: 0,
  total_nature: 0,
  total_users: 0,
  total_bookings: 0,
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: { type?: string; search?: string; province?: string; page?: string };
}) {
  const [featured, stats] = await Promise.all([
    getFeaturedPlaces(6).catch(() => []),
    getSiteStats().catch(() => defaultStats),
  ]);

  return (
    <>
      <HeroSection stats={stats} />

      {!searchParams.search && !searchParams.type && !searchParams.province && (
        <Suspense fallback={<div className="h-64 shimmer-loading rounded-2xl mx-8 mt-12" />}>
          <FeaturedSection places={featured} />
        </Suspense>
      )}

      <Suspense fallback={<PlacesSkeleton />}>
        <PlacesSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function PlacesSkeleton() {
  return (
    <section className="page-container py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card h-80 shimmer-loading" />
        ))}
      </div>
    </section>
  );
}
