import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// QPay API Integration
async function getQPayToken(): Promise<string> {
  const res = await fetch('https://merchant.qpay.mn/v2/auth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(
        `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
      ).toString('base64')}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'QPay auth failed');
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { booking_id } = await req.json();
    const supabase = createAdminClient();

    // Get booking details
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, place:places(name)')
      .eq('id', booking_id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }

    // Get QPay token
    const token = await getQPayToken();

    // Create QPay invoice
    const invoiceRes = await fetch('https://merchant.qpay.mn/v2/invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice_code:        process.env.QPAY_INVOICE_CODE,
        sender_invoice_no:   booking_id,
        invoice_receiver_code: 'terminal',
        invoice_description: `${(booking as any).place?.name ?? 'Захиалга'} - ${booking_id.slice(0, 8)}`,
        amount:              (booking as any).total_amount,
        callback_url:        `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/qpay/callback`,
      }),
    });

    const invoiceData = await invoiceRes.json();
    if (!invoiceRes.ok) throw new Error(invoiceData.message ?? 'QPay invoice алдаа');

    // Save invoice ID to booking
    await (supabase.from('bookings') as any)
      .update({ qpay_invoice_id: invoiceData.invoice_id })
      .eq('id', booking_id);

    return NextResponse.json({
      invoice_id: invoiceData.invoice_id,
      qr_text:    invoiceData.qr_text,
      qr_image:   invoiceData.qr_image,
      urls:       invoiceData.urls,
    });
  } catch (err: any) {
    console.error('QPay error:', err);
    return NextResponse.json({ error: err.message ?? 'QPay алдаа' }, { status: 500 });
  }
}
