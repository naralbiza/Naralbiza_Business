import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Pipeline } from './components/Pipeline';
import { Clients } from './components/Clients';
import { Financial } from './components/Financial';
import { Reports } from './components/Reports';
import { Notifications } from './components/Notifications';
import { Goals } from './components/Goals';
import { Agenda } from './components/Agenda';
import { Admin } from './components/Admin';
import { Settings } from './components/Settings';
import { Metrics } from './components/Metrics';
import { resetPassword } from './services/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { signOut, currentUser, refreshUser } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const {
    leads, clients, financialData, reports, goals, calendarEvents, employees, teams, notifications, activities, loading: loadingData,
    addLead, updateLeadData, removeLead, addLeadNote, addLeadTask, toggleLeadTask, addLeadFile, convertLeadToClient,
    addClient, updateClientData, removeClient, addInteraction, addClientTag, removeClientTag, createTag,
    addTransaction, removeTransaction, toggleTransactionStatus, addBudget, updateBudget, deleteBudget, addTax, updateTax, deleteTax, payTax,
    addReport, updateReport,
    addGoal, updateGoal, deleteGoal, addGoalUpdate,
    addEvent, updateEvent, deleteEvent,
    addEmployee, updateEmployeeData, removeEmployee,
    addTeam, updateTeamData, removeTeam,
    addNotification, markNotificationRead, markAllNotificationsRead
  } = useData();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check for inactive user
  useEffect(() => {
    if (currentUser && currentUser.active === false) {
      alert("Sua conta foi desativada. Entre em contato com o administrador.");
      signOut();
    }
  }, [currentUser, signOut]);

  useEffect(() => {
    const checkDueTaxes = async () => {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      financialData.taxRecords.forEach(async tax => {
        if (tax.status === 'Pending') {
          const dueDate = new Date(tax.dueDate);
          if (dueDate <= threeDaysFromNow && dueDate >= today) {
            const exists = notifications.some(n => n.title === 'Imposto a Vencer' && n.message.includes(tax.name) && new Date(n.date).toDateString() === today.toDateString());
            if (!exists) {
              await addNotification('Imposto a Vencer', `Imposto ${tax.name} vence em ${tax.dueDate}.`, 'alert');
            }
          }
        }
      });
    };
    if (financialData.taxRecords.length > 0) {
      checkDueTaxes();
    }
  }, [financialData.taxRecords, notifications, addNotification]);

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      alert('Email de redefinição de senha enviado!');
    } catch (error) {
      console.error("Error resetting password:", error);
      alert('Erro ao enviar email de redefinição.');
    }
  };

  if (loadingData) {
    return <div className="flex h-screen items-center justify-center">Carregando dados...</div>;
  }

  return (
    <div className={`flex h-screen bg-brand-light dark:bg-gray-900 font-sans`}>
      <Sidebar
        notificationCount={unreadNotifications}
        currentUser={currentUser!} // Safe because of ProtectedRoute
      />
      <main className="flex-1 flex flex-col ml-64">
        <Header currentUser={currentUser!} leads={leads} clients={clients} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={
              <Dashboard
                leads={leads}
                calendarEvents={calendarEvents}
                financialData={financialData}
                notifications={notifications}
                activities={activities}
                employees={employees}
              />
            } />
            <Route path="/pipeline" element={
              <Pipeline
                leads={leads}
                employees={employees}
                activities={activities}
                onUpdateLead={updateLeadData}
                onAddLead={addLead}
                onAddLeadNote={addLeadNote}
                onAddLeadTask={addLeadTask}
                onToggleLeadTask={toggleLeadTask}
                onAddLeadFile={addLeadFile}
                onConvertLeadToClient={convertLeadToClient}
                onDeleteLead={removeLead}
              />
            } />
            <Route path="/clients" element={
              <Clients
                clients={clients}
                leads={leads}
                transactions={financialData.transactions}
                onAddInteraction={addInteraction}
                onAddClient={addClient}
                onUpdateClient={updateClientData}
                onDeleteClient={removeClient}
                onAddTag={addClientTag}
                onRemoveTag={removeClientTag}
                onCreateTag={createTag}
              />
            } />
            <Route path="/financial" element={
              <Financial
                financialData={financialData}
                onAddTransaction={addTransaction}
                onDeleteTransaction={removeTransaction}
                onToggleTransaction={toggleTransactionStatus}
                onAddBudget={addBudget}
                onUpdateBudget={updateBudget}
                onDeleteBudget={deleteBudget}
                onAddTax={addTax}
                onUpdateTax={updateTax}
                onDeleteTax={deleteTax}
                onPayTax={payTax}
              />
            } />
            <Route path="/metrics" element={<Metrics leads={leads} employees={employees} reports={reports} financialData={financialData} />} />
            <Route path="/reports" element={<Reports reports={reports} employees={employees} currentUser={currentUser!} onAddReport={addReport} onUpdateReport={updateReport} leads={leads} events={calendarEvents} />} />
            <Route path="/notifications" element={
              <Notifications
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                currentUser={currentUser!}
              />
            } />
            <Route path="/goals" element={<Goals goals={goals} employees={employees} onAddGoal={addGoal} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} onAddGoalUpdate={addGoalUpdate} />} />
            <Route path="/agenda" element={<Agenda events={calendarEvents} onAddEvent={addEvent} onUpdateEvent={updateEvent} onDeleteEvent={deleteEvent} employees={employees} />} />
            <Route path="/admin" element={
              <Admin
                employees={employees}
                teams={teams}
                onAddEmployee={addEmployee}
                onRemoveEmployee={removeEmployee}
                onUpdateEmployee={updateEmployeeData}
                onAddTeam={addTeam}
                onUpdateTeam={updateTeamData}
                onRemoveTeam={removeTeam}
                onResetPassword={handleResetPassword}
              />
            } /><Route path="/settings" element={<Settings currentUser={currentUser!} onUpdateUser={updateEmployeeData} theme={theme} setTheme={setTheme} onResetPassword={handleResetPassword} employees={employees} onAddEmployee={addEmployee} onRemoveEmployee={removeEmployee} onUpdateEmployee={updateEmployeeData} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;