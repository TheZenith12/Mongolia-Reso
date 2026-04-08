import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteStats } from '@/lib/actions/places';
import { getCurrentProfile } from '@/lib/actions/auth';
import type { SiteStats } from '@/lib/types';

const defaultStats: SiteStats = {
  total_views: 0,
  total_places: 0,
  total_resorts: 0,
  total_nature: 0,
  total_users: 0,
  total_bookings: 0,
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [stats, profile] = await Promise.all([
    getSiteStats().catch(() => defaultStats),
    getCurrentProfile().catch(() => null),
  ]);

  return (
    <div className="flex flex-col min-h-dvh">
      <Header stats={stats} profile={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
