import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, MailIcon } from './common/Icon';
import type { Notification, Employee } from '../types';

interface NotificationsProps {
  notifications?: Notification[];
  onMarkRead?: (id: number) => void;
  onMarkAllRead?: () => void;
  currentUser: Employee;
}

/**
 * Notifications page component.
 * Displays a list of all notifications for the user.
 */
export const Notifications: React.FC<NotificationsProps> = ({ notifications = [], onMarkRead, onMarkAllRead, currentUser }) => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global');

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const getNotificationStyles = (type: Notification['type']): { icon: React.ReactNode; color: string } => {
    switch (type) {
      case 'alert':
        return { icon: <AlertTriangleIcon className="w-6 h-6" />, color: 'border-red-500 text-red-500' };
      case 'success':
        return { icon: <CheckCircleIcon className="w-6 h-6" />, color: 'border-green-500 text-green-500' };
      case 'info':
        return { icon: <InfoIcon className="w-6 h-6" />, color: 'border-blue-500 text-blue-500' };
      default:
        return { icon: <InfoIcon className="w-6 h-6" />, color: 'border-gray-500 text-gray-500' };
    }
  };

  const handleToggleRead = (id: number) => {
    if (onMarkRead) {
      onMarkRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const filteredNotifications = localNotifications.filter(n => {
    const readMatch = filter === 'unread' ? !n.read : true;
    const tabMatch = activeTab === 'global' ? !n.userId : n.userId === currentUser.id;
    return readMatch && tabMatch;
  });

  return (
    <div className="p-8">
      <Card>
        <div className="flex border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'global' ? 'border-brand-gold text-brand-dark dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-brand-gold text-brand-dark dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Pessoais
          </button>
        </div>
        <div className="p-4 border-b flex justify-between items-center dark:border-gray-700">
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-brand-gold text-brand-dark' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Todas</button>
            <button onClick={() => setFilter('unread')} className={`px-3 py-1 rounded-md text-sm font-medium ${filter === 'unread' ? 'bg-brand-gold text-brand-dark' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>Não Lidas</button>
          </div>
          <button onClick={handleMarkAllAsRead} className="text-sm text-brand-gold hover:underline">Marcar todas como lidas</button>
        </div>
        <div className="space-y-4 p-4">
          {filteredNotifications.map((notification) => {
            const { icon, color } = getNotificationStyles(notification.type);
            return (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${color.split(' ')[0]} ${notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700 shadow-sm'
                  }`}
              >
                <div className={`${color.split(' ')[1]} pt-1`}>{icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-semibold ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-brand-dark dark:text-gray-100'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-brand-secondary dark:text-gray-300'}`}>
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0 ml-4">{new Date(notification.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleRead(notification.id)} title={notification.read ? 'Marcar como não lida' : 'Marcar como lida'}>
                    <div className={`w-3 h-3 rounded-full transition-colors ${notification.read ? 'bg-transparent border-2 border-gray-400' : 'bg-blue-500'}`}></div>
                  </button>
                </div>
              </div>
            );
          })}
          {filteredNotifications.length === 0 && <p className="text-center py-8 text-gray-500">Nenhuma notificação aqui.</p>}
        </div>
      </Card>
    </div>
  );
};