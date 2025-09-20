// src/components/EditBookingForm.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";
import GoogleMapsSelector from "./GoogleMapsSelector";

export default function EditBookingForm({ booking, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    patientName: booking.patientName || "",
    phone: booking.phone || "",
    fromAddress: booking.fromAddress || "",
    fromLatitude: booking.fromLatitude || null,
    fromLongitude: booking.fromLongitude || null,
    toAddress: booking.toAddress || "",
    toLatitude: booking.toLatitude || null,
    toLongitude: booking.toLongitude || null,
    fromDate: booking.fromDate ? new Date(booking.fromDate).toISOString().split('T')[0] : "",
    toDate: booking.toDate ? new Date(booking.toDate).toISOString().split('T')[0] : "",
    time: booking.time || "",
    notes: booking.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentSection, setShowAssignmentSection] = useState(false);

  useEffect(() => {
    if (formData.fromDate && formData.time) {
      fetchAvailableAssignments();
    }
  }, [formData.fromDate, formData.time]);

  const fetchAvailableAssignments = async () => {
    try {
      const bookingDate = new Date(formData.fromDate);
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
    const shift = getShiftFromTime(formData.time);
    return availableAssignments.filter(assignment => assignment.shift === shift);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressSelect = (type, address, lat, lng) => {
    if (type === "from") {
      setFormData(prev => ({
        ...prev,
        fromAddress: address,
        fromLatitude: lat,
        fromLongitude: lng
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        toAddress: address,
        toLatitude: lat,
        toLongitude: lng
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.fromAddress || !formData.toAddress || !formData.fromDate || !formData.time) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Update the booking
      const response = await client.patch(`/admin/bookings/${booking.id}`, formData);
      let finalBookingData = response.data;
      
      // If a new assignment is selected, update the assignment
      if (selectedAssignment && selectedAssignment.id !== booking.assignedAmbulance?.id) {
        const assignmentResponse = await client.patch(`/admin/bookings/${booking.id}/assign`, {
          ambulanceId: selectedAssignment.ambulanceId,
          driverId: selectedAssignment.driverId
        });
        finalBookingData = assignmentResponse.data;
      }
      
      onSuccess(finalBookingData);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Patient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Patient Name *
          </label>
          <input
            type="text"
            value={formData.patientName}
            onChange={(e) => handleInputChange("patientName", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Pickup Address *
          </label>
          <GoogleMapsSelector
            placeholder="Enter pickup address or use current location"
            onSelect={(address, lat, lng) => handleAddressSelect("from", address, lat, lng)}
            selectedAddress={formData.fromAddress}
            isPickup={true}
            onCurrentLocation={(lat, lng) => handleAddressSelect("from", "", lat, lng)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Destination Address *
          </label>
          <GoogleMapsSelector
            placeholder="Enter destination address"
            onSelect={(address, lat, lng) => handleAddressSelect("to", address, lat, lng)}
            selectedAddress={formData.toAddress}
            isPickup={false}
          />
        </div>
      </div>

      {/* Schedule Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Pickup Date *
          </label>
          <input
            type="date"
            value={formData.fromDate}
            onChange={(e) => handleInputChange("fromDate", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Return Date
          </label>
          <input
            type="date"
            value={formData.toDate}
            onChange={(e) => handleInputChange("toDate", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Time *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange("time", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special requirements or notes..."
        />
      </div>

      {/* Current Assignment Display */}
      {booking.assignedAmbulance && (
        <div className="p-3 bg-blue-50 rounded border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Assignment</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Ambulance:</strong> {booking.assignedAmbulance.vehicleNo} - {booking.assignedAmbulance.modelName}</div>
            <div><strong>Driver:</strong> {booking.assignedDriver?.name} ({booking.assignedDriver?.phone})</div>
          </div>
        </div>
      )}

      {/* Assignment Change Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Change Assignment</h4>
          <button
            type="button"
            onClick={() => setShowAssignmentSection(!showAssignmentSection)}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            {showAssignmentSection ? "Hide" : "Change Assignment"}
          </button>
        </div>

        {showAssignmentSection && (
          <div className="p-3 bg-gray-50 rounded border">
            {getAvailableAssignmentsForTime().length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-600 mb-2">
                  Available assignments for {getShiftLabel(getShiftFromTime(formData.time))}:
                </div>
                
                {getAvailableAssignmentsForTime().map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`p-2 border rounded cursor-pointer transition-colors ${
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
                No available assignments for {getShiftLabel(getShiftFromTime(formData.time))} on {new Date(formData.fromDate).toLocaleDateString()}.
              </div>
            )}
          </div>
        )}
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
          {loading ? "Updating..." : "Update Booking"}
        </button>
      </div>
    </form>
  );
}
