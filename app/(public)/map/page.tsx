import { getPlaces } from '@/lib/actions/places';
import MapPageClient from '@/components/map/MapPageClient';

export const metadata = { title: 'Газрын зураг' };

export default async function MapPage() {
  const { data: places } = await getPlaces({ pageSize: 200 });
  return <MapPageClient places={places} />;
}
