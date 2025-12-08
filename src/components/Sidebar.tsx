import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Page, Employee } from '../types';
import { DashboardIcon, PipelineIcon, ClientsIcon, FinancialIcon, ReportsIcon, BellIcon, TargetIcon, CalendarIcon, AdminIcon, SettingsIcon, ActivityIcon } from './common/Icon';

interface SidebarProps {
  notificationCount: number;
  currentUser: Employee;
}

const navItems = [
  { page: Page.Dashboard, path: '/', icon: DashboardIcon, adminOnly: false },
  { page: Page.Pipeline, path: '/pipeline', icon: PipelineIcon, adminOnly: false },
  { page: Page.Clients, path: '/clients', icon: ClientsIcon, adminOnly: false },
  { page: Page.Financial, path: '/financial', icon: FinancialIcon, adminOnly: false },
  { page: Page.Métricas, path: '/metrics', icon: ActivityIcon, adminOnly: false },
  { page: 'divider' as const, path: '', adminOnly: false },
  { page: Page.Agenda, path: '/agenda', icon: CalendarIcon, adminOnly: false },
  { page: Page.Goals, path: '/goals', icon: TargetIcon, adminOnly: false },
  { page: Page.Reports, path: '/reports', icon: ReportsIcon, adminOnly: false },
  { page: 'divider' as const, path: '', adminOnly: false },
  { page: Page.Notifications, path: '/notifications', icon: BellIcon, adminOnly: false },
  { page: Page.Settings, path: '/settings', icon: SettingsIcon, adminOnly: false },
  { page: Page.Admin, path: '/admin', icon: AdminIcon, adminOnly: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ notificationCount, currentUser }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-brand-dark text-white flex flex-col fixed h-full">
      <div className="h-20 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">NARALBIZA</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item, index) => {
            if (item.adminOnly && (!currentUser || !currentUser.isAdmin)) {
              return null;
            }
            if (item.page === 'divider') {
              return <li key={`divider-${index}`}><hr className="my-4 border-t border-gray-700" /></li>;
            }

            const Icon = item.icon!;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <li key={item.page}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-brand-gold text-brand-dark' : 'hover:bg-gray-700'
                    }`}
                >
                  <Icon className="w-6 h-6 mr-4" />
                  <span className="font-medium">{item.page}</span>
                  {item.page === Page.Notifications && notificationCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-4 py-6 border-t border-gray-700">
        <button
          onClick={signOut}
          className="w-full flex items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 text-red-400"
        >
          <span className="font-medium">Sair</span>
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">&copy; 2024 NARALBIZA Inc.</p>
      </div>
    </aside>
  );
};