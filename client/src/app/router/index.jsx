import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/auth.provider.jsx';
import PrivateRoute from './private.routes.jsx';
import PublicRoute from './public.routes.jsx';

// Layouts
import AuthLayout from '../../layouts/auth.layout.jsx';
import DashboardLayout from '../../layouts/dashboard.layout.jsx';
import NotificationsPage from '../../pages/notification/index.jsx';

// Auth Pages
import Login from '../../pages/auth/login.jsx';
import Register from '../../pages/auth/register.jsx';
import ForgotPassword from '../../pages/auth/forgot-password.jsx';
import ResetPassword from '../../pages/auth/reset-password.jsx';

// Dashboard Pages
import Dashboard from '../../pages/dashboard/index.jsx';
import ClientsList from '../../pages/clients/list.jsx';
import ClientDetail from '../../pages/clients/detail.jsx';
import ClientCreate from '../../pages/clients/create.jsx';
import ClientEdit from '../../pages/clients/edit.jsx';
import CasesList from '../../pages/cases/list.jsx';
import CaseDetail from '../../pages/cases/detail.jsx';
import CaseCreate from '../../pages/cases/create.jsx';
import CaseEdit from '../../pages/cases/edit.jsx';

// CaseParty Pages
import CasePartyList from '../../pages/case-parties/list.jsx';
import CasePartyCreate from '../../pages/case-parties/create.jsx';
import CasePartyEdit from '../../pages/case-parties/edit.jsx';
import CasePartyDetail from '../../pages/case-parties/detail.jsx';

// Documents
import DocumentsList from '../../pages/documents/list.jsx';
import DocumentUpload from '../../pages/documents/upload.jsx';
import DocumentEdit from '../../pages/documents/edit.jsx';
import DocumentDetail from '../../pages/documents/detail.jsx';

// Tasks
import TasksList from '../../pages/tasks/list.jsx';
import TaskDetail from '../../pages/tasks/detail.jsx';
import TaskCreate from '../../pages/tasks/create.jsx';
import TaskEdit from '../../pages/tasks/edit.jsx';

// Meetings
import MeetingsList from '../../pages/meetings/list.jsx';
import MeetingCreate from '../../pages/meetings/create.jsx';
import MeetingDetail from '../../pages/meetings/detail.jsx';
import MeetingEdit from '../../pages/meetings/edit.jsx';

// Events
import EventCreate from '../../pages/events/create.jsx';
import EventDetail from '../../pages/events/detail.jsx';
import EventEdit from '../../pages/events/edit.jsx';

// Templates (Şablonlar)
import TemplatesList from '../../pages/templates/list.jsx';
import TemplateCreate from '../../pages/templates/create.jsx';
import TemplateDetail from '../../pages/templates/detail.jsx';
import TemplateEdit from '../../pages/templates/edit.jsx';

// Other
import Calendar from '../../pages/calendar/index.jsx';
import Finance from '../../pages/finance/index.jsx';
import FinanceCreate from '../../pages/finance/create.jsx';
import AIAssistant from '../../pages/ai/index.jsx';
import Search from '../../pages/search/index.jsx';
import Settings from '../../pages/settings/index.jsx';

// ✅ Users (Sadece Admin)
import UserList from '../../pages/users/list.jsx';
// ✅ AuditLog (Sadece Admin)
import AuditLogList from '../../pages/audit-logs/list.jsx';
import AuditLogDetail from '../../pages/audit-logs/detail.jsx';

// ✅ Power of Attorney (Vekaletname)
import PowerOfAttorneyList from '../../pages/power-of-attorney/list.jsx';
import PowerOfAttorneyDetail from '../../pages/power-of-attorney/detail.jsx';
import PowerOfAttorneyCreate from '../../pages/power-of-attorney/create.jsx';
import PowerOfAttorneyEdit from '../../pages/power-of-attorney/edit.jsx';

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        
        <Route element={<AuthLayout />}>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Clients */}
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/create" element={<ClientCreate />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientEdit />} />
          
          {/* Cases */}
          <Route path="/cases" element={<CasesList />} />
          <Route path="/cases/create" element={<CaseCreate />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/cases/:id/edit" element={<CaseEdit />} />

          {/* Case Parties */}
          <Route path="/cases/:caseId/parties" element={<CasePartyList />} />
          <Route path="/cases/:caseId/parties/create" element={<CasePartyCreate />} />
          <Route path="/cases/:caseId/parties/:id/edit" element={<CasePartyEdit />} />
          <Route path="/cases/:caseId/parties/:id" element={<CasePartyDetail />} />
          
          {/* Documents */}
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/upload" element={<DocumentUpload />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/documents/:id/edit" element={<DocumentEdit />} />
           
          {/* Meetings */}
          <Route path="/meetings" element={<MeetingsList />} />
          <Route path="/meetings/create" element={<MeetingCreate />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/meetings/:id/edit" element={<MeetingEdit />} />

          {/* Tasks */}
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/:id/edit" element={<TaskEdit />} />

          {/* Events */}
          <Route path="/events/create" element={<EventCreate />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EventEdit />} />

          {/* Templates (Şablonlar) */}
          <Route path="/templates" element={<TemplatesList />} />
          <Route path="/templates/create" element={<TemplateCreate />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />
          <Route path="/templates/:id/edit" element={<TemplateEdit />} />

          {/* Calendar */}
          <Route path="/calendar" element={<Calendar />} />

          {/* Finance */}
          <Route path="/finance" element={<Finance />} />
          <Route path="/finance/create" element={<FinanceCreate />} />

          {/* ✅ Power of Attorney (Vekaletname) */}
          <Route path="/power-of-attorney" element={<PowerOfAttorneyList />} />
          <Route path="/power-of-attorney/create" element={<PowerOfAttorneyCreate />} />
          <Route path="/power-of-attorney/:id" element={<PowerOfAttorneyDetail />} />
          <Route path="/power-of-attorney/:id/edit" element={<PowerOfAttorneyEdit />} />

          {/* AI & Search */}
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/search" element={<Search />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* ✅ ADMIN ROUTES - SADECE ADMIN */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="users" element={<UserList />} />
            <Route path="audit-logs" element={<AuditLogList />} />
            <Route path="audit-logs/:id" element={<AuditLogDetail />} />
          </Route>
          
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRouter;