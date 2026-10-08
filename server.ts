/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Handlers
import healthHandler from './api/health.js';
import mcpHandler from './api/mcp.js';
import { APPROVED_SOURCES_REGISTRY, testSourceConnectivity, getProvenanceExport } from './api/sources.js';
import { getLoadedDataset, replaceDatasetAtomically } from './api/csvParser.js';
import { evaluatePatientSchedule, VACCINE_RULES } from './api/rules.js';
import { getEnvironmentSnapshot, getTransportSnapshot } from './api/live.js';
import { askGroundedAssistant } from './api/assistant.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with size boundaries
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 1. /api/health
app.get('/api/health', (req, res) => {
  return healthHandler(req, res);
});

// 2. /api/mcp
app.all('/api/mcp', (req, res) => {
  return mcpHandler(req, res);
});

// 3. /api/sources
app.get('/api/sources', (req, res) => {
  try {
    const provenance = getProvenanceExport();
    return res.status(200).json(provenance);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/sources/test', async (req, res) => {
  try {
    const { sourceId } = req.body;
    if (!sourceId) {
      return res.status(400).json({ error: 'sourceId is required' });
    }
    const result = await testSourceConnectivity(sourceId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. /api/dataset
app.get('/api/dataset', (req, res) => {
  try {
    const dataset = getLoadedDataset();
    return res.status(200).json(dataset);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/dataset/upload', (req, res) => {
  try {
    const { csvContent, filename } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'Valid csvContent string is required.' });
    }

    const updated = replaceDatasetAtomically(csvContent, filename || 'Uploaded_Replacement.csv');
    return res.status(200).json({
      success: true,
      message: 'Dataset validated and updated atomically.',
      dataset: updated
    });
  } catch (err: any) {
    return res.status(422).json({
      success: false,
      error: `CSV validation failed: ${err.message}`,
      retainedPreviousVersion: true
    });
  }
});

// 5. /api/rules
app.get('/api/rules', (req, res) => {
  return res.status(200).json({
    effectiveDate: 'September 2025',
    source: 'NAIS_Sept 2025.pdf',
    rulesCount: VACCINE_RULES.length,
    rules: VACCINE_RULES.map(r => ({
      ruleId: r.ruleId,
      vaccineName: r.vaccineName,
      valency: r.valency,
      schedule: r.schedule,
      clinicalIndication: r.clinicalIndication,
      contraindications: r.contraindications,
      evidenceLocator: r.evidenceLocator,
      subsidyLocator: r.subsidyLocator
    }))
  });
});

app.post('/api/rules/evaluate', (req, res) => {
  try {
    const profile = req.body?.profile || req.body || {};
    const evaluation = evaluatePatientSchedule(profile);
    return res.status(200).json(evaluation);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. /api/live/weather & /api/live/transport
app.get('/api/live/weather', async (req, res) => {
  try {
    const weather = await getEnvironmentSnapshot();
    return res.status(200).json(weather);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/live/transport', async (req, res) => {
  try {
    const transport = await getTransportSnapshot();
    return res.status(200).json(transport);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. /api/assistant
app.post('/api/assistant', async (req, res) => {
  try {
    const { query, profile } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query parameter is required' });
    }

    const response = await askGroundedAssistant(query, profile);
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Start Vite in middleware mode during development, or serve dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[My Vaccine Guide SG] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
