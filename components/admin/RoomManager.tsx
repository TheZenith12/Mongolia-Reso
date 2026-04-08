'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { ImageUpload } from './ImageUpload';

interface Room {
  id?: string;
  place_id: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  quantity: number;
  cover_image: string;
  amenities: string[];
  is_available: boolean;
}

const AMENITIES_LIST = [
  'WiFi', 'Телевиз', 'Агаар хөргөгч', 'Халаагч', 'Хөргөгч',
  'Угаалгын өрөө', 'Балкон', 'Хоол', 'Цайны тэрэг', 'Машины зогсоол'
];

export default function RoomManager({ placeId }: { placeId: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyRoom: Room = {
    place_id:       placeId,
    name:           '',
    description:    '',
    price_per_night: 0,
    capacity:       2,
    quantity:       1,
    cover_image:    '',
    amenities:      [],
    is_available:   true,
  };
  const [form, setForm] = useState<Room>(emptyRoom);

  useEffect(() => {
    fetchRooms();
  }, [placeId]);

  async function fetchRooms() {
    const supabase = createClient();
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('place_id', placeId)
      .order('price_per_night', { ascending: true });
    setRooms((data ?? []) as Room[]);
    setLoading(false);
  }

  function setField(key: keyof Room, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter(a => a !== amenity)
        : [...f.amenities, amenity],
    }));
  }

  function startEdit(room: Room) {
    setForm({ ...room });
    setEditing(room.id ?? null);
    setShowForm(true);
  }

  function startNew() {
    setForm({ ...emptyRoom });
    setEditing(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyRoom);
  }

  async function saveRoom() {
    if (!form.name) { toast.error('Өрөөний нэр оруулна уу'); return; }
    if (!form.price_per_night) { toast.error('Үнэ оруулна уу'); return; }
    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        place_id:       placeId,
        name:           form.name,
        description:    form.description,
        price_per_night: Number(form.price_per_night),
        capacity:       Number(form.capacity),
        quantity:       Number(form.quantity),
        cover_image:    form.cover_image,
        amenities:      form.amenities,
        is_available:   form.is_available,
        updated_at:     new Date().toISOString(),
      };
      if (editing) {
        const { error } = await (supabase.from('rooms') as any).update(payload).eq('id', editing);
        if (error) throw error;
        toast.success('Өрөө шинэчлэгдлээ!');
      } else {
        const { error } = await (supabase.from('rooms') as any).insert(payload);
        if (error) throw error;
        toast.success('Өрөө нэмэгдлээ!');
      }
      await fetchRooms();
      cancelForm();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRoom(id: string) {
    if (!confirm('Өрөөг устгах уу?')) return;
    const supabase = createClient();
    await supabase.from('rooms').delete().eq('id', id);
    toast.success('Өрөө устгагдлаа');
    fetchRooms();
  }

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 size={20} className="animate-spin text-forest-400" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-forest-900">Өрөөний төрлүүд</h2>
          <p className="text-xs text-forest-500 mt-0.5">{rooms.length} өрөөний төрөл</p>
        </div>
        {!showForm && (
          <button type="button" onClick={startNew} className="btn-primary text-sm py-2">
            <Plus size={15} /> Өрөө нэмэх
          </button>
        )}
      </div>

      {/* Room form */}
      {showForm && (
        <div className="bg-forest-50 rounded-xl border border-forest-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-forest-900">{editing ? 'Өрөө засах' : 'Шинэ өрөө нэмэх'}</h3>
            <button type="button" onClick={cancelForm} className="text-forest-400 hover:text-forest-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-forest-700 mb-1">Өрөөний нэр *</label>
                <input value={form.name} onChange={e => setField('name', e.target.value)}
                  className="input-field text-sm" placeholder="Энгийн өрөө, VIP, Люкс..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-forest-700 mb-1">Үнэ (₮/шөнө) *</label>
                <input type="number" value={form.price_per_night} onChange={e => setField('price_per_night', e.target.value)}
                  className="input-field text-sm" placeholder="150000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-forest-700 mb-1">Хүний тоо (багтаамж)</label>
                <select value={form.capacity} onChange={e => setField('capacity', Number(e.target.value))} className="input-field text-sm">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} хүн</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-forest-700 mb-1">Өрөөний тоо</label>
                <input type="number" value={form.quantity} onChange={e => setField('quantity', Number(e.target.value))}
                  min={1} className="input-field text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-700 mb-1">Тайлбар</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                rows={2} className="input-field text-sm resize-none" placeholder="Өрөөний дэлгэрэнгүй тайлбар..." />
            </div>

            <ImageUpload
              value={form.cover_image}
              onChange={url => setField('cover_image', url)}
              label="Өрөөний зураг"
            />

            <div>
              <label className="block text-xs font-medium text-forest-700 mb-2">Тав тухын нөхцөл</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      form.amenities.includes(a)
                        ? 'bg-forest-700 text-white border-forest-700'
                        : 'bg-white text-forest-600 border-forest-200 hover:border-forest-400'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setField('is_available', !form.is_available)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_available ? 'bg-forest-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-forest-700">Захиалах боломжтой</span>
            </label>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={cancelForm} className="btn-secondary text-sm py-2">Болих</button>
              <button type="button" onClick={saveRoom} disabled={saving} className="btn-primary text-sm py-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Хадгалж байна...</> : <><Save size={14} /> Хадгалах</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room list */}
      {rooms.length === 0 && !showForm ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-forest-400 text-sm">Өрөө нэмэгдээгүй байна</p>
          <button type="button" onClick={startNew} className="text-forest-600 text-sm font-medium mt-2 hover:underline">
            + Эхний өрөөгоо нэмэх
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => (
            <div key={room.id} className={`flex items-start gap-4 p-4 bg-white rounded-xl border transition-all ${
              room.is_available ? 'border-forest-100' : 'border-gray-100 opacity-60'
            }`}>
              {room.cover_image ? (
                <img src={room.cover_image} alt={room.name} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-16 rounded-lg bg-forest-50 flex items-center justify-center text-2xl flex-shrink-0">🛏</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-forest-900 text-sm">{room.name}</div>
                    <div className="text-xs text-forest-500 mt-0.5">
                      👥 {room.capacity} хүн · 🏨 {room.quantity} өрөө
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-amber-600 text-sm">{formatPrice(room.price_per_night)}</div>
                    <div className="text-xs text-forest-400">/ шөнө</div>
                  </div>
                </div>
                {room.description && (
                  <p className="text-xs text-forest-500 mt-1 line-clamp-1">{room.description}</p>
                )}
                {room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {room.amenities.slice(0, 4).map(a => (
                      <span key={a} className="text-[10px] bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="text-[10px] text-forest-400">+{room.amenities.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button type="button" onClick={() => startEdit(room)}
                  className="p-2 rounded-lg hover:bg-forest-50 text-forest-400 hover:text-forest-600 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button type="button" onClick={() => deleteRoom(room.id!)}
                  className="p-2 rounded-lg hover:bg-red-50 text-forest-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
