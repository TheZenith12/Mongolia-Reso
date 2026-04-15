'use client';

import { useRouter } from 'next/navigation';
import BookingChat from '@/components/booking/BookingChat';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface BookingChatWrapperProps {
  bookingId: string;
  currentUserId: string;
  currentUserRole: string;
  bookingStatus: string;
  cancelReason?: string | null;
  managerNote?: string | null;
}

export default function BookingChatWrapper({
  bookingId,
  currentUserId,
  currentUserRole,
  bookingStatus,
  cancelReason,
  managerNote,
}: BookingChatWrapperProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleConfirm(note: string) {
    const { error } = await (supabase.from('bookings') as any).update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      manager_note: note || null,
      updated_at: new Date().toISOString(),
    }).eq('id', bookingId);

    if (error) throw new Error(error.message);

    // Send auto message to chat
    if (note) {
      await (supabase.from('booking_messages') as any).insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        sender_role: currentUserRole,
        message: `✅ Захиалга баталгаажлаа. ${note}`,
      });
    } else {
      await (supabase.from('booking_messages') as any).insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        sender_role: currentUserRole,
        message: '✅ Захиалга баталгаажлаа. Тавтай морилно уу!',
      });
    }
    router.refresh();
  }

  async function handleCancel(reason: string) {
    const { error } = await (supabase.from('bookings') as any).update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
      updated_at: new Date().toISOString(),
    }).eq('id', bookingId);

    if (error) throw new Error(error.message);

    // Send auto message
    await (supabase.from('booking_messages') as any).insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      message: `❌ Захиалга цуцлагдлаа. Шалтгаан: ${reason}`,
    });
    router.refresh();
  }

  return (
    <div className="px-5 py-4">
      <BookingChat
        bookingId={bookingId}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        bookingStatus={bookingStatus}
        showActions={true}
        cancelReason={cancelReason}
        managerNote={managerNote}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
