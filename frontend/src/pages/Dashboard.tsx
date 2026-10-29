import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  Truck, 
  Package, 
  TrendingUp, 
  MapPin, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AccessibilityBadge } from '../components/AccessibilityBadge';

interface DashboardProps {
  selectedState: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ selectedState }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/summary?state=${selectedState}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [selectedState]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Aggregating live NER accessibility and telemetry feeds...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Failed to load dashboard data.</div>;
  }

  const pieData = [
    { name: 'Open Segments', value: data.open_segments, color: '#10B981' },
    { name: 'Restricted (Caution)', value: data.restricted_segments, color: '#F59E0B' },
    { name: 'Closed (Blockage)', value: data.closed_segments, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Executive Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">
              COMMAND CENTER
            </span>
            <span className="text-xs text-slate-500">
              Region: <strong className="text-slate-800">{selectedState === 'ALL' ? 'All 8 North Eastern States' : selectedState}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            North Eastern Transport Accessibility & Logistics Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-source intelligence: IMD Weather, ISRO Bhuvan Terrain, and Ground Field Verification
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-4 text-right">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <div className="text-[11px] font-semibold text-blue-600">OVERALL ACCESSIBILITY INDEX</div>
            <div className="text-2xl font-black text-blue-900">{data.safe_accessibility_pct}%</div>
            <div className="text-[10px] text-blue-600">Monitored Roads Accessible</div>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Segments</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.total_monitored_segments}</div>
          <div className="text-[11px] text-slate-400 mt-1">Critical Transit Lifelines</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Open Roads</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{data.open_segments}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">Unimpeded Traffic</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Restricted</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{data.restricted_segments}</div>
          <div className="text-[11px] text-amber-700 mt-1">Single-lane / Slow</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Closed Roads</span>
            <Ban className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{data.closed_segments}</div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">Clearance in progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tracked Fleet</span>
            <Truck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{data.tracked_vehicles_count}</div>
          <div className="text-[11px] text-slate-400 mt-1">Live Telemetry Linked</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Consignments</span>
            <Package className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.active_consignments_count}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">
            {data.delayed_consignments_count} Delayed
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* District Accessibility Index Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">District-Level Accessibility Index</h3>
              <p className="text-xs text-slate-500">Calculated from road closures, active hazard incidents, and high-risk corridors</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded">Score / 100</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.district_rankings}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="accessibility_index" fill="#1E40AF" radius={[4, 4, 0, 0]} name="Accessibility Index" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Road Accessibility Breakdown Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Corridor Operational Status</h3>
            <p className="text-xs text-slate-500">Real-time status of monitored segments</p>
          </div>

          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></span>Open & Safe</span>
              <span className="font-bold text-slate-700">{data.open_segments} segments</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2"></span>Restricted Traffic</span>
              <span className="font-bold text-slate-700">{data.restricted_segments} segments</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2"></span>Closed by Landslide/Flood</span>
              <span className="font-bold text-slate-700">{data.closed_segments} segments</span>
            </div>
          </div>
        </div>

      </div>

      {/* Historical Disruption Trends & Recurring Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Historical Trends Area Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monsoonal Disruption Trend Patterns</h3>
              <p className="text-xs text-slate-500">Correlation of monthly rainfall with landslide incidents & transit delay hours</p>
            </div>
            <span className="text-xs font-semibold text-blue-700">NER Historical Baseline</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.disruption_trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="landslide_events" stackId="1" stroke="#EF4444" fill="#FCA5A5" name="Landslide Events" />
                <Area type="monotone" dataKey="flood_events" stackId="1" stroke="#3B82F6" fill="#93C5FD" name="Flood Inundations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recurring Bottleneck Corridors */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Critical Infrastructure Bottleneck Rankings</h3>
              <p className="text-xs text-slate-500">Corridors with highest cumulative disruption recurrence</p>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-semibold">Priority Focus</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Corridor / Highway</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Disruptions</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recurring_hotspots.map((h: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{h.corridor_name}</div>
                      <div className="text-[10px] text-blue-600 font-mono">{h.highway}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{h.state}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{h.historical_disruptions} incidents</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-rose-600">{(h.current_risk_score * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <AccessibilityBadge status={h.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Verified Real-time Emergency Alerts Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Verified Field & Meteorological Alerts</h3>
          </div>
          <span className="text-xs text-slate-500">Auto-dispatched via SEOC Protocol</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.recent_alerts.map((alert: any) => (
            <div key={alert.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-blue-300 transition">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {alert.category}
                </span>
                <span className="text-[10px] text-slate-500">{alert.state}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{alert.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{alert.message}</p>
              <div className="mt-2 text-[10px] text-blue-700 font-medium">
                Recommendation: {alert.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

