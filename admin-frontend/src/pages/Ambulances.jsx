// src/pages/Ambulances.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function Ambulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState(null);

  const [formData, setFormData] = useState({
    modelName: "",
    type: "",
    vehicleNo: "",
    equipmentDetails: "",
    status: "available"
  });

  const columns = [
    { key: "modelName", label: "Model", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "vehicleNo", label: "Vehicle No", sortable: true },
    { 
      key: "equipmentDetails", 
      label: "Equipment", 
      sortable: false,
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: "available", label: "Available" },
        { value: "in_use", label: "In Use" },
        { value: "maintenance", label: "Maintenance" },
        { value: "out_of_service", label: "Out of Service" }
      ],
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "available" ? "bg-green-100 text-green-800" :
          value === "in_use" ? "bg-red-100 text-red-800" :
          value === "maintenance" ? "bg-yellow-100 text-yellow-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value.replace('_', ' ')}
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
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const { data } = await client.get("/admin/ambulances");
      setAmbulances(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch ambulances");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAmbulance) {
        await client.patch(`/admin/ambulances/${editingAmbulance.id}`, formData);
      } else {
        await client.post("/admin/ambulances", formData);
      }
      resetForm();
      fetchAmbulances();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save ambulance");
    }
  };

  const handleEdit = (ambulance) => {
    setEditingAmbulance(ambulance);
    setFormData({
      modelName: ambulance.modelName,
      type: ambulance.type,
      vehicleNo: ambulance.vehicleNo,
      equipmentDetails: ambulance.equipmentDetails,
      status: ambulance.status
    });
    setShowModal(true);
  };

  const handleDelete = async (ambulance) => {
    if (!window.confirm(`Are you sure you want to delete ${ambulance.vehicleNo}?`)) return;
    
    try {
      await client.delete(`/admin/ambulances/${ambulance.id}`);
      fetchAmbulances();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete ambulance");
    }
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      modelName: "",
      type: "",
      vehicleNo: "",
      equipmentDetails: "",
      status: "available"
    });
    setEditingAmbulance(null);
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
        data={ambulances}
        columns={columns}
        loading={loading}
        title="Ambulances Management"
        searchPlaceholder="Search ambulances..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingAmbulance ? "Edit Ambulance" : "Add New Ambulance"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Model Name *
              </label>
              <input
                type="text"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Tata Winger"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Type</option>
                <option value="Basic Life Support">Basic Life Support</option>
                <option value="Advanced Life Support">Advanced Life Support</option>
                <option value="Critical Care">Critical Care</option>
                <option value="Neonatal">Neonatal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vehicle No *
              </label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., KA01AB0001"
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
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Equipment Details *
              </label>
              <textarea
                value={formData.equipmentDetails}
                onChange={(e) => setFormData({ ...formData, equipmentDetails: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Oxygen cylinder, First aid kit, Stretcher, Basic monitoring equipment"
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
              {editingAmbulance ? "Update" : "Add"} Ambulance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
