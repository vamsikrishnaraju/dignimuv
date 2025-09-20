// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Drivers from "./pages/Drivers";
import Ambulances from "./pages/Ambulances";
import Assignments from "./pages/Assignments";
import Expenses from "./pages/Expenses";
import Monitoring from "./pages/Monitoring";
import MapboxTest from "./components/MapboxTest";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
        <div className="ml-40 min-h-screen">
          <Header />
          <main className="p-3 max-w-full overflow-x-hidden">
            <div className="max-w-full w-full">
              {children}
            </div>
          </main>
        </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/bookings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Bookings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/drivers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Drivers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/ambulances"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Ambulances />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/assignments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Assignments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/expenses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Expenses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/monitoring"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Monitoring />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/mapbox-test"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MapboxTest />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<div className="p-8">404 — Page not found</div>} />
    </Routes>
  );
}
