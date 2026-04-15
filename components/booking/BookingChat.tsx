'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string | null;
  sender_role: string;
  message: string;
  created_at: string;
}

interface BookingChatProps {
  bookingId: string;
  currentUserId: string;
  currentUserRole: string;
  bookingStatus: string;
  showActions?: boolean;
  cancelReason?: string | null;
  managerNote?: string | null;
  onConfirm?: (note: string) => Promise<void>;
  onCancel?: (reason: string) => Promise<void>;
}

export default function BookingChat({
  bookingId,
  currentUserId,
  currentUserRole,
  bookingStatus,
  showActions = false,
  cancelReason,
  managerNote,
  onConfirm,
  onCancel,
}: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmNote, setConfirmNote] = useState('');
  const [cancelRea, setCancelRea] = useState('');
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [showCancelBox, setShowCancelBox] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const isAdmin = ['super_admin', 'manager'].includes(currentUserRole);
  // Allow chat for all statuses except completed
  const canChat = bookingStatus !== 'completed';

  useEffect(() => {
    fetchMessages();
    // Realtime subscription
    const channel = supabase
      .channel(`booking-chat-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as Message];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    setLoading(true);
    const { data } = await (supabase.from('booking_messages') as any)
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await (supabase.from('booking_messages') as any).insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      sender_role: currentUserRole,
      message: text.trim(),
    });
    if (error) toast.error('Мессеж илгээхэд алдаа гарлаа');
    else setText('');
    setSending(false);
  }

  async function handleConfirm() {
    if (!onConfirm) return;
    setConfirming(true);
    try {
      await onConfirm(confirmNote);
      setShowConfirmBox(false);
      setConfirmNote('');
      toast.success('Захиалга баталгаажлаа');
    } catch {
      toast.error('Алдаа гарлаа');
    }
    setConfirming(false);
  }

  async function handleCancel() {
    if (!onCancel) return;
    if (!cancelRea.trim()) { toast.error('Цуцлах шалтгаан оруулна уу'); return; }
    setCancelling(true);
    try {
      await onCancel(cancelRea);
      setShowCancelBox(false);
      setCancelRea('');
      toast.success('Захиалга цуцлагдлаа');
    } catch {
      toast.error('Алдаа гарлаа');
    }
    setCancelling(false);
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('mn-MN', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const roleBadge: Record<string, string> = {
    user: 'Зочин',
    manager: 'Менежер',
    super_admin: 'Админ',
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Admin action buttons */}
      {showActions && isAdmin && bookingStatus === 'pending' && (
        <div className="flex gap-2 px-5 py-3 bg-forest-50 rounded-xl border border-forest-100">
          <button
            onClick={() => { setShowConfirmBox(true); setShowCancelBox(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={15} /> Баталгаажуулах
          </button>
          <button
            onClick={() => { setShowCancelBox(true); setShowConfirmBox(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <XCircle size={15} /> Цуцлах
          </button>
        </div>
      )}

      {/* Confirm box */}
      {showConfirmBox && (
        <div className="px-5 py-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-medium text-green-800 mb-2">Баталгаажуулах тайлбар (заавал биш):</p>
          <input
            value={confirmNote}
            onChange={(e) => setConfirmNote(e.target.value)}
            placeholder="Жишээ: Тавтай морил!"
            className="w-full border border-green-200 rounded-lg px-3 py-2 text-sm bg-white mb-3 outline-none focus:border-green-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Баталгаажуулах
            </button>
            <button onClick={() => setShowConfirmBox(false)} className="text-sm text-gray-500 hover:text-gray-700 px-2">Болих</button>
          </div>
        </div>
      )}

      {/* Cancel box */}
      {showCancelBox && (
        <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-medium text-red-800 mb-2">Цуцлах шалтгаан:</p>
          <input
            value={cancelRea}
            onChange={(e) => setCancelRea(e.target.value)}
            placeholder="Шалтгаан оруулна уу..."
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm bg-white mb-3 outline-none focus:border-red-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Цуцлах
            </button>
            <button onClick={() => setShowCancelBox(false)} className="text-sm text-gray-500 hover:text-gray-700 px-2">Болих</button>
          </div>
        </div>
      )}

      {/* Info notes */}
      {cancelReason && (
        <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
          Цуцлах шалтгаан: {cancelReason}
        </div>
      )}
      {managerNote && (
        <div className="px-4 py-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
          Менежерийн тэмдэглэл: {managerNote}
        </div>
      )}

      {/* Chat section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
          <MessageCircle size={15} className="text-forest-500" />
          <span className="text-sm font-medium text-forest-700">Захиалгын чат</span>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-4 py-3 flex flex-col gap-2 bg-gray-50/40">
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={18} className="animate-spin text-forest-400" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-forest-300 text-sm gap-1 py-8">
              <MessageCircle size={28} className="opacity-30" />
              <p>Мессеж байхгүй байна</p>
              <p className="text-xs">Захиалгатай холбоотой асуулт бичнэ үү</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            const isAdminMsg = ['super_admin', 'manager'].includes(msg.sender_role);
            return (
              <div key={msg.id} className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
                <span className="text-[10px] text-forest-400 px-1">
                  {roleBadge[msg.sender_role] ?? msg.sender_role} · {formatTime(msg.created_at)}
                </span>
                <div className={cn(
                  'max-w-xs px-3 py-2 rounded-2xl text-sm leading-snug',
                  isMine
                    ? 'bg-forest-700 text-white rounded-br-sm'
                    : isAdminMsg
                      ? 'bg-amber-50 text-amber-900 border border-amber-100 rounded-bl-sm'
                      : 'bg-white text-forest-800 border border-gray-100 rounded-bl-sm'
                )}>
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {canChat ? (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Мессеж бичнэ үү... (Enter = илгээх)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-forest-400 focus:bg-white transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="w-10 h-10 bg-forest-700 text-white rounded-xl flex items-center justify-center hover:bg-forest-800 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-gray-100 text-center text-xs text-forest-400 bg-gray-50">
            Захиалга дууссан тул чат хаагдсан байна
          </div>
        )}
      </div>
    </div>
  );
}
