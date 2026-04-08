import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if super admin
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, role } = await req.json();
    const admin = createAdminClient();
   const { error } = await (admin.from('profiles') as any)
  .update({ role, updated_at: new Date().toISOString() })
  .eq('id', user_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
