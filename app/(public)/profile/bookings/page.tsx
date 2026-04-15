import { getUserBookings } from '@/lib/actions/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { MessageCircle, Heart, Calendar, Tent, Leaf } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: '⏳ Хүлээгдэж буй', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: '✅ Баталгаажсан',   color: 'bg-green-50 text-green-700 border border-green-200' },
  cancelled: { label: '❌ Цуцлагдсан',     color: 'bg-red-50 text-red-700 border border-red-200' },
  completed: { label: '🏁 Дууссан',        color: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

export default async function ProfileBookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const activeTab = searchParams.tab === 'favorites' ? 'favorites' : 'bookings';
  const bookings = await getUserBookings();

  // Liked places
  const { data: likesRaw } = await supabase
    .from('likes')
    .select('place_id, places(id, name, cover_image, type, province, price_per_night, rating_avg)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const likedPlaces = (likesRaw ?? []).map((l: any) => l.places).filter(Boolean);
  const favoriteCount = likedPlaces.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-6">Миний профайл</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-forest-50 rounded-xl mb-8 w-fit">
        <Link
          href="/profile/bookings?tab=bookings"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'bookings'
              ? 'bg-white text-forest-900 shadow-sm'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          <Calendar size={15} />
          Захиалгууд
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
            activeTab === 'bookings' ? 'bg-forest-100 text-forest-700' : 'bg-forest-100/60 text-forest-400'
          }`}>
            {bookings.length}
          </span>
        </Link>
        <Link
          href="/profile/bookings?tab=favorites"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'favorites'
              ? 'bg-white text-forest-900 shadow-sm'
              : 'text-forest-500 hover:text-forest-700'
          }`}
        >
          <Heart size={15} />
          Дуртай газрууд
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
            activeTab === 'favorites' ? 'bg-red-50 text-red-600' : 'bg-forest-100/60 text-forest-400'
          }`}>
            {favoriteCount}
          </span>
        </Link>
      </div>

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <>
          {bookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-forest-400">
              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Захиалга байхгүй байна</p>
              <Link href="/places" className="text-forest-600 text-sm font-medium mt-2 inline-block hover:underline">
                → Газрууд үзэх
              </Link>
            </div>
          )}
          <div className="space-y-3">
            {bookings.map((b: any) => {
              const sc = statusConfig[b.status] ?? { label: b.status, color: 'bg-gray-50 text-gray-600 border border-gray-200' };
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-forest-200 transition-colors">
                  <Link href={`/profile/bookings/${b.id}`} className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-forest-50 flex-shrink-0">
                      {b.place?.cover_image ? (
                        <Image src={b.place.cover_image} alt={b.place?.name ?? ''} width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏕</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-forest-900 text-sm">{b.place?.name ?? '—'}</div>
                      <div className="text-xs text-forest-400 mt-0.5">{b.check_in} → {b.check_out}</div>
                      <div className="text-sm font-semibold text-forest-700 mt-1">{formatPrice(b.total_amount)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.color}`}>
                        {sc.label}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-forest-500 bg-forest-50 px-2.5 py-1 rounded-lg">
                        <MessageCircle size={12} /> Чат харах
                      </span>
                    </div>
                  </Link>
                  {b.cancel_reason && (
                    <div className="px-4 pb-3 text-xs text-red-500">
                      Цуцлах шалтгаан: {b.cancel_reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Favorites tab */}
      {activeTab === 'favorites' && (
        <>
          {likedPlaces.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-forest-400">
              <Heart size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Дуртай газар байхгүй байна</p>
              <Link href="/places" className="text-forest-600 text-sm font-medium mt-2 inline-block hover:underline">
                → Газрууд үзэх
              </Link>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {likedPlaces.map((place: any) => (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-forest-200 hover:shadow-sm transition-all group"
              >
                <div className="relative h-40 bg-forest-50">
                  {place.cover_image ? (
                    <Image
                      src={place.cover_image}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {place.type === 'resort'
                        ? <Tent size={40} className="text-forest-200" />
                        : <Leaf size={40} className="text-forest-200" />}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 backdrop-blur-sm text-red-500 rounded-full p-1.5 flex items-center">
                      <Heart size={13} fill="currentColor" />
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                      place.type === 'resort'
                        ? 'bg-amber-50/90 text-amber-700'
                        : 'bg-forest-50/90 text-forest-700'
                    }`}>
                      {place.type === 'resort' ? '🏕 Амралтын газар' : '🌿 Байгалийн газар'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-forest-900 text-sm">{place.name}</h3>
                  {place.province && <p className="text-xs text-forest-400 mt-0.5">{place.province}</p>}
                  <div className="flex items-center justify-between mt-2">
                    {place.rating_avg > 0 && (
                      <span className="text-xs text-amber-600">⭐ {Number(place.rating_avg).toFixed(1)}</span>
                    )}
                    {place.price_per_night && (
                      <span className="text-xs font-semibold text-forest-700">
                        ₮{Number(place.price_per_night).toLocaleString()} / шөнө
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
