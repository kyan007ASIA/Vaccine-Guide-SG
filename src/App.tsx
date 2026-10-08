/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { GuideMeView } from './components/GuideMeView';
import { VaccinesView } from './components/VaccinesView';
import { EvidenceView } from './components/EvidenceView';
import { PatientProfile } from './types';
import { ShieldCheck, HeartPulse, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'guidance' | 'vaccines' | 'evidence'>('home');

  // In-memory voluntary patient profile
  const [profile, setProfile] = useState<PatientProfile>({
    age: 40,
    gender: 'all',
    citizenship: 'citizen',
    subsidyCard: 'none',
    healthierSgEnrolled: false,
    atEnrolledClinic: false,
    hasDiabetes: false,
    hasChronicLung: false,
    hasChronicHeart: false,
    hasChronicKidneyLiver: false,
    isImmunocompromised: false,
    isPregnant: false,
    priorPcvReceived: false,
    priorPpsv23Received: false,
    priorHpvDoses: 0
  });

  const handleUpdateProfile = (updates: Partial<PatientProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Permanent Medical Awareness Disclaimer */}
      <DisclaimerBanner />

      {/* Top Navbar & Mobile Bottom Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        systemStatus="healthy"
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {activeTab === 'guidance' && (
          <GuideMeView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateToSources={() => setActiveTab('evidence')}
          />
        )}
        {activeTab === 'vaccines' && <VaccinesView />}
        {activeTab === 'evidence' && <EvidenceView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              SG
            </div>
            <span className="font-semibold text-slate-800">My Vaccine Guide SG</span>
            <span>• Grounded in NAIS (Updated September 2025)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Voluntary in-memory session only</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('evidence')}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Source Registry
            </button>
            <span>•</span>
            <a
              href="https://isomer-user-content.by.gov.sg/18/abda18d6-75b8-4ce2-9085-58905e6e75b6/NAIS_Sept%202025.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              NAIS PDF <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
