import React from 'react';
import { Settings as SettingsIcon, BrainCircuit, Shield, Database, Cloud, Info } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-800 rounded-md">
          SYSTEM CONFIGURATION & CAPSTONE SPECIFICATIONS
        </span>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          NER SmartLogistics AI — System Architecture & Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Smart India Hackathon 2026 • Problem Statement SIH26002 • Ministry of Development of North Eastern Region (MDoNER)
        </p>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        
        {/* ML Configuration Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <BrainCircuit className="w-4 h-4 mr-2 text-purple-600" />
            AI Disruption Model Configuration
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Primary Tabular Classifier:</span>
              <strong className="text-slate-900">XGBoost (xgb-v1.0.0-ner)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Baseline Comparison:</span>
              <strong className="text-slate-900">Random Forest Classifier</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Explainability Framework:</span>
              <strong className="text-slate-900">SHAP (TreeExplainer)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Target Forecast Horizon:</span>
              <strong className="text-slate-900">6 to 72 Hours</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Measured Disruption Recall (24h):</span>
              <strong className="text-emerald-600 font-bold">49.6% (74.3% at calibrated thresh)</strong>
            </div>
          </div>
        </div>

        {/* Routing Engine Parameters Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-blue-600" />
            Risk-Aware Routing Graph Configuration
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Graph Engine:</span>
              <strong className="text-slate-900">NetworkX Directed Graph</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Multi-Objective Cost Formula:</span>
              <strong className="text-slate-900 font-mono text-[11px]">α·Time + β·Risk + γ·Distance</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Safety Constraint:</span>
              <strong className="text-rose-600 font-semibold">Strict Pruning on Closed Roads</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Cargo Priority Adaptation:</span>
              <strong className="text-slate-900">Medicine, Food, Agri, Construction</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>ETA Deviation Detector:</span>
              <strong className="text-slate-900">Gradient Boosted Regressor Baseline</strong>
            </div>
          </div>
        </div>

        {/* Database & Cloud Deployment Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Database className="w-4 h-4 mr-2 text-emerald-600" />
            Data Persistence & GIS Infrastructure
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Primary Geospatial Database:</span>
              <strong className="text-slate-900">PostgreSQL 15 + PostGIS</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Zero-Dependency Fallback:</span>
              <strong className="text-slate-900">SQLite Local Self-Contained Engine</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Client-Side PWA Storage:</span>
              <strong className="text-slate-900">IndexedDB (idb v8) Offline Sync</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Target Cloud Hosting:</span>
              <strong className="text-slate-900">MeghRaj GI Cloud Ready (Dockerized)</strong>
            </div>
          </div>
        </div>

        {/* Security & Cryptography Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Cloud className="w-4 h-4 mr-2 text-indigo-600" />
            Security & Authentication Standards
          </h3>
          <div className="space-y-1.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Token Architecture:</span>
              <strong className="text-slate-900">OAuth2 JWT (HS256)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Password Encryption:</span>
              <strong className="text-slate-900">PBKDF2-HMAC-SHA256 (100k rounds)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>RBAC Enforcement:</span>
              <strong className="text-slate-900">Backend Dependency Inversion</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Audit Logging:</span>
              <strong className="text-slate-900">Immutable Relational Audit Trail</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

