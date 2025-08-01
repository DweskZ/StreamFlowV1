import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import LikedSongsPage from './pages/LikedSongsPage';
import PlaylistPage from './pages/PlaylistPage';
import StreamFlow from './pages/StreamFlow';
import PricingPage from './pages/PricingPage';
import { SubscriptionTest } from './components/subscription/SubscriptionTest';
import MainLayout from './components/MainLayout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { LibraryProvider } from './contexts/LibraryContext';

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Cargando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
};

const PublicLayout = () => {
  return <MainLayout />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <PlayerProvider>
          <LibraryProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                  </Route>
                  <Route element={<ProtectedLayout />}>
                    <Route path="/app" element={<Dashboard />} />
                    <Route path="/app/search" element={<SearchPage />} />
                    <Route path="/app/liked" element={<LikedSongsPage />} />
                    <Route path="/app/playlist/:playlistId" element={<PlaylistPage />} />
                    <Route path="/app/streamflow" element={<StreamFlow />} />
                    <Route path="/app/pricing" element={<PricingPage />} />
                    <Route path="/app/test-subscription" element={<SubscriptionTest />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LibraryProvider>
        </PlayerProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
