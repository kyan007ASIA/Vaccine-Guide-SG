/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  Sparkles,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Building2,
  CreditCard
} from 'lucide-react';
import { PatientProfile, EvaluationResult, AssistantResponse } from '../types';

interface GuideMeViewProps {
  profile: PatientProfile;
  onUpdateProfile: (updates: Partial<PatientProfile>) => void;
  onNavigateToSources: () => void;
}

export const GuideMeView: React.FC<GuideMeViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigateToSources
}) => {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [expandedVaccine, setExpandedVaccine] = useState<string | null>(null);

  // Assistant state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      sender: 'user' | 'assistant';
      text?: string;
      response?: AssistantResponse;
      timestamp: string;
    }>
  >([]);

  // Evaluate whenever profile changes
  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/rules/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      if (res.ok) {
        const json = await res.json();
        setEvaluation(json);
      }
    } catch (err) {
      console.error('Failed to evaluate rules:', err);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [profile]);

  // Handle preset application
  const applyPreset = (presetName: string) => {
    if (presetName === 'senior_chronic') {
      onUpdateProfile({
        age: 68,
        gender: 'female',
        citizenship: 'citizen',
        subsidyCard: 'pioneer',
        healthierSgEnrolled: true,
        atEnrolledClinic: true,
        hasDiabetes: true,
        hasChronicHeart: false,
        hasChronicLung: false,
        hasChronicKidneyLiver: false,
        isImmunocompromised: false,
        isPregnant: false,
        priorPcvReceived: false,
        priorPpsv23Received: false
      });
    } else if (presetName === 'young_female') {
      onUpdateProfile({
        age: 22,
        gender: 'female',
        citizenship: 'citizen',
        subsidyCard: 'chas_orange',
        healthierSgEnrolled: false,
        atEnrolledClinic: false,
        hasDiabetes: false,
        hasChronicHeart: false,
        hasChronicLung: false,
        hasChronicKidneyLiver: false,
        isImmunocompromised: false,
        isPregnant: false,
        priorHpvDoses: 0
      });
    } else if (presetName === 'pregnancy') {
      onUpdateProfile({
        age: 31,
        gender: 'female',
        citizenship: 'citizen',
        subsidyCard: 'chas_green',
        healthierSgEnrolled: true,
        atEnrolledClinic: true,
        hasDiabetes: false,
        hasChronicHeart: false,
        hasChronicLung: false,
        hasChronicKidneyLiver: false,
        isImmunocompromised: false,
        isPregnant: true
      });
    } else if (presetName === 'reset') {
      onUpdateProfile({
        age: 40,
        gender: 'all',
        citizenship: 'citizen',
        subsidyCard: 'none',
        healthierSgEnrolled: false,
        atEnrolledClinic: false,
        hasDiabetes: false,
        hasChronicHeart: false,
        hasChronicLung: false,
        hasChronicKidneyLiver: false,
        isImmunocompromised: false,
        isPregnant: false,
        priorPcvReceived: false,
        priorPpsv23Received: false,
        priorHpvDoses: 0
      });
    }
  };

  // Handle asking grounded assistant
  const handleAskAssistant = async (questionText?: string) => {
    const q = questionText || chatInput;
    if (!q.trim() || chatLoading) return;

    const userEntry = {
      sender: 'user' as const,
      text: q,
      timestamp: new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userEntry]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          profile
        })
      });

      if (res.ok) {
        const assistantRes: AssistantResponse = await res.json();
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'assistant',
            response: assistantRes,
            timestamp: new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('Assistant response failed');
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the evidence assistant at this time. Please refer directly to the verified rules table above.',
          timestamp: new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* View Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Interactive Guidance & Subsidy Checker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find your recommended vaccines & subsidies
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Input your voluntary details below. The deterministic rule engine evaluates official NAIS criteria and MOH subsidy caps. No health data is stored or tracked.
        </p>
      </div>

      {/* Preset Pills */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-700 mr-1">Load Example Persona:</span>
        <button
          onClick={() => applyPreset('senior_chronic')}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
        >
          68yo Pioneer (Diabetes)
        </button>
        <button
          onClick={() => applyPreset('young_female')}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
        >
          22yo Citizen (HPV age)
        </button>
        <button
          onClick={() => applyPreset('pregnancy')}
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
        >
          31yo Pregnant (Tdap booster)
        </button>
        <button
          onClick={() => applyPreset('reset')}
          className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Form
        </button>
      </div>

      {/* Profile Form (Two-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 lg:col-span-1">
          <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
            Patient Parameters
          </h2>

          {/* Age Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Age (Years): <span className="font-bold text-blue-600">{profile.age ?? 40}</span>
            </label>
            <input
              type="range"
              min={18}
              max={95}
              value={profile.age ?? 40}
              onChange={(e) => onUpdateProfile({ age: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>18 yrs</span>
              <span>50 yrs</span>
              <span>65+ yrs</span>
              <span>95 yrs</span>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Biological Sex (For HPV/Pregnancy schedules)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateProfile({ gender: 'female' })}
                className={`py-2 text-xs rounded-xl font-medium cursor-pointer transition-colors ${
                  profile.gender === 'female'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Female
              </button>
              <button
                onClick={() => onUpdateProfile({ gender: 'male', isPregnant: false })}
                className={`py-2 text-xs rounded-xl font-medium cursor-pointer transition-colors ${
                  profile.gender === 'male'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Male
              </button>
            </div>
          </div>

          {/* Citizenship */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Citizenship / Residency
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'citizen', label: 'Citizen' },
                { id: 'pr', label: 'PR' },
                { id: 'foreigner', label: 'Foreign' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => onUpdateProfile({ citizenship: c.id as any })}
                  className={`py-1.5 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                    profile.citizenship === c.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subsidy Tier Card */}
          {profile.citizenship === 'citizen' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CHAS / Special Card Category
              </label>
              <select
                value={profile.subsidyCard || 'none'}
                onChange={(e) => onUpdateProfile({ subsidyCard: e.target.value as any })}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="none">No CHAS Card (Standard Citizen)</option>
                <option value="pioneer">Pioneer Generation (PG)</option>
                <option value="merdeka">Merdeka Generation (MG)</option>
                <option value="chas_blue">CHAS Blue</option>
                <option value="chas_orange">CHAS Orange</option>
                <option value="chas_green">CHAS Green</option>
              </select>
            </div>
          )}

          {/* Healthier SG Enrolment */}
          {profile.citizenship === 'citizen' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.healthierSgEnrolled}
                  onChange={(e) =>
                    onUpdateProfile({
                      healthierSgEnrolled: e.target.checked,
                      atEnrolledClinic: e.target.checked
                    })
                  }
                  className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-emerald-950">
                  Enrolled in Healthier SG
                </span>
              </label>
              <p className="text-[11px] text-emerald-800 leading-normal pl-5">
                Eligible Singapore Citizens receive $0 co-payment for all nationally recommended vaccines at their enrolled GP clinic.
              </p>
            </div>
          )}

          {/* Medical Conditions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Documented Chronic Conditions (NAIS Table 1)
            </label>
            <div className="space-y-1.5">
              {[
                { key: 'hasDiabetes', label: 'Diabetes Mellitus' },
                { key: 'hasChronicLung', label: 'Chronic Respiratory (Asthma / COPD)' },
                { key: 'hasChronicHeart', label: 'Chronic Cardiovascular Disease' },
                { key: 'hasChronicKidneyLiver', label: 'Chronic Renal or Liver Disease' },
                { key: 'isImmunocompromised', label: 'Immunocompromised (HIV, Asplenia, Immunosuppressants)' },
              ].map((cond) => (
                <label key={cond.key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(profile[cond.key as keyof PatientProfile])}
                    onChange={(e) => onUpdateProfile({ [cond.key]: e.target.checked })}
                    className="rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                  <span>{cond.label}</span>
                </label>
              ))}

              {profile.gender === 'female' && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(profile.isPregnant)}
                    onChange={(e) => onUpdateProfile({ isPregnant: e.target.checked })}
                    className="rounded-sm text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-purple-900">Currently Pregnant</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Deterministic Evaluation Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Subsidy Summary Card */}
          {evaluation?.subsidy && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Subsidy & Co-Payment Status</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {evaluation.subsidy.category || 'Standard'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Co-Payment Estimate:</span>
                  <span className="font-bold text-slate-900">{evaluation.subsidy.coPaymentCap}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">MediSave Usable:</span>
                  <span className="font-semibold text-slate-800">
                    {evaluation.subsidy.mediSaveUsable ? 'Yes (MediSave 500/700 up to $500–$700/yr)' : 'Not applicable / 0 co-pay'}
                  </span>
                </div>
                {evaluation.subsidy.notice && (
                  <p className="text-emerald-800 font-medium pt-1 border-t border-slate-200">
                    {evaluation.subsidy.notice}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 pt-1">
                  <strong>Verification Note:</strong> {evaluation.subsidy.disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* Recommended Vaccines List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Evaluated Schedule by Vaccine
              </h3>
              <span className="text-xs text-slate-500">
                Source: NAIS_Sept 2025.pdf
              </span>
            </div>

            {evaluation?.vaccines?.map((vac) => {
              const isMatch = vac.status === 'matches_documented_criteria';
              const isNoMatch = vac.status === 'does_not_match_criteria';
              const isExpanded = expandedVaccine === vac.ruleId;

              return (
                <div
                  key={vac.ruleId}
                  className={`rounded-2xl border transition-all ${
                    isMatch
                      ? 'bg-white border-emerald-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-90'
                  }`}
                >
                  <div
                    onClick={() => setExpandedVaccine(isExpanded ? null : vac.ruleId)}
                    className="p-4 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="mt-0.5 sm:mt-0">
                        {isMatch ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isNoMatch ? (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{vac.vaccineName}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">({vac.ruleId})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {vac.schedule} • <span className="font-medium text-slate-700">{vac.valency}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                          isMatch
                            ? 'bg-emerald-100 text-emerald-800'
                            : isNoMatch
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isMatch
                          ? 'Matches Published Criteria'
                          : isNoMatch
                          ? 'Does Not Match Criteria'
                          : 'Insufficient Info'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-700 space-y-2">
                      {vac.patientNotice && (
                        <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900">
                          <strong>Patient Advisory:</strong> {vac.patientNotice}
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-slate-900">Clinical Indication: </span>
                        <span>{vac.clinicalIndication}</span>
                      </div>

                      {vac.qualifyingFactors && vac.qualifyingFactors.length > 0 && (
                        <div>
                          <span className="font-semibold text-emerald-900">Qualifying Profile Factors: </span>
                          <span className="text-emerald-800">{vac.qualifyingFactors.join(', ')}</span>
                        </div>
                      )}

                      {vac.reason && (
                        <div>
                          <span className="font-semibold text-slate-900">Non-Match Rationale: </span>
                          <span>{vac.reason}</span>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-slate-900">Contraindications: </span>
                        <span>{vac.contraindications}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>
                          <strong>Evidence Locator:</strong> {vac.evidenceLocator}
                        </span>
                        <button
                          onClick={onNavigateToSources}
                          className="text-blue-600 hover:text-blue-800 font-medium underline flex items-center gap-1 cursor-pointer"
                        >
                          View Source Record <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grounded Runtime Assistant Chat (Strict Section 7 Implementation) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Grounded Evidence Q&A Assistant
            </h3>
            <p className="text-xs text-slate-500">
              Answers using only retrieved official Singapore NAIS evidence, MOH subsidy guidelines, and verified research.
            </p>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {[
            'What vaccines are free under Healthier SG?',
            'What is the difference between PCV13 and PPSV23?',
            'Should pregnant women take Tdap?',
            'What are the subsidy caps for Pioneer Generation?',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleAskAssistant(promptText)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="space-y-4 my-4 max-h-96 overflow-y-auto pr-1">
          {chatHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              Ask any question about adult vaccines, schedules, or subsidies in Singapore.
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p>{msg.text}</p>
                  ) : msg.response ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-line text-slate-900 font-normal">
                        {msg.response.answer}
                      </p>

                      {/* Structured Claims with Evidence Mapping */}
                      {msg.response.claims && msg.response.claims.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 space-y-1.5">
                          <span className="font-semibold text-slate-700 text-[11px] block">
                            Evaluated Claims:
                          </span>
                          {msg.response.claims.map((claim) => (
                            <div
                              key={claim.claimId}
                              className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-slate-500 font-bold">
                                  {claim.claimId}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-sm font-semibold uppercase text-[9px] ${
                                    claim.status === 'supported'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {claim.status}
                                </span>
                              </div>
                              <p className="text-slate-800">{claim.text}</p>
                              <div className="text-[10px] text-slate-500">
                                Ref: {claim.evidenceIds.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sourced Citations */}
                      {msg.response.sources && msg.response.sources.length > 0 && (
                        <div className="pt-1 text-[11px] text-slate-600">
                          <strong>Citations: </strong>
                          {msg.response.sources.map((s, idx) => (
                            <span key={idx} className="mr-2">
                              • {s.title} ({s.locator})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* As-Of and Limitations */}
                      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between gap-1">
                        <span>Data as of: {msg.response.dataAsOf}</span>
                        <span>{msg.response.limitations}</span>
                      </div>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              <span>Verifying approved evidence records...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
            placeholder="Type your question about adult vaccinations..."
            className="flex-1 text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            onClick={() => handleAskAssistant()}
            disabled={!chatInput.trim() || chatLoading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
