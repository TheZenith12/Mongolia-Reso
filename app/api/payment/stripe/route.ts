import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const { booking_id } = await req.json();
    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, place:places(name, cover_image)')
      .eq('id', booking_id)
      .single();

    if (!booking) return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'mnt',
          unit_amount:  (booking as any).total_amount * 100, // Stripe uses smallest unit
          product_data: {
            name:        (booking as any).place?.name ?? 'Захиалга',
            description: `${(booking as any).nights} шөнө · ${(booking as any).guest_count} хүн`,
            images:      (booking as any).place?.cover_image ? [(booking as any).place.cover_image] : [],
          },
        },
        quantity: 1,
      }],
      metadata: { booking_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking_id}/confirmation?stripe=success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking_id}/payment?stripe=cancel`,
    });

    // Save payment intent to booking
    await (supabase.from('bookings') as any).update({
      payment_intent: session.id,
    }).eq('id', booking_id);

    return NextResponse.json({ checkout_url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
