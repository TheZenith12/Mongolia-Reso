import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { formatDate, getInitials } from '@/lib/utils';
import AdminUserRoleChange from '@/components/admin/AdminUserRoleChange';

async function getUsers() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile || (profile as any).role !== 'super_admin') redirect('/admin');

  const users = await getUsers();

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-50 text-red-700 border-red-200',
    manager:     'bg-blue-50 text-blue-700 border-blue-200',
    user:        'bg-gray-50 text-gray-600 border-gray-200',
  };
  const roleLabels: Record<string, string> = {
    super_admin: '👑 Super Admin',
    manager:     '🔑 Manager',
    user:        '👤 Хэрэглэгч',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Хэрэглэгчид</h1>
        <p className="text-forest-500 text-sm mt-1">{users.length} нийт хэрэглэгч</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Хэрэглэгч', 'Утас', 'Эрх', 'Бүртгүүлсэн', 'Үйлдэл'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-sm font-semibold">
                      {getInitials(user.full_name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-forest-900">{user.full_name ?? '—'}</div>
                      <div className="text-xs text-forest-400 font-mono">{user.id.slice(0, 12)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-forest-600">{user.phone ?? '—'}</td>
                <td className="px-5 py-4">
                  <span className={`badge text-xs ${roleColors[user.role] ?? ''}`}>
                    {roleLabels[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-forest-500">{formatDate(user.created_at)}</td>
                <td className="px-5 py-4">
                  <AdminUserRoleChange userId={user.id} currentRole={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16 text-forest-400 text-sm">Хэрэглэгч байхгүй байна</div>
        )}
      </div>
    </div>
  );
}