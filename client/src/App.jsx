import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Common Route Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Services from './pages/public/Services';
import ServiceDetails from './pages/public/ServiceDetails';
import ProviderProfile from './pages/public/ProviderProfile';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';

// Customer Pages
import BookService from './pages/customer/BookService';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookings from './pages/customer/MyBookings';
import BookingDetails from './pages/customer/BookingDetails';
import MyReviews from './pages/customer/MyReviews';
import CustomerProfile from './pages/customer/CustomerProfile';
import NotificationsPage from './pages/customer/NotificationsPage';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderBookings from './pages/provider/ProviderBookings';
import ManageServices from './pages/provider/ManageServices';
import AddService from './pages/provider/AddService';
import EditService from './pages/provider/EditService';
import AvailabilityManagement from './pages/provider/AvailabilityManagement';
import CustomerReviews from './pages/provider/CustomerReviews';
import ProviderProfileManagement from './pages/provider/ProviderProfileManagement';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProviders from './pages/admin/ManageProviders';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';
import AdminManageServices from './pages/admin/ManageServices';
import AdminManageBookings from './pages/admin/ManageBookings';
import ManageComplaints from './pages/admin/ManageComplaints';

function App() {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Customer Booking Flow */}
        <Route
          path="/book/:serviceId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['customer']}>
                <BookService />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFound />} />
      </Route>

      {/* Customer Portal wrapped in DashboardLayout */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['customer']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="reviews" element={<MyReviews />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Provider Portal wrapped in DashboardLayout */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['provider']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="services/add" element={<AddService />} />
        <Route path="services/edit/:id" element={<EditService />} />
        <Route path="availability" element={<AvailabilityManagement />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="profile" element={<ProviderProfileManagement />} />
      </Route>

      {/* Admin Portal wrapped in DashboardLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="providers" element={<ManageProviders />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="services" element={<AdminManageServices />} />
        <Route path="bookings" element={<AdminManageBookings />} />
        <Route path="complaints" element={<ManageComplaints />} />
      </Route>

      {/* Notifications standalone route */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NotificationsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;

