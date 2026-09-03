import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { LoginPage } from './pages/public/LoginPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ContactPage } from './pages/public/ContactPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { RegisterEventPage } from './pages/student/RegisterEventPage';
import { PaymentPage } from './pages/student/PaymentPage';
import { RegistrationDetailPage } from './pages/student/RegistrationDetailPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { EsportsHubPage } from './pages/student/EsportsHubPage';
import { TeamBuilderPage } from './pages/student/TeamBuilderPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { PaymentVerificationPage } from './pages/admin/PaymentVerificationPage';
import { AllRegistrationsPage } from './pages/admin/AllRegistrationsPage';
import { AdminRegistrationDetailPage } from './pages/admin/AdminRegistrationDetailPage';
import { StudentManagementPage } from './pages/admin/StudentManagementPage';
import { EventManagementPage } from './pages/admin/EventManagementPage';
import { PaymentSettingsPage } from './pages/admin/PaymentSettingsPage';
import { ExportDataPage } from './pages/admin/ExportDataPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AdminEsportsTeamsPage } from './pages/admin/AdminEsportsTeamsPage';
import { AdminTeamDetailPage } from './pages/admin/AdminTeamDetailPage';

// Public/Student Layout wrapper with Navbar & Footer
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-[#010914] text-[#FFFFFF]">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/about"
        element={
          <MainLayout>
            <AboutPage />
          </MainLayout>
        }
      />
      <Route
        path="/events"
        element={
          <MainLayout>
            <EventsPage />
          </MainLayout>
        }
      />
      <Route
        path="/events/:slug"
        element={
          <MainLayout>
            <EventDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <MainLayout>
            <RegisterPage />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <MainLayout>
            <ForgotPasswordPage />
          </MainLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <MainLayout>
            <ContactPage />
          </MainLayout>
        }
      />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <MainLayout>
            <StudentDashboardPage />
          </MainLayout>
        }
      />
      <Route
        path="/student/register-event"
        element={
          <MainLayout>
            <RegisterEventPage />
          </MainLayout>
        }
      />
      <Route
        path="/student/payment/:registrationId"
        element={
          <MainLayout>
            <PaymentPage />
          </MainLayout>
        }
      />
      <Route
        path="/student/registrations/:id"
        element={
          <MainLayout>
            <RegistrationDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/student/profile"
        element={
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        }
      />
      <Route
        path="/student/esports"
        element={
          <MainLayout>
            <EsportsHubPage />
          </MainLayout>
        }
      />
      <Route
        path="/student/esports/create"
        element={
          <MainLayout>
            <TeamBuilderPage />
          </MainLayout>
        }
      />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Protected Console */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="esports/teams" element={<AdminEsportsTeamsPage />} />
        <Route path="esports/teams/:id" element={<AdminTeamDetailPage />} />
        <Route path="payments" element={<PaymentVerificationPage />} />
        <Route path="registrations" element={<AllRegistrationsPage />} />
        <Route path="registrations/:id" element={<AdminRegistrationDetailPage />} />
        <Route path="students" element={<StudentManagementPage />} />
        <Route path="events" element={<EventManagementPage />} />
        <Route path="settings" element={<PaymentSettingsPage />} />
        <Route path="export" element={<ExportDataPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
