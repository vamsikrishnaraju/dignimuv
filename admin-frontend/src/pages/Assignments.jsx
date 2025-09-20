// src/pages/Assignments.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";
import Calendar from "../components/Calendar";
import AssignmentsTable from "../components/AssignmentsTable";
import AssignmentForm from "../components/AssignmentForm";
import Modal from "../components/Modal";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "table"
  const [selectedAmbulance, setSelectedAmbulance] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const shifts = [
    { value: "morning", label: "Morning (6 AM - 2 PM)", icon: "🌅" },
    { value: "afternoon", label: "Afternoon (2 PM - 10 PM)", icon: "☀️" },
    { value: "night", label: "Night (10 PM - 6 AM)", icon: "🌙" }
  ];



  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAmbulance) {
      const filtered = assignments.filter(assignment => 
        assignment.ambulanceId === selectedAmbulance
      );
      setFilteredAssignments(filtered);
    } else {
      setFilteredAssignments(assignments);
    }
  }, [selectedAmbulance, assignments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, ambulancesRes, driversRes] = await Promise.all([
        client.get("/admin/assignments"),
        client.get("/admin/ambulances"),
        client.get("/admin/drivers")
      ]);
      
      setAssignments(assignmentsRes.data);
      setAmbulances(ambulancesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedAssignment(null);
    setShowModal(true);
  };

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedDate(null);
    setShowModal(true);
  };

  const handleSubmit = async (assignmentData) => {
    try {
      if (selectedAssignment) {
        // Update existing assignment - single assignment data
        await client.patch(`/admin/assignments/${selectedAssignment.id}`, assignmentData);
        resetForm();
      } else {
        // Create new assignment(s) - could be single or multiple
        if (Array.isArray(assignmentData)) {
          // Multiple assignments
          const promises = assignmentData.map(data => client.post("/admin/assignments", data));
          await Promise.all(promises);
        } else {
          // Single assignment
          await client.post("/admin/assignments", assignmentData);
        }
        resetForm();
      }
      
      fetchData();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err?.response?.data?.error || "Failed to save assignment");
      throw err; // Re-throw to let AssignmentForm handle the error
    }
  };

  const handleDelete = async () => {
    if (!selectedAssignment) return;
    
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await client.delete(`/admin/assignments/${selectedAssignment.id}`);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete assignment");
    }
  };

  const resetForm = () => {
    setSelectedAssignment(null);
    setSelectedDate(null);
    setShowModal(false);
  };

  const getAssignmentsForSelectedDate = () => {
    if (!selectedDate) return [];
    // Create a date string in YYYY-MM-DD format using local timezone
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return assignments.filter(assignment => 
      assignment.date.startsWith(dateStr)
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
        <div className="text-xs text-gray-600">
          Manage ambulance-driver assignments for the next 30 days
        </div>
      </div>

      {/* View Mode Toggle and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left Section - View Mode Toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 text-xs rounded ${
                  viewMode === "calendar" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs rounded ${
                  viewMode === "table" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
          
          {/* Center Section - Filter */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Filter by Ambulance:</label>
              <select
                value={selectedAmbulance}
                onChange={(e) => setSelectedAmbulance(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent min-w-0"
              >
                <option value="">All Ambulances</option>
                {ambulances.map(ambulance => (
                  <option key={ambulance.id} value={ambulance.id}>
                    {ambulance.vehicleNo} - {ambulance.modelName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Right Section - Add Button */}
          <div className="flex justify-center lg:justify-end">
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedAssignment(null);
                setShowModal(true);
              }}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              + Add Assignment
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <Calendar
              assignments={filteredAssignments}
              ambulances={ambulances}
              drivers={drivers}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onAssignmentClick={handleAssignmentClick}
            />
          </div>
          
          {/* Selected Date Details - Compact */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-2">
                {shifts.map(shift => {
                  const shiftAssignments = getAssignmentsForSelectedDate().filter(
                    assignment => assignment.shift === shift.value
                  );
                  
                  return (
                    <div key={shift.value} className="border border-gray-200 rounded p-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-sm">{shift.icon}</span>
                        <h4 className="text-xs font-medium text-gray-900">{shift.label.split(' ')[0]}</h4>
                      </div>
                      
                      <div className="space-y-1">
                        {shiftAssignments.length > 0 ? (
                          shiftAssignments.map(assignment => (
                            <div
                              key={assignment.id}
                              className="p-1.5 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleAssignmentClick(assignment)}
                            >
                              <div className="text-xs font-medium text-gray-900">
                                {assignment.ambulance.vehicleNo}
                              </div>
                              <div className="text-xs text-gray-600">
                                {assignment.driver.name}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500 text-center py-1">
                            No assignments
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <AssignmentsTable
          assignments={filteredAssignments}
          onEdit={handleAssignmentClick}
          onDelete={handleDelete}
          loading={loading}
        />
      )}


      {/* Assignment Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={selectedAssignment ? "Edit Assignment" : "Create Assignment"}
        size="lg"
      >
        <AssignmentForm
          selectedDate={selectedDate}
          selectedAssignment={selectedAssignment}
          ambulances={ambulances}
          drivers={drivers}
          assignments={assignments}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </Modal>
    </div>
  );
}
