'use client';

import { useState } from 'react';
import { Save, Globe, Mail, Phone, Facebook, Instagram } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Profile } from '@/lib/types';

export default function AdminSettingsClient({ profile }: { profile: Profile }) {
  const [siteName,    setSiteName]    = useState('Монгол Нутаг');
  const [sitePhone,   setSitePhone]   = useState('+976 9900-0000');
  const [siteEmail,   setSiteEmail]   = useState('info@mongolnudag.mn');
  const [siteUrl,     setSiteUrl]     = useState('https://mongolnudag.mn');
  const [fbUrl,       setFbUrl]       = useState('');
  const [igUrl,       setIgUrl]       = useState('');
  const [loading,     setLoading]     = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Тохиргоо хадгалагдлаа');
    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Тохиргоо</h1>
        <p className="text-forest-500 text-sm mt-1">Сайтын ерөнхий тохиргоо</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Site info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
            <Globe size={17} /> Сайтын мэдээлэл
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Сайтын нэр</label>
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Домэйн</label>
              <input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="input-field"
                placeholder="https://mongolnudag.mn"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
            <Phone size={17} /> Холбоо барих
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Утас</label>
              <input
                value={sitePhone}
                onChange={(e) => setSitePhone(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">И-мэйл</label>
              <input
                type="email"
                value={siteEmail}
                onChange={(e) => setSiteEmail(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
            <Facebook size={17} /> Сошиал медиа
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Facebook</label>
              <input
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
                className="input-field"
                placeholder="https://facebook.com/mongolnudag"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Instagram</label>
              <input
                value={igUrl}
                onChange={(e) => setIgUrl(e.target.value)}
                className="input-field"
                placeholder="https://instagram.com/mongolnudag"
              />
            </div>
          </div>
        </div>

        {/* Admin profile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Профайл мэдээлэл</h2>
          <div className="p-4 bg-forest-50 rounded-xl text-sm text-forest-700">
            <p><strong>Нэр:</strong> {profile.full_name}</p>
            <p className="mt-1"><strong>Эрх:</strong> Super Admin</p>
            <p className="mt-1"><strong>ID:</strong> <code className="font-mono text-xs">{profile.id}</code></p>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" className="opacity-75" />
                </svg>
                Хадгалж байна...
              </span>
            ) : (
              <><Save size={16} /> Хадгалах</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
