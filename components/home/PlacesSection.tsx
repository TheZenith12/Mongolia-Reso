import { getPlaces } from '@/lib/actions/places';
import { getUserLikes } from '@/lib/actions/auth';
import PlacesGrid from '@/components/places/PlacesGrid';
import SortSelect from '@/components/places/SortSelect';

interface PlacesSectionProps {
  searchParams: {
    type?: string;
    search?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
  };
}

export default async function PlacesSection({ searchParams }: PlacesSectionProps) {
  const page = parseInt(searchParams.page ?? '1', 10);

  const [result, likedIds] = await Promise.all([
    getPlaces({
      type:      searchParams.type as 'resort' | 'nature' | undefined,
      search:    searchParams.search,
      province:  searchParams.province,
      minPrice:  searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice:  searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      page,
      pageSize:  12,
      sortBy:    (searchParams.sort as 'created_at' | 'price_per_night' | 'rating_avg' | 'view_count') ?? 'created_at',
      sortOrder: 'desc',
    }).catch(() => ({ data: [], count: 0, page: 1, pageSize: 12, totalPages: 0 })),
    getUserLikes().catch(() => []),
  ]);

  if (result.count === 0 && !searchParams.search && !searchParams.type) {
    return (
      <section className="page-container py-16">
        <div className="text-center py-20 bg-white rounded-2xl border border-forest-100">
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="font-display text-2xl font-semibold text-forest-700 mb-3">
            Supabase тохируулах шаардлагатай
          </h2>
          <p className="text-forest-500 text-sm max-w-md mx-auto leading-relaxed">
            <code className="bg-forest-50 px-2 py-1 rounded text-forest-700">.env.local</code> файлд
            Supabase URL болон API key-ийг оруулж, дараа нь{' '}
            <code className="bg-forest-50 px-2 py-1 rounded text-forest-700">supabase/schema.sql</code>-ийг
            Supabase SQL Editor дээр ажиллуулна уу.
          </p>
          <div className="mt-6 text-left inline-block bg-forest-950 text-green-300 rounded-xl px-6 py-4 text-sm font-mono">
            <div className="text-forest-400 text-xs mb-2"># .env.local</div>
            <div>NEXT_PUBLIC_SUPABASE_URL=<span className="text-amber-300">https://xxx.supabase.co</span></div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-amber-300">eyJ...</span></div>
            <div>SUPABASE_SERVICE_ROLE_KEY=<span className="text-amber-300">eyJ...</span></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-title">
            {searchParams.type === 'resort' ? '🏕 Амралтын газрууд' :
             searchParams.type === 'nature' ? '🌿 Байгалийн газрууд' :
             'Бүх газрууд'}
          </h2>
          <p className="text-forest-500 mt-1.5 font-body text-sm">
            {result.count} газар олдлоо
          </p>
        </div>
        <SortSelect current={searchParams.sort} />
      </div>

      <PlacesGrid
        places={result.data}
        likedIds={likedIds}
        pagination={{
          page:       result.page,
          totalPages: result.totalPages,
          count:      result.count,
        }}
        searchParams={searchParams}
      />
    </section>
  );
}
