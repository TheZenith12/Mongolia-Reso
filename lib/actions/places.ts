'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import type { Place, PlaceFormData, PlacesFilter, PaginatedResponse, SiteStats } from '@/lib/types';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const EMPTY: PaginatedResponse<Place> = { data: [], count: 0, page: 1, pageSize: 12, totalPages: 0 };

export async function getPlaces(filter: PlacesFilter = {}): Promise<PaginatedResponse<Place>> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      type, search, province, minPrice, maxPrice,
      page = 1, pageSize = 12,
      sortBy = 'created_at', sortOrder = 'desc',
    } = filter;

    let query = supabase
      .from('places')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (type)     query = query.eq('type', type);
    if (province) query = query.eq('province', province);
    if (minPrice) query = query.gte('price_per_night', minPrice);
    if (maxPrice) query = query.lte('price_per_night', maxPrice);
    if (search)   query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, from + pageSize - 1);

    if (error) return EMPTY;
    return {
      data: (data as Place[]) ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  } catch {
    return EMPTY;
  }
}

export async function getPlace(id: string): Promise<Place | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('places')
      .select('*, manager:profiles(id, full_name, avatar_url), reviews(*, user:profiles(id, full_name, avatar_url))')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Place;
  } catch {
    return null;
  }
}

export async function incrementViewCount(placeId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.rpc as any)('increment_view_count', { place_id: placeId });
  } catch { /* silence */ }
}

export async function getSiteStats(): Promise<SiteStats> {
  const fallback: SiteStats = { total_views: 0, total_places: 0, total_resorts: 0, total_nature: 0, total_users: 0, total_bookings: 0 };
  try {
    const supabase = await createServerSupabaseClient();
    const [statsRes, placesRes] = await Promise.all([
      supabase.from('site_stats').select('key, value'),
      supabase.from('places').select('type').eq('is_published', true),
    ]);
    if (statsRes.error || placesRes.error) return fallback;

    const statsMap: Record<string, number> = {};
    (statsRes.data ?? []).forEach((row: { key: string; value: number }) => {
      statsMap[row.key] = row.value;
    });

    const places = (placesRes.data ?? []) as Array<{ type: string }>;
    return {
      total_views:    statsMap['total_views'] ?? 0,
      total_places:   places.length,
      total_resorts:  places.filter(p => p.type === 'resort').length,
      total_nature:   places.filter(p => p.type === 'nature').length,
      total_users:    statsMap['total_users'] ?? 0,
      total_bookings: 0,
    };
  } catch {
    return fallback;
  }
}

export async function getFeaturedPlaces(limit = 6): Promise<Place[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as Place[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminPlaces(filter: PlacesFilter = {}): Promise<PaginatedResponse<Place>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { page = 1, pageSize = 20, search, type } = filter;
    let query = supabase.from('places').select('*, manager:profiles(id, full_name)', { count: 'exact' });
    if (type)   query = query.eq('type', type);
    if (search) query = query.ilike('name', `%${search}%`);
    const from = (page - 1) * pageSize;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) return EMPTY;
    return { data: (data as Place[]) ?? [], count: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };
  } catch {
    return EMPTY;
  }
}

export async function createPlace(formData: PlaceFormData): Promise<Place> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');
  const { data, error } = await (supabase
    .from('places') as any)
    .insert({ ...formData, created_by: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  revalidatePath('/');
  return data as Place;
}

export async function updatePlace(id: string, formData: Partial<PlaceFormData>): Promise<Place> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await (supabase
    .from('places') as any)
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  revalidatePath(`/places/${id}`);
  revalidatePath('/');
  return data as Place;
}

export async function deletePlace(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  revalidatePath('/');
}

export async function togglePublish(id: string, isPublished: boolean): Promise<void> {
  await updatePlace(id, { is_published: isPublished });
}
