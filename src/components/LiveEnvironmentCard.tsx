/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, Car, Compass, RefreshCw, AlertCircle } from 'lucide-react';
import { EnvironmentSnapshot, TransportSnapshot } from '../types';

export const LiveEnvironmentCard: React.FC = () => {
  const [weather, setWeather] = useState<EnvironmentSnapshot | null>(null);
  const [transport, setTransport] = useState<TransportSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchLiveFeeds = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, tRes] = await Promise.all([
        fetch('/api/live/weather'),
        fetch('/api/live/transport')
      ]);

      if (wRes.ok) {
        const wJson = await wRes.json();
        setWeather(wJson);
      }
      if (tRes.ok) {
        const tJson = await tRes.json();
        setTransport(tJson);
      }
      setLastUpdated(new Date().toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' }));
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve live environmental feeds.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFeeds();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-base">Travel & Environment Context</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              Data.gov.sg Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Contextual conditions to assist planning your visit to a clinic
          </p>
        </div>

        <button
          onClick={fetchLiveFeeds}
          disabled={loading}
          title="Refresh approved feeds"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Environmental Readings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Weather Forecast */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>2-Hr Forecast</span>
          </div>
          <div className="text-sm font-semibold text-slate-800 capitalize">
            {weather?.forecast?.twoHourSummary || 'Loading...'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {weather?.precipitation?.rainfallDetected ? 'Rain detected' : 'No rain recorded'}
          </div>
        </div>

        {/* Air Temperature */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>Air Temp</span>
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {weather?.airTemperature?.islandwideAverageCelsius
              ? `${weather.airTemperature.islandwideAverageCelsius}°C`
              : 'Reading...'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Islandwide station avg
          </div>
        </div>

        {/* Pollutants: PSI & PM2.5 */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>Air Quality</span>
          </div>
          <div className="text-xs font-semibold text-slate-800 space-y-0.5">
            <div>PSI (24h): <span className="font-bold text-slate-900">{weather?.airQuality?.psi24Hourly ?? '—'}</span></div>
            <div>PM2.5: <span className="font-bold text-slate-900">{weather?.airQuality?.pm25OneHourlyMicrogramM3 ?? '—'} µg/m³</span></div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            NEA monitoring
          </div>
        </div>

        {/* Transport Context */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Car className="w-3.5 h-3.5 text-indigo-500" />
            <span>Transport Feed</span>
          </div>
          <div className="text-xs font-semibold text-slate-800 space-y-0.5">
            <div>Taxis on road: <span className="font-bold">{transport?.taxi?.totalTaxisAvailableOnRoad ?? '—'}</span></div>
            <div>Carparks: <span className="font-bold">{transport?.carpark?.totalCarparksReported ?? '—'} active</span></div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            LTA / HDB real-time
          </div>
        </div>
      </div>

      {/* Honest Boundary & Disclaimer */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p>
          <strong className="text-slate-700">Honest Boundary:</strong> Environmental metrics and transport feeds do{' '}
          <em>not</em> alter vaccine medical eligibility, infection probability, or clinic appointments.
        </p>
        {lastUpdated && (
          <span className="text-slate-500 text-[10px] shrink-0">
            Retrieved: {lastUpdated} SGT
          </span>
        )}
      </div>
    </div>
  );
};
