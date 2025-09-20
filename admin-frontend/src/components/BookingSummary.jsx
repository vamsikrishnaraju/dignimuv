// src/components/BookingSummary.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";

export default function BookingSummary({ bookingData, onConfirm, onBack, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchAvailableAssignments();
  }, [bookingData.fromDate]);

  const fetchAvailableAssignments = async () => {
    try {
      const bookingDate = new Date(bookingData.fromDate);
      const dateStr = bookingDate.toISOString().split('T')[0];
      
      // Get assignments for the booking date
      const response = await client.get(`/admin/assignments?startDate=${dateStr}&endDate=${dateStr}`);
      setAvailableAssignments(response.data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  const getShiftFromTime = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 14) return "morning";
    if (hour >= 14 && hour < 22) return "afternoon";
    return "night";
  };

  const getShiftLabel = (shift) => {
    switch (shift) {
      case "morning": return "🌅 Morning (6 AM - 2 PM)";
      case "afternoon": return "☀️ Afternoon (2 PM - 10 PM)";
      case "night": return "🌙 Night (10 PM - 6 AM)";
      default: return shift;
    }
  };

  const getAvailableAssignmentsForTime = () => {
    const shift = getShiftFromTime(bookingData.time);
    return availableAssignments.filter(assignment => assignment.shift === shift);
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      
      // Create the booking
      const bookingResponse = await client.post("/bookings", bookingData);
      let finalBookingData = bookingResponse.data;
      
      // If assignment is selected, assign it to the booking
      if (selectedAssignment) {
        const assignmentResponse = await client.patch(`/admin/bookings/${bookingResponse.data.id}/assign`, {
          ambulanceId: selectedAssignment.ambulanceId,
          driverId: selectedAssignment.driverId
        });
        // Use the updated booking data that includes assignment information
        finalBookingData = assignmentResponse.data;
      }
      
      onConfirm(finalBookingData);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const availableAssignmentsForTime = getAvailableAssignmentsForTime();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h2>
        <p className="text-sm text-gray-600">Review your booking details and confirm</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Booking Details */}
      <div className="space-y-4 mb-6">
        {/* Patient Information */}
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div><strong>Name:</strong> {bookingData.patientName}</div>
            <div><strong>Phone:</strong> {bookingData.phone}</div>
            <div className="md:col-span-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Phone Verified
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Address Information</h3>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Pickup:</strong> {bookingData.fromAddress}
            </div>
            <div>
              <strong>Destination:</strong> {bookingData.toAddress}
            </div>
            {bookingData.fromLatitude && bookingData.fromLongitude && (
              <div className="text-gray-500">
                Coordinates: {bookingData.fromLatitude.toFixed(6)}, {bookingData.fromLongitude.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Information */}
        <div className="p-3 bg-gray-50 rounded border">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Schedule Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div><strong>Date:</strong> {new Date(bookingData.fromDate).toLocaleDateString()}</div>
            <div><strong>Time:</strong> {bookingData.time}</div>
            {bookingData.toDate && (
              <div><strong>Return Date:</strong> {new Date(bookingData.toDate).toLocaleDateString()}</div>
            )}
            <div><strong>Shift:</strong> {getShiftLabel(getShiftFromTime(bookingData.time))}</div>
          </div>
        </div>

        {/* Notes */}
        {bookingData.notes && (
          <div className="p-3 bg-gray-50 rounded border">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h3>
            <p className="text-xs text-gray-700">{bookingData.notes}</p>
          </div>
        )}
      </div>

      {/* Assignment Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Available Assignments</h3>
        
        {availableAssignmentsForTime.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">
              Select an available ambulance and driver for {getShiftLabel(getShiftFromTime(bookingData.time))}:
            </div>
            
            {availableAssignmentsForTime.map((assignment) => (
              <div
                key={assignment.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedAssignment?.id === assignment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.ambulance.vehicleNo} - {assignment.ambulance.modelName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Driver: {assignment.driver.name} ({assignment.driver.phone})
                    </div>
                    <div className="text-xs text-gray-500">
                      Type: {assignment.ambulance.type}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {selectedAssignment?.id === assignment.id && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            No available assignments for {getShiftLabel(getShiftFromTime(bookingData.time))} on {new Date(bookingData.fromDate).toLocaleDateString()}.
            <br />
            The booking will be created without assignment and can be assigned later by admin.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <button
          onClick={handleConfirmBooking}
          disabled={loading}
          className="px-6 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
