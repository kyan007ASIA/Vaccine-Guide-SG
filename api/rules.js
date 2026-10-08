/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 3 Standard Evaluation States
 */
export const EVAL_STATUS = {
  MATCHES: 'matches_documented_criteria',
  DOES_NOT_MATCH: 'does_not_match_criteria',
  INSUFFICIENT_INFO: 'insufficient_information'
};

/**
 * Deterministic Rules Registry based on NAIS Sept 2025 and MOH Subsidies
 */
export const VACCINE_RULES = [
  // 1. INFLUENZA
  {
    ruleId: 'RULE-NAIS-2025-FLU-01',
    vaccineName: 'Influenza (Flu)',
    valency: 'Annual Seasonal Formulation (Trivalent / Quadrivalent as recommended by WHO/HSA)',
    evidenceLocator: 'NAIS_Sept 2025.pdf, Table 1, p. 2',
    subsidyLocator: 'MOH Healthier SG & CHAS Subsidy Schedule',
    effectiveDate: 'September 2025',
    schedule: '1 dose annually',
    clinicalIndication: 'Persons aged 65 years and older; or persons aged 18-64 with chronic medical conditions (diabetes, chronic respiratory/asthma, heart disease, chronic kidney/liver disease, immunocompromise); or pregnant women at any stage.',
    contraindications: 'Severe prior allergic reaction (anaphylaxis) to any component of influenza vaccine. Defer if acute moderate-to-severe illness with fever.',
    evaluate: (profile) => {
      if (!profile || typeof profile.age !== 'number' || profile.age < 18) {
        return {
          status: EVAL_STATUS.INSUFFICIENT_INFO,
          reason: 'Valid adult age (18+) is required to evaluate NAIS criteria.'
        };
      }

      const hasChronicCondition = Boolean(
        profile.hasDiabetes ||
        profile.hasChronicLung ||
        profile.hasChronicHeart ||
        profile.hasChronicKidneyLiver ||
        profile.isImmunocompromised
      );
      const isPregnant = Boolean(profile.isPregnant);
      const isAge65Plus = profile.age >= 65;

      if (isAge65Plus || hasChronicCondition || isPregnant) {
        return {
          status: EVAL_STATUS.MATCHES,
          qualifyingFactors: [
            isAge65Plus ? 'Age 65 years or older' : null,
            hasChronicCondition ? 'Documented chronic medical condition' : null,
            isPregnant ? 'Pregnancy' : null
          ].filter(Boolean),
          scheduleNote: '1 dose annually during seasonal protection window.',
          patientNotice: 'May meet published criteria; confirm with your clinic.'
        };
      }

      return {
        status: EVAL_STATUS.DOES_NOT_MATCH,
        reason: 'Currently under age 65 without documented qualifying chronic conditions or pregnancy in NAIS high-risk list.',
        patientNotice: 'Does not match national priority criteria for routine subsidies. May still be taken for personal protection upon GP advice.'
      };
    }
  },

  // 2. PNEUMOCOCCAL CONJUGATE (PCV13 / PCV20)
  {
    ruleId: 'RULE-NAIS-2025-PCV-01',
    vaccineName: 'Pneumococcal Conjugate (PCV13 or PCV20)',
    valency: 'PCV13 (Prevenar 13) or PCV20 (Prevenar 20)',
    evidenceLocator: 'NAIS_Sept 2025.pdf, Table 1 & Footnote 4, p. 2-3',
    subsidyLocator: 'MOH Healthier SG & CHAS Schedule',
    effectiveDate: 'September 2025',
    schedule: '1 dose (initial step in sequential regimen, or single PCV20 dose)',
    clinicalIndication: 'Persons aged 65 years and older; persons aged 18-64 with chronic illness or immunocompromising conditions.',
    contraindications: 'Severe hypersensitivity to any component or diphtheria toxoid-containing vaccine.',
    evaluate: (profile) => {
      if (!profile || typeof profile.age !== 'number') {
        return { status: EVAL_STATUS.INSUFFICIENT_INFO, reason: 'Age is required.' };
      }

      const isAge65Plus = profile.age >= 65;
      const hasCondition = Boolean(
        profile.hasDiabetes ||
        profile.hasChronicLung ||
        profile.hasChronicHeart ||
        profile.hasChronicKidneyLiver ||
        profile.isImmunocompromised
      );

      if (profile.priorPcvReceived) {
        return {
          status: EVAL_STATUS.DOES_NOT_MATCH,
          reason: 'Documented prior PCV dose. Sequential PPSV23 step or interval evaluation required.',
          patientNotice: 'Already received PCV. Review timing for sequential PPSV23 dose with your clinician.'
        };
      }

      if (isAge65Plus || hasCondition) {
        return {
          status: EVAL_STATUS.MATCHES,
          qualifyingFactors: [
            isAge65Plus ? 'Age >=65 years' : null,
            hasCondition ? 'Documented chronic medical condition' : null
          ].filter(Boolean),
          scheduleNote: '1 dose of PCV13 followed by PPSV23 at >=1 year (or single PCV20 alone depending on clinic stock and clinical protocol).',
          patientNotice: 'May meet published criteria; confirm with your clinic.'
        };
      }

      return {
        status: EVAL_STATUS.DOES_NOT_MATCH,
        reason: 'Age is under 65 without qualifying chronic conditions.',
        patientNotice: 'Does not match routine NAIS criteria.'
      };
    }
  },

  // 3. PNEUMOCOCCAL POLYSACCHARIDE (PPSV23)
  {
    ruleId: 'RULE-NAIS-2025-PPSV23-01',
    vaccineName: 'Pneumococcal Polysaccharide (PPSV23)',
    valency: 'PPSV23 (Pneumovax 23)',
    evidenceLocator: 'NAIS_Sept 2025.pdf, Table 1 & Footnote 4, p. 2-3',
    subsidyLocator: 'MOH Healthier SG & CHAS Schedule',
    effectiveDate: 'September 2025',
    schedule: '1 dose at least 1 year after PCV13 for general >=65; or at least 8 weeks after PCV13 for high-risk immunocompromised.',
    clinicalIndication: 'Adults aged >=65 or adults with specified chronic conditions following prior PCV13 receipt.',
    contraindications: 'Severe prior allergic reaction to PPSV23.',
    evaluate: (profile) => {
      if (!profile || typeof profile.age !== 'number') {
        return { status: EVAL_STATUS.INSUFFICIENT_INFO, reason: 'Age is required.' };
      }

      const isAge65Plus = profile.age >= 65;
      const hasCondition = Boolean(
        profile.hasDiabetes ||
        profile.hasChronicLung ||
        profile.hasChronicHeart ||
        profile.hasChronicKidneyLiver ||
        profile.isImmunocompromised
      );

      if (!isAge65Plus && !hasCondition) {
        return {
          status: EVAL_STATUS.DOES_NOT_MATCH,
          reason: 'Age under 65 and no chronic conditions.',
          patientNotice: 'Does not match NAIS indication.'
        };
      }

      if (profile.priorPpsv23Received) {
        return {
          status: EVAL_STATUS.DOES_NOT_MATCH,
          reason: 'PPSV23 already recorded. Repeat dosing is restricted to high-risk individuals after >=5 years.',
          patientNotice: 'Check with your clinician if a booster is indicated.'
        };
      }

      if (profile.priorPcvReceived === undefined) {
        return {
          status: EVAL_STATUS.INSUFFICIENT_INFO,
          reason: 'Prior PCV vaccination status is unknown. NAIS specifies sequential administration.',
          patientNotice: 'Verify whether PCV was administered before scheduling PPSV23.'
        };
      }

      return {
        status: EVAL_STATUS.MATCHES,
        qualifyingFactors: ['Sequential regimen following PCV'],
        scheduleNote: profile.isImmunocompromised 
          ? 'Administer >=8 weeks after PCV13; repeat 2nd dose >=5 years later.' 
          : 'Administer >=1 year after PCV13.',
        patientNotice: 'May meet published criteria; confirm with your clinic.'
      };
    }
  },

  // 4. HUMAN PAPILLOMAVIRUS (HPV)
  {
    ruleId: 'RULE-NAIS-2025-HPV-01',
    vaccineName: 'Human Papillomavirus (HPV)',
    valency: 'Bivalent (HPV2), Quadrivalent (HPV4), or 9-Valent (HPV9)',
    evidenceLocator: 'NAIS_Sept 2025.pdf, Table 1 & Footnote 5, p. 3',
    subsidyLocator: 'MOH CHAS / Healthier SG Subsidy Schedule',
    effectiveDate: 'September 2025',
    schedule: '3 doses (at months 0, 1-2, 6)',
    clinicalIndication: 'Recommended for females aged 18 to 26 years. (May be given to women up to 45 years following individual clinical assessment).',
    contraindications: 'Severe allergy to yeast or vaccine components; contraindicated during pregnancy (defer until completion).',
    evaluate: (profile) => {
      if (!profile || typeof profile.age !== 'number') {
        return { status: EVAL_STATUS.INSUFFICIENT_INFO, reason: 'Age is required.' };
      }

      if (profile.gender === 'male' || profile.gender === 'males') {
        return {
          status: EVAL_STATUS.DOES_NOT_MATCH,
          reason: 'Routine NAIS schedule currently lists HPV recommendation for females aged 18-26. Males may receive HPV vaccination privately upon GP consultation.',
          patientNotice: 'Not included in national female schedule subsidies; discuss with clinic.'
        };
      }

      if (profile.isPregnant) {
        return {
          status: EVAL_STATUS.DOES_NOT_MATCH,
          reason: 'HPV vaccination is not recommended during pregnancy.',
          patientNotice: 'Defer HPV vaccination until after pregnancy.'
        };
      }

      if (profile.age >= 18 && profile.age <= 26) {
        return {
          status: EVAL_STATUS.MATCHES,
          qualifyingFactors: ['Female resident aged 18-26 years'],
          scheduleNote: '3 doses at months 0, 1-2, 6.',
          patientNotice: 'May meet published criteria; confirm with your clinic.'
        };
      }

      return {
        status: EVAL_STATUS.DOES_NOT_MATCH,
        reason: 'Outside primary NAIS target age band (18-26 years).',
        patientNotice: 'May be administered off-schedule up to age 45 upon clinician discussion.'
      };
    }
  },

  // 5. TDAP (Tetanus, Diphtheria, Pertussis)
  {
    ruleId: 'RULE-NAIS-2025-TDAP-01',
    vaccineName: 'Tdap (Tetanus, Reduced Diphtheria, Acellular Pertussis)',
    valency: 'Combined Tdap toxoid formulation',
    evidenceLocator: 'NAIS_Sept 2025.pdf, Table 1, p. 4',
    subsidyLocator: 'MOH Healthier SG / Polyclinic Schedule',
    effectiveDate: 'September 2025',
    schedule: '1 dose in each pregnancy (preferably 16-32 weeks); booster every 10 years or post-wound management.',
    clinicalIndication: 'Pregnant women; adults requiring routine or wound booster; healthcare workers caring for infants.',
    contraindications: 'Severe encephalopathy within 7 days of previous pertussis-containing vaccine.',
    evaluate: (profile) => {
      if (profile?.isPregnant) {
        return {
          status: EVAL_STATUS.MATCHES,
          qualifyingFactors: ['Pregnancy (optimal protection window 16-32 weeks)'],
          scheduleNote: '1 dose during each pregnancy to confer maternal-neonatal immunity.',
          patientNotice: 'May meet published criteria; confirm with your clinic.'
        };
      }

      if (profile?.woundManagement || profile?.infantContact) {
        return {
          status: EVAL_STATUS.MATCHES,
          qualifyingFactors: ['Clinical wound management or direct infant contact'],
          scheduleNote: 'Booster dose every 10 years or acute post-exposure.',
          patientNotice: 'May meet published criteria; confirm with your clinic.'
        };
      }

      return {
        status: EVAL_STATUS.DOES_NOT_MATCH,
        reason: 'No documented pregnancy or special indication.',
        patientNotice: 'Standard 10-year booster may be reviewed with GP.'
      };
    }
  },

  // 6. HERPES ZOSTER (Shingles)
  {
    ruleId: 'RULE-NAIS-2025-ZOSTER-01',
    vaccineName: 'Herpes Zoster (Shingles)',
    valency: 'Recombinant Zoster Vaccine (RZV / Shingrix)',
    evidenceLocator: 'NAIS_Sept 2025.pdf, Table 1, p. 4',
    subsidyLocator: 'MediSave 500/700 use guidelines; CHAS subsidy varies',
    effectiveDate: 'September 2025',
    schedule: '2 doses (administered 2 to 6 months apart)',
    clinicalIndication: 'Clinically recommended for adults aged 50 years and older; and immunocompromised adults aged 19 years and older.',
    contraindications: 'Severe allergy to any component; defer during acute herpes zoster infection.',
    evaluate: (profile) => {
      if (!profile || typeof profile.age !== 'number') {
        return { status: EVAL_STATUS.INSUFFICIENT_INFO, reason: 'Age is required.' };
      }

      const isAge50Plus = profile.age >= 50;
      const isImmunocompromised = Boolean(profile.isImmunocompromised && profile.age >= 19);

      if (isAge50Plus || isImmunocompromised) {
        return {
          status: EVAL_STATUS.MATCHES,
          qualifyingFactors: [
            isAge50Plus ? 'Age >=50 years' : null,
            isImmunocompromised ? 'Immunocompromised adult >=19 years' : null
          ].filter(Boolean),
          scheduleNote: '2 doses at interval of 2 to 6 months.',
          subsidyNotice: 'Note: Clinical recommendation in NAIS is distinct from CHAS subsidy. RZV can be claimed under MediSave 500/700 up to prevailing annual limits. Confirm current clinic subsidy status.',
          patientNotice: 'May meet published criteria; confirm with your clinic.'
        };
      }

      return {
        status: EVAL_STATUS.DOES_NOT_MATCH,
        reason: 'Age is under 50 and not immunocompromised.',
        patientNotice: 'Does not match NAIS criteria for shingles vaccination.'
      };
    }
  }
];

/**
 * Deterministically evaluate subsidy and co-payment guidelines.
 * Keeps clinical recommendation strictly separated from subsidy policy!
 */
export function evaluateSubsidyCoverage(profile) {
  if (!profile || !profile.citizenship) {
    return {
      status: EVAL_STATUS.INSUFFICIENT_INFO,
      reason: 'Citizenship status (Singapore Citizen, PR, or Foreign Resident) is required to evaluate subsidies.',
      category: null,
      coPaymentCap: 'Unknown',
      mediSaveUsable: false
    };
  }

  const isCitizen = profile.citizenship === 'citizen';
  const isPR = profile.citizenship === 'pr';
  const isHealthierSgEnrolled = Boolean(profile.healthierSgEnrolled);
  const enrolledAtCurrentClinic = Boolean(profile.atEnrolledClinic);

  if (!isCitizen && !isPR) {
    return {
      status: EVAL_STATUS.DOES_NOT_MATCH,
      category: 'Foreign Resident / Private Patient',
      reason: 'MOH Singapore adult vaccination subsidies (CHAS / Healthier SG) apply to Singapore Citizens and PRs.',
      healthierSgFree: false,
      coPaymentCap: 'Full private clinic rate applies',
      mediSaveUsable: false,
      disclaimer: 'Consult clinic for private pricing.'
    };
  }

  if (isCitizen && isHealthierSgEnrolled && enrolledAtCurrentClinic) {
    return {
      status: EVAL_STATUS.MATCHES,
      category: 'Healthier SG Enrolled Singapore Citizen',
      healthierSgFree: true,
      coPaymentCap: '$0 (Fully Subsidised at Enrolled Clinic for NAIS-recommended vaccines)',
      mediSaveUsable: false, // Not needed because 0 co-pay
      notice: 'Under Healthier SG, nationally recommended vaccinations matching your age and conditions are fully subsidised ($0 co-payment) at your designated clinic.',
      disclaimer: 'Applies to nationally recommended vaccines at your enrolled GP only. Consult your clinic to confirm eligibility.'
    };
  }

  // CHAS / Pioneer / Merdeka Tiers
  const cardTier = profile.subsidyCard || 'none';
  let coPaymentEstimate = 'Standard Subsidised Co-payment';
  let tierLabel = 'Singapore Citizen (Standard)';

  if (isCitizen) {
    switch (cardTier) {
      case 'pioneer':
        tierLabel = 'Pioneer Generation (PG)';
        coPaymentEstimate = 'Capped at approx. $9 to $16 per dose for approved NAIS vaccines';
        break;
      case 'merdeka':
        tierLabel = 'Merdeka Generation (MG)';
        coPaymentEstimate = 'Capped at approx. $18 to $31 per dose for approved NAIS vaccines';
        break;
      case 'chas_blue':
      case 'chas_orange':
        tierLabel = 'CHAS Blue / Orange';
        coPaymentEstimate = 'Capped at approx. $9 to $31 per dose depending on vaccine';
        break;
      case 'chas_green':
        tierLabel = 'CHAS Green';
        coPaymentEstimate = 'Standard CHAS subsidy with clinic co-payment';
        break;
      default:
        tierLabel = 'Singapore Citizen (No CHAS card)';
        coPaymentEstimate = 'Subsidised rate at Polyclinics; private GP fees apply unless under Healthier SG';
    }

    return {
      status: EVAL_STATUS.MATCHES,
      category: tierLabel,
      healthierSgFree: false,
      coPaymentCap: coPaymentEstimate,
      mediSaveUsable: true,
      mediSaveNote: 'Up to $500 per year (or $700 under MediSave700) can be used from MediSave for approved NAIS vaccines.',
      disclaimer: 'Actual payable fee depends on vaccine valency, clinic registration fees, and doctor consultation.'
    };
  }

  if (isPR) {
    return {
      status: EVAL_STATUS.MATCHES,
      category: 'Permanent Resident (PR)',
      healthierSgFree: false,
      coPaymentCap: 'Subsidies available at Polyclinics (government clinics). CHAS GP subsidies do not apply.',
      mediSaveUsable: true,
      mediSaveNote: 'MediSave500/700 is usable at approved institutions for NAIS vaccinations.',
      disclaimer: 'Confirm specific rates with Polyclinic.'
    };
  }

  return {
    status: EVAL_STATUS.INSUFFICIENT_INFO,
    reason: 'Insufficient subsidy details provided.'
  };
}

/**
 * Full deterministic evaluation of patient profile against all NAIS adult vaccines.
 */
export function evaluatePatientSchedule(profile) {
  const vaccineResults = VACCINE_RULES.map(rule => {
    const outcome = rule.evaluate(profile);
    return {
      ruleId: rule.ruleId,
      vaccineName: rule.vaccineName,
      valency: rule.valency,
      schedule: rule.schedule,
      clinicalIndication: rule.clinicalIndication,
      contraindications: rule.contraindications,
      evidenceLocator: rule.evidenceLocator,
      subsidyLocator: rule.subsidyLocator,
      effectiveDate: rule.effectiveDate,
      ...outcome
    };
  });

  const subsidyResult = evaluateSubsidyCoverage(profile);

  return {
    evaluatedAt: new Date().toISOString(),
    sourceDocument: 'NAIS_Sept 2025.pdf',
    rulesVersion: 'NAIS-Sept-2025-v1',
    patientProfileSummary: {
      age: profile?.age ?? null,
      citizenship: profile?.citizenship ?? null,
      subsidyCard: profile?.subsidyCard ?? null,
      healthierSgEnrolled: Boolean(profile?.healthierSgEnrolled)
    },
    vaccines: vaccineResults,
    subsidy: subsidyResult,
    importantClinicalDisclaimer: 'This tool provides educational awareness based on published Singapore Ministry of Health criteria (NAIS Sept 2025). It does not diagnose, prescribe, or certify official eligibility. Final vaccination decisions, product selection, and co-payment amounts must be determined by a qualified doctor.'
  };
}
