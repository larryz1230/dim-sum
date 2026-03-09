import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Matchmake from "./pages/Matchmake";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Game from "./pages/Game";
import Room from "./pages/Room";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/login" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/game" element={<Game />} />
            <Route path="/matchmake" element={<Matchmake />} />
            <Route path="/room/:matchId" element={<Room />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
