/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isUrlApproved } from './sources.js';

// In-memory bounded cache
const liveCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute default app cache

/**
 * Fetch and validate approved upstream data.gov.sg API.
 */
async function fetchApprovedEndpoint(endpointUrl, timeoutMs = 5000) {
  if (!isUrlApproved(endpointUrl)) {
    throw new Error(`Endpoint URL "${endpointUrl}" is not on the approved sources registry.`);
  }

  const cached = liveCache.get(endpointUrl);
  if (cached && (Date.now() - cached.fetchedAtTime < CACHE_TTL_MS)) {
    return {
      ...cached.data,
      isCached: true,
      retrievedAt: cached.retrievedAt
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MyVaccineGuideSG/1.0 (Realtime Environment Integration)'
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Upstream returned HTTP ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const retrievedAt = new Date().toISOString();

    const result = {
      endpointUrl,
      status: 'ready',
      retrievedAt,
      rawData: json,
      isCached: false
    };

    liveCache.set(endpointUrl, {
      data: result,
      retrievedAt,
      fetchedAtTime: Date.now()
    });

    return result;
  } catch (err) {
    clearTimeout(timer);
    // If cached version exists, return it with stale flag
    if (cached) {
      return {
        ...cached.data,
        status: 'stale',
        isCached: true,
        staleReason: err.message,
        retrievedAt: cached.retrievedAt
      };
    }

    return {
      endpointUrl,
      status: 'error',
      retrievedAt: new Date().toISOString(),
      error: err.name === 'AbortError' ? `Request timed out after ${timeoutMs}ms` : err.message,
      rawData: null
    };
  }
}

/**
 * Get comprehensive environmental snapshot (Weather, PM2.5, PSI, Temperature).
 */
export async function getEnvironmentSnapshot() {
  const [twoHrRes, tempRes, psiRes, pm25Res, rainRes] = await Promise.all([
    fetchApprovedEndpoint('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast'),
    fetchApprovedEndpoint('https://api-open.data.gov.sg/v2/real-time/api/air-temperature'),
    fetchApprovedEndpoint('https://api-open.data.gov.sg/v2/real-time/api/psi'),
    fetchApprovedEndpoint('https://api-open.data.gov.sg/v2/real-time/api/pm25'),
    fetchApprovedEndpoint('https://api-open.data.gov.sg/v2/real-time/api/rainfall')
  ]);

  // Extract readings safely without hallucinating schemas
  let twoHrForecastText = 'Unavailable';
  let forecastValidity = null;
  let generalSummary = null;

  if (twoHrRes.rawData?.data?.items?.[0]) {
    const item = twoHrRes.rawData.data.items[0];
    forecastValidity = item.valid_period || item.update_timestamp || null;
    if (item.forecasts && item.forecasts.length > 0) {
      const central = item.forecasts.find(f => f.area?.toLowerCase().includes('central') || f.area?.toLowerCase().includes('tanglin') || f.area?.toLowerCase().includes('novena')) || item.forecasts[0];
      twoHrForecastText = central.forecast || 'Variable';
      generalSummary = `${item.forecasts.length} area forecasts reported`;
    }
  }

  // Parse temperature
  let averageTemp = null;
  let tempTimestamp = null;
  if (tempRes.rawData?.data?.readings?.[0]?.data) {
    const readings = tempRes.rawData.data.readings[0].data;
    const values = readings.map(r => r.value).filter(v => typeof v === 'number');
    if (values.length > 0) {
      averageTemp = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    }
    tempTimestamp = tempRes.rawData.data.readings[0].timestamp || null;
  }

  // Parse PSI
  let nationalPsi24Hr = null;
  let psiTimestamp = null;
  if (psiRes.rawData?.data?.items?.[0]?.readings?.psi_twenty_four_hourly) {
    const psiObj = psiRes.rawData.data.items[0].readings.psi_twenty_four_hourly;
    nationalPsi24Hr = psiObj.national ?? psiObj.central ?? null;
    psiTimestamp = psiRes.rawData.data.items[0].timestamp || null;
  }

  // Parse PM2.5
  let pm25OneHourly = null;
  let pm25Timestamp = null;
  if (pm25Res.rawData?.data?.items?.[0]?.readings?.pm25_one_hourly) {
    const pmObj = pm25Res.rawData.data.items[0].readings.pm25_one_hourly;
    pm25OneHourly = pmObj.central ?? pmObj.national ?? Object.values(pmObj)[0] ?? null;
    pm25Timestamp = pm25Res.rawData.data.items[0].timestamp || null;
  }

  // Parse Rain
  let rainActive = false;
  if (rainRes.rawData?.data?.readings?.[0]?.data) {
    const rainReadings = rainRes.rawData.data.readings[0].data;
    rainActive = rainReadings.some(r => r.value > 0);
  }

  return {
    timezone: 'Asia/Singapore',
    retrievedAt: new Date().toISOString(),
    forecast: {
      twoHourSummary: twoHrForecastText,
      validityPeriod: forecastValidity,
      generalSummary,
      status: twoHrRes.status
    },
    airTemperature: {
      islandwideAverageCelsius: averageTemp,
      unit: '°C',
      observationTimestamp: tempTimestamp,
      status: tempRes.status
    },
    airQuality: {
      psi24Hourly: nationalPsi24Hr,
      psiObservationTimestamp: psiTimestamp,
      pm25OneHourlyMicrogramM3: pm25OneHourly,
      pm25ObservationTimestamp: pm25Timestamp,
      note: 'PSI and PM2.5 are separate environmental metrics with distinct thresholds. Environmental readings do not affect personal vaccine eligibility or clinical indications.'
    },
    precipitation: {
      rainfallDetected: rainActive,
      status: rainRes.status
    },
    disclaimer: 'Weather and pollutant conditions provide travel context for planning clinic visits. They do NOT infer infectious disease risk, vaccination urgency, or personal risk scores.'
  };
}

/**
 * Get transport availability snapshot (Carpark and Taxi).
 */
export async function getTransportSnapshot() {
  const [carparkRes, taxiRes] = await Promise.all([
    fetchApprovedEndpoint('https://api.data.gov.sg/v1/transport/carpark-availability'),
    fetchApprovedEndpoint('https://api.data.gov.sg/v1/transport/taxi-availability')
  ]);

  let totalCarparksReported = 0;
  let carparkTimestamp = null;
  let sampleCarparks = [];

  if (carparkRes.rawData?.items?.[0]?.carpark_data) {
    const list = carparkRes.rawData.items[0].carpark_data;
    totalCarparksReported = list.length;
    carparkTimestamp = carparkRes.rawData.items[0].timestamp;
    // Take 5 sample carparks with exact IDs and lots
    sampleCarparks = list.slice(0, 5).map(cp => ({
      carparkNumber: cp.carpark_number,
      updateDatetime: cp.update_datetime,
      lotTypes: cp.carpark_info?.map(info => ({
        type: info.lot_type,
        totalLots: info.total_lots,
        availableLots: info.lots_available
      })) || []
    }));
  }

  let totalTaxisAvailable = 0;
  let taxiTimestamp = null;
  if (taxiRes.rawData?.features?.[0]?.geometry?.coordinates) {
    totalTaxisAvailable = taxiRes.rawData.features[0].geometry.coordinates.length;
    taxiTimestamp = taxiRes.rawData.features[0].properties?.timestamp || null;
  }

  return {
    timezone: 'Asia/Singapore',
    retrievedAt: new Date().toISOString(),
    carpark: {
      status: carparkRes.status,
      totalCarparksReported,
      observationTimestamp: carparkTimestamp,
      sampleFeed: sampleCarparks,
      notice: 'Carpark lot availability does not establish clinic proximity, parking charges, or vaccine appointment availability.'
    },
    taxi: {
      status: taxiRes.status,
      totalTaxisAvailableOnRoad: totalTaxisAvailable,
      observationTimestamp: taxiTimestamp,
      notice: 'Taxi count reflects islandwide LTA real-time GPS locations and is not a ride booking service or waiting time guarantee.'
    },
    disclaimer: 'Transport data is purely contextual. It does not indicate clinic opening hours, doctor availability, or vaccine stock.'
  };
}
