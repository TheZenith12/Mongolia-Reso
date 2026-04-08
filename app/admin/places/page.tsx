import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { formatPrice, getPlaceTypeLabel, getPlaceTypeColor } from '@/lib/utils';
import { Plus, MapPin } from 'lucide-react';
import AdminPlaceActions from '@/components/admin/AdminPlaceActions';

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string; search?: string };
}) {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('places')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (searchParams.type)   query = query.eq('type', searchParams.type);
  if (searchParams.search) query = query.ilike('name', `%${searchParams.search}%`);

  const { data: places, count, error } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">Газрууд</h1>
          <p className="text-forest-500 text-sm mt-1">{count ?? 0} нийт газар</p>
        </div>
        <Link href="/admin/places/new" className="btn-primary">
          <Plus size={17} /> Шинэ газар нэмэх
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex gap-3">
        <form className="flex gap-3 flex-1">
          <input name="search" defaultValue={searchParams.search}
            placeholder="Нэрээр хайх..." className="input-field flex-1 text-sm py-2" />
          <select name="type" defaultValue={searchParams.type ?? ''} className="input-field w-44 text-sm py-2">
            <option value="">Бүгд</option>
            <option value="resort">Амралтын газар</option>
            <option value="nature">Байгалийн газар</option>
          </select>
          <button type="submit" className="btn-primary text-sm py-2">Хайх</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Газар', 'Төрөл', 'Байршил', 'Үнэ', 'Статус', 'Үйлдэл'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(places ?? []).map((place) => (
              <tr key={(place as any).id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-forest-100 flex-shrink-0">
                      {(place as any).cover_image ? (
                        <Image src={(place as any).cover_image} alt={(place as any).name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {(place as any).type === 'resort' ? '🏕' : '🌿'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-forest-900 text-sm">{(place as any).name}</div>
                      <div className="text-xs text-forest-400 mt-0.5">
                        👁 {(place as any).view_count ?? 0} · ❤️ {(place as any).like_count ?? 0}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`badge text-xs ${getPlaceTypeColor((place as any).type)}`}>
                    {getPlaceTypeLabel((place as any).type)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {(place as any).province ? (
                    <div className="flex items-center gap-1 text-forest-500 text-xs">
                      <MapPin size={12} /> {(place as any).province}
                    </div>
                  ) : <span className="text-forest-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-4">
                  <span className="text-forest-700 text-sm font-medium">
                    {(place as any).price_per_night ? formatPrice((place as any).price_per_night) : '—'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`badge text-xs ${ (place as any).is_published
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    { (place as any).is_published ? '✓ Нийтлэгдсэн' : '○ Ноорог'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <AdminPlaceActions place={place as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!places || places.length === 0) && (
          <div className="text-center py-16 text-forest-400 text-sm">
            {error ? `Алдаа: ${error.message}` : 'Газар байхгүй байна'}
          </div>
        )}
      </div>
    </div>
  );
}