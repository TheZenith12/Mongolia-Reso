import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PlaceDetailClient from '@/components/places/PlaceDetailClient';

interface PlacePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('places').select('name, short_desc, cover_image').eq('id', params.id).single();
  if (!data) return { title: 'Газар олдсонгүй' };
  return {
    title: (data as any).name,
    description: (data as any).short_desc ?? '',
    openGraph: { images: (data as any).cover_image ? [(data as any).cover_image] : [] },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const supabase = await createServerSupabaseClient();

  const { data: place, error } = await supabase
    .from('places')
    .select('*, reviews(*, user:profiles(id, full_name))')
    .eq('id', params.id)
    .single();

  if (error || !place) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase.from('likes').select('place_id').eq('user_id', user.id);
    likedIds = likes?.map((l: any) => l.place_id) ?? [];
  }

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  (supabase.rpc as any)('increment_view_count', { place_id: params.id }).then(() => {}).catch(() => {});

  return (
    <PlaceDetailClient
      place={place as any}
      initialLiked={likedIds.includes((place as any).id)}
      profile={profile}
    />
  );
}