import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart3, Download, TrendingUp, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

interface Props {
  selectedState: string;
}

export const AnalyticsReports: React.FC<Props> = ({ selectedState }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/dashboard/summary?state=${selectedState}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedState]);

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "District,State,TotalSegments,OpenPercentage,HighRiskCount,ActiveIncidents,AccessibilityIndex\n";

    data.district_rankings.forEach((d: any) => {
      csvContent += `${d.district},${d.state},${d.total_segments},${d.open_pct},${d.high_risk_count},${d.active_incidents},${d.accessibility_index}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NER_Logistics_Accessibility_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Loading infrastructure planning reports...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-md">
            MODULE I: INFRASTRUCTURE & DISASTER PLANNING
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Regional Transport Accessibility Analytics & Hotspot Planning
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quarterly resilience indicators, bottleneck frequency, and essential supply chain delivery performance
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="mt-4 md:mt-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export Planning CSV Dataset
        </button>
      </div>

      {/* Grid of Key Analytical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Landslide Correlation</div>
          <div className="text-3xl font-black text-rose-600">0.84 r</div>
          <p className="text-xs text-slate-600">
            Strong statistical correlation between antecedent 7-day rainfall saturation and highway slope failure.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Monsoon Freight Delay</div>
          <div className="text-3xl font-black text-amber-600">+5.4 hrs</div>
          <p className="text-xs text-slate-600">
            Peak delays experienced across NH-10 (Sikkim) and NH-29 (Nagaland) during July-August heavy downpours.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bypass Alternative Efficiency</div>
          <div className="text-3xl font-black text-emerald-600">92.1%</div>
          <p className="text-xs text-slate-600">
            Successful delivery continuity achieved using multi-objective risk-time-distance routing bypasses.
          </p>
        </div>

      </div>

      {/* Seasonal Disruption Trends vs Rainfall */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Seasonal Disruption Patterns vs Average Monthly Precipitation
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Visualizing rainfall volume in millimeters against recorded landslide obstruction events
        </p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.disruption_trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="landslide_events" stroke="#EF4444" strokeWidth={2} name="Landslide Events" />
              <Line yAxisId="left" type="monotone" dataKey="flood_events" stroke="#3B82F6" strokeWidth={2} name="Flood Events" />
              <Line yAxisId="right" type="monotone" dataKey="avg_rainfall_mm" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Avg Rainfall (mm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Accessibility Full Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">District-Level Connectivity Matrix</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Monitored Roads</th>
                <th className="py-2.5 px-3">Open Ratio</th>
                <th className="py-2.5 px-3">Active Disruptions</th>
                <th className="py-2.5 px-3">High Risk Corridors</th>
                <th className="py-2.5 px-3">Resilience Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.district_rankings.map((d: any) => (
                <tr key={d.district} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{d.district}</td>
                  <td className="py-2.5 px-3 text-slate-600">{d.state}</td>
                  <td className="py-2.5 px-3">{d.total_segments}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{d.open_pct}%</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{d.active_incidents}</td>
                  <td className="py-2.5 px-3 text-amber-600 font-semibold">{d.high_risk_count}</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-black ${d.accessibility_index > 70 ? 'text-emerald-600' : d.accessibility_index > 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {d.accessibility_index}/100
                    </span>
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

