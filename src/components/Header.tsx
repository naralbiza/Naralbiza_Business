import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchIcon, ChevronDownIcon, BellIcon, PipelineIcon, ClientsIcon } from './common/Icon';
import { Page, Lead, Client, Employee } from '../types';

interface HeaderProps {
  currentUser: Employee;
  leads: Lead[];
  clients: Client[];
}

type SearchResult = (Lead & { type: 'lead' }) | (Client & { type: 'client' });

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/': return Page.Dashboard;
    case '/pipeline': return Page.Pipeline;
    case '/clients': return Page.Clients;
    case '/financial': return Page.Financial;
    case '/metrics': return Page.Métricas;
    case '/reports': return Page.Reports;
    case '/notifications': return Page.Notifications;
    case '/goals': return Page.Goals;
    case '/agenda': return Page.Agenda;
    case '/admin': return Page.Admin;
    case '/settings': return Page.Settings;
    default: return Page.Dashboard;
  }
};

export const Header: React.FC<HeaderProps> = ({ currentUser, leads, clients }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const activePage = getPageTitle(location.pathname);

  const searchResults: SearchResult[] = useMemo(() => {
    if (searchQuery.length < 2) return [];

    const lowercasedQuery = searchQuery.toLowerCase();

    const filteredLeads = leads.filter(
      lead =>
        lead.name.toLowerCase().includes(lowercasedQuery) ||
        lead.company.toLowerCase().includes(lowercasedQuery)
    ).map(lead => ({ ...lead, type: 'lead' as const }));

    const filteredClients = clients.filter(
      client =>
        client.name.toLowerCase().includes(lowercasedQuery) ||
        client.company.toLowerCase().includes(lowercasedQuery)
    ).map(client => ({ ...client, type: 'client' as const }));

    return [...filteredLeads, ...filteredClients].slice(0, 10);
  }, [searchQuery, leads, clients]);


  return (
    <header className="bg-white h-20 flex items-center justify-between px-8 border-b border-gray-200 z-10">
      <div>
        <h2 className="text-3xl font-bold text-brand-dark">{activePage}</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar leads, clientes..."
            className="w-full bg-brand-light border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setSearchQuery(''), 200)} // Clear on blur with a delay
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-20">
              <ul>
                {searchResults.map(result => (
                  <li key={`${result.type}-${result.id}`} className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {result.type === 'lead' ? <PipelineIcon className="w-5 h-5 text-brand-secondary" /> : <ClientsIcon className="w-5 h-5 text-brand-secondary" />}
                      <div>
                        <p className="font-semibold text-sm text-brand-dark">{result.name}</p>
                        <p className="text-xs text-gray-500">{result.company} - <span className="capitalize">{result.type === 'lead' ? 'Lead' : 'Cliente'}</span></p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-brand-dark">
            <BellIcon className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </button>
          <div className="flex items-center gap-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-brand-dark">{currentUser.name}</p>
              <p className="text-xs text-brand-secondary">{currentUser.position}</p>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
};