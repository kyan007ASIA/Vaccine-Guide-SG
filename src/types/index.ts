/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PatientProfile {
  age: number | null;
  gender: 'all' | 'male' | 'female' | null;
  citizenship: 'citizen' | 'pr' | 'foreigner' | null;
  subsidyCard: 'pioneer' | 'merdeka' | 'chas_blue' | 'chas_orange' | 'chas_green' | 'none' | null;
  healthierSgEnrolled: boolean;
  atEnrolledClinic: boolean;
  hasDiabetes: boolean;
  hasChronicLung: boolean;
  hasChronicHeart: boolean;
  hasChronicKidneyLiver: boolean;
  isImmunocompromised: boolean;
  isPregnant: boolean;
  priorPcvReceived?: boolean;
  priorPpsv23Received?: boolean;
  priorHpvDoses?: number;
  woundManagement?: boolean;
  infantContact?: boolean;
}

export type EvalStatus = 'matches_documented_criteria' | 'does_not_match_criteria' | 'insufficient_information';

export interface VaccineEvaluation {
  ruleId: string;
  vaccineName: string;
  valency: string;
  schedule: string;
  clinicalIndication: string;
  contraindications: string;
  evidenceLocator: string;
  subsidyLocator: string;
  effectiveDate: string;
  status: EvalStatus;
  qualifyingFactors?: string[];
  scheduleNote?: string;
  subsidyNotice?: string;
  patientNotice?: string;
  reason?: string;
}

export interface SubsidyEvaluation {
  status: EvalStatus;
  category: string | null;
  healthierSgFree?: boolean;
  coPaymentCap: string;
  mediSaveUsable: boolean;
  mediSaveNote?: string;
  notice?: string;
  disclaimer: string;
  reason?: string;
}

export interface EvaluationResult {
  evaluatedAt: string;
  sourceDocument: string;
  rulesVersion: string;
  patientProfileSummary: {
    age: number | null;
    citizenship: string | null;
    subsidyCard: string | null;
    healthierSgEnrolled: boolean;
  };
  vaccines: VaccineEvaluation[];
  subsidy: SubsidyEvaluation;
  importantClinicalDisclaimer: string;
}

export interface AssistantClaim {
  claimId: string;
  text: string;
  evidenceIds: string[];
  status: 'supported' | 'insufficient' | 'conflicting';
}

export interface AssistantSource {
  sourceId: string;
  title: string;
  locator: string;
  date?: string;
}

export interface AssistantResponse {
  answer: string;
  claims: AssistantClaim[];
  sources: AssistantSource[];
  dataAsOf: string;
  missingInformation: string | null;
  limitations: string;
}

export interface CsvSeriesRecord {
  inputRow: number;
  dataSeries: string;
  indicator: string;
  gender: string;
  years: Record<string, { year: number; value: number | null; rawText: string; isNull: boolean }>;
  chronologicalValues: Array<{ year: number; value: number | null; rawText: string }>;
  latestAvailable: { year: number | null; value: number | null };
  earliestAvailable: { year: number | null; value: number | null };
  unitNotice: string;
  sourceFilename: string;
}

export interface CsvDataset {
  filename: string;
  contentHash: string;
  rowCount: number;
  columns: string[];
  chronologicalYears: number[];
  series: CsvSeriesRecord[];
  loadedAt: string;
  valid: boolean;
}

export interface EnvironmentSnapshot {
  timezone: string;
  retrievedAt: string;
  forecast: {
    twoHourSummary: string;
    validityPeriod: string | null;
    generalSummary: string | null;
    status: string;
  };
  airTemperature: {
    islandwideAverageCelsius: string | null;
    unit: string;
    observationTimestamp: string | null;
    status: string;
  };
  airQuality: {
    psi24Hourly: number | null;
    psiObservationTimestamp: string | null;
    pm25OneHourlyMicrogramM3: number | null;
    pm25ObservationTimestamp: string | null;
    note: string;
  };
  precipitation: {
    rainfallDetected: boolean;
    status: string;
  };
  disclaimer: string;
}

export interface TransportSnapshot {
  timezone: string;
  retrievedAt: string;
  carpark: {
    status: string;
    totalCarparksReported: number;
    observationTimestamp: string | null;
    sampleFeed: Array<{
      carparkNumber: string;
      updateDatetime: string;
      lotTypes: Array<{ type: string; totalLots: string; availableLots: string }>;
    }>;
    notice: string;
  };
  taxi: {
    status: string;
    totalTaxisAvailableOnRoad: number;
    observationTimestamp: string | null;
    notice: string;
  };
  disclaimer: string;
}
