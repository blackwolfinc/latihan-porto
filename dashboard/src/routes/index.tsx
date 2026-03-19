import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/auth.store';
import DashboardLayout from '@/layouts/DashboardLayout';

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
    <Spin size="large" />
  </div>
);

// Lazy loaded pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));

const CarListPage = React.lazy(() => import('@/pages/cars/CarListPage'));
const CarFormPage = React.lazy(() => import('@/pages/cars/CarFormPage'));
const CarDetailPage = React.lazy(() => import('@/pages/cars/CarDetailPage'));

const BookingListPage = React.lazy(() => import('@/pages/bookings/BookingListPage'));
const BookingFormPage = React.lazy(() => import('@/pages/bookings/BookingFormPage'));
const BookingDetailPage = React.lazy(() => import('@/pages/bookings/BookingDetailPage'));
const BookingCalendarPage = React.lazy(() => import('@/pages/bookings/BookingCalendarPage'));

const SchedulingPage = React.lazy(() => import('@/pages/scheduling/SchedulingPage'));

const DriverListPage = React.lazy(() => import('@/pages/drivers/DriverListPage'));
const DriverFormPage = React.lazy(() => import('@/pages/drivers/DriverFormPage'));
const DriverDetailPage = React.lazy(() => import('@/pages/drivers/DriverDetailPage'));

const CustomerListPage = React.lazy(() => import('@/pages/customers/CustomerListPage'));
const CustomerDetailPage = React.lazy(() => import('@/pages/customers/CustomerDetailPage'));

const PaymentListPage = React.lazy(() => import('@/pages/payments/PaymentListPage'));
const PaymentDetailPage = React.lazy(() => import('@/pages/payments/PaymentDetailPage'));

const MaintenanceListPage = React.lazy(() => import('@/pages/maintenance/MaintenanceListPage'));
const MaintenanceFormPage = React.lazy(() => import('@/pages/maintenance/MaintenanceFormPage'));

const FuelListPage = React.lazy(() => import('@/pages/fuel/FuelListPage'));
const FuelFormPage = React.lazy(() => import('@/pages/fuel/FuelFormPage'));
const ExpenseListPage = React.lazy(() => import('@/pages/fuel/ExpenseListPage'));

const GpsTrackingPage = React.lazy(() => import('@/pages/gps/GpsTrackingPage'));

const InspectionListPage = React.lazy(() => import('@/pages/inspections/InspectionListPage'));
const InspectionDetailPage = React.lazy(() => import('@/pages/inspections/InspectionDetailPage'));

const ContractListPage = React.lazy(() => import('@/pages/contracts/ContractListPage'));
const ContractDetailPage = React.lazy(() => import('@/pages/contracts/ContractDetailPage'));

const ReviewListPage = React.lazy(() => import('@/pages/reviews/ReviewListPage'));

const BranchListPage = React.lazy(() => import('@/pages/branches/BranchListPage'));
const BranchFormPage = React.lazy(() => import('@/pages/branches/BranchFormPage'));

const RevenueReportPage = React.lazy(() => import('@/pages/reports/RevenueReportPage'));
const FleetReportPage = React.lazy(() => import('@/pages/reports/FleetReportPage'));
const ExpenseReportPage = React.lazy(() => import('@/pages/reports/ExpenseReportPage'));

const SettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="cars" element={<CarListPage />} />
          <Route path="cars/new" element={<CarFormPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="cars/:id/edit" element={<CarFormPage />} />

          <Route path="bookings" element={<BookingListPage />} />
          <Route path="bookings/new" element={<BookingFormPage />} />
          <Route path="bookings/calendar" element={<BookingCalendarPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />

          <Route path="scheduling" element={<SchedulingPage />} />

          <Route path="drivers" element={<DriverListPage />} />
          <Route path="drivers/new" element={<DriverFormPage />} />
          <Route path="drivers/:id" element={<DriverDetailPage />} />
          <Route path="drivers/:id/edit" element={<DriverFormPage />} />

          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />

          <Route path="payments" element={<PaymentListPage />} />
          <Route path="payments/:id" element={<PaymentDetailPage />} />

          <Route path="maintenance" element={<MaintenanceListPage />} />
          <Route path="maintenance/new" element={<MaintenanceFormPage />} />
          <Route path="maintenance/:id/edit" element={<MaintenanceFormPage />} />

          <Route path="fuel" element={<FuelListPage />} />
          <Route path="fuel/new" element={<FuelFormPage />} />
          <Route path="fuel/:id/edit" element={<FuelFormPage />} />
          <Route path="expenses" element={<ExpenseListPage />} />

          <Route path="gps-tracking" element={<GpsTrackingPage />} />

          <Route path="inspections" element={<InspectionListPage />} />
          <Route path="inspections/:id" element={<InspectionDetailPage />} />

          <Route path="contracts" element={<ContractListPage />} />
          <Route path="contracts/:id" element={<ContractDetailPage />} />

          <Route path="reviews" element={<ReviewListPage />} />

          <Route path="branches" element={<BranchListPage />} />
          <Route path="branches/new" element={<BranchFormPage />} />
          <Route path="branches/:id/edit" element={<BranchFormPage />} />

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
