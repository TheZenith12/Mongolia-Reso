// app/api/admin/places-list/route.ts
// NEW FILE - create this

import { NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json([], { status: 401 });

    // Зөвхөн super_admin хандаж чадна
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'super_admin') {
      return NextResponse.json([], { status: 403 });
    }

    // Admin client ашиглаж бүх газруудыг авах
    const admin = createAdminClient();
    const { data, error } = await (admin.from('places') as any)
      .select('id, name')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json([], { status: 500 });
  }
}