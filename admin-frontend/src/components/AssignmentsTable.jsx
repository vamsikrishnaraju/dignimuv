// src/components/AssignmentsTable.jsx
import React, { useState, useMemo } from "react";

export default function AssignmentsTable({ 
  assignments = [], 
  onEdit, 
  onDelete,
  loading = false 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "shift", label: "Shift", sortable: true },
    { key: "ambulance", label: "Ambulance", sortable: true },
    { key: "driver", label: "Driver", sortable: true },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: "scheduled", label: "Scheduled" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" }
      ],
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "scheduled" ? "bg-blue-100 text-blue-800" :
          value === "completed" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          {value}
        </span>
      )
    },
    { key: "notes", label: "Notes", sortable: false }
  ];

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = assignments.filter(item => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableFields = [
          item.ambulance.vehicleNo,
          item.ambulance.modelName,
          item.driver.name,
          item.driver.phone,
          item.shift,
          item.status
        ];
        
        const matchesSearch = searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }

      // Column filters
      for (const [field, filterValue] of Object.entries(filters)) {
        if (filterValue && filterValue !== "all") {
          const itemValue = item[field];
          if (itemValue && !itemValue.toString().toLowerCase().includes(filterValue.toLowerCase())) {
            return false;
          }
        }
      }

      return true;
    });

    // Sort data
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        if (sortField === "ambulance") {
          aVal = a.ambulance.vehicleNo;
          bVal = b.ambulance.vehicleNo;
        } else if (sortField === "driver") {
          aVal = a.driver.name;
          bVal = b.driver.name;
        } else {
          aVal = a[sortField];
          bVal = b[sortField];
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [assignments, searchTerm, sortField, sortDirection, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const getShiftIcon = (shift) => {
    switch (shift) {
      case "morning": return "🌅";
      case "afternoon": return "☀️";
      case "night": return "🌙";
      default: return "⏰";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Assignments List</h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-2 flex flex-wrap gap-2">
          {columns
            .filter(col => col.filterable !== false && col.filterOptions)
            .map(col => (
              <select
                key={col.key}
                value={filters[col.key] || "all"}
                onChange={(e) => handleFilterChange(col.key, e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All {col.label}</option>
                {col.filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortField === col.key && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((assignment, index) => (
              <tr key={assignment.id || index} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  {new Date(assignment.date).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  <div className="flex items-center space-x-1">
                    <span>{getShiftIcon(assignment.shift)}</span>
                    <span className="capitalize">{assignment.shift}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  <div>
                    <div className="font-medium">{assignment.ambulance.vehicleNo}</div>
                    <div className="text-gray-500">{assignment.ambulance.modelName}</div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  <div>
                    <div className="font-medium">{assignment.driver.name}</div>
                    <div className="text-gray-500">{assignment.driver.phone}</div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  {columns.find(col => col.key === "status")?.render ? 
                    columns.find(col => col.key === "status").render(assignment.status) : 
                    assignment.status}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  <div className="max-w-xs truncate" title={assignment.notes}>
                    {assignment.notes || "-"}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(assignment)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(assignment)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-700">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-xs text-gray-700">entries</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 py-1 text-xs border rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
