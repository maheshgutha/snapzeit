import { Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 pb-32 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/orasnap-logo.png" alt="OraSnap Logo" className="h-8 w-auto" />
              <h3 className="text-2xl font-bold">OraSnap</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Professional photography booking platform connecting clients with talented photographers worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/photographers" className="hover:text-white transition-colors">Photographers</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Developer Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Developer</h4>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Rabbani Basha</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Vuyyruru, Krishna District</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+918367561999" className="text-sm hover:text-white transition-colors">
                  +91 8367561999
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p className="mx-auto max-w-[200px] md:max-w-none">&copy; 2026 OraSnap. All rights reserved. Developed by Rabbani Basha</p>
        </div>
      </div>
    </footer>
  );
}