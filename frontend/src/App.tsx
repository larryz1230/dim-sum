import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Matchmake from "./pages/Matchmake";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Game from "./pages/Game";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/game" element={<Game />} />
          </Route>
          <Route path="/matchmake" element={<Matchmake />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
