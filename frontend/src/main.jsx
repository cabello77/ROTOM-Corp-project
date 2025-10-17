import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import App from "./App";
import SignUp from "./SignUp";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import "./index.css";
import ErrorBoundary from './ErrorBoundary';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </UserProvider>
  </React.StrictMode>
);
