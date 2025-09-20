import React, { useState, useEffect } from "react";
import AmbulanceMap from "../components/AmbulanceMap";
import client from "../api/client";

export default function Monitoring() {
  const [ambulances, setAmbulances] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
  const [statusOverview, setStatusOverview] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ambulancesRes, activeRidesRes, statusRes] = await Promise.all([
        client.get("/admin/monitoring/ambulances"),
        client.get("/admin/monitoring/active-rides"),
        client.get("/admin/monitoring/status-overview")
      ]);

      setAmbulances(ambulancesRes.data);
      setActiveRides(activeRidesRes.data);
      setStatusOverview(statusRes.data);
    } catch (err) {
      console.error("Error fetching monitoring data:", err);
      setError("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading ambulance locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={fetchMonitoringData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ambulance Monitoring</h1>
        <p className="text-gray-600">Real-time tracking of ambulance locations and status</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Ambulances</p>
              <p className="text-2xl font-semibold text-gray-900">{statusOverview.totalAmbulances || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-2xl font-semibold text-gray-900">{statusOverview.availableAmbulances || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">On Duty</p>
              <p className="text-2xl font-semibold text-gray-900">{statusOverview.onDutyAmbulances || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Rides</p>
              <p className="text-2xl font-semibold text-gray-900">{statusOverview.activeRides || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ambulance Locations</h2>
        <AmbulanceMap ambulances={ambulances} activeRides={activeRides} />
      </div>

      {/* Ambulance List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ambulance Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Model</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Driver</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ambulances.map((ambulance) => (
                <tr key={ambulance.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{ambulance.vehicleNo}</td>
                  <td className="px-4 py-3 text-gray-600">{ambulance.modelName}</td>
                  <td className="px-4 py-3 text-gray-600">{ambulance.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ambulance.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : ambulance.status === 'on_duty'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ambulance.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ambulance.assignments && ambulance.assignments.length > 0 
                      ? ambulance.assignments[0].driver?.name || 'Unassigned'
                      : 'Unassigned'
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ambulance.lastLocationUpdate 
                      ? new Date(ambulance.lastLocationUpdate).toLocaleString()
                      : 'Never'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
