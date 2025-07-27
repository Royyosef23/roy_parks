import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthForm } from './components/features/AuthForm';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AddParking } from './pages/parking/AddParking';
import { MyParkings } from './pages/parking/MyParkings';
import { SearchParking } from './pages/parking/SearchParking';
import { RequestParkingClaim } from './pages/parking/RequestParkingClaim';
import { VaadManagement } from './pages/admin/VaadManagement';
import './App.css';

// יצירת QueryClient עבור React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Layout showNavbar={false}>
              <AuthForm />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/add-parking" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <AddParking />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-parkings" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <MyParkings />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/search-parking" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <SearchParking />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/request-parking-claim" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <RequestParkingClaim />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vaad-management" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Layout>
              <VaadManagement />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />}
      />
      {/* נתיבים נוספים יתווספו כאן */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
