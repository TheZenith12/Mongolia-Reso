import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPlace, incrementViewCount } from '@/lib/actions/places';
import { getUserLikes, getCurrentProfile } from '@/lib/actions/auth';
import PlaceDetailClient from '@/components/places/PlaceDetailClient';

interface PlacePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const place = await getPlace(params.id);
  if (!place) return { title: 'Газар олдсонгүй' };
  return {
    title: place.name,
    description: place.short_desc ?? place.description ?? '',
    openGraph: {
      images: place.cover_image ? [place.cover_image] : [],
    },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const [place, likedIds, profile] = await Promise.all([
    getPlace(params.id),
    getUserLikes(),
    getCurrentProfile(),
  ]);

  if (!place) notFound();

  // Fire-and-forget view count
  incrementViewCount(params.id).catch(() => {});

  return (
    <PlaceDetailClient
      place={place}
      initialLiked={likedIds.includes(place.id)}
      profile={profile}
    />
  );
}
