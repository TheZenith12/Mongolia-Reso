'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { createReview } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import { getRelativeTime, getInitials } from '@/lib/utils';
import type { Review, Profile } from '@/lib/types';

interface ReviewsSectionProps {
  placeId: string;
  reviews: Review[];
  profile: Profile | null;
}

export default function ReviewsSection({ placeId, reviews, profile }: ReviewsSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast.error('Үнэлгээ өгнө үү'); return; }
    if (!body)   { toast.error('Сэтгэгдэл бичнэ үү'); return; }

    setLoading(true);
    try {
      await createReview(placeId, rating, title, body);
      setLocalReviews([
        {
          id: Date.now().toString(),
          place_id: placeId,
          user_id: profile?.id ?? null,
          booking_id: null,
          rating,
          title: title || null,
          body,
          images: [],
          is_verified: false,
          created_at: new Date().toISOString(),
          user: profile ?? undefined,
        },
        ...localReviews,
      ]);
      setRating(0); setTitle(''); setBody('');
      toast.success('Сэтгэгдэл амжилттай нэмэгдлээ!');
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  const avg = localReviews.length
    ? (localReviews.reduce((a, r) => a + r.rating, 0) / localReviews.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-2xl font-semibold text-forest-900">Үнэлгээ & Сэтгэгдэл</h2>
        <span className="badge bg-forest-50 text-forest-700 border-forest-200">
          ⭐ {avg} · {localReviews.length} сэтгэгдэл
        </span>
      </div>

      {/* Write review */}
      {profile ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(profile.full_name)}
            </div>
            <span className="font-medium text-forest-800 text-sm">{profile.full_name}</span>
          </div>

          {/* Star rating */}
          <div className="flex gap-1.5 mb-4">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-forest-200'}
                />
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Гарчиг (заавал биш)"
            className="input-field mb-3"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Сэтгэгдлээ бичнэ үү..."
            rows={3}
            className="input-field resize-none mb-3"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm">
            {loading ? 'Нэмж байна...' : 'Сэтгэгдэл нэмэх'}
          </button>
        </form>
      ) : (
        <div className="bg-forest-50 rounded-2xl border border-forest-100 p-5 mb-8 flex items-center gap-3">
          <MessageSquare size={20} className="text-forest-400" />
          <span className="text-forest-600 text-sm">
            Сэтгэгдэл нэмэхийн тулд{' '}
            <a href="/auth/login" className="text-forest-700 font-semibold underline">нэвтэрнэ үү</a>
          </span>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-5">
        {localReviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-forest-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-sm font-semibold">
                  {getInitials(r.user?.full_name)}
                </div>
                <div>
                  <div className="font-medium text-forest-800 text-sm">{r.user?.full_name ?? 'Хэрэглэгч'}</div>
                  <div className="text-xs text-forest-400">{getRelativeTime(r.created_at)}</div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-forest-200'} />
                ))}
              </div>
            </div>
            {r.title && <p className="font-semibold text-forest-800 text-sm mb-1">{r.title}</p>}
            {r.body  && <p className="text-forest-600 text-sm leading-relaxed">{r.body}</p>}
          </div>
        ))}

        {localReviews.length === 0 && (
          <div className="text-center py-10 text-forest-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Одоогоор сэтгэгдэл байхгүй байна. Эхний сэтгэгдэл үлдээнэ үү!</p>
          </div>
        )}
      </div>
    </div>
  );
}
