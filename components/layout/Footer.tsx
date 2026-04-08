import Link from 'next/link';
import { Leaf, Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-forest-300 mt-24">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
                <Leaf size={18} className="text-amber-300" />
              </div>
              <span className="font-display text-xl font-semibold text-white">Монгол Нутаг</span>
            </div>
            <p className="text-sm leading-relaxed text-forest-400 max-w-xs">
              Монголын байгалийн гоо үзэсгэлэн, амралтын газруудыг нэгтгэсэн хамгийн том
              платформ. Аялал жуулчлалын шинэ туршлага бүтээж байна.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 bg-forest-800 rounded-lg flex items-center justify-center hover:bg-forest-700 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-forest-800 rounded-lg flex items-center justify-center hover:bg-forest-700 transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-lg">Хурдан холбоос</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/places?type=resort', label: 'Амралтын газрууд' },
                { href: '/places?type=nature', label: 'Байгалийн газрууд' },
                { href: '/map', label: 'Газрын зураг' },
                { href: '/about', label: 'Бидний тухай' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-lg">Холбоо барих</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-amber-400 flex-shrink-0" />
                <span>+976 9900-0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-amber-400 flex-shrink-0" />
                <span>info@mongolnudag.mn</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Улаанбаатар хот, Монгол Улс</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-forest-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-500">
          <span>© 2025 Монгол Нутаг. Бүх эрх хуулиар хамгаалагдсан.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-forest-300 transition-colors">Нууцлалын бодлого</Link>
            <Link href="/terms" className="hover:text-forest-300 transition-colors">Үйлчилгээний нөхцөл</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
