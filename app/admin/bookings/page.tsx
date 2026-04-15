// app/admin/bookings/page.tsx
// REPLACE the entire file

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import BookingChatWrapper from '@/components/admin/BookingChatWrapper';

export default async function AdminBookingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role;
  if (!['super_admin', 'manager'].includes(role)) redirect('/');

  const admin = createAdminClient();
  let bookings: any[] = [];

  if (role === 'super_admin') {
    const { data } = await (admin.from('bookings') as any)
      .select('*, place:places(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    bookings = data ?? [];
  } else {
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id').eq('manager_id', user.id).maybeSingle();
    if (assignment?.place_id) {
      const { data } = await (admin.from('bookings') as any)
        .select('*, place:places(name)')
        .eq('place_id', assignment.place_id)
        .order('created_at', { ascending: false })
        .limit(100);
      bookings = data ?? [];
    }
  }

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-50 text-amber-700 border border-amber-200',
    confirmed: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  const statusLabels: Record<string, string> = {
    pending:   '⏳ Хүлээгдэж буй',
    confirmed: '✅ Баталгаажсан',
    cancelled: '❌ Цуцлагдсан',
    completed: '🏁 Дууссан',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Захиалгууд</h1>
        <p className="text-forest-500 text-sm mt-1">{bookings.length} захиалга</p>
      </div>

      <div className="space-y-3">
        {bookings.map((b: any) => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Booking header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-semibold text-forest-900 text-sm">{b.guest_name}</div>
                  <div className="text-xs text-forest-400 mt-0.5">{b.guest_phone} · {b.place?.name}</div>
                </div>
                <div className="text-xs text-forest-500">
                  {b.check_in} → {b.check_out}
                </div>
                <div className="font-semibold text-forest-700 text-sm">{formatPrice(b.total_amount)}</div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[b.status] ?? ''}`}>
                {statusLabels[b.status] ?? b.status}
              </span>
            </div>

            {/* Chat panel */}
            <BookingChatWrapper
              bookingId={b.id}
              currentUserId={user.id}
              currentUserRole={role}
              bookingStatus={b.status}
              cancelReason={b.cancel_reason}
              managerNote={b.manager_note}
            />
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-forest-400 text-sm">
            Захиалга байхгүй байна
          </div>
        )}
      </div>
    </div>
  );
}