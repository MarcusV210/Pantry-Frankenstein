import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PantryPage } from './pages/PantryPage';
import { GeneratePage } from './pages/GeneratePage';
import { HistoryPage } from './pages/HistoryPage';
import { AuthGuard } from './components/AuthGuard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes gated by AuthGuard */}
          <Route element={<AuthGuard />}>
            <Route path="/pantry" element={<PantryPage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          {/* Fallback Redirections */}
          <Route path="/" element={<Navigate to="/pantry" replace />} />
          <Route path="*" element={<Navigate to="/pantry" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
