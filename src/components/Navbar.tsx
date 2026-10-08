/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, ShieldPlus, BookOpen, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'guidance' | 'vaccines' | 'evidence';
  onTabChange: (tab: 'home' | 'guidance' | 'vaccines' | 'evidence') => void;
  systemStatus?: 'healthy' | 'checking' | 'degraded';
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, systemStatus = 'healthy' }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'guidance', label: 'Guide Me', icon: Compass },
    { id: 'vaccines', label: 'Vaccines', icon: ShieldPlus },
    { id: 'evidence', label: 'Evidence', icon: BookOpen },
  ] as const;

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <ShieldPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                  My Vaccine Guide SG
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-100 text-blue-800 rounded-md">
                  NAIS Sept 2025
                </span>
              </div>
              <p className="text-xs text-slate-700 hidden sm:block">
                Singapore Adult Immunisation Education & Subsidy Guide
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Registry Status Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('evidence')}
              title="Verified Source Registry Status"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${systemStatus === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="hidden sm:inline">Registry</span>
              <span className="text-[11px] text-slate-500">v2025</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Stitch Layout) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe">
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
