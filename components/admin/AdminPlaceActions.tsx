'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { deletePlace, togglePublish } from '@/lib/actions/places';
import { toast } from 'react-hot-toast';
import type { Place } from '@/lib/types';

export default function AdminPlaceActions({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`"${place.name}" газрыг устгах уу?`)) return;
    setLoading(true);
    try {
      await deletePlace(place.id);
      toast.success('Газар устгагдлаа');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublish() {
    setLoading(true);
    try {
      await togglePublish(place.id, !place.is_published);
      toast.success(place.is_published ? 'Нийтлэлийг цуцаллаа' : 'Амжилттай нийтлэгдлээ!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative flex items-center justify-end gap-2">
      <Link
        href={`/admin/places/${place.id}/edit`}
        className="p-2 rounded-lg hover:bg-forest-50 text-forest-500 hover:text-forest-700 transition-colors"
        title="Засах"
      >
        <Edit size={15} />
      </Link>
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className="p-2 rounded-lg hover:bg-forest-50 text-forest-500 hover:text-forest-700 transition-colors"
        title={place.is_published ? 'Нуух' : 'Нийтлэх'}
      >
        {place.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors"
        title="Устгах"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
