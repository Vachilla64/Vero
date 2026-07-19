import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";

import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-canvas">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PageLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-canvas p-0 sm:p-4 md:p-8">
      {/* Mobile App Frame Constraint */}
      <div className="w-full h-[100dvh] sm:h-[850px] max-w-md bg-surface relative overflow-hidden sm:rounded-[3rem] sm:shadow-app">
        {/* TopBar is removed here because the new design dictates custom headers per page (like the transparent ones on verdict screens or specific titles) */}
        {children}
        <BottomNav />
      </div>
    </div>
  );
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Mobile Pages */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PageLayout>
                <Dashboard />
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
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
