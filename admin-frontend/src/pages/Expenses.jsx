// src/pages/Expenses.jsx
import React, { useState, useEffect } from "react";
import client from "../api/client";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "maintenance",
    amount: "",
    currency: "INR",
    date: "",
    vendor: "",
    receiptUrl: "",
    status: "pending"
  });

  const expenseCategories = [
    { value: "maintenance", label: "Vehicle Maintenance", icon: "🔧" },
    { value: "fuel", label: "Fuel & Gas", icon: "⛽" },
    { value: "equipment", label: "Medical Equipment", icon: "🏥" },
    { value: "driver", label: "Driver Expenses", icon: "👨‍💼" },
    { value: "insurance", label: "Insurance", icon: "🛡️" },
    { value: "other", label: "Other Expenses", icon: "📋" }
  ];

  const statusOptions = [
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "approved", label: "Approved", color: "green" },
    { value: "rejected", label: "Rejected", color: "red" }
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await client.get("/admin/expenses");
      setExpenses(response.data.expenses || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await client.patch(`/admin/expenses/${editingExpense.id}`, formData);
      } else {
        await client.post("/admin/expenses", formData);
      }
      
      resetForm();
      fetchExpenses();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save expense");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      description: expense.description || "",
      category: expense.category,
      amount: expense.amount.toString(),
      currency: expense.currency,
      date: expense.date.split('T')[0],
      vendor: expense.vendor || "",
      receiptUrl: expense.receiptUrl || "",
      status: expense.status
    });
    setShowModal(true);
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Are you sure you want to delete ${expense.title}?`)) return;
    
    try {
      await client.delete(`/admin/expenses/${expense.id}`);
      fetchExpenses();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete expense");
    }
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "maintenance",
      amount: "",
      currency: "INR",
      date: "",
      vendor: "",
      receiptUrl: "",
      status: "pending"
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-100";
      case "rejected": return "text-red-600 bg-red-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };

  const getCategoryIcon = (category) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat ? cat.icon : "📋";
  };

  const columns = [
    { key: "title", label: "Title", sortable: true },
    { 
      key: "category", 
      label: "Category", 
      sortable: true,
      filterable: true,
      filterOptions: expenseCategories.map(cat => ({ value: cat.value, label: cat.label })),
      render: (value) => {
        const category = expenseCategories.find(c => c.value === value);
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {category ? category.label : value}
          </span>
        );
      }
    },
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (value, expense) => (
        <div className="text-left">
          <span className="font-semibold text-gray-900">
            ₹{parseFloat(value).toLocaleString()}
          </span>
          <div className="text-xs text-gray-500">{expense.currency}</div>
        </div>
      )
    },
    { key: "date", label: "Date", sortable: true, render: (value) => new Date(value).toLocaleDateString() },
    { key: "vendor", label: "Vendor", render: (value) => value || "-" },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      filterable: true,
      filterOptions: statusOptions.map(s => ({ value: s.value, label: s.label })),
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {statusOptions.find(s => s.value === value)?.label || value}
        </span>
      )
    },
    { 
      key: "createdAt", 
      label: "Created", 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <DataTable
        data={expenses}
        columns={columns}
        loading={loading}
        title="Expenses Management"
        searchPlaceholder="Search expenses..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {expenseCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Vendor
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Receipt URL
            </label>
            <input
              type="url"
              value={formData.receiptUrl}
              onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/receipt.pdf"
            />
          </div>

          {editingExpense && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              {editingExpense ? "Update Expense" : "Create Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
