'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Building2, Leaf } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MONGOLIAN_PROVINCES } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { ImageUpload, MultiImageUpload, VideoUpload } from './ImageUpload';
import RoomManager from './RoomManager';

export default function PlaceForm({ place, mode }: { place?: any; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const [loading, setLoading]         = useState(false);
  const [type, setType]               = useState<'resort' | 'nature'>(place?.type ?? 'resort');
  const [coverImage, setCoverImage]   = useState(place?.cover_image ?? '');
  const [images, setImages]           = useState<string[]>(place?.images ?? []);
  const [videoUrl, setVideoUrl]       = useState(place?.video_url ?? '');
  const [isPublished, setIsPublished] = useState(place?.is_published ?? false);
  const [isFeatured, setIsFeatured]   = useState(place?.is_featured ?? false);
  const [activeTab, setActiveTab]     = useState<'info' | 'rooms'>('info');

  const [form, setForm] = useState({
    name:            place?.name ?? '',
    description:     place?.description ?? '',
    short_desc:      place?.short_desc ?? '',
    price_per_night: place?.price_per_night?.toString() ?? '',
    phone:           place?.phone ?? '',
    email:           place?.email ?? '',
    website:         place?.website ?? '',
    latitude:        place?.latitude?.toString() ?? '',
    longitude:       place?.longitude?.toString() ?? '',
    address:         place?.address ?? '',
    province:        place?.province ?? '',
    district:        place?.district ?? '',
  });

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Нэр оруулна уу'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const payload = {
        type,
        name:            form.name,
        description:     form.description || null,
        short_desc:      form.short_desc || null,
        price_per_night: form.price_per_night ? parseFloat(form.price_per_night) : null,
        phone:           form.phone || null,
        email:           form.email || null,
        website:         form.website || null,
        latitude:        form.latitude ? parseFloat(form.latitude) : null,
        longitude:       form.longitude ? parseFloat(form.longitude) : null,
        address:         form.address || null,
        province:        form.province || null,
        district:        form.district || null,
        cover_image:     coverImage || null,
        images,
        video_url:       videoUrl || null,
        is_published:    isPublished,
        is_featured:     isFeatured,
        updated_at:      new Date().toISOString(),
      };

      if (mode === 'create') {
        const { error } = await (supabase.from('places') as any).insert(payload);
        if (error) throw error;
        toast.success('Газар амжилттай нэмэгдлээ!');
      } else {
        const { error } = await (supabase.from('places') as any).update(payload).eq('id', place.id);
        if (error) throw error;
        toast.success('Мэдээлэл шинэчлэгдлээ!');
      }
      router.push('/admin/places');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'info',  label: '📋 Мэдээлэл' },
    ...(mode === 'edit' && type === 'resort' ? [{ id: 'rooms', label: '🛏 Өрөөнүүд' }] : []),
  ] as { id: 'info' | 'rooms'; label: string }[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          {mode === 'create' ? 'Шинэ газар нэмэх' : 'Газар засах'}
        </h1>
        {place && (
          <a href={`/places/${place.id}`} target="_blank" className="btn-secondary text-sm">
            <Eye size={15} /> Харах
          </a>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white text-forest-900 shadow-sm' : 'text-forest-500 hover:text-forest-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Rooms tab */}
      {activeTab === 'rooms' && mode === 'edit' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <RoomManager placeId={place.id} />
        </div>
      )}

      {/* Info tab */}
      {activeTab === 'info' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-forest-900 mb-4">Газрын төрөл</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'resort', label: 'Амралтын газар', icon: Building2, desc: 'Зочид буудал, бааз, кемп' },
                { value: 'nature', label: 'Байгалийн газар', icon: Leaf,      desc: 'Уул, нуур, хавцал' },
              ] as const).map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      type === t.value ? 'border-forest-600 bg-forest-50' : 'border-gray-100 hover:border-forest-200'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      type === t.value ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon size={19} />
                    </div>
                    <div>
                      <div className="font-medium text-forest-900 text-sm">{t.label}</div>
                      <div className="text-xs text-forest-500 mt-0.5">{t.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-forest-900 mb-4">Үндсэн мэдээлэл</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Нэр *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Товч тайлбар</label>
                <input value={form.short_desc} onChange={e => set('short_desc', e.target.value)} className="input-field" placeholder="Картад харагдах тайлбар" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Дэлгэрэнгүй тайлбар</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">
                  Үндсэн үнэ (₮/шөнө) {type === 'resort' && <span className="text-forest-400 text-xs">— өрөө тодорхойлоогүй бол</span>}
                </label>
                <input type="number" value={form.price_per_night} onChange={e => set('price_per_night', e.target.value)} className="input-field" placeholder="150000" />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-forest-900 mb-5">Зураг & Бичлэг</h2>
            <div className="space-y-5">
              <ImageUpload value={coverImage} onChange={setCoverImage} label="Нүүр зураг" />
              <MultiImageUpload values={images} onChange={setImages} label="Зургийн цомог" max={20} />
              <VideoUpload value={videoUrl} onChange={setVideoUrl} />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-forest-900 mb-4">Байршил</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Хаяг</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Аймаг</label>
                <select value={form.province} onChange={e => set('province', e.target.value)} className="input-field">
                  <option value="">Сонгох</option>
                  {MONGOLIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Сум/Дүүрэг</label>
                <input value={form.district} onChange={e => set('district', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Өргөрөг</label>
                <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} className="input-field" placeholder="47.9077" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Уртраг</label>
                <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} className="input-field" placeholder="106.8832" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-forest-900 mb-4">Холбоо барих</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Утас</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="+976 9900-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">И-мэйл</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Вэбсайт</label>
                <input value={form.website} onChange={e => set('website', e.target.value)} className="input-field" placeholder="https://" />
              </div>
            </div>
          </div>

          {/* Publish */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-forest-900 mb-4">Нийтлэлийн тохиргоо</h2>
            <div className="space-y-4">
              {[
                { label: 'Нийтлэх', desc: 'Хэрэглэгчдэд харагдана', value: isPublished, set: setIsPublished },
                { label: 'Онцлох',  desc: 'Нүүр хуудсанд онцлох',   value: isFeatured,  set: setIsFeatured  },
              ].map(opt => (
                <label key={opt.label} className="flex items-center gap-4 cursor-pointer">
                  <div onClick={() => opt.set(!opt.value)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${opt.value ? 'bg-forest-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${opt.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-forest-800">{opt.label}</div>
                    <div className="text-xs text-forest-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Болих</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Хадгалж байна...' : <><Save size={16} /> {mode === 'create' ? 'Газар нэмэх' : 'Хадгалах'}</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
