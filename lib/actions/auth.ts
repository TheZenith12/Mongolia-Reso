'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { BookingFormData, Booking } from '@/lib/types';
import { calculateNights } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect('/');
}

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function getSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return data;
  } catch {
    return null;
  }
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function createBooking(formData: BookingFormData): Promise<Booking> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: place } = await supabase
    .from('places')
    .select('price_per_night, name')
    .eq('id', formData.place_id)
    .single();

  if (!place) throw new Error('Газар олдсонгүй');
  if ((!place as any).price_per_night) throw new Error('Энэ газар захиалах боломжгүй');

  const nights = calculateNights(formData.check_in, formData.check_out);
  if (nights < 1) throw new Error('Буцах огноо буруу байна');

  const total_amount = ((place as any).price_per_night as number) * nights * formData.guest_count;

  const { data, error } = await (supabase
    .from('bookings') as any)
    .insert({
      place_id:       formData.place_id,
      guest_name:     formData.guest_name,
      guest_phone:    formData.guest_phone,
      guest_email:    formData.guest_email ?? null,
      guest_count:    formData.guest_count,
      check_in:       formData.check_in,
      check_out:      formData.check_out,
      payment_method: formData.payment_method,
      notes:          formData.notes ?? null,
      user_id:        user?.id ?? null,
      total_amount,
      payment_status: 'pending',
      status:         'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/profile/bookings');
  return data as Booking;
}

export async function getUserBookings(): Promise<Booking[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('bookings')
      .select('*, place:places(id, name, cover_image, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data as Booking[]) ?? [];
  } catch {
    return [];
  }
}

export async function cancelBooking(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');
  const { error } = await (supabase
    .from('bookings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/profile/bookings');
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function toggleLike(placeId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { data: existing } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('place_id', placeId)
    .maybeSingle();

  if (existing) {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('place_id', placeId);
    return false;
  } else {
    await (supabase.from('likes') as any).insert({ user_id: user.id, place_id: placeId });
    return true;
  }
}

export async function getUserLikes(): Promise<string[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('likes')
      .select('place_id')
      .eq('user_id', user.id);
    return (data ?? []).map((l: { place_id: string }) => l.place_id);
  } catch {
    return [];
  }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function createReview(
  placeId: string,
  rating: number,
  title: string,
  body: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');
  const { error } = await (supabase
    .from('reviews') as any)
    .insert({ place_id: placeId, user_id: user.id, rating, title, body });
  if (error) throw new Error(error.message);
  revalidatePath(`/places/${placeId}`);
}
