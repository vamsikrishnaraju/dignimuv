// src/pages/Bookings.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";
import DataTable from "../components/DataTable";
import BookingForm from "../components/BookingForm";
import BookingSummary from "../components/BookingSummary";
import EditBookingForm from "../components/EditBookingForm";
import Modal from "../components/Modal";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeAssignmentModal, setShowChangeAssignmentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingFormData, setBookingFormData] = useState(null);

  const columns = [
    { key: "patientName", label: "Patient", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { 
      key: "fromAddress", 
      label: "From", 
      sortable: false,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: "toAddress", 
      label: "To", 
      sortable: false,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: "fromDate", 
      label: "Date", 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: "time", label: "Time", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "assigned", label: "Assigned" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" }
      ],
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "pending" ? "bg-yellow-100 text-yellow-800" :
          value === "confirmed" ? "bg-blue-100 text-blue-800" :
          value === "assigned" ? "bg-purple-100 text-purple-800" :
          value === "in_progress" ? "bg-orange-100 text-orange-800" :
          value === "completed" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    { 
      key: "assignedAmbulance", 
      label: "Ambulance", 
      sortable: false,
      render: (value) => value ? (
        <div className="text-xs">
          <div className="font-medium">{value.vehicleNo}</div>
          <div className="text-gray-500">{value.modelName}</div>
        </div>
      ) : (
        <span className="text-gray-400 text-xs">Not assigned</span>
      )
    },
    { 
      key: "assignedDriver", 
      label: "Driver", 
      sortable: false,
      render: (value) => value ? (
        <div className="text-xs">
          <div className="font-medium">{value.name}</div>
          <div className="text-gray-500">{value.phone}</div>
        </div>
      ) : (
        <span className="text-gray-400 text-xs">Not assigned</span>
      )
    },
    { 
      key: "createdAt", 
      label: "Created", 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, ambulancesRes, driversRes] = await Promise.all([
        client.get("/admin/bookings"),
        client.get("/admin/ambulances"),
        client.get("/admin/drivers")
      ]);
      
      setBookings(bookingsRes.data);
      setAmbulances(ambulancesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = (formData) => {
    setBookingFormData(formData);
    setShowCreateModal(false);
    setShowSummaryModal(true);
  };

  const handleConfirmBooking = (bookingData) => {
    setBookings(prev => [bookingData, ...prev]);
    setShowSummaryModal(false);
    setBookingFormData(null);
  };

  const handleBackToForm = () => {
    setShowSummaryModal(false);
    setShowCreateModal(true);
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };


  const handleDelete = async (booking) => {
    if (window.confirm(`Are you sure you want to delete the booking for ${booking.patientName}?`)) {
      try {
        await client.delete(`/admin/bookings/${booking.id}`);
        setBookings(prev => prev.filter(b => b.id !== booking.id));
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to delete booking");
      }
    }
  };

  const handleUpdateBooking = (updatedBooking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    setShowEditModal(false);
    setSelectedBooking(null);
  };

  const handleChangeAssignment = (booking) => {
    setSelectedBooking(booking);
    setShowChangeAssignmentModal(true);
  };

  const handleUpdateAssignment = async (ambulanceId, driverId) => {
    try {
      const response = await client.patch(`/admin/bookings/${selectedBooking.id}/assign`, {
        ambulanceId,
        driverId
      });
      
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id ? response.data : b
      ));
      
      setShowChangeAssignmentModal(false);
      setSelectedBooking(null);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update assignment");
    }
  };



  const handleStatusChange = async (booking, newStatus) => {
    try {
      const response = await client.patch(`/admin/bookings/${booking.id}/status`, {
        status: newStatus
      });
      
      setBookings(prev => prev.map(b => 
        b.id === booking.id ? response.data : b
      ));
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Bookings</h1>
        <div className="text-xs text-gray-600">
          Manage patient bookings and ambulance assignments
        </div>
      </div>

      <DataTable
        data={bookings}
        columns={columns}
        loading={loading}
        title="Bookings Management"
        searchPlaceholder="Search bookings..."
        onAdd={() => setShowCreateModal(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        customActions={(booking) => (
          <div className="flex space-x-1">
            {booking.status === "pending" && (
              <button
                onClick={() => handleStatusChange(booking, "confirmed")}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            )}
            {booking.status === "assigned" && (
              <button
                onClick={() => handleStatusChange(booking, "in_progress")}
                className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                Start
              </button>
            )}
            {booking.status === "in_progress" && (
              <button
                onClick={() => handleStatusChange(booking, "completed")}
                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
            )}
            {booking.assignedAmbulance && (
              <button
                onClick={() => handleChangeAssignment(booking)}
                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                title="Change assignment"
              >
                Change
              </button>
            )}
          </div>
        )}
      />

      {/* Create Booking Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Booking"
        size="lg"
      >
        <BookingForm
          onSuccess={handleCreateBooking}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Booking Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setBookingFormData(null);
        }}
        title="Booking Summary"
        size="lg"
      >
        {bookingFormData && (
          <BookingSummary
            bookingData={bookingFormData}
            onConfirm={handleConfirmBooking}
            onBack={handleBackToForm}
            onCancel={() => {
              setShowSummaryModal(false);
              setBookingFormData(null);
            }}
          />
        )}
      </Modal>

      {/* Edit Booking Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBooking(null);
        }}
        title="Edit Booking"
        size="lg"
      >
        {selectedBooking && (
          <EditBookingForm
            booking={selectedBooking}
            onSuccess={handleUpdateBooking}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedBooking(null);
            }}
          />
        )}
      </Modal>

      {/* Change Assignment Modal */}
      <Modal
        isOpen={showChangeAssignmentModal}
        onClose={() => {
          setShowChangeAssignmentModal(false);
          setSelectedBooking(null);
        }}
        title="Change Assignment"
        size="md"
      >
        {selectedBooking && (
          <AssignmentForm
            booking={selectedBooking}
            ambulances={ambulances}
            drivers={drivers}
            onAssign={handleUpdateAssignment}
            onCancel={() => {
              setShowChangeAssignmentModal(false);
              setSelectedBooking(null);
            }}
          />
        )}
      </Modal>

    </div>
  );
}

// Assignment Form Component for changing assignments
function AssignmentForm({ booking, ambulances, drivers, onAssign, onCancel }) {
  const [selectedAmbulance, setSelectedAmbulance] = useState(booking.assignedAmbulance?.id || "");
  const [selectedDriver, setSelectedDriver] = useState(booking.assignedDriver?.id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAmbulance || !selectedDriver) {
      alert("Please select both ambulance and driver");
      return;
    }

    setLoading(true);
    try {
      await onAssign(selectedAmbulance, selectedDriver);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 rounded border">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Booking Details</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Patient:</strong> {booking.patientName}</div>
          <div><strong>Phone:</strong> {booking.phone}</div>
          <div><strong>From:</strong> {booking.fromAddress}</div>
          <div><strong>To:</strong> {booking.toAddress}</div>
          <div><strong>Date:</strong> {new Date(booking.fromDate).toLocaleDateString()}</div>
          <div><strong>Time:</strong> {booking.time}</div>
        </div>
      </div>

      {booking.assignedAmbulance && (
        <div className="p-3 bg-blue-50 rounded border">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Assignment</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Ambulance:</strong> {booking.assignedAmbulance.vehicleNo} - {booking.assignedAmbulance.modelName}</div>
            <div><strong>Driver:</strong> {booking.assignedDriver?.name} ({booking.assignedDriver?.phone})</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Select New Ambulance *
          </label>
          <select
            value={selectedAmbulance}
            onChange={(e) => setSelectedAmbulance(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose ambulance...</option>
            {ambulances
              .filter(ambulance => ambulance.status === "available")
              .map(ambulance => (
                <option key={ambulance.id} value={ambulance.id}>
                  {ambulance.vehicleNo} - {ambulance.modelName} ({ambulance.type})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Select New Driver *
          </label>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose driver...</option>
            {drivers
              .filter(driver => driver.status === "available")
              .map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.phone})
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Updating..." : "Update Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
