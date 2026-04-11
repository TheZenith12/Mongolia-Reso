import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient();
  const { data: places } = await supabase.from('places').select('id, updated_at');

  const placeUrls = places?.map((place) => ({
    url: `https://mongolia-reso.vercel.app/places/${(place as any).id}`,
    lastModified: (place as any).updated_at ?? new Date(),
  })) ?? [];

  return [
    { url: 'https://mongolia-reso.vercel.app', lastModified: new Date() },
    { url: 'https://mongolia-reso.vercel.app/places', lastModified: new Date() },
    { url: 'https://mongolia-reso.vercel.app/map', lastModified: new Date() },
    ...placeUrls,
  ];
}