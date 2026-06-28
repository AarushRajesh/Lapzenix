import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-bg py-10 mt-20 border-t-4 border-brand">
      <div className="container mx-auto px-4 text-center md:text-left grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-outfit font-bold text-brand mb-4">Lapzenix</h2>
          <p className="text-muted text-sm max-w-xs mx-auto md:mx-0">
            Chennai's leading expert in custom PC builds, components, repairs, and data recovery.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
          <p className="text-muted text-sm mb-2">WhatsApp: +91 98765 43210</p>
          <p className="text-muted text-sm mb-2">Email: contact@lapzenix.com</p>
          <p className="text-muted text-sm">Location: Chennai, Tamil Nadu</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="text-muted text-sm space-y-2">
            <li><Link to="/admin" className="hover:text-brand transition-colors">Admin Login</Link></li>
            <li><a href="#" className="hover:text-brand transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-muted text-xs mt-10 border-t border-muted/20 pt-6">
        &copy; {new Date().getFullYear()} Lapzenix. All rights reserved.
      </div>
    </footer>
  );
}
