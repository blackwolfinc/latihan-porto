import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuthStore } from '@/stores/auth.store';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const OperationalDashboard = lazy(() => import('@/pages/OperationalDashboard'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CarListPage = lazy(() => import('@/pages/cars/CarListPage'));
const CarFormPage = lazy(() => import('@/pages/cars/CarFormPage'));
const CarDetailPage = lazy(() => import('@/pages/cars/CarDetailPage'));
const BookingListPage = lazy(() => import('@/pages/bookings/BookingListPage'));
const BookingFormPage = lazy(() => import('@/pages/bookings/BookingFormPage'));
const BookingDetailPage = lazy(() => import('@/pages/bookings/BookingDetailPage'));
const BookingCalendarPage = lazy(() => import('@/pages/bookings/BookingCalendarPage'));
const SchedulingPage = lazy(() => import('@/pages/scheduling/SchedulingPage'));
const DriverListPage = lazy(() => import('@/pages/drivers/DriverListPage'));
const DriverFormPage = lazy(() => import('@/pages/drivers/DriverFormPage'));
const DriverDetailPage = lazy(() => import('@/pages/drivers/DriverDetailPage'));
const CustomerListPage = lazy(() => import('@/pages/customers/CustomerListPage'));
const CustomerDetailPage = lazy(() => import('@/pages/customers/CustomerDetailPage'));
const PaymentListPage = lazy(() => import('@/pages/payments/PaymentListPage'));
const PaymentDetailPage = lazy(() => import('@/pages/payments/PaymentDetailPage'));
const MaintenanceListPage = lazy(() => import('@/pages/maintenance/MaintenanceListPage'));
const MaintenanceFormPage = lazy(() => import('@/pages/maintenance/MaintenanceFormPage'));
const FuelListPage = lazy(() => import('@/pages/fuel/FuelListPage'));
const FuelFormPage = lazy(() => import('@/pages/fuel/FuelFormPage'));
const ExpenseListPage = lazy(() => import('@/pages/fuel/ExpenseListPage'));
const GpsTrackingPage = lazy(() => import('@/pages/gps/GpsTrackingPage'));
const InspectionListPage = lazy(() => import('@/pages/inspections/InspectionListPage'));
const InspectionDetailPage = lazy(() => import('@/pages/inspections/InspectionDetailPage'));
const ContractListPage = lazy(() => import('@/pages/contracts/ContractListPage'));
const ContractDetailPage = lazy(() => import('@/pages/contracts/ContractDetailPage'));
const ReviewListPage = lazy(() => import('@/pages/reviews/ReviewListPage'));
const BranchListPage = lazy(() => import('@/pages/branches/BranchListPage'));
const BranchFormPage = lazy(() => import('@/pages/branches/BranchFormPage'));
const InvoiceListPage = lazy(() => import('@/pages/invoices/InvoiceListPage'));
const InvoiceFormPage = lazy(() => import('@/pages/invoices/InvoiceFormPage'));
const InvoiceDetailPage = lazy(() => import('@/pages/invoices/InvoiceDetailPage'));
const RevenueReportPage = lazy(() => import('@/pages/reports/RevenueReportPage'));
const FleetReportPage = lazy(() => import('@/pages/reports/FleetReportPage'));
const ExpenseReportPage = lazy(() => import('@/pages/reports/ExpenseReportPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin size="large" tip="Memuat..." />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/operational" replace />} />
          <Route path="operational" element={<OperationalDashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cars" element={<CarListPage />} />
          <Route path="cars/create" element={<CarFormPage />} />
          <Route path="cars/:id/edit" element={<CarFormPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="bookings" element={<BookingListPage />} />
          <Route path="bookings/create" element={<BookingFormPage />} />
          <Route path="bookings/calendar" element={<BookingCalendarPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="scheduling" element={<SchedulingPage />} />
          <Route path="drivers" element={<DriverListPage />} />
          <Route path="drivers/create" element={<DriverFormPage />} />
          <Route path="drivers/:id/edit" element={<DriverFormPage />} />
          <Route path="drivers/:id" element={<DriverDetailPage />} />
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="payments" element={<PaymentListPage />} />
          <Route path="payments/:id" element={<PaymentDetailPage />} />
          <Route path="maintenance" element={<MaintenanceListPage />} />
          <Route path="maintenance/create" element={<MaintenanceFormPage />} />
          <Route path="maintenance/:id/edit" element={<MaintenanceFormPage />} />
          <Route path="fuel" element={<FuelListPage />} />
          <Route path="fuel/create" element={<FuelFormPage />} />
          <Route path="fuel/:id/edit" element={<FuelFormPage />} />
          <Route path="fuel/expenses" element={<ExpenseListPage />} />
          <Route path="gps" element={<GpsTrackingPage />} />
          <Route path="inspections" element={<InspectionListPage />} />
          <Route path="inspections/:id" element={<InspectionDetailPage />} />
          <Route path="contracts" element={<ContractListPage />} />
          <Route path="contracts/:id" element={<ContractDetailPage />} />
          <Route path="invoices" element={<InvoiceListPage />} />
          <Route path="invoices/create" element={<InvoiceFormPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="reviews" element={<ReviewListPage />} />
          <Route path="branches" element={<BranchListPage />} />
          <Route path="branches/create" element={<BranchFormPage />} />
          <Route path="branches/:id/edit" element={<BranchFormPage />} />
          <Route path="reports" element={<RevenueReportPage />} />
          <Route path="reports/revenue" element={<RevenueReportPage />} />
          <Route path="reports/fleet" element={<FleetReportPage />} />
          <Route path="reports/expenses" element={<ExpenseReportPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
