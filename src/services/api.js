/**
 * AirSense AI – API Service
 *
 * All real backend endpoints are served by the FastAPI backend at
 * VITE_API_BASE_URL (default: http://localhost:8000).
 *
 * Set VITE_USE_MOCK_DATA=false in .env to use the real backend.
 * Set VITE_USE_MOCK_DATA=true  to fall back to local mock data.
 *
 * Station IDs in the real dataset use the form DEMO_PUN_01, DEMO_MUM_02, etc.
 * City IDs returned by /api/v1/cities use city.name.toLowerCase().replace(' ','_')
 * e.g. "pune" / "mumbai" / "delhi".
 */

import axios from 'axios';
import {
  citiesData,
  stationsData,
  airQualityData,
  forecastData,
  weatherData,
  historicalData,
  monitoringOverviewData,
  dataQualityData,
  modelPerformanceData,
  driftData,
  incidentsData,
} from '../data/mockData';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wraps every API call with consistent error handling.
 * In mock mode, returns mock data with a simulated delay.
 */
const handleRequest = async (mockFn, apiFn) => {
  if (useMockData) {
    await delay(500);
    return mockFn();
  }
  try {
    const res = await apiFn();
    return res.data;
  } catch (err) {
    console.error('API Error:', err);
    const detail = err.response?.data?.detail;
    const message =
      typeof detail === 'string'
        ? detail
        : detail
        ? JSON.stringify(detail)
        : err.message || 'Request failed';
    throw new Error(message);
  }
};

// ---------------------------------------------------------------------------
// Cities   →  GET /api/v1/cities
// ---------------------------------------------------------------------------

export const getCities = () =>
  handleRequest(
    () => citiesData,
    () => apiClient.get('/api/v1/cities'),
  );

// ---------------------------------------------------------------------------
// Stations  →  GET /api/v1/stations?city=<cityName>
//
// The backend filters by city *name* (e.g. "Pune"), not by the frontend's
// legacy city_01 IDs. The cities returned by getCities() include a `name`
// field that is used as the query parameter here.
// ---------------------------------------------------------------------------

export const getStations = (cityNameOrId) =>
  handleRequest(
    () =>
      cityNameOrId
        ? stationsData.filter((s) => s.cityId === cityNameOrId)
        : stationsData,
    () =>
      apiClient.get('/api/v1/stations', {
        params: cityNameOrId ? { city: cityNameOrId } : undefined,
      }),
  );

// ---------------------------------------------------------------------------
// Air Quality  →  GET /api/v1/air-quality/{station_id}
// ---------------------------------------------------------------------------

export const getAirQuality = (stationId) =>
  handleRequest(
    () => airQualityData,
    () => apiClient.get(`/api/v1/air-quality/${encodeURIComponent(stationId)}`),
  );

// ---------------------------------------------------------------------------
// Historical Data  →  GET /api/v1/historical
// ---------------------------------------------------------------------------

export const getHistoricalData = (stationId, pollutant = 'PM2.5', timeRange = '24h') =>
  handleRequest(
    () => historicalData,
    () =>
      apiClient.get('/api/v1/historical', {
        params: { station_id: stationId, pollutant, time_range: timeRange },
      }),
  );

// ---------------------------------------------------------------------------
// Forecasts  →  GET /api/v1/forecasts/{station_id}
// ---------------------------------------------------------------------------

/** Returns forecast data for a single station from the ML models. */
export const getModelForecasts = async (stationId) => {
  if (useMockData) {
    await delay(500);
    return forecastData;
  }
  try {
    const endpoint = stationId
      ? `/api/v1/forecasts/${encodeURIComponent(stationId)}`
      : '/api/v1/forecasts';
    const res = await apiClient.get(endpoint);
    return res.data;
  } catch (err) {
    console.error('Forecast API error:', err);
    const detail = err.response?.data?.detail;
    throw new Error(
      typeof detail === 'string'
        ? detail
        : detail
        ? JSON.stringify(detail)
        : err.message || 'Unable to fetch forecasts',
    );
  }
};

/** Legacy alias used by useForecast hook */
export const getForecast = (stationId) => getModelForecasts(stationId);

// ---------------------------------------------------------------------------
// Weather  →  GET /api/v1/weather/{station_id}
// ---------------------------------------------------------------------------

export const getWeather = (stationId) =>
  handleRequest(
    () => weatherData,
    () => apiClient.get(`/api/v1/weather/${encodeURIComponent(stationId)}`),
  );

// ---------------------------------------------------------------------------
// Monitoring Overview  →  GET /api/v1/monitoring
// ---------------------------------------------------------------------------

export const getMonitoringMetrics = () =>
  handleRequest(
    () => monitoringOverviewData,
    () => apiClient.get('/api/v1/monitoring'),
  );

// ---------------------------------------------------------------------------
// Data Quality  →  GET /api/v1/monitoring/data-quality
// ---------------------------------------------------------------------------

export const getDataQuality = () =>
  handleRequest(
    () => dataQualityData,
    () => apiClient.get('/api/v1/monitoring/data-quality'),
  );

// ---------------------------------------------------------------------------
// Model Performance  →  GET /api/v1/monitoring/model-performance
// ---------------------------------------------------------------------------

export const getModelPerformance = () =>
  handleRequest(
    () => modelPerformanceData,
    () => apiClient.get('/api/v1/monitoring/model-performance'),
  );

// ---------------------------------------------------------------------------
// Drift Detection  →  GET /api/v1/monitoring/drift
// ---------------------------------------------------------------------------

export const getDriftData = () =>
  handleRequest(
    () => driftData,
    () => apiClient.get('/api/v1/monitoring/drift'),
  );

// ---------------------------------------------------------------------------
// Incidents  →  GET /api/v1/incidents
// ---------------------------------------------------------------------------

export const getIncidents = () =>
  handleRequest(
    () => incidentsData,
    () => apiClient.get('/api/v1/incidents'),
  );

export const getIncidentById = (id) =>
  handleRequest(
    () => incidentsData.find((i) => i.id === id),
    () => apiClient.get(`/api/v1/incidents/${id}`),
  );

export const createIncident = (data) =>
  handleRequest(
    async () => { await delay(300); return { success: true, data }; },
    () => apiClient.post('/api/v1/incidents', data),
  );

export const updateIncident = (id, data) =>
  handleRequest(
    async () => { await delay(300); return { success: true, id, data }; },
    () => apiClient.put(`/api/v1/incidents/${id}`, data),
  );

// ---------------------------------------------------------------------------
// Retraining  (UI only – no automated retraining on the backend)
// ---------------------------------------------------------------------------

export const startRetraining = () =>
  handleRequest(
    async () => { await delay(1500); return { success: true }; },
    () => apiClient.post('/api/v1/models/retrain'),
  );

export const getRetrainingStatus = () =>
  handleRequest(
    () => ({ status: 'Not Required' }),
    () => apiClient.get('/api/v1/models/retrain/status'),
  );

export const getModels = () =>
  handleRequest(
    () => [],
    () => apiClient.get('/api/v1/models'),
  );
