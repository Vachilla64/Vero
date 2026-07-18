import { BrowserRouter as Router, Routes, Route, Navigate } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-canvas">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
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
