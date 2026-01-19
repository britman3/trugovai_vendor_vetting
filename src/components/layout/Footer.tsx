'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate700/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-sm text-slate700">
              TruGovAI™ Vendor Vetting
            </span>
          </div>

          <p className="text-xs text-slate700/70 text-center">
            Part of the TruGovAI™ Toolkit — "Board-ready AI governance in 30 days"
          </p>

          <div className="flex items-center gap-4 text-sm text-slate700/70">
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
