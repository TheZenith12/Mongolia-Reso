import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-9xl font-semibold text-forest-200 leading-none mb-4">
          404
        </div>
        <h1 className="font-display text-3xl font-semibold text-forest-900 mb-3">
          Хуудас олдсонгүй
        </h1>
        <p className="text-forest-500 mb-8 leading-relaxed">
          Та хайж буй хуудас устгагдсан эсвэл шилжсэн байж болно.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home size={16} /> Нүүр хуудас
          </Link>
          <Link href="/places" className="btn-secondary">
            <Search size={16} /> Газар хайх
          </Link>
        </div>
      </div>
    </div>
  );
}
