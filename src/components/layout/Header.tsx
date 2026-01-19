'use client';

import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <span className="font-bold text-lg">TruGovAI</span>
              <span className="text-xs text-mint300 ml-1">Vendor Vetting</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Vendor Registry
            </Link>
            <Link
              href="/assessments"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Assessments
            </Link>
            <Link
              href="/assessments/new"
              className="bg-teal hover:bg-teal/90 text-white px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors"
            >
              Start Assessment
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-white/80 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
