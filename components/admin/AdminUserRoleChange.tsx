'use client';

import { useState } from 'react';
import { createAdminClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import type { UserRole } from '@/lib/types';

interface AdminUserRoleChangeProps {
  userId: string;
  currentRole: UserRole;
}

export default function AdminUserRoleChange({ userId, currentRole }: AdminUserRoleChangeProps) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [loading, setLoading] = useState(false);

  async function handleChange(newRole: UserRole) {
    if (newRole === role) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      if (!res.ok) throw new Error('Алдаа гарлаа');
      setRole(newRole);
      toast.success('Эрх өөрчлөгдлөө');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      disabled={loading}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-forest-700 focus:outline-none focus:ring-1 focus:ring-forest-400 disabled:opacity-50"
    >
      <option value="user">👤 Хэрэглэгч</option>
      <option value="manager">🔑 Manager</option>
      <option value="super_admin">👑 Super Admin</option>
    </select>
  );
}
