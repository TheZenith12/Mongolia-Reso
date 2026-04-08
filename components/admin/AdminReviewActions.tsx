'use client';

import { useState } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface AdminReviewActionsProps {
  reviewId: string;
  isVerified: boolean;
}

export default function AdminReviewActions({ reviewId, isVerified }: AdminReviewActionsProps) {
  const [verified, setVerified] = useState(isVerified);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await (supabase
      .from('reviews') as any)
      .update({ is_verified: !verified })
      .eq('id', reviewId);
    if (!error) {
      setVerified(!verified);
      toast.success(verified ? 'Баталгаажуулалт цуцлагдлаа' : 'Баталгаажуулагдлаа');
    } else {
      toast.error('Алдаа гарлаа');
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm('Сэтгэгдлийг устгах уу?')) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (!error) {
      setDeleted(true);
      toast.success('Сэтгэгдэл устгагдлаа');
    } else {
      toast.error('Алдаа гарлаа');
    }
    setLoading(false);
  }

  if (deleted) return null;

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={handleVerify}
        disabled={loading}
        title={verified ? 'Баталгаажуулалт цуцлах' : 'Баталгаажуулах'}
        className={`p-2 rounded-lg transition-colors ${
          verified
            ? 'text-green-600 bg-green-50 hover:bg-green-100'
            : 'text-gray-400 hover:bg-gray-50 hover:text-green-600'
        }`}
      >
        <CheckCircle size={15} />
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        title="Устгах"
        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
