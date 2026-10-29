import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  BrainCircuit, 
  Navigation, 
  Truck, 
  Package, 
  Camera, 
  CheckSquare, 
  AlertTriangle, 
  BarChart3, 
  Activity, 
  Users, 
  FileText, 
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { hasRole } = useAuth();

  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/map', label: 'GIS Accessibility Map', icon: Map },
    { to: '/predictions', label: 'AI Disruption Risk', icon: BrainCircuit },
    { to: '/routes', label: 'Risk-Aware Routing', icon: Navigation },
    { to: '/vehicles', label: 'Fleet & Telemetry', icon: Truck },
    { to: '/consignments', label: 'Consignment Logistics', icon: Package },
    { to: '/reporting', label: 'Field Incident Entry', icon: Camera },
    { 
      to: '/verification', 
      label: 'Incident Verification', 
      icon: CheckSquare, 
      requireRoles: ['DISTRICT_OFFICER', 'GOVT_ADMIN', 'SUPER_ADMIN'] as const 
    },
    { to: '/alerts', label: 'Alerts & Warnings', icon: AlertTriangle },
    { to: '/analytics', label: 'Analytics & Planning', icon: BarChart3 },
    { to: '/integrations', label: 'Data Source Health', icon: Activity },
    { 
      to: '/users', 
      label: 'User Management', 
      icon: Users, 
      requireRoles: ['SUPER_ADMIN', 'GOVT_ADMIN'] as const 
    },
    { 
      to: '/audit-logs', 
      label: 'Audit & Security Logs', 
      icon: FileText, 
      requireRoles: ['SUPER_ADMIN', 'GOVT_ADMIN'] as const 
    },
    { to: '/settings', label: 'Model & System Info', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col justify-between py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Operations & GIS Modules
          </div>

          {navItems.map((item) => {
            if (item.requireRoles && !hasRole(item.requireRoles as any)) {
              return null;
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 mx-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <div className="text-[11px] font-bold text-slate-700">MDoNER • SIH 2026</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Problem Statement SIH26002</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
            Operational v1.0.0
          </div>
        </div>

      </div>
    </aside>
  );
};

