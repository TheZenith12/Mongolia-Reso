import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Debug: show what's happening
  if (!user) {
    return (
      <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
        <h2>❌ User байхгүй байна</h2>
        <p style={{color: '#f87171'}}>Шалтгаан: {userError?.message ?? 'Session олдсонгүй'}</p>
        <br/>
        <a href="/auth/login" style={{color: '#4ade80'}}>→ Login хуудас руу очих</a>
      </div>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return (
      <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
        <h2>❌ Profile байхгүй байна</h2>
        <p>User ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p style={{color: '#f87171'}}>Profile алдаа: {profileError?.message}</p>
      </div>
    );
  }

if (!['super_admin', 'manager'].includes((profile as any).role)) {
    return (
      <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
        <h2>❌ Эрх байхгүй</h2>
        <p>Email: {user.email}</p>
        <p>Одоогийн role: <strong style={{color: '#fbbf24'}}>{(profile as any).role}</strong></p>
        <p style={{color: '#f87171'}}>super_admin эрх шаардлагатай</p>
        <br/>
        <p>Supabase SQL Editor дээр доорхыг ажиллуулна уу:</p>
        <pre style={{background: '#1a2e1a', padding: '12px', borderRadius: '8px', color: '#4ade80'}}>
{`UPDATE profiles SET role = 'super_admin' WHERE id = '${user.id}';`}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-forest-950">
      <AdminSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
