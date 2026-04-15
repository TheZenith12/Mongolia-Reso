// app/(public)/profile/bookings/page.tsx
// REPLACE — хэрэглэгчийн захиалгын жагсаалтад чат линк нэмэх

import { getUserBookings } from '@/lib/actions/auth';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatDate } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:   { label: '⏳ Хүлээгдэж буй', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  confirmed: { label: '✅ Баталгаажсан',   color: 'bg-green-50 text-green-700 border border-green-200' },
  cancelled: { label: '❌ Цуцлагдсан',     color: 'bg-red-50 text-red-700 border border-red-200' },
  completed: { label: '🏁 Дууссан',        color: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

export default async function ProfileBookingsPage() {
  const bookings = await getUserBookings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-6">Миний захиалгууд</h1>

      {bookings.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-forest-400">
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
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {/* Cover image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-forest-50 flex-shrink-0">
                  {b.place?.cover_image ? (
                    <Image src={b.place.cover_image} alt={b.place.name} width={64} height={64} className="object-cover w-full h-full" />
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
                  <Link
                    href={`/profile/bookings/${b.id}`}
                    className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <MessageCircle size={12} /> Чат
                  </Link>
                </div>
              </div>

              {/* Cancel reason */}
              {b.cancel_reason && (
                <div className="px-4 pb-3 text-xs text-red-500">
                  Цуцлах шалтгаан: {b.cancel_reason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}