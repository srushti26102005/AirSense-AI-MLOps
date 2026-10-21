// ─── Cities ────────────────────────────────────────────────────────────────
// Fields match the backend response shape so mock ↔ real backend are
// drop-in replacements: id, name, state, station_count, current_pm25, status
export const citiesData = [
  { id: 'city_01', name: 'Pune',       state: 'Maharashtra',   station_count: 5,  current_pm25: 72,  status: 'Monitoring' },
  { id: 'city_02', name: 'Mumbai',     state: 'Maharashtra',   station_count: 12, current_pm25: 58,  status: 'Normal' },
  { id: 'city_03', name: 'Delhi',      state: 'Delhi',         station_count: 15, current_pm25: 112, status: 'Attention' },
  { id: 'city_04', name: 'Hyderabad',  state: 'Telangana',     station_count: 8,  current_pm25: 46,  status: 'Normal' },
  { id: 'city_05', name: 'Chennai',    state: 'Tamil Nadu',    station_count: 7,  current_pm25: 39,  status: 'Normal' },
  { id: 'city_06', name: 'Bengaluru',  state: 'Karnataka',     station_count: 9,  current_pm25: 45,  status: 'Normal' },
  { id: 'city_07', name: 'Kolkata',    state: 'West Bengal',   station_count: 6,  current_pm25: 67,  status: 'Monitoring' },
  { id: 'city_08', name: 'Jaipur',     state: 'Rajasthan',     station_count: 4,  current_pm25: 82,  status: 'Monitoring' },
  { id: 'city_09', name: 'Lucknow',    state: 'Uttar Pradesh', station_count: 5,  current_pm25: 91,  status: 'Attention' },
];

// ─── Stations ───────────────────────────────────────────────────────────────
// Fields: id, cityId (legacy filter), city, state, name, current_pm25,
//         status, parameters (array), active_status
export const stationsData = [
  { id: 'site_5409', cityId: 'city_01', city: 'Pune',   state: 'Maharashtra', name: 'Revenue Colony-Shivajinagar', current_pm25: 68, status: 'Satisfactory', active_status: 'Active', parameters: ['PM2.5','PM10','NO2','SO2','CO','O3','NH3'] },
  { id: 'site_5766', cityId: 'city_01', city: 'Pune',   state: 'Maharashtra', name: 'Katraj Dairy',                current_pm25: 72, status: 'Moderate',     active_status: 'Active', parameters: ['PM2.5','PM10','NO2','SO2','CO','O3','NH3'] },
  { id: 'site_3211', cityId: 'city_02', city: 'Mumbai', state: 'Maharashtra', name: 'Bandra',                     current_pm25: 58, status: 'Satisfactory', active_status: 'Active', parameters: ['PM2.5','PM10','NO2','SO2','CO','O3','NH3'] },
  { id: 'site_3212', cityId: 'city_02', city: 'Mumbai', state: 'Maharashtra', name: 'Colaba',                     current_pm25: 45, status: 'Good',         active_status: 'Inactive', parameters: ['PM2.5','PM10','NO2','SO2','CO','O3'] },
  { id: 'site_1101', cityId: 'city_03', city: 'Delhi',  state: 'Delhi',       name: 'Anand Vihar',                current_pm25: 112, status: 'Poor',        active_status: 'Active', parameters: ['PM2.5','PM10','NO2','SO2','CO','O3','NH3'] },
];

// ─── Air Quality ────────────────────────────────────────────────────────────
// Keys match the backend response: "PM2.5", "PM10", etc. (not "PM25")
export const airQualityData = {
  current: {
    'PM2.5': { value: 72,  unit: 'µg/m³', status: 'Moderate', change: '↑ 8%' },
    'PM10':  { value: 108, unit: 'µg/m³', status: 'Moderate', change: '↑ 4%' },
    'NO2':   { value: 31,  unit: 'µg/m³', status: 'Good',     change: '↓ 3%' },
    'SO2':   { value: 9,   unit: 'µg/m³', status: 'Good',     change: '↓ 5%' },
    'CO':    { value: 0.7, unit: 'mg/m³', status: 'Good',     change: 'Stable' },
    'O3':    { value: 42,  unit: 'µg/m³', status: 'Good',     change: '↓ 2%' },
    'NH3':   { value: 14,  unit: 'µg/m³', status: 'Good',     change: 'Stable' },
  },
};

// ─── Forecast ───────────────────────────────────────────────────────────────
export const forecastData = {
  summary: {
    current: 72,
    h1:  75,
    h6:  81,
    h24: 68,
  },
  model: {
    name: 'RandomForestRegressor',
    horizons: ['1h', '6h', '24h'],
    lastTrained: '2026-09-18T00:00:00Z',
    forecastGenerated: '2026-09-25T15:00:00Z',
  },
  chart: [
    { time: '10:00', actual: 65,   forecast: null, lower: null, upper: null },
    { time: '11:00', actual: 68,   forecast: null, lower: null, upper: null },
    { time: '12:00', actual: 72,   forecast: 72,   lower: 70,   upper: 74   },
    { time: '13:00', actual: null, forecast: 75,   lower: 72,   upper: 78   },
    { time: '16:00', actual: null, forecast: 79,   lower: 74,   upper: 84   },
    { time: '18:00', actual: null, forecast: 81,   lower: 76,   upper: 86   },
  ],
  data_source: 'synthetic_demo',
};

// ─── Weather ────────────────────────────────────────────────────────────────
export const weatherData = {
  current: {
    temperature:   28,
    humidity:      64,
    windSpeed:     3.4,
    windDirection: 'SW',
    pressure:      1008,
    precipitation: 0.0,
    cloudCover:    42,
    windGust:      5.1,
  },
  chart: [
    { time: '00:00', temperature: 24, humidity: 75, windSpeed: 2.1 },
    { time: '04:00', temperature: 23, humidity: 78, windSpeed: 1.8 },
    { time: '08:00', temperature: 26, humidity: 70, windSpeed: 2.5 },
    { time: '12:00', temperature: 31, humidity: 55, windSpeed: 4.2 },
    { time: '16:00', temperature: 30, humidity: 58, windSpeed: 3.8 },
    { time: '20:00', temperature: 27, humidity: 65, windSpeed: 2.9 },
  ],
};

// ─── Historical Data ─────────────────────────────────────────────────────────
// Chart keys match pollutant names exactly: "PM2.5" not "PM25"
// Backend also echoes back the pollutant name in { pollutant: "PM2.5" }
export const historicalData = {
  pollutant: 'PM2.5',
  summary: { average: 68.5, min: 42.1, max: 112.4, observations: 24 },
  chart: [
    { time: '00:00', 'PM2.5': 65,  'PM10': 95,  'NO2': 22, 'SO2': 8,  'CO': 0.5, 'O3': 35 },
    { time: '04:00', 'PM2.5': 58,  'PM10': 88,  'NO2': 18, 'SO2': 7,  'CO': 0.4, 'O3': 30 },
    { time: '08:00', 'PM2.5': 85,  'PM10': 120, 'NO2': 45, 'SO2': 12, 'CO': 1.1, 'O3': 25 },
    { time: '12:00', 'PM2.5': 72,  'PM10': 105, 'NO2': 38, 'SO2': 10, 'CO': 0.8, 'O3': 55 },
    { time: '16:00', 'PM2.5': 68,  'PM10': 98,  'NO2': 32, 'SO2': 9,  'CO': 0.7, 'O3': 65 },
    { time: '20:00', 'PM2.5': 75,  'PM10': 110, 'NO2': 42, 'SO2': 11, 'CO': 0.9, 'O3': 45 },
  ],
};

// ─── Monitoring Overview ────────────────────────────────────────────────────
export const monitoringOverviewData = {
  dataQuality:      { status: 'Healthy', explanation: '98% data completeness across all parameters',          timestamp: new Date().toISOString() },
  modelPerformance: { status: 'Healthy', explanation: 'RMSE within acceptable limits for all horizons',       timestamp: new Date().toISOString() },
  dataDrift:        { status: 'Warning', explanation: 'Mild drift detected in humidity feature (PSI=0.35)',    timestamp: new Date().toISOString() },
  predictionDrift:  { status: 'Healthy', explanation: 'Predictions align with historical baseline',           timestamp: new Date().toISOString() },
  pipelineStatus:   { status: 'Healthy', explanation: 'All pipeline jobs running successfully',               timestamp: new Date().toISOString() },
  lastAnalysis:     { status: 'Healthy', explanation: 'Drift analysis completed successfully 5 minutes ago',  timestamp: new Date().toISOString() },
};

// ─── Data Quality ────────────────────────────────────────────────────────────
// Backend shape: { total_records, table: [{parameter, issue_count, status}] }
export const dataQualityData = {
  total_records: 7168,
  table: [
    { parameter: 'PM2.5 — missing values',   issue_count: 51,  status: 'PASS' },
    { parameter: 'PM10 — missing values',    issue_count: 123, status: 'PASS' },
    { parameter: 'NO2 — missing values',     issue_count: 553, status: 'WARNING' },
    { parameter: 'SO2 — missing values',     issue_count: 113, status: 'PASS' },
    { parameter: 'CO — missing values',      issue_count: 1280,status: 'WARNING' },
    { parameter: 'O3 — missing values',      issue_count: 236, status: 'PASS' },
    { parameter: 'Temperature — missing',    issue_count: 10,  status: 'PASS' },
    { parameter: 'Humidity — missing',       issue_count: 12,  status: 'PASS' },
    { parameter: 'Wind Speed — missing',     issue_count: 8,   status: 'PASS' },
    { parameter: 'Duplicate rows',           issue_count: 0,   status: 'PASS' },
    { parameter: 'Out-of-range PM2.5',       issue_count: 12,  status: 'PASS' },
  ],
};

// ─── Model Performance ───────────────────────────────────────────────────────
export const modelPerformanceData = {
  model: 'RandomForestRegressor',
  metrics: {
    h1:  { mae: 4.2,  rmse: 6.5,  r2: 0.92 },
    h6:  { mae: 8.5,  rmse: 12.1, r2: 0.85 },
    h24: { mae: 15.3, rmse: 21.4, r2: 0.72 },
  },
  chart: [
    { horizon: '+1h',  mae: 4.2,  rmse: 6.5  },
    { horizon: '+6h',  mae: 8.5,  rmse: 12.1 },
    { horizon: '+24h', mae: 15.3, rmse: 21.4 },
  ],
};

// ─── Drift Data ──────────────────────────────────────────────────────────────
// Backend shape: { summary, table: [{feature, reference_rows, current_rows, psi, ks_pvalue, status}] }
export const driftData = {
  summary: {
    dataDriftStatus:      'Warning',
    predictionDriftStatus:'Healthy',
    affectedFeatures:     1,
    lastChecked:          new Date().toISOString(),
  },
  table: [
    { feature: 'PM2.5',       reference_rows: 5000, current_rows: 2168, psi: 0.05, ks_pvalue: 0.23, status: 'No Drift' },
    { feature: 'PM10',        reference_rows: 5000, current_rows: 2168, psi: 0.08, ks_pvalue: 0.18, status: 'No Drift' },
    { feature: 'NO2',         reference_rows: 5000, current_rows: 2168, psi: 0.12, ks_pvalue: 0.09, status: 'Moderate' },
    { feature: 'Temperature', reference_rows: 5000, current_rows: 2168, psi: 0.15, ks_pvalue: 0.07, status: 'Moderate' },
    { feature: 'Humidity',    reference_rows: 5000, current_rows: 2168, psi: 0.35, ks_pvalue: 0.01, status: 'Drift Detected' },
    { feature: 'Wind Speed',  reference_rows: 5000, current_rows: 2168, psi: 0.22, ks_pvalue: 0.06, status: 'Moderate' },
    { feature: 'Pressure',    reference_rows: 5000, current_rows: 2168, psi: 0.04, ks_pvalue: 0.45, status: 'No Drift' },
  ],
};

// ─── Incidents ───────────────────────────────────────────────────────────────
export const incidentsData = [
  {
    id: 'INC-001', type: 'Data Drift',       severity: 'Warning',  source: 'Drift Detection',
    status: 'Investigating', created: new Date(Date.now() - 86400000).toISOString(),
    lastUpdated: new Date(Date.now() - 3600000).toISOString(), assignedTo: 'MLOps Team',
    description: 'Humidity feature distribution has drifted significantly from the training baseline.',
    feature: 'Humidity', score: '0.35', threshold: '0.30',
    action: 'Investigate sensor calibration or trigger retraining.',
  },
  {
    id: 'INC-002', type: 'Model Performance', severity: 'Critical', source: 'Model Monitoring',
    status: 'Open', created: new Date(Date.now() - 172800000).toISOString(),
    lastUpdated: new Date(Date.now() - 86400000).toISOString(), assignedTo: 'Data Science Team',
    description: 'RMSE for +24h horizon has exceeded acceptable thresholds for 3 consecutive days.',
    feature: '+24h Horizon', score: '21.4 RMSE', threshold: '20.0 RMSE',
    action: 'Evaluate recent drift and trigger model retraining with recent data.',
  },
  {
    id: 'INC-003', type: 'Data Quality',      severity: 'Warning',  source: 'Data Pipeline',
    status: 'Resolved', created: new Date(Date.now() - 432000000).toISOString(),
    lastUpdated: new Date(Date.now() - 259200000).toISOString(), assignedTo: 'Data Engineering',
    description: 'Elevated missing values detected in CO parameter stream.',
    feature: 'CO', score: '12.5% Missing', threshold: '5.0% Missing',
    action: 'Data pipeline patched. Missing values imputed via historical moving average.',
  },
];
