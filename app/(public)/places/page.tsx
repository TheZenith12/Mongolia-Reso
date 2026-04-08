import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PlaceDetailClient from '@/components/places/PlaceDetailClient';
import type { Database } from '@/lib/database.types';

type PlaceMeta = Pick<Database['public']['Tables']['places']['Row'], 'name' | 'short_desc' | 'cover_image'>;

interface PlacePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('places').select('name, short_desc, cover_image').eq('id', params.id).single();
  if (!data) return { title: 'Газар олдсонгүй' };
  const meta = data as PlaceMeta;
  return {
    title: meta.name,
    description: meta.short_desc ?? '',
    openGraph: { images: meta.cover_image ? [meta.cover_image] : [] },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const supabase = await createServerSupabaseClient();

  const { data: place, error } = await supabase
    .from('places')
    .select('*, reviews(*, user:profiles(id, full_name))')
    .eq('id', params.id)
    .single();

  if (error || !place) {
    notFound();
  }

  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user likes
  let likedIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase.from('likes').select('place_id').eq('user_id', user.id);
    likedIds = likes?.map((l: any) => l.place_id) ?? [];
  }

  // Get profile
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  // Increment view count (fire and forget)
 (supabase.rpc as any)('increment_view_count', { place_id: params.id }).then(() => {}).catch(() => {});

  return (
    <PlaceDetailClient
      place={place as any}
      initialLiked={likedIds.includes((place as any).id)}
      profile={profile}
    />
  );
}
