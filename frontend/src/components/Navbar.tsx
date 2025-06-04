'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/series', label: 'Series', icon: '📋' },
    { path: '/rankings', label: 'Rankings', icon: '🏆' },
    { path: '/matches', label: 'Matches', icon: '⚔️' },
    { path: '/teams', label: 'Teams', icon: '🤖' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-800 shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h1 className="text-xl font-bold text-slate-100">Eurobot 2025 Dashboard</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-slate-700 text-slate-100 border-b-2 border-blue-400'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-slate-300 hover:text-slate-100 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-slate-700 text-slate-100'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
