// src/components/Sidebar.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z",
      active: true
    },
    { 
      path: "/dashboard/bookings", 
      label: "Bookings", 
      icon: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      badge: null
    },
    { 
      path: "/dashboard/drivers", 
      label: "Drivers", 
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      badge: null
    },
    { 
      path: "/dashboard/ambulances", 
      label: "Ambulances", 
      icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
      badge: null
    },
    { 
      path: "/dashboard/assignments", 
      label: "Assignments", 
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      badge: null
    },
    { 
      path: "/dashboard/expenses", 
      label: "Expenses", 
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      badge: null
    },
    { 
      path: "/dashboard/monitoring", 
      label: "Monitoring", 
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
      badge: null
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-12' : 'w-40'} h-screen fixed left-0 top-0 z-50`}>
      {/* Logo Section */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {!collapsed && (
            <span className="ml-2 text-lg font-bold text-gray-900">digniMuv</span>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="mt-2 px-1">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-1.5 py-1.5 rounded text-sm font-medium transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${collapsed ? 'mx-auto' : 'mr-1.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-purple-100 text-purple-600 text-xs font-medium px-1 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="absolute bottom-3 left-2 right-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
          {!collapsed && <span className="ml-1 text-xs">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
