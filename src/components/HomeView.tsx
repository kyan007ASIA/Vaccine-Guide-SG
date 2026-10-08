/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Compass, ArrowRight, HeartPulse, ShieldAlert, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { LiveEnvironmentCard } from './LiveEnvironmentCard';
import { PatientProfile } from '../types';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'guidance' | 'vaccines' | 'evidence') => void;
  profile: PatientProfile;
  onUpdateProfile: (updates: Partial<PatientProfile>) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, profile, onUpdateProfile }) => {
  return (
    <div className="space-y-6 pb-20 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Hero Banner (Stitch visual design: blue & white palette, clean rounded cards) */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-medium mb-3 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Official NAIS Guidance (Updated Sept 2025)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight sm:leading-snug">
            Protect your health with the right adult vaccines.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Understand which adult vaccines are clinically recommended for you under Singapore’s National Adult Immunisation Schedule (NAIS), and check your Healthier SG and CHAS subsidy eligibility.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('guidance')}
              className="px-5 py-3 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-blue-700" />
              <span>Check My Recommendations</span>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </button>
            <button
              onClick={() => onNavigate('vaccines')}
              className="px-5 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700/80 border border-blue-400/30 text-white font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore NAIS Vaccines</span>
            </button>
          </div>
        </div>

        {/* Decorative Graphic Element */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick In-Memory Context Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-blue-600" />
              Quick Eligibility Snapshot
            </h2>
            <p className="text-xs text-slate-500">
              Set voluntary details to personalise guidance. Data stays only in temporary memory.
            </p>
          </div>
          <button
            onClick={() => onNavigate('guidance')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-center cursor-pointer"
          >
            <span>Full questionnaire</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Age Selection */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Age Range
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: '18–49', val: 35 },
                { label: '50–64', val: 55 },
                { label: '65+', val: 68 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => onUpdateProfile({ age: btn.val })}
                  className={`py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                    (btn.val === 68 && (profile.age ?? 0) >= 65) ||
                    (btn.val === 55 && (profile.age ?? 0) >= 50 && (profile.age ?? 0) < 65) ||
                    (btn.val === 35 && (profile.age ?? 0) < 50 && profile.age !== null)
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Citizenship */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Residency / Citizenship
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onUpdateProfile({ citizenship: 'citizen' })}
                className={`py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  profile.citizenship === 'citizen'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Singapore Citizen
              </button>
              <button
                onClick={() => onUpdateProfile({ citizenship: 'pr' })}
                className={`py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  profile.citizenship === 'pr'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Permanent Resident
              </button>
            </div>
          </div>

          {/* Healthier SG Enrolment */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Healthier SG Enrolment
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onUpdateProfile({ healthierSgEnrolled: true, atEnrolledClinic: true })}
                className={`py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  profile.healthierSgEnrolled
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Enrolled ($0 Co-pay)
              </button>
              <button
                onClick={() => onUpdateProfile({ healthierSgEnrolled: false, atEnrolledClinic: false })}
                className={`py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                  !profile.healthierSgEnrolled
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Not Enrolled
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Core NAIS Vaccines at a Glance */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Key Adult Vaccines on NAIS (Sept 2025)</h2>
          <button
            onClick={() => onNavigate('vaccines')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            View all 8 vaccines →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Influenza */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  Annual Dose
                </span>
                <span className="text-[11px] text-slate-500">Table 1, p. 2</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-2.5">Influenza (Flu)</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Recommended annually for all adults aged 65+, individuals with diabetes, asthma, or heart conditions, and pregnant women.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>$0 co-payment for enrolled Healthier SG Citizens</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pneumococcal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                  PCV & PPSV23
                </span>
                <span className="text-[11px] text-slate-500">Table 1 & Note 4</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-2.5">Pneumococcal Conjugate & Polysaccharide</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Distinct sequential regimens: PCV13 followed by PPSV23 at ≥1 year (or single PCV20) for adults aged 65+ and high-risk patients.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-700">
                CHAS Blue cap: ~$16 / dose • Healthier SG: $0
              </div>
            </div>
          </div>

          {/* Card 3: Herpes Zoster */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  Age 50+
                </span>
                <span className="text-[11px] text-slate-500">Table 1, p. 4</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-2.5">Herpes Zoster (Shingles)</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Recombinant zoster vaccine (RZV / Shingrix, 2 doses). Recommended clinically for adults ≥50 and immunocompromised adults ≥19.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-700">
                MediSave500 claimable • Check clinic co-pay
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Environment & Transport Context Card */}
      <LiveEnvironmentCard />

      {/* Singapore Chronic Conditions & Population Health Survey Context */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              Singapore Population Health Baseline (Residents Aged 18–74)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              From the verified SingStat / National Population Health Survey (2007–2023) dataset.
            </p>
          </div>
          <button
            onClick={() => onNavigate('evidence')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 self-start sm:self-center cursor-pointer"
          >
            Explore all 27 data series →
          </button>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed mb-4">
          Under NAIS, chronic conditions such as <strong>Hypertension, Hyperlipidaemia, and Diabetes Mellitus</strong> are key indicators for adult vaccine subsidies and prioritized immunisation (such as annual influenza and pneumococcal). Here are the latest survey benchmarks:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500">Hypertension (Total)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">37.0%</div>
            <div className="text-[10px] text-slate-500">Latest Year: 2023</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500">Hyperlipidaemia (Total)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">31.9%</div>
            <div className="text-[10px] text-slate-500">Latest Year: 2023</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500">Diabetes Mellitus (Total)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">8.5%</div>
            <div className="text-[10px] text-slate-500">Latest Year: 2023</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500">Obesity (Total)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">11.6%</div>
            <div className="text-[10px] text-slate-500">Latest Year: 2023</div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500 leading-normal">
          <strong>Statistical Note:</strong> These population figures provide historical demographic context. They do not calculate individual risk scores, guarantee subsidy eligibility, or replace personal clinical evaluation.
        </div>
      </div>
    </div>
  );
};
