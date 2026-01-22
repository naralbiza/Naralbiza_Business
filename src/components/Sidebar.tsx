import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Page, User } from '../types';
import {
  DashboardIcon, PipelineIcon, ClientsIcon, FinancialIcon, ReportsIcon,
  BellIcon, TargetIcon, CalendarIcon, AdminIcon, SettingsIcon,
  ProductionIcon, DAMIcon, InventoryIcon, HRIcon, MarketingIcon,
  QualityIcon, AfterSalesIcon, BIIcon, ProcessIcon, ChevronDownIcon,
  ChevronRightIcon
} from './common/Icon';

interface SidebarProps {
  notificationCount: number;
  currentUser: User;
}

interface NavItem {
  page: string;
  path: string;
  icon?: React.FC<{ className?: string }>;
  adminOnly?: boolean;
  module?: string;
  label?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'ESTRATÉGIA',
    items: [
      { page: Page.Dashboard, path: '/', icon: DashboardIcon, module: Page.Dashboard },
      { page: Page.BI, path: '/bi', icon: BIIcon, module: Page.BI },
      { page: Page.SOPs, path: '/sops', icon: ProcessIcon, module: Page.SOPs },
    ],
  },
  {
    title: 'CRM e Vendas',
    items: [
      { page: Page.CRM, path: '/crm', icon: PipelineIcon, module: Page.CRM, label: 'Pipeline' },
      { page: Page.Clients, path: '/clients', icon: ClientsIcon, module: Page.Clients },
      { page: Page.AfterSales, path: '/after-sales', icon: AfterSalesIcon, module: Page.AfterSales },
    ],
  },
  {
    title: 'OPERAÇÕES',
    items: [
      { page: Page.Production, path: '/production', icon: ProductionIcon, module: Page.Production },
      { page: Page.ProjectManagement, path: '/project-management', icon: TargetIcon, module: Page.ProjectManagement },
      { page: Page.DAM, path: '/dam', icon: DAMIcon, module: Page.DAM },
      { page: Page.Inventory, path: '/inventory', icon: InventoryIcon, module: Page.Inventory },
    ],
  },
  {
    title: 'BACKOFFICE',
    items: [
      { page: Page.Financial, path: '/financial', icon: FinancialIcon, module: Page.Financial },
      { page: Page.HR, path: '/hr', icon: HRIcon, module: Page.HR },
      { page: Page.Marketing, path: '/marketing', icon: MarketingIcon, module: Page.Marketing },
      { page: Page.Quality, path: '/quality', icon: QualityIcon, module: Page.Quality },
    ],
  },
  {
    title: 'DASHBOARDS ESPECÍFICOS',
    items: [
      { page: Page.DashboardPhoto, path: '/dashboard-photo', module: Page.DashboardPhoto },
      { page: Page.DashboardVideo, path: '/dashboard-video', module: Page.DashboardVideo },
      { page: Page.DashboardSocial, path: '/dashboard-social', module: Page.DashboardSocial },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      { page: Page.Agenda, path: '/agenda', icon: CalendarIcon, module: Page.Agenda },
      { page: Page.Notifications, path: '/notifications', icon: BellIcon, module: Page.Notifications },
      { page: Page.Settings, path: '/settings', icon: SettingsIcon, module: Page.Settings },
      { page: Page.Admin, path: '/admin', icon: AdminIcon, adminOnly: true, module: Page.Admin },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ notificationCount, currentUser }) => {
  const location = useLocation();
  const { signOut, hasPermission } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(navGroups.map(g => g.title));

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="w-72 bg-brand-dark text-white flex flex-col fixed h-full overflow-y-auto no-scrollbar border-r border-brand-gold/20">
      <div className="h-24 flex flex-col items-center justify-center border-b border-brand-gold/20 bg-brand-dark sticky top-0 z-10 p-4">
        <h1 className="text-2xl font-black tracking-widest text-white">NARALBIZA</h1>
        <p className="text-[10px] text-brand-gold font-bold tracking-[0.2em] uppercase mt-1">Business Management</p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-8">
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.title);

          // Filter items based on permissions and admin status
          const visibleItems = group.items.filter(item => {
            if (item.adminOnly && currentUser && currentUser.role !== 'Admin' && currentUser.role !== 'CEO / Direção') return false;
            if (item.module) return hasPermission(item.module, 'view');
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-2">
              <button
                onClick={() => toggleGroup(group.title)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-white/40 tracking-[0.15em] uppercase px-2 hover:text-brand-gold transition-colors"
              >
                <span>{group.title}</span>
                {isExpanded ? <ChevronDownIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
              </button>

              {isExpanded && (
                <ul className="space-y-1 mt-2">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                      <li key={item.page}>
                        <Link
                          to={item.path}
                          className={`group flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 ${isActive
                            ? 'bg-gold-metallic shadow-lg shadow-brand-gold/40 font-black scale-[1.02]'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          {Icon && (
                            <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-brand-dark' : 'text-gray-500 group-hover:text-brand-gold'
                              }`} />
                          )}
                          {!Icon && <div className="w-2 h-2 rounded-full bg-gray-600 mr-4 ml-1.5 group-hover:bg-brand-gold transition-colors" />}
                          <span className="text-sm truncate" translate="no">{item.label || item.page}</span>

                          {item.page === Page.Notifications && notificationCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shrink-0">
                              {notificationCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-brand-gold/20 bg-black">
        <div className="flex items-center mb-6 px-2">
          <img
            src={currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=B8860B&color=fff`}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full border-2 border-brand-gold/50 mr-3"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{currentUser?.name}</p>
            <p className="text-[10px] text-white/50 truncate uppercase tracking-wider">{currentUser?.role}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-sm font-bold border border-red-500/20"
        >
          <span>Sair do Sistema</span>
        </button>
        <p className="text-center text-[9px] text-white/40 mt-6 font-medium tracking-widest uppercase">&copy; 2025 NARALBIZA STUDIOS</p>
      </div>
    </aside>
  );
};