import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AirQuality from './pages/AirQuality';
import Cities from './pages/Cities';
import Stations from './pages/Stations';
import HistoricalData from './pages/HistoricalData';
import Forecasts from './pages/Forecasts';
import Weather from './pages/Weather';
import MonitoringOverview from './pages/MonitoringOverview';
import DataQuality from './pages/DataQuality';
import ModelPerformance from './pages/ModelPerformance';
import DriftDetection from './pages/DriftDetection';
import Incidents from './pages/Incidents';
import './index.css';

// Temporary placeholders for pages
const Placeholder = ({ title }) => (
  <div>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/air-quality" element={<AirQuality />} />
          <Route path="/air-quality/cities" element={<Cities />} />
          <Route path="/air-quality/stations" element={<Stations />} />
          <Route path="/air-quality/historical" element={<HistoricalData />} />
          <Route path="/forecasts" element={<Forecasts />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/monitoring" element={<MonitoringOverview />} />
          <Route path="/monitoring/data-quality" element={<DataQuality />} />
          <Route path="/monitoring/model-performance" element={<ModelPerformance />} />
          <Route path="/monitoring/drift" element={<DriftDetection />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/models/versions" element={<Placeholder title="Model Versions" />} />
          <Route path="/models/experiments" element={<Placeholder title="Experiments" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
