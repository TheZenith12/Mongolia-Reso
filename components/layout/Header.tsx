'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin, Eye, Building2, Leaf, User, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteStats, Profile } from '@/lib/types';
import { signOut } from '@/lib/actions/auth';

interface HeaderProps {
  stats: SiteStats;
  profile: Profile | null;
}

export default function Header({ stats, profile }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/',                label: 'Нүүр' },
    { href: '/places?type=resort',  label: '🏕 Амралтын газар' },
    { href: '/places?type=nature',  label: '🌿 Байгалийн газар' },
    { href: '/map',             label: '🗺️ Газрын зураг' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-forest-100/60">
      {/* Stats bar */}
      <div className="bg-forest-950 text-forest-300 text-xs py-1.5">
        <div className="page-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Eye size={12} className="text-amber-400" />
              <span>{stats.total_views.toLocaleString()} үзэлт</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 size={12} className="text-amber-400" />
              <span>{stats.total_resorts} амралтын газар</span>
            </span>
            <span className="flex items-center gap-1.5 hidden sm:flex">
              <Leaf size={12} className="text-amber-400" />
              <span>{stats.total_nature} байгалийн газар</span>
            </span>
          </div>
          <span className="text-forest-400 hidden md:block">
            🇲🇳 Монголын хамгийн том амралтын платформ
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center shadow-md group-hover:bg-forest-600 transition-colors">
              <Leaf size={18} className="text-amber-300" />
            </div>
            <div>
              <span className="font-display text-xl font-semibold text-forest-900 leading-none block">
                Монгол Нутаг
              </span>
              <span className="text-[10px] text-forest-500 font-body tracking-wide leading-none">
                RESORT & NATURE
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-200',
                  pathname === link.href || pathname.startsWith(link.href.split('?')[0] + '?')
                    ? 'bg-forest-100 text-forest-800'
                    : 'text-forest-600 hover:bg-forest-50 hover:text-forest-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-forest-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center text-white text-xs font-semibold">
                    {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-forest-700">
                    {profile.full_name ?? 'Хэрэглэгч'}
                  </span>
                  <ChevronDown size={14} className="text-forest-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-forest-100 py-1 z-50">
                    {(profile.role === 'super_admin' || profile.role === 'manager') && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-forest-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Building2 size={15} /> Удирдлагын самбар
                      </Link>
                    )}
                    <Link
                      href="/profile/bookings"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-forest-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MapPin size={15} /> Миний захиалгууд
                    </Link>
                    <hr className="border-forest-100 my-1" />
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={15} /> Гарах
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-xs px-4 py-2">
                  Нэвтрэх
                </Link>
                <Link href="/auth/register" className="btn-primary text-xs px-4 py-2 hidden sm:flex">
                  Бүртгүүлэх
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-forest-50 text-forest-600 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-forest-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-forest-700 hover:bg-forest-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
