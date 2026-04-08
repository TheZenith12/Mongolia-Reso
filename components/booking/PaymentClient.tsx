'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Smartphone, Shield, CheckCircle, ArrowLeft,
  Calendar, Users, MapPin,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Booking, Profile } from '@/lib/types';

interface PaymentClientProps {
  booking: Booking & { place: any };
  profile: Profile | null;
}

export default function PaymentClient({ booking, profile }: PaymentClientProps) {
  const router = useRouter();
  const [method] = useState<'stripe' | 'qpay'>(booking.payment_method ?? 'qpay');
  const [step, setStep] = useState<'review' | 'processing' | 'qpay_scan'>('review');
  const [qpayData, setQpayData] = useState<any>(null);

  // Card form state (Stripe)
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleQPayPayment() {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/qpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQpayData(data);
      setStep('qpay_scan');
    } catch (err: any) {
      toast.error(err.message ?? 'QPay алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  async function handleStripePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStep('processing');
    try {
      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Redirect to Stripe checkout
      window.location.href = data.checkout_url;
    } catch (err: any) {
      toast.error(err.message ?? 'Карт алдаа гарлаа');
      setStep('review');
    } finally {
      setLoading(false);
    }
  }

  async function checkQPayStatus() {
    if (!qpayData) return;
    try {
      const res = await fetch(`/api/payment/qpay/check?invoice_id=${qpayData.invoice_id}&booking_id=${booking.id}`);
      const data = await res.json();
      if (data.paid) {
        toast.success('Төлбөр амжилттай!');
        router.push(`/booking/${booking.id}/confirmation`);
      } else {
        toast.error('Төлбөр хийгдээгүй байна. Дахин шалгана уу.');
      }
    } catch {
      toast.error('Шалгах үед алдаа гарлаа');
    }
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="page-container max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-forest-500 text-sm mb-6 hover:text-forest-700 transition-colors">
          <ArrowLeft size={16} /> Буцах
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment form */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <h1 className="font-display text-2xl font-semibold text-forest-900 mb-6">Төлбөр хийх</h1>

              {step === 'review' && (
                <>
                  {method === 'qpay' ? (
                    <div>
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                        <Smartphone size={22} className="text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-800 text-sm">QPay төлбөр</div>
                          <div className="text-blue-600 text-xs mt-0.5">
                            Монголын банкны аппликейшнээр төлнө
                          </div>
                        </div>
                      </div>

                      <p className="text-forest-600 text-sm mb-6 leading-relaxed">
                        Дараах товч дарахад QPay QR код үүснэ. Та өөрийн банкны аппликейшнийг нээж
                        QR кодыг уншуулан төлбөрөө хийнэ үү.
                      </p>

                      <button
                        onClick={handleQPayPayment}
                        disabled={loading}
                        className="btn-primary w-full py-4"
                      >
                        {loading ? 'Боловсруулж байна...' : '📱 QPay QR Код Үүсгэх'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleStripePayment}>
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 mb-6">
                        <CreditCard size={22} className="text-purple-600" />
                        <div>
                          <div className="font-semibold text-purple-800 text-sm">Карттай төлбөр</div>
                          <div className="text-purple-600 text-xs">Visa / Mastercard / American Express</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-forest-700 mb-1.5">Картын дугаар</label>
                          <input
                            value={cardNum}
                            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16)
                              .replace(/(.{4})/g, '$1 ').trim())}
                            placeholder="0000 0000 0000 0000"
                            className="input-field font-mono tracking-wider"
                            maxLength={19}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-forest-700 mb-1.5">Эзэмшигчийн нэр</label>
                          <input
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="БАТБОЛД Б"
                            className="input-field uppercase"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-forest-700 mb-1.5">Хүчинтэй хугацаа</label>
                            <input
                              value={expiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                                setExpiry(v);
                              }}
                              placeholder="MM/YY"
                              className="input-field font-mono"
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-forest-700 mb-1.5">CVC</label>
                            <input
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="•••"
                              className="input-field font-mono"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-6">
                        {loading ? 'Боловсруулж байна...' : `💳 ${formatPrice(booking.total_amount)} Төлөх`}
                      </button>
                    </form>
                  )}
                </>
              )}

              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mb-4" />
                  <p className="text-forest-700 font-medium">Төлбөр боловсруулж байна...</p>
                  <p className="text-forest-400 text-sm mt-1">Хуудсыг хаахгүй байна уу</p>
                </div>
              )}

              {step === 'qpay_scan' && qpayData && (
                <div className="flex flex-col items-center">
                  <div className="bg-white border-4 border-forest-100 rounded-2xl p-4 mb-5">
                    <img
                      src={`data:image/png;base64,${qpayData.qr_image}`}
                      alt="QPay QR Code"
                      className="w-52 h-52"
                    />
                  </div>
                  <p className="text-forest-600 text-sm text-center mb-4 max-w-xs">
                    Банкны аппликейшнийг нээж энэ QR кодыг уншуулан
                    <strong className="text-forest-900"> {formatPrice(booking.total_amount)}</strong> төлнө үү
                  </p>

                  {/* Bank app buttons */}
                  {qpayData.urls && (
                    <div className="grid grid-cols-3 gap-2 mb-5 w-full max-w-xs">
                      {qpayData.urls.slice(0, 6).map((url: any, i: number) => (
                        <a key={i} href={url.link}
                          className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                          {url.logo && <img src={url.logo} alt={url.name} className="w-8 h-8 rounded-lg object-cover" />}
                          <span className="text-[10px] text-gray-600 text-center leading-tight">{url.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <button onClick={checkQPayStatus} className="btn-primary w-full max-w-xs">
                    <CheckCircle size={16} /> Төлбөр шалгах
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-forest-400">
                <Shield size={13} /> SSL шифрлэлтээр хамгаалагдсан
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="card p-5">
              <h2 className="font-semibold text-forest-900 mb-4 text-sm uppercase tracking-wide">Захиалгын мэдээлэл</h2>

              {booking.place?.cover_image && (
                <div className="relative h-36 rounded-xl overflow-hidden mb-4">
                  <Image src={booking.place.cover_image} alt={booking.place.name} fill className="object-cover" />
                </div>
              )}

              <div className="font-display text-xl font-semibold text-forest-900 mb-3">
                {booking.place?.name}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-forest-600">
                  <Calendar size={14} />
                  <span>{formatDate(booking.check_in)} — {formatDate(booking.check_out)}</span>
                </div>
                <div className="flex items-center gap-2 text-forest-600">
                  <Users size={14} />
                  <span>{booking.guest_count} хүн · {booking.nights} шөнө</span>
                </div>
              </div>

              <div className="border-t border-forest-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-forest-600">
                  <span>{formatPrice(booking.place?.price_per_night)} × {booking.nights} шөнө</span>
                </div>
                <div className="flex justify-between text-forest-600">
                  <span>{booking.guest_count} хүн</span>
                </div>
                <div className="flex justify-between font-semibold text-forest-900 text-base pt-2 border-t border-forest-100">
                  <span>Нийт дүн</span>
                  <span className="text-amber-600">{formatPrice(booking.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
