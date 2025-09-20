// src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../utils/auth";

export default function Header() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-12 flex items-center justify-between px-3">
      {/* Left Section - Search */}
      <div className="flex items-center flex-1 max-w-xs">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Center Section - Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-sm font-semibold text-gray-900 hidden lg:block">
          digniMuv Admin Dashboard
        </h1>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-1 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-1.5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-sm text-gray-500">admin@local</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
