import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Matchmake from "./pages/Matchmake";
import { AuthProvider } from "./hooks/useAuth";
import DefaultRoute from "./components/DefaultRoute";
import Game from "./pages/Game";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<DefaultRoute mode="public" />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<DefaultRoute mode="protected" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game" element={<Game />} />
            <Route path="/matchmake" element={<Matchmake />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
