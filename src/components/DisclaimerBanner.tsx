/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-sky-50 border-b border-sky-200 text-sky-950 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-700 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="font-semibold text-sky-900">Patient Education & Awareness:</strong>{' '}
            Supports discussion with your GP. Not a medical diagnosis, prescription, or official government entitlement certificate.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sky-700 hover:text-sky-900 underline font-medium text-xs flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            {expanded ? 'Hide Scope' : 'Source Scope & Clinical Note'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-sky-200 text-xs text-sky-900 leading-relaxed max-w-7xl mx-auto space-y-1">
          <p>
            • <strong>Source Authority:</strong> National Adult Immunisation Schedule (NAIS, updated September 2025), MOH Healthier SG and CHAS subsidy schedules.
          </p>
          <p>
            • <strong>Clinical Responsibility:</strong> Suitability, prior contraindications, brand valencies, and final co-payments are determined by the treating clinician.
          </p>
          <p>
            • <strong>Medical Emergencies:</strong> For acute distress, severe allergic reactions, or respiratory emergency, seek immediate emergency medical care (dial 995 in Singapore).
          </p>
        </div>
      )}
    </div>
  );
};
