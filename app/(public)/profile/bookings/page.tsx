import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getUserBookings } from '@/lib/actions/auth';
import { formatPrice, formatDate, getBookingStatusLabel, getPaymentStatusLabel } from '@/lib/utils';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

export default async function MyBookingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/auth/login?redirect=/profile/bookings');

  const bookings = await getUserBookings();

  const statusColors: Record<string, string> = {
    pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="page-container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-semibold text-forest-900 mb-2">Миний захиалгууд</h1>
        <p className="text-forest-500 mb-8">{bookings.length} захиалга</p>

        {bookings.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🏕</div>
            <h2 className="font-display text-2xl font-semibold text-forest-700 mb-2">Захиалга байхгүй байна</h2>
            <p className="text-forest-500 mb-6 text-sm">Амралтын газар захиалж, Монголын байгалийг мэдрэх цаг боллоо!</p>
            <Link href="/" className="btn-primary">Газар хайх</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const place = (booking as any).place;
              return (
                <div key={booking.id} className="card p-5">
                  <div className="flex gap-4">
                    {place?.cover_image ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={place.cover_image} alt={place.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-forest-50 flex items-center justify-center text-3xl flex-shrink-0">
                        {place?.type === 'resort' ? '🏕' : '🌿'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display text-xl font-semibold text-forest-900 leading-tight">
                          {place?.name ?? 'Газар'}
                        </h3>
                        <span className={`badge text-xs flex-shrink-0 ${statusColors[booking.status] ?? ''}`}>
                          {getBookingStatusLabel(booking.status)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-forest-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(booking.check_in)} — {formatDate(booking.check_out)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {booking.guest_count} хүн · {booking.nights} шөнө
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-forest-900">{formatPrice(booking.total_amount)}</span>
                          <span className={`ml-2 badge text-xs ${
                            booking.payment_status === 'paid'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                            {getPaymentStatusLabel(booking.payment_status)}
                          </span>
                        </div>

                        {booking.payment_status === 'pending' && (
                          <Link href={`/booking/${booking.id}/payment`}
                            className="flex items-center gap-1 text-amber-600 text-xs font-medium hover:text-amber-700">
                            Төлбөр хийх <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
