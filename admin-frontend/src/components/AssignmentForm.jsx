// src/components/AssignmentForm.jsx
import React, { useState, useEffect } from "react";

export default function AssignmentForm({ 
  selectedDate, 
  selectedAssignment, 
  ambulances, 
  drivers, 
  assignments = [], // Add assignments prop to check for conflicts
  onSubmit, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    date: "",
    endDate: "",
    shift: "morning",
    driverId: "",
    ambulanceId: "",
    notes: "",
    assignmentType: "single" // "single", "multiple", "range"
  });
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const shifts = [
    { value: "morning", label: "Morning (6 AM - 2 PM)", icon: "🌅" },
    { value: "afternoon", label: "Afternoon (2 PM - 10 PM)", icon: "☀️" },
    { value: "night", label: "Night (10 PM - 6 AM)", icon: "🌙" }
  ];

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to check if a driver is available for a specific date and shift
  const isDriverAvailable = (driverId, date, shift) => {
    if (!date || !shift) return true;
    
    const dateStr = formatDateForInput(new Date(date));
    return !assignments.some(assignment => 
      assignment.driverId === driverId && 
      assignment.date.startsWith(dateStr) && 
      assignment.shift === shift &&
      assignment.id !== selectedAssignment?.id // Exclude current assignment when editing
    );
  };

  // Helper function to check if an ambulance is available for a specific date and shift
  const isAmbulanceAvailable = (ambulanceId, date, shift) => {
    if (!date || !shift) return true;
    
    const dateStr = formatDateForInput(new Date(date));
    return !assignments.some(assignment => 
      assignment.ambulanceId === ambulanceId && 
      assignment.date.startsWith(dateStr) && 
      assignment.shift === shift &&
      assignment.id !== selectedAssignment?.id // Exclude current assignment when editing
    );
  };

  // Get available drivers for the current form data
  const getAvailableDrivers = () => {
    if (formData.assignmentType === "single") {
      return drivers.filter(driver => 
        driver.status === "available" && 
        isDriverAvailable(driver.id, formData.date, formData.shift)
      );
    } else if (formData.assignmentType === "multiple") {
      // For multiple days, check availability for all selected days
      return drivers.filter(driver => 
        driver.status === "available" && 
        selectedDays.every(day => isDriverAvailable(driver.id, day, formData.shift))
      );
    } else if (formData.assignmentType === "range") {
      // For date range, we'll check the start date (can be enhanced later)
      return drivers.filter(driver => 
        driver.status === "available" && 
        isDriverAvailable(driver.id, formData.date, formData.shift)
      );
    }
    return drivers.filter(driver => driver.status === "available");
  };

  // Get available ambulances for the current form data
  const getAvailableAmbulances = () => {
    if (formData.assignmentType === "single") {
      return ambulances.filter(ambulance => 
        ambulance.status === "available" && 
        isAmbulanceAvailable(ambulance.id, formData.date, formData.shift)
      );
    } else if (formData.assignmentType === "multiple") {
      // For multiple days, check availability for all selected days
      return ambulances.filter(ambulance => 
        ambulance.status === "available" && 
        selectedDays.every(day => isAmbulanceAvailable(ambulance.id, day, formData.shift))
      );
    } else if (formData.assignmentType === "range") {
      // For date range, we'll check the start date (can be enhanced later)
      return ambulances.filter(ambulance => 
        ambulance.status === "available" && 
        isAmbulanceAvailable(ambulance.id, formData.date, formData.shift)
      );
    }
    return ambulances.filter(ambulance => ambulance.status === "available");
  };

  useEffect(() => {
    if (selectedAssignment) {
      // Edit mode - populate with existing assignment data
      setFormData({
        date: selectedAssignment.date.split('T')[0],
        endDate: "",
        shift: selectedAssignment.shift,
        driverId: selectedAssignment.driverId,
        ambulanceId: selectedAssignment.ambulanceId,
        notes: selectedAssignment.notes || "",
        assignmentType: "single"
      });
    } else if (selectedDate) {
      // New assignment with selected date
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      console.log("Setting date from selectedDate:", dateStr);
      setFormData(prev => ({
        ...prev,
        date: dateStr
      }));
    } else {
      // New assignment without selected date - set today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      console.log("Setting today's date:", dateStr);
      setFormData(prev => ({
        ...prev,
        date: dateStr
      }));
    }
  }, [selectedAssignment, selectedDate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    setSelectedDays(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
  };

  // Helper function to get days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Generate proper date range for multiple days selection
  const generateMultipleDays = () => {
    const days = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    
    // Generate next 30 days with proper month handling
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentYear, currentMonth, currentDate + i);
      days.push(date);
    }
    
    return days;
  };

  const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate date range
    if (start > end) {
      throw new Error("Start date must be before end date");
    }
    
    // Check if range is within 30 days
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (daysDiff > 30) {
      throw new Error("Date range cannot exceed 30 days");
    }
    
    while (start <= end) {
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      start.setDate(start.getDate() + 1);
    }
    
    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.driverId || !formData.ambulanceId) {
      alert("Please select both driver and ambulance");
      return;
    }

    setLoading(true);
    try {
      let datesToProcess = [];

      switch (formData.assignmentType) {
        case "single":
          if (!formData.date) {
            alert("Please select a date");
            return;
          }
          datesToProcess = [formData.date];
          break;
          
        case "multiple":
          if (selectedDays.length === 0) {
            alert("Please select at least one day");
            return;
          }
          datesToProcess = selectedDays;
          break;
          
        case "range":
          if (!formData.date || !formData.endDate) {
            alert("Please select both start and end dates");
            return;
          }
          try {
            datesToProcess = generateDateRange(formData.date, formData.endDate);
          } catch (error) {
            alert(error.message);
            return;
          }
          break;
      }

      // Create assignments for each date
      const assignmentsData = datesToProcess.map(date => ({
        date,
        shift: formData.shift,
        driverId: formData.driverId,
        ambulanceId: formData.ambulanceId,
        notes: formData.notes
      }));

      await onSubmit(assignmentsData);
      onCancel();
    } catch (error) {
      console.error("Error creating assignments:", error);
      alert("Failed to create assignments");
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Assignment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleInputChange("assignmentType", "single")}
            className={`p-2 text-xs rounded border ${
              formData.assignmentType === "single"
                ? "bg-blue-100 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            📅 Single Day
          </button>
          <button
            type="button"
            onClick={() => handleInputChange("assignmentType", "multiple")}
            className={`p-2 text-xs rounded border ${
              formData.assignmentType === "multiple"
                ? "bg-blue-100 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            📋 Multiple Days
          </button>
          <button
            type="button"
            onClick={() => handleInputChange("assignmentType", "range")}
            className={`p-2 text-xs rounded border ${
              formData.assignmentType === "range"
                ? "bg-blue-100 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            📊 Date Range
          </button>
        </div>
      </div>

      {/* Date Selection based on type */}
      {formData.assignmentType === "single" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
            min={formatDateForInput(new Date())}
            max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
          />
        </div>
      )}

      {formData.assignmentType === "range" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              required
              min={formatDateForInput(new Date())}
              max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              required
              min={formData.date || formatDateForInput(new Date())}
              max={formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
            />
          </div>
        </div>
      )}

      {formData.assignmentType === "multiple" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Days *
          </label>
          <div className="grid grid-cols-7 gap-1 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
            {generateMultipleDays().map((date, index) => {
              const dateStr = formatDateForInput(date);
              const isSelected = selectedDays.includes(dateStr);
              const isToday = date.toDateString() === new Date().toDateString();
              const monthName = date.toLocaleDateString('en-US', { month: 'short' });
              
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayToggle(date)}
                  className={`p-1 text-xs rounded border ${
                    isSelected
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : isToday
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                  title={`${monthName} ${date.getDate()}, ${date.getFullYear()}`}
                >
                  <div className="text-xs font-medium">{date.getDate()}</div>
                  {index === 0 && (
                    <div className="text-xs text-gray-500">{monthName}</div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedDays.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Selected: {selectedDays.length} day(s)
            </div>
          )}
        </div>
      )}

      {/* Shift Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shift *
        </label>
        <select
          value={formData.shift}
          onChange={(e) => handleInputChange("shift", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          required
        >
          {shifts.map(shift => (
            <option key={shift.value} value={shift.value}>
              {shift.icon} {shift.label}
            </option>
          ))}
        </select>
      </div>

      {/* Driver Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Driver *
        </label>
        <select
          value={formData.driverId}
          onChange={(e) => handleInputChange("driverId", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select Driver</option>
          {getAvailableDrivers().map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name} ({driver.phone})
            </option>
          ))}
        </select>
        {getAvailableDrivers().length === 0 && (
          <p className="text-xs text-red-600 mt-1">
            No drivers available for the selected date and shift
          </p>
        )}
      </div>

      {/* Ambulance Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ambulance *
        </label>
        <select
          value={formData.ambulanceId}
          onChange={(e) => handleInputChange("ambulanceId", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select Ambulance</option>
          {getAvailableAmbulances().map(ambulance => (
            <option key={ambulance.id} value={ambulance.id}>
              {ambulance.vehicleNo} - {ambulance.modelName} ({ambulance.type})
            </option>
          ))}
        </select>
        {getAvailableAmbulances().length === 0 && (
          <p className="text-xs text-red-600 mt-1">
            No ambulances available for the selected date and shift
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any additional notes..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : selectedAssignment ? "Update Assignment" : "Create Assignment"}
        </button>
      </div>
    </form>
  );
}
