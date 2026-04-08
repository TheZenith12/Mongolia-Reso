import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentProfile } from '@/lib/actions/auth';
import PaymentClient from '@/components/booking/PaymentClient';
import type { Database } from '@/lib/database.types';

type BookingRow = Database['public']['Tables']['bookings']['Row'] & {
  place: Pick<Database['public']['Tables']['places']['Row'], 'id' | 'name' | 'cover_image' | 'price_per_night' | 'type'> | null;
};

async function getBooking(id: string): Promise<BookingRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, place:places(id, name, cover_image, price_per_night, type)')
    .eq('id', id)
    .single();
  return data as BookingRow | null;
}

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const [booking, profile] = await Promise.all([
    getBooking(params.id),
    getCurrentProfile(),
  ]);

  if (!booking) notFound();
  if (booking.payment_status === 'paid') redirect(`/booking/${params.id}/confirmation`);

  return <PaymentClient booking={booking as any} profile={profile} />;
}
