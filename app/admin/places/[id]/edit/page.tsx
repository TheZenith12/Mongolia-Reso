import { createServerSupabaseClient } from '@/lib/supabase-server';
import PlaceForm from '@/components/admin/PlaceForm';

export default async function EditPlacePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: place } = await supabase
    .from('places')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!place) {
    return (
      <div className="text-center py-20">
        <p className="text-forest-500">Газар олдсонгүй</p>
      </div>
    );
  }

  return <PlaceForm place={place as any} mode="edit" />;
}
