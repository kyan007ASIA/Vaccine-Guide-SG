/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  HeartPulse
} from 'lucide-react';

interface VaccineDirectoryItem {
  id: string;
  name: string;
  category: 'seniors' | 'chronic' | 'women' | 'all';
  valency: string;
  dosingSchedule: string;
  intervalRules: string;
  indication: string;
  contraindications: string;
  subsidyHealthierSg: string;
  subsidyChas: string;
  mediSaveEligible: string;
  locator: string;
  pubmedPmid?: string;
  pubmedSummary?: string;
}

export const VACCINE_DIRECTORY: VaccineDirectoryItem[] = [
  {
    id: 'vac-influenza',
    name: 'Influenza (Flu)',
    category: 'all',
    valency: 'Annual Seasonal Quadrivalent / Trivalent formulation',
    dosingSchedule: '1 dose annually',
    intervalRules: 'Recommended annually during northern and southern hemisphere seasonal protection windows.',
    indication: 'All persons aged 65 years and older; adults aged 18–64 with chronic disorders of pulmonary or cardiac systems (including asthma), diabetes, chronic renal disease, chronic liver disease, or immunocompromise; and pregnant women at any stage.',
    contraindications: 'Severe prior anaphylactic reaction to influenza vaccine or components. Defer in acute febrile illness.',
    subsidyHealthierSg: '$0 co-payment for enrolled Singapore Citizens at their enrolled GP clinic.',
    subsidyChas: 'CHAS Blue / Orange: ~$9–$18 capped co-payment. Pioneer Generation: ~$9–$16 cap. Merdeka Generation: ~$18–$31 cap.',
    mediSaveEligible: 'Eligible under MediSave500 / MediSave700 at participating polyclinics and approved private clinics.',
    locator: 'NAIS_Sept 2025.pdf, Table 1, p. 2',
    pubmedPmid: '37812836',
    pubmedSummary: 'MMWR 2024: Demonstrates substantial reduction in adult acute respiratory hospitalizations following annual seasonal influenza vaccination.'
  },
  {
    id: 'vac-pcv',
    name: 'Pneumococcal Conjugate (PCV13 / PCV20)',
    category: 'seniors',
    valency: 'PCV13 (Prevenar 13) or PCV20 (Prevenar 20)',
    dosingSchedule: '1 dose (initial step in sequential regimen, or single PCV20)',
    intervalRules: 'If PCV13 administered, follow with PPSV23 at least 1 year later (or ≥8 weeks later for immunocompromised adults).',
    indication: 'All adults aged 65 years and older; adults aged 18–64 with chronic pulmonary, heart, liver, or renal diseases, diabetes, cochlear implants, CSF leaks, asplenia, or immunocompromising conditions.',
    contraindications: 'Severe allergic reaction to any pneumococcal vaccine or diphtheria toxoid component.',
    subsidyHealthierSg: '$0 co-payment for enrolled Singapore Citizens matching NAIS age/condition criteria at their enrolled clinic.',
    subsidyChas: 'CHAS Blue: ~$16–$31 capped co-payment. Pioneer Generation: ~$16 cap. Merdeka Generation: ~$31 cap.',
    mediSaveEligible: 'Claimable under MediSave500 / MediSave700.',
    locator: 'NAIS_Sept 2025.pdf, Table 1 & Footnote 4, p. 2–3',
    pubmedPmid: '36044738',
    pubmedSummary: 'Expert Rev Vaccines 2022: Demonstrates robust opsonophagocytic antibody responses against 20 vaccine serotypes in adults ≥50 and high-risk groups.'
  },
  {
    id: 'vac-ppsv23',
    name: 'Pneumococcal Polysaccharide (PPSV23)',
    category: 'seniors',
    valency: 'PPSV23 (Pneumovax 23)',
    dosingSchedule: '1 dose following prior PCV13',
    intervalRules: 'Must be given at least 1 year after PCV13 for general older adults. High-risk immunocompromised individuals receive dose ≥8 weeks post-PCV13, with a second PPSV23 booster ≥5 years later.',
    indication: 'Adults aged 65 and older and high-risk chronic patients who have previously received PCV13.',
    contraindications: 'Severe hypersensitivity to PPSV23.',
    subsidyHealthierSg: '$0 co-payment for enrolled Singapore Citizens at their enrolled clinic.',
    subsidyChas: 'CHAS Blue / Orange capped co-payments apply. PG / MG subsidy tiers available.',
    mediSaveEligible: 'Claimable under MediSave500.',
    locator: 'NAIS_Sept 2025.pdf, Table 1 & Footnote 4, p. 3',
    pubmedPmid: '36044738',
    pubmedSummary: 'Provides broad capsular polysaccharide coverage across 23 serotypes as the sequential component of adult protection.'
  },
  {
    id: 'vac-hpv',
    name: 'Human Papillomavirus (HPV)',
    category: 'women',
    valency: 'Bivalent (Cervarix), Quadrivalent (Gardasil), or 9-Valent (Gardasil 9)',
    dosingSchedule: '3 doses (0, 1–2, 6 months)',
    intervalRules: 'Minimum 1 month between dose 1 and 2; minimum 3 months between dose 2 and 3.',
    indication: 'Recommended for females aged 18 to 26 years for prevention of cervical cancer, anogenital lesions, and genital warts.',
    contraindications: 'Severe yeast allergy (for Gardasil). Contraindicated during pregnancy; defer doses until delivery.',
    subsidyHealthierSg: '$0 co-payment for enrolled Singapore Citizen females aged 18–26 at enrolled clinics for approved bivalent/quadrivalent formulations.',
    subsidyChas: 'Subsidised at CHAS clinics for Singapore Citizen females aged 18–26 with fixed caps for approved formulations.',
    mediSaveEligible: 'MediSave500 can be used for females aged 9 to 26 years.',
    locator: 'NAIS_Sept 2025.pdf, Table 1 & Footnote 5, p. 3',
    pubmedPmid: '31204115',
    pubmedSummary: 'Lancet 2019: Systematic meta-analysis confirming substantial population reductions in HPV 16/18 infections and high-grade cervical lesions.'
  },
  {
    id: 'vac-tdap',
    name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
    category: 'women',
    valency: 'Combined Tdap toxoid and acellular pertussis formulation',
    dosingSchedule: '1 dose in each pregnancy; or booster every 10 years / post-injury',
    intervalRules: 'Recommended in every pregnancy, optimally between 16 and 32 weeks of gestation.',
    indication: 'Pregnant women (to confer passive protective antibodies to the neonate against pertussis); adults requiring wound tetanus prophylaxis; healthcare personnel caring for infants.',
    contraindications: 'Severe encephalopathy within 7 days of previous pertussis-containing vaccine.',
    subsidyHealthierSg: 'Covered under national subsidy schedule for maternal health.',
    subsidyChas: 'Subsidies apply at polyclinics and participating CHAS clinics.',
    mediSaveEligible: 'Claimable under approved maternal and vaccination guidelines.',
    locator: 'NAIS_Sept 2025.pdf, Table 1, p. 4',
    pubmedPmid: '29958745',
    pubmedSummary: 'Obstet Gynecol 2018: Confirms safety and high transplacental IgG antibody transfer protecting infants during vulnerable first months of life.'
  },
  {
    id: 'vac-zoster',
    name: 'Herpes Zoster (Shingles)',
    category: 'seniors',
    valency: 'Recombinant Zoster Vaccine (RZV / Shingrix)',
    dosingSchedule: '2 doses (administered 2 to 6 months apart)',
    intervalRules: 'Dose 2 given 2 to 6 months after dose 1. For immunocompromised individuals, interval can be compressed to 1 to 2 months upon clinical decision.',
    indication: 'Clinically recommended for all adults aged 50 years and older; and immunocompromised adults aged 19 years and older.',
    contraindications: 'Severe allergy to vaccine components. Defer during acute active shingles rash or severe febrile illness.',
    subsidyHealthierSg: 'Clinical recommendation on NAIS is distinct from routine CHAS subsidies. Co-payment depends on prevailing clinic formulary.',
    subsidyChas: 'Confirm with clinic whether public subsidies apply; not universally $0 under standard packages.',
    mediSaveEligible: 'Approved under MediSave500 / MediSave700 up to annual limits for adults aged 50+.',
    locator: 'NAIS_Sept 2025.pdf, Table 1, p. 4',
    pubmedPmid: '31570774',
    pubmedSummary: 'Clin Infect Dis 2020: 4-year final trial analysis confirming >90% sustained efficacy against shingles and postherpetic neuralgia in older adults.'
  },
  {
    id: 'vac-hepb',
    name: 'Hepatitis B',
    category: 'chronic',
    valency: 'Recombinant Hepatitis B Surface Antigen (HBsAg)',
    dosingSchedule: '3 doses (0, 1, 6 months)',
    intervalRules: 'Minimum 4 weeks between doses 1 and 2; minimum 8 weeks between doses 2 and 3 (and ≥16 weeks after dose 1).',
    indication: 'Adults with no prior hepatitis B vaccination or immunity (negative anti-HBs and negative HBsAg), especially those with chronic liver disease, household contacts of carriers, or healthcare workers.',
    contraindications: 'Severe allergy to yeast or vaccine ingredients.',
    subsidyHealthierSg: '$0 co-payment for eligible enrolled citizens matching high-risk indications at enrolled GP.',
    subsidyChas: 'Subsidised for high-risk citizens at polyclinics and participating CHAS clinics.',
    mediSaveEligible: 'MediSave500 eligible.',
    locator: 'NAIS_Sept 2025.pdf, Table 1, p. 3'
  },
  {
    id: 'vac-mmr',
    name: 'Measles, Mumps, Rubella (MMR)',
    category: 'all',
    valency: 'Live attenuated viral combination',
    dosingSchedule: '1 or 2 doses (minimum 4 weeks apart)',
    intervalRules: 'At least 4 weeks between doses.',
    indication: 'Adults born in or after 1957 without documented proof of immunity or 2 doses of prior MMR vaccine.',
    contraindications: 'Pregnancy (avoid pregnancy for 1 month post-vaccination); severe immunosuppression.',
    subsidyHealthierSg: '$0 co-payment for susceptible enrolled citizens at enrolled GP.',
    subsidyChas: 'Subsidised for eligible citizens at polyclinics and CHAS clinics.',
    mediSaveEligible: 'MediSave500 eligible.',
    locator: 'NAIS_Sept 2025.pdf, Table 1, p. 3'
  }
];

export const VaccinesView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'seniors' | 'chronic' | 'women'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('vac-influenza');

  const filteredVaccines = VACCINE_DIRECTORY.filter((vac) => {
    const matchesCategory = filter === 'all' || vac.category === filter;
    const matchesSearch =
      vac.name.toLowerCase().includes(search.toLowerCase()) ||
      vac.valency.toLowerCase().includes(search.toLowerCase()) ||
      vac.indication.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Directory Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
          <ShieldPlus className="w-3.5 h-3.5" />
          <span>National Adult Immunisation Schedule Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Adult Vaccines in Singapore
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Comprehensive, source-grounded guide to vaccines recommended for adults aged 18 and above based on official MOH guidance (NAIS Sept 2025).
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vaccine name, serotype, or condition..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Vaccines' },
            { id: 'seniors', label: 'Seniors (65+)' },
            { id: 'chronic', label: 'Chronic Illness' },
            { id: 'women', label: 'Women & Pregnancy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Cards */}
      <div className="space-y-4">
        {filteredVaccines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No vaccines match your search criteria.
          </div>
        ) : (
          filteredVaccines.map((vac) => {
            const isExpanded = expandedId === vac.id;
            return (
              <div
                key={vac.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-colors hover:border-blue-200"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : vac.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-base font-bold text-slate-900">{vac.name}</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {vac.dosingSchedule}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      <strong className="text-slate-800">Product / Formulation:</strong> {vac.valency}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-slate-500">
                      {vac.locator}
                    </span>
                    <div className="p-1 rounded-lg bg-slate-100 text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-700 space-y-4">
                    {/* Clinical Indications */}
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                      <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Clinical Target Indications</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed pl-5.5">
                        {vac.indication}
                      </p>
                    </div>

                    {/* Schedule & Timing Rules */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-semibold text-slate-900 block">Dosing & Administration:</span>
                        <p className="text-slate-700">{vac.dosingSchedule}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="font-semibold text-slate-900 block">Interval & Sequencing Rules:</span>
                        <p className="text-slate-700">{vac.intervalRules}</p>
                      </div>
                    </div>

                    {/* Subsidies & Payment Breakdown */}
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Subsidies, Co-payments & MediSave</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                          <span className="font-bold text-emerald-900 block">Healthier SG:</span>
                          <span className="text-emerald-800">{vac.subsidyHealthierSg}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                          <span className="font-bold text-emerald-900 block">CHAS / PG / MG:</span>
                          <span className="text-emerald-800">{vac.subsidyChas}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                          <span className="font-bold text-emerald-900 block">MediSave:</span>
                          <span className="text-emerald-800">{vac.mediSaveEligible}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contraindications */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1 text-amber-950">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Contraindications & Precautions</span>
                      </div>
                      <p className="text-xs text-amber-900 pl-5.5">{vac.contraindications}</p>
                    </div>

                    {/* Grounded PubMed Research Reference */}
                    {vac.pubmedSummary && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">
                            Supporting Research Record (PubMed):
                          </span>
                          {vac.pubmedPmid && (
                            <span className="font-mono text-[11px] text-blue-600 font-bold">
                              PMID: {vac.pubmedPmid}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed text-xs">
                          {vac.pubmedSummary}
                        </p>
                      </div>
                    )}

                    {/* Precise Source Footnote */}
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>Source: Singapore Ministry of Health — {vac.locator}</span>
                      <span className="italic">Confirm product valency with administering GP</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
