import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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
  return data.access_token;
}

// GET /api/payment/qpay/check?invoice_id=...&booking_id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('invoice_id');
  const bookingId = searchParams.get('booking_id');

  if (!invoiceId || !bookingId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const token = await getQPayToken();
    const res = await fetch(`https://merchant.qpay.mn/v2/payment/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ object_type: 'INVOICE', object_id: invoiceId }),
    });

    const data = await res.json();
    const paid = data.count > 0 && data.paid_amount > 0;

    if (paid) {
      const supabase = createAdminClient();
     await (supabase.from('bookings') as any).update({
  payment_status: 'paid',
  status: 'confirmed',
  updated_at: new Date().toISOString(),
}).eq('id', bookingId);
    }

    return NextResponse.json({ paid, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
