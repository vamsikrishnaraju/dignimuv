// src/pages/Drivers.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNo: "",
    address: "",
    aadharNo: "",
    status: "available"
  });

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "licenseNo", label: "License No", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: "available", label: "Available" },
        { value: "busy", label: "Busy" },
        { value: "offline", label: "Offline" }
      ],
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "available" ? "bg-green-100 text-green-800" :
          value === "busy" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Added Date", 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data } = await client.get("/admin/drivers");
      setDrivers(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await client.patch(`/admin/drivers/${editingDriver.id}`, formData);
      } else {
        await client.post("/admin/drivers", formData);
      }
      resetForm();
      fetchDrivers();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save driver");
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      licenseNo: driver.licenseNo,
      address: driver.address,
      aadharNo: driver.aadharNo,
      status: driver.status
    });
    setShowModal(true);
  };

  const handleDelete = async (driver) => {
    if (!window.confirm(`Are you sure you want to delete ${driver.name}?`)) return;
    
    try {
      await client.delete(`/admin/drivers/${driver.id}`);
      fetchDrivers();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete driver");
    }
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      licenseNo: "",
      address: "",
      aadharNo: "",
      status: "available"
    });
    setEditingDriver(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <DataTable
        data={drivers}
        columns={columns}
        loading={loading}
        title="Drivers Management"
        searchPlaceholder="Search drivers..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingDriver ? "Edit Driver" : "Add New Driver"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                License No *
              </label>
              <input
                type="text"
                value={formData.licenseNo}
                onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Aadhar No *
              </label>
              <input
                type="text"
                value={formData.aadharNo}
                onChange={(e) => setFormData({ ...formData, aadharNo: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {editingDriver ? "Update" : "Add"} Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
