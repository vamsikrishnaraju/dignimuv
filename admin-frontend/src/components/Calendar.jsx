// src/components/Calendar.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function Calendar({ 
  onDateSelect, 
  onAssignmentClick, 
  selectedDate, 
  assignments = [],
  ambulances = [],
  drivers = []
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month" or "week"
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const getDaysInRange = (start, end) => {
    const days = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Get days for month view with proper month boundaries
  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of the week that contains the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End at the last day of the week that contains the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    return getDaysInRange(startDate, endDate);
  };

  // Get days for week view
  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return getDaysInRange(startOfWeek, endOfWeek);
  };

  const getAssignmentsForDate = (date) => {
    // Create a date string in YYYY-MM-DD format using local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return assignments.filter(assignment => 
      assignment.date.startsWith(dateStr)
    );
  };

  const getAssignmentColor = (shift) => {
    switch (shift) {
      case "morning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "afternoon": return "bg-blue-100 text-blue-800 border-blue-200";
      case "night": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getShiftIcon = (shift) => {
    switch (shift) {
      case "morning": return "🌅";
      case "afternoon": return "☀️";
      case "night": return "🌙";
      default: return "⏰";
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    return date < today.setHours(0, 0, 0, 0);
  };

  const days = viewMode === "month" 
    ? getMonthDays(currentDate)
    : getWeekDays(currentDate);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode("month")}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === "month" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === "week" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => viewMode === "month" ? navigateMonth(-1) : navigateWeek(-1)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Today
            </button>
            <button
              onClick={() => viewMode === "month" ? navigateMonth(1) : navigateWeek(1)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2">
        {viewMode === "month" && (
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={`day-header-${index}`} className="p-1 text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>
        )}
        
        <div className={`grid gap-0.5 ${viewMode === "month" ? "grid-cols-7" : "grid-cols-7"}`}>
          {days.map((date, index) => {
            const dateAssignments = getAssignmentsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isCurrentDay = isToday(date);
            const isSelectedDay = isSelected(date);
            const isPast = isPastDate(date);
            
            return (
              <div
                key={index}
                className={`min-h-[50px] p-1 border rounded cursor-pointer transition-colors ${
                  !isCurrentMonth 
                    ? "bg-gray-50 text-gray-400" 
                    : isSelectedDay
                    ? "bg-blue-100 border-blue-300"
                    : isCurrentDay
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                } ${isPast ? "opacity-60" : ""}`}
                onClick={() => !isPast && onDateSelect(date)}
              >
                <div className="text-xs font-medium mb-1">
                  {date.getDate()}
                </div>
                
                <div className="space-y-0.5">
                  {dateAssignments.slice(0, 2).map((assignment, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-1 py-0.5 rounded border cursor-pointer ${getAssignmentColor(assignment.shift)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignmentClick(assignment);
                      }}
                      title={`${assignment.ambulance.vehicleNo} - ${assignment.driver.name} (${assignment.shift})`}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">{getShiftIcon(assignment.shift)}</span>
                        <span className="truncate text-xs">{assignment.ambulance.vehicleNo}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dateAssignments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dateAssignments.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
