import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CheckCircle, Calendar, Users, MapPin, ArrowRight, Home } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Database } from '@/lib/database.types';

// ===== TYPES =====
type Booking = Database['public']['Tables']['bookings']['Row'];
type Place = Database['public']['Tables']['places']['Row'];

type BookingWithPlace = Booking & {
  place: Pick<Place, 'id' | 'name' | 'cover_image' | 'province'> | null;
};

// ===== DATA FETCH =====
async function getBooking(id: string): Promise<BookingWithPlace | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      place:places (
        id,
        name,
        cover_image,
        province
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return data as BookingWithPlace;
}

// ===== PAGE =====
export default async function ConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await getBooking(params.id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="font-display text-4xl font-semibold text-forest-900 mb-3">
          Захиалга баталгаажлаа!
        </h1>

        <p className="text-forest-500 mb-8 leading-relaxed">
          Таны захиалга амжилттай бүртгэгдлээ. Захиалгын дугаар:
          <br />
          <code className="font-mono text-forest-700 bg-forest-50 px-2 py-0.5 rounded-lg text-sm">
            {booking.id.slice(0, 12)}...
          </code>
        </p>

        {/* Booking details */}
        <div className="card p-6 text-left mb-6">
          {booking.place && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-forest-100">
              {booking.place.cover_image && (
                <img
                  src={booking.place.cover_image}
                  alt={booking.place.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              )}
              <div>
                <div className="font-display text-lg font-semibold text-forest-900">
                  {booking.place.name}
                </div>
                {booking.place.province && (
                  <div className="flex items-center gap-1 text-forest-500 text-xs mt-0.5">
                    <MapPin size={11} /> {booking.place.province}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-forest-600">
              <Calendar size={15} className="text-forest-400" />
              <span>
                {formatDate(booking.check_in)} —{' '}
                {formatDate(booking.check_out)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-forest-600">
              <Users size={15} className="text-forest-400" />
              <span>
                {booking.guest_count} хүн · {booking.nights} шөнө
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-forest-100">
              <span className="font-semibold text-forest-900">Нийт дүн</span>
              <span className="font-bold text-amber-600 text-base">
                {formatPrice(booking.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {booking.payment_status === 'paid'
            ? 'Төлбөр амжилттай хийгдсэн'
            : 'Захиалга хүлээгдэж байна'}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profile/bookings" className="btn-primary">
            Миний захиалгууд <ArrowRight size={15} />
          </Link>
          <Link href="/" className="btn-secondary">
            <Home size={15} /> Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}