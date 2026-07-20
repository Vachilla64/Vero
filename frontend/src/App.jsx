import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Tags from "./pages/Tags";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import HowItWorks from "./pages/HowItWorks";
import Onboarding from "./pages/Onboarding";

import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";

import Splash from "./pages/Splash";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // We don't render Splash here anymore, the root handles it.
  // But just in case auth is still loading during normal navigation:
  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-canvas">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

// Mobile App Frame Constraint — single source of truth for the phone chrome
const PhoneFrame = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas p-0 sm:p-4 md:p-8">
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-md bg-surface relative overflow-hidden sm:rounded-[3rem] sm:shadow-app">
        {children}
      </div>
    </div>
  );
};

const PageLayout = ({ children }) => {
  return (
    <PhoneFrame>
      {/* TopBar is removed here because the new design dictates custom headers per page (like the transparent ones on verdict screens or specific titles) */}
      {children}
      <BottomNav />
    </PhoneFrame>
  );
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PhoneFrame><Login /></PhoneFrame>} />
        <Route path="/register" element={<PhoneFrame><Register /></PhoneFrame>} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <PhoneFrame>
                <Onboarding />
              </PhoneFrame>
            </ProtectedRoute>
          }
        />
        
        {/* Protected Mobile Pages */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <Home />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/verify" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <Verify />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tags" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <Tags />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <History />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <Settings />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upgrade" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <Upgrade />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/how-it-works" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <HowItWorks />
              </PageLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

import { useState } from "react";

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <PhoneFrame>
        <Splash onFinish={() => setShowSplash(false)} />
      </PhoneFrame>
    );
  }

  return <AppRoutes />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
