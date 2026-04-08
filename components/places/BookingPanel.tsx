'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CreditCard, Smartphone, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { formatPrice, calculateNights } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Room {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  quantity: number;
  cover_image: string;
  amenities: string[];
  is_available: boolean;
}

export default function BookingPanel({ place, profile }: any) {
  const router = useRouter();
  const isResort = place.type === 'resort';
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]     = useState(1);
  const [payMethod, setPayMethod] = useState<'stripe' | 'qpay'>('qpay');
  const [loading, setLoading]   = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const price = selectedRoom?.price_per_night ?? place.price_per_night ?? 0;
  const total = nights * price * (selectedRoom ? 1 : guests);

  useEffect(() => {
    if (!isResort) return;
    const supabase = createClient();
    supabase.from('rooms').select('*').eq('place_id', place.id).eq('is_available', true)
      .order('price_per_night', { ascending: true })
      .then(({ data }) => {
        setRooms((data ?? []) as Room[]);
        setLoadingRooms(false);
      });
  }, [place.id, isResort]);

  async function handleBook() {
    if (!profile) {
      toast.error('Захиалахын тулд нэвтрэх шаардлагатай');
      router.push(`/auth/login?redirect=/places/${place.id}`);
      return;
    }
    if (!checkIn || !checkOut) { toast.error('Огноо сонгоно уу'); return; }
    if (nights < 1) { toast.error('Буцах огноо буруу байна'); return; }
    if (rooms.length > 0 && !selectedRoom) { toast.error('Өрөө сонгоно уу'); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const payload: any = {
        place_id:       place.id,
        guest_name:     profile.full_name ?? 'Хэрэглэгч',
        guest_phone:    profile.phone ?? '',
        guest_count:    selectedRoom ? selectedRoom.capacity : guests,
        check_in:       checkIn,
        check_out:      checkOut,
        payment_method: payMethod,
        user_id:        profile.id,
        total_amount:   total,
        payment_status: 'pending',
        status:         'pending',
      };
      if (selectedRoom) {
        payload.room_id   = selectedRoom.id;
        payload.room_name = selectedRoom.name;
      }

      const { data, error } = await supabase.from('bookings').insert(payload).select().single();
      if (error) throw error;
      toast.success('Захиалга амжилттай үүслээ!');
      router.push(`/booking/${(data as any).id}/payment`);
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  if (!isResort) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center text-xl">🌿</div>
          <div>
            <div className="font-semibold text-forest-900 text-sm">Байгалийн газар</div>
            <div className="text-xs text-forest-500">Үнэгүй нэвтрэх боломжтой</div>
          </div>
        </div>
        <p className="text-forest-600 text-sm leading-relaxed mb-4">
          Энэ байгалийн үзэсгэлэнт газар нийтийн хэрэглээнд нээлттэй.
        </p>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
          target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
          Замын заалт авах <ArrowRight size={15} />
        </a>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-display text-xl font-semibold text-forest-900 mb-4">Захиалах</h3>

      {/* Room selection */}
      {loadingRooms ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="animate-spin text-forest-400" />
        </div>
      ) : rooms.length > 0 ? (
        <div className="mb-4">
          <label className="block text-xs font-medium text-forest-500 uppercase tracking-wide mb-2">Өрөө сонгох</label>
          <div className="space-y-2">
            {rooms.map(room => (
              <button key={room.id} type="button" onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedRoom?.id === room.id
                    ? 'border-forest-600 bg-forest-50'
                    : 'border-forest-100 hover:border-forest-300 bg-white'
                }`}>
                {room.cover_image ? (
                  <img src={room.cover_image} alt={room.name} className="w-14 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-12 rounded-lg bg-forest-100 flex items-center justify-center text-xl flex-shrink-0">🛏</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-medium text-forest-900 text-sm">{room.name}</span>
                    <span className="font-bold text-amber-600 text-sm flex-shrink-0">{formatPrice(room.price_per_night)}</span>
                  </div>
                  <div className="text-xs text-forest-500 mt-0.5">
                    👥 {room.capacity} хүн · 🏨 {room.quantity} өрөө
                  </div>
                  {room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.amenities.slice(0, 3).map(a => (
                        <span key={a} className="text-[10px] bg-forest-50 text-forest-500 px-1.5 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
                {selectedRoom?.id === room.id && (
                  <div className="w-5 h-5 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-forest-50 rounded-xl">
          <div className="text-sm font-semibold text-forest-900">{formatPrice(place.price_per_night)}<span className="text-forest-400 font-normal text-xs"> / шөнө</span></div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">Ирэх өдөр</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="input-field pl-8 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">Явах өдөр</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="input-field pl-8 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Guests — only show if no room selected */}
        {!selectedRoom && (
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">Зочдын тоо</label>
            <div className="relative">
              <Users size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                className="input-field pl-8 py-2 text-sm appearance-none">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} хүн</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Payment */}
        <div>
          <label className="text-xs font-medium text-forest-500 mb-2 block">Төлбөрийн хэлбэр</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'qpay',   label: 'QPay',  icon: <Smartphone size={14} /> },
              { value: 'stripe', label: 'Карт',  icon: <CreditCard size={14} /> },
            ].map(pm => (
              <button key={pm.value} type="button" onClick={() => setPayMethod(pm.value as any)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                  payMethod === pm.value
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'bg-white text-forest-600 border-forest-200 hover:border-forest-400'
                }`}>
                {pm.icon} {pm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      {nights > 0 && price > 0 && (
        <div className="bg-forest-50 rounded-xl p-3 mb-4 text-sm space-y-1">
          {selectedRoom && (
            <div className="flex justify-between text-forest-600">
              <span>{selectedRoom.name}</span>
            </div>
          )}
          <div className="flex justify-between text-forest-600">
            <span>{formatPrice(price)} × {nights} шөнө</span>
          </div>
          <div className="flex justify-between font-semibold text-forest-900 pt-1.5 border-t border-forest-200">
            <span>Нийт дүн</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}

      <button onClick={handleBook} disabled={loading} className="btn-amber w-full py-3.5">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Боловсруулж байна...
          </span>
        ) : <>Захиалах <ArrowRight size={16} /></>}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-forest-400">
        <Lock size={11} /> Таны мэдээлэл хамгаалагдсан
      </div>
    </div>
  );
}
