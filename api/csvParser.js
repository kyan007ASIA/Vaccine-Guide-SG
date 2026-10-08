/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const CSV_FILENAME = 'PrevalenceOfOverweightObesityDailySmokingHypertensionDiabetesMellitusHyperlipidaemiaSufficientTotalPhysicalActivityAndBingeDrinkingAmongResidentsAged1874Years(1).csv';
export const EXPECTED_COLUMNS = ['DataSeries', '2023', '2021', '2019', '2007', '2022', '2020', '2017', '2013', '2010'];
export const CHRONOLOGICAL_YEARS = [2007, 2010, 2013, 2017, 2019, 2020, 2021, 2022, 2023];

let currentDatasetState = null;

/**
 * Robust CSV parser that handles BOM, CRLF/LF, quotes, and commas.
 */
export function parseCsvRaw(csvText) {
  // Strip UTF-8 BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header and one data row.');
  }

  // Parse header
  const header = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length !== header.length) {
      throw new Error(`Row ${i + 1} column count (${values.length}) does not match header count (${header.length}).`);
    }
    const rowObj = {};
    header.forEach((col, idx) => {
      rowObj[col.trim()] = values[idx]?.trim() ?? '';
    });
    rows.push({
      inputRow: i + 1,
      rawValues: values,
      data: rowObj
    });
  }

  return { header, rows };
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Validate dataset against strict schema rules.
 */
export function validateAndNormalizeDataset(csvText, sourceFilename = CSV_FILENAME) {
  const { header, rows } = parseCsvRaw(csvText);

  // Validate exact headers in exact order
  if (header.length !== EXPECTED_COLUMNS.length) {
    throw new Error(`Header count mismatch: expected ${EXPECTED_COLUMNS.length}, got ${header.length}`);
  }
  for (let idx = 0; idx < EXPECTED_COLUMNS.length; idx++) {
    if (header[idx] !== EXPECTED_COLUMNS[idx]) {
      throw new Error(`Column ${idx + 1} mismatch: expected "${EXPECTED_COLUMNS[idx]}", got "${header[idx]}"`);
    }
  }

  if (rows.length !== 27) {
    throw new Error(`Expected exactly 27 data rows, but found ${rows.length} rows.`);
  }

  const hash = crypto.createHash('sha256').update(csvText).digest('hex');
  const normalizedSeries = [];

  rows.forEach((row, rowIndex) => {
    const seriesLabel = row.data['DataSeries'];
    if (!seriesLabel) {
      throw new Error(`Row ${rowIndex + 2} has empty DataSeries label.`);
    }

    const yearValues = {};
    let latestNonNullYear = null;
    let latestNonNullValue = null;
    let earliestNonNullYear = null;
    let earliestNonNullValue = null;

    // Process sorted years
    CHRONOLOGICAL_YEARS.forEach(year => {
      const yearStr = String(year);
      const rawCell = row.data[yearStr];
      let numVal = null;

      if (rawCell === undefined || rawCell === null || rawCell.toLowerCase() === 'na' || rawCell === '') {
        numVal = null;
      } else {
        const parsed = Number.parseFloat(rawCell);
        if (Number.isNaN(parsed)) {
          throw new Error(`Invalid numeric value "${rawCell}" for series "${seriesLabel}" in year ${year}`);
        }
        numVal = parsed;
      }

      yearValues[yearStr] = {
        year,
        value: numVal,
        rawText: rawCell ?? 'na',
        isNull: numVal === null
      };

      if (numVal !== null) {
        if (earliestNonNullYear === null) {
          earliestNonNullYear = year;
          earliestNonNullValue = numVal;
        }
        latestNonNullYear = year;
        latestNonNullValue = numVal;
      }
    });

    // Detect gender and indicator
    let gender = 'Total';
    if (seriesLabel.includes('Males') || seriesLabel.includes('Male')) {
      gender = 'Males';
    } else if (seriesLabel.includes('Females') || seriesLabel.includes('Female')) {
      gender = 'Females';
    }

    const indicator = seriesLabel.replace(/\s*-\s*(Total|Males|Females|Male|Female)\s*$/i, '').trim();

    normalizedSeries.push({
      inputRow: row.inputRow,
      dataSeries: seriesLabel,
      indicator,
      gender,
      years: yearValues,
      chronologicalValues: CHRONOLOGICAL_YEARS.map(y => ({
        year: y,
        value: yearValues[String(y)].value,
        rawText: yearValues[String(y)].rawText
      })),
      latestAvailable: {
        year: latestNonNullYear,
        value: latestNonNullValue
      },
      earliestAvailable: {
        year: earliestNonNullYear,
        value: earliestNonNullValue
      },
      // Note: Unknown units are not automatically percentages without confirmation.
      unitNotice: 'Values as published in Singapore National Population Health Survey tables for residents aged 18-74 years.',
      sourceFilename
    });
  });

  return {
    filename: sourceFilename,
    contentHash: hash,
    rowCount: normalizedSeries.length,
    columns: header,
    chronologicalYears: CHRONOLOGICAL_YEARS,
    series: normalizedSeries,
    loadedAt: new Date().toISOString(),
    valid: true
  };
}

/**
 * Get or load dataset from root CSV file.
 */
export function getLoadedDataset() {
  if (currentDatasetState) {
    return currentDatasetState;
  }

  const csvPath = path.resolve(process.cwd(), CSV_FILENAME);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  currentDatasetState = validateAndNormalizeDataset(content, CSV_FILENAME);
  return currentDatasetState;
}

/**
 * Replace dataset atomically after full validation.
 */
export function replaceDatasetAtomically(newCsvText, newFilename = CSV_FILENAME) {
  const validated = validateAndNormalizeDataset(newCsvText, newFilename);
  currentDatasetState = validated;
  return validated;
}
