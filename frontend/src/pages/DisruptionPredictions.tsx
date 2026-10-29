import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DisruptionPrediction, RoadSegment } from '../types';
import { BrainCircuit, Play, CheckCircle2, AlertTriangle, ShieldCheck, Activity, BarChart2 } from 'lucide-react';
import { RiskMeter } from '../components/AccessibilityBadge';

interface Props {
  selectedState: string;
}

export const DisruptionPredictions: React.FC<Props> = ({ selectedState }) => {
  const [predictions, setPredictions] = useState<DisruptionPrediction[]>([]);
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [modelHealth, setModelHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Scenario Simulator Form
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [forecastHorizon, setForecastHorizon] = useState<number>(24);
  const [simRainfall, setSimRainfall] = useState<number>(85.0);
  const [simSaturation, setSimSaturation] = useState<number>(75.0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<DisruptionPrediction | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [predsRes, segsRes, healthRes] = await Promise.all([
          api.get('/predictions/disruptions'),
          api.get(`/geo/road-segments?state=${selectedState}`),
          api.get('/predictions/model-health')
        ]);
        setPredictions(predsRes.data);
        setSegments(segsRes.data);
        setModelHealth(healthRes.data);
        if (segsRes.data.length > 0) {
          setSelectedSegmentId(segsRes.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load predictions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedState]);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSegmentId) return;
    setIsSimulating(true);

    try {
      const res = await api.post('/predictions/predict', {
        road_segment_id: selectedSegmentId,
        forecast_horizon_hours: forecastHorizon,
        rainfall_current_mm: simRainfall,
        soil_saturation_pct: simSaturation
      });
      setSimulationResult(res.data);
      // Refresh prediction list
      const predsRes = await api.get('/predictions/disruptions');
      setPredictions(predsRes.data);
    } catch (err) {
      alert("Simulation inference failed.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-md">
            MODULE C: AI / ML DISRUPTION INTELLIGENCE
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Predictive Road Accessibility & Landslide Risk Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            XGBoost model with SHAP (SHapley Additive exPlanations) calibrated for North Eastern mountain hydrology
          </p>
        </div>

        {modelHealth && (
          <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
            <Activity className="w-5 h-5 text-purple-600" />
            <div className="text-xs">
              <div className="font-bold text-purple-900">Model: {modelHealth.model_name} (v{modelHealth.version})</div>
              <div className="text-purple-700 text-[11px]">
                Status: <span className="font-semibold">{modelHealth.status}</span> • Test Recall: {(modelHealth.test_recall_24h * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Scenario Simulator Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center mb-3">
          <BrainCircuit className="w-4 h-4 mr-2 text-purple-600" />
          Interactive Environmental Scenario Simulator
        </h3>
        
        <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Road Segment</label>
            <select
              value={selectedSegmentId}
              onChange={(e) => setSelectedSegmentId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-slate-50"
            >
              {segments.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.highway_number}: {seg.name} ({seg.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Forecast Horizon: <span className="text-blue-600 font-bold">{forecastHorizon} Hours</span>
            </label>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-slate-50"
            >
              <option value={6}>6 Hours (Immediate Flash Flood)</option>
              <option value={12}>12 Hours (Next Shift Traffic)</option>
              <option value={24}>24 Hours (Next Day Delivery Window)</option>
              <option value={48}>48 Hours (Medium Term Inundation)</option>
              <option value={72}>72 Hours (Long Range Storm Advisory)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Simulated Rainfall (24h): <span className="text-blue-600 font-bold">{simRainfall} mm</span>
            </label>
            <input
              type="range"
              min={0}
              max={250}
              value={simRainfall}
              onChange={(e) => setSimRainfall(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              {isSimulating ? 'Computing Inference...' : 'Run AI Prediction'}
            </button>
          </div>
        </form>

        {/* Real-time simulation output result card with SHAP */}
        {simulationResult && (
          <div className="mt-4 p-4 rounded-lg bg-purple-50 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900">SIMULATION INFERENCE RESULT</span>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  Segment: {simulationResult.road_segment_id} ({simulationResult.forecast_horizon_hours}h Forecast)
                </div>
              </div>
              <div className="text-right">
                <RiskMeter score={simulationResult.risk_probability} level={simulationResult.risk_level} />
              </div>
            </div>

            {/* SHAP Feature Contribution Waterfall */}
            <div>
              <div className="text-xs font-semibold text-purple-950 mb-1.5 flex items-center">
                <BarChart2 className="w-3.5 h-3.5 mr-1" />
                SHAP Quantitative Contributing Factors (Explainable AI):
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(simulationResult.contributing_factors).map(([factor, impact]) => (
                  <div key={factor} className="bg-white p-2 rounded border border-purple-100 text-xs">
                    <div className="text-[10px] text-slate-500 font-mono truncate">{factor}</div>
                    <div className={`font-bold ${impact >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {impact >= 0 ? `+${impact}` : impact} impact
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monitored Road Disruption Predictions Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Road Segment Disruption Inferences</h3>
            <p className="text-xs text-slate-500">Predicted failure probability over target forecast horizon</p>
          </div>
          <span className="text-xs text-slate-500">{predictions.length} Monitored Segments Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Road Segment ID</th>
                <th className="py-2.5 px-3">Horizon</th>
                <th className="py-2.5 px-3">Risk Probability</th>
                <th className="py-2.5 px-3">Top SHAP Drivers</th>
                <th className="py-2.5 px-3">Rainfall</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {predictions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                    {p.road_segment_id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">
                    {p.forecast_horizon_hours}h
                  </td>
                  <td className="py-2.5 px-3">
                    <RiskMeter score={p.risk_probability} level={p.risk_level} />
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(p.contributing_factors).slice(0, 2).map(([k, v]) => (
                        <span key={k} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                          {k}: {v > 0 ? `+${v}` : v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {p.rainfall_current_mm} mm
                  </td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                    {(p.prediction_confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

