import React, { useState, useEffect } from 'react';
import { formatCurrency } from './utils';
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
import { Production } from './components/Production';
import { ProjectManagement } from './components/ProjectManagement';
import { DAM } from './components/DAM';
import { Inventory } from './components/Inventory';
import { Marketing } from './components/Marketing';
import { Quality } from './components/Quality';
import { AfterSales } from './components/AfterSales';
import { HRPerformance } from './components/HRPerformance';
import { BITechnology } from './components/BITechnology';
import { SOPs } from './components/SOPs';
import { DashboardPhoto } from './components/DashboardPhoto';
import { DashboardVideo } from './components/DashboardVideo';
import { DashboardSocial } from './components/DashboardSocial';
import { resetPassword, sendEmailNotification as queueEmailNotification } from './services/api';
import { Page } from './types';

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

const PermissionRoute: React.FC<{ children: React.ReactNode, module: string, action?: 'view' | 'create' | 'edit' | 'approve' }> = ({ children, module, action = 'view' }) => {
  const { hasPermission, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAdmin && !hasPermission(module, action)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { signOut, currentUser, refreshUser } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const {
    leads, clients, financialData, reports, goals, calendarEvents, employees, teams, notifications, activities, loading: loadingData,
    proposals, followUps,
    addLead, updateLeadData, removeLead, addLeadNote, addLeadTask, toggleLeadTask, addLeadFile, convertLeadToClient,
    addProposal, updateProposalData, removeProposal, addFollowUp, removeFollowUp,
    addClient, updateClientData, removeClient, addInteraction, addClientTag, removeClientTag, createTag,
    addFeedback, addComplaint, addUpsellOpportunity, addImportantDate,
    addTransaction, removeTransaction, updateTransactionData, toggleTransactionStatus, addBudget, updateBudget, deleteBudget,
    addInternalBudget, updateInternalBudget, deleteInternalBudget,
    addTax, updateTax, deleteTax, payTax,
    addReport, updateReport,
    addGoal, updateGoal, deleteGoal, addGoalUpdate,
    addEvent, updateEvent, deleteEvent,
    addEmployee, updateEmployeeData, removeEmployee,
    addTeam, updateTeamData, removeTeam,
    addProductionProject,
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

              if (tax.responsibleId) {
                const responsible = employees.find(e => e.id === tax.responsibleId);
                if (responsible && responsible.email) {
                  await queueEmailNotification(
                    responsible.email,
                    `Lembrete de Imposto: ${tax.name}`,
                    `Olá ${responsible.name},\n\nO imposto "${tax.name}" no valor de ${formatCurrency(tax.amount)} vence em ${new Date(tax.dueDate).toLocaleDateString('pt-BR')}.\n\nPor favor, providencie o pagamento.`
                  );
                }
              }
            }
          }
        }
      });
    };
    if (financialData.taxRecords.length > 0) {
      checkDueTaxes();
    }
  }, [financialData.taxRecords, notifications, addNotification, employees]);

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
            <Route path="/crm" element={
              <PermissionRoute module={Page.CRM}>
                <Pipeline
                  leads={leads}
                  employees={employees}
                  activities={activities}
                  proposals={proposals}
                  followUps={followUps}
                  onUpdateLead={updateLeadData}
                  onAddLead={addLead}
                  onAddLeadNote={addLeadNote}
                  onAddLeadTask={addLeadTask}
                  onToggleLeadTask={toggleLeadTask}
                  onAddLeadFile={addLeadFile}
                  onConvertLeadToClient={convertLeadToClient}
                  onDeleteLead={removeLead}
                  onAddProposal={addProposal}
                  onUpdateProposal={updateProposalData}
                  onRemoveProposal={removeProposal}
                  onAddFollowUp={addFollowUp}
                  onRemoveFollowUp={removeFollowUp}
                  currentUser={currentUser!}
                />
              </PermissionRoute>
            } />
            <Route path="/clients" element={
              <PermissionRoute module={Page.Clients}>
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
                  onAddFeedback={addFeedback}
                  onAddComplaint={addComplaint}
                  onAddUpsellOpportunity={addUpsellOpportunity}
                  onAddImportantDate={addImportantDate}
                  onAddProductionProject={addProductionProject}
                />
              </PermissionRoute>
            } />
            <Route path="/financial" element={
              <PermissionRoute module={Page.Financial}>
                <Financial
                  financialData={financialData}
                  onAddTransaction={addTransaction}
                  onUpdateTransaction={updateTransactionData}
                  onDeleteTransaction={removeTransaction}
                  onToggleTransaction={toggleTransactionStatus}
                  onAddBudget={addBudget}
                  onUpdateBudget={updateBudget}
                  onDeleteBudget={deleteBudget}
                  onAddTax={addTax}
                  onUpdateTax={updateTax}
                  onDeleteTax={deleteTax}
                  onPayTax={payTax}
                  onAddInternalBudget={addInternalBudget}
                  onUpdateInternalBudget={updateInternalBudget}
                  onDeleteInternalBudget={deleteInternalBudget}
                  employees={employees}
                />
              </PermissionRoute>
            } />
            <Route path="/metrics" element={<PermissionRoute module={Page.BI}><Metrics leads={leads} employees={employees} reports={reports} financialData={financialData} /></PermissionRoute>} />
            <Route path="/reports" element={<PermissionRoute module={Page.BI}><Reports reports={reports} employees={employees} currentUser={currentUser!} onAddReport={addReport} onUpdateReport={updateReport} leads={leads} events={calendarEvents} /></PermissionRoute>} />
            <Route path="/notifications" element={
              <Notifications
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                currentUser={currentUser!}
              />
            } />
            <Route path="/goals" element={<PermissionRoute module={Page.HR}><Goals goals={goals} employees={employees} onAddGoal={addGoal} onUpdateGoal={updateGoal} onDeleteGoal={deleteGoal} onAddGoalUpdate={addGoalUpdate} /></PermissionRoute>} />
            <Route path="/agenda" element={<PermissionRoute module={Page.Agenda}><Agenda events={calendarEvents} onAddEvent={addEvent} onUpdateEvent={updateEvent} onDeleteEvent={deleteEvent} employees={employees} /></PermissionRoute>} />
            <Route path="/admin" element={
              <PermissionRoute module={Page.Admin}>
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
              </PermissionRoute>
            } />
            <Route path="/settings" element={<Settings currentUser={currentUser!} onUpdateUser={updateEmployeeData} theme={theme} setTheme={setTheme} onResetPassword={handleResetPassword} employees={employees} onAddEmployee={addEmployee} onRemoveEmployee={removeEmployee} onUpdateEmployee={updateEmployeeData} />} />

            <Route path="/production" element={<PermissionRoute module={Page.Production}><Production /></PermissionRoute>} />
            <Route path="/project-management" element={<PermissionRoute module={Page.ProjectManagement}><ProjectManagement /></PermissionRoute>} />
            <Route path="/dam" element={<PermissionRoute module={Page.DAM}><DAM /></PermissionRoute>} />
            <Route path="/inventory" element={<PermissionRoute module={Page.Inventory}><Inventory /></PermissionRoute>} />
            <Route path="/after-sales" element={<PermissionRoute module={Page.AfterSales}><AfterSales /></PermissionRoute>} />
            <Route path="/marketing" element={<PermissionRoute module={Page.Marketing}><Marketing /></PermissionRoute>} />
            <Route path="/quality" element={<PermissionRoute module={Page.Quality}><Quality /></PermissionRoute>} />
            <Route path="/bi" element={<PermissionRoute module={Page.BI}><BITechnology leads={leads} financialData={financialData} employees={employees} reports={reports} followUps={followUps} /></PermissionRoute>} />
            <Route path="/sops" element={<PermissionRoute module={Page.SOPs}><SOPs /></PermissionRoute>} />
            <Route path="/hr" element={<PermissionRoute module={Page.HR}><HRPerformance /></PermissionRoute>} />

            {/* Specific Dashboards */}
            <Route path="/dashboard-photo" element={<PermissionRoute module={Page.DashboardPhoto}><DashboardPhoto /></PermissionRoute>} />
            <Route path="/dashboard-video" element={<PermissionRoute module={Page.DashboardVideo}><DashboardVideo /></PermissionRoute>} />
            <Route path="/dashboard-social" element={<PermissionRoute module={Page.DashboardSocial}><DashboardSocial /></PermissionRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

import { PublicDelivery } from './components/PublicDelivery';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/delivery/:token" element={<PublicDelivery />} />
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