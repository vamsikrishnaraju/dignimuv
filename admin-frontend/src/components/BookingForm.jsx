// src/components/BookingForm.jsx
import React, { useState } from "react";
import client from "../api/client";
import GoogleMapsSelector from "./GoogleMapsSelector";

export default function BookingForm({ onSuccess, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Contact Info
    patientName: "",
    phone: "",
    otp: "",
    
    // Step 2: Address Info
    fromAddress: "",
    fromLatitude: null,
    fromLongitude: null,
    toAddress: "",
    toLatitude: null,
    toLongitude: null,
    
    // Step 3: Date & Time
    fromDate: "",
    toDate: "",
    time: "",
    notes: ""
  });

  const steps = [
    { number: 1, title: "Contact Info", description: "Patient details & phone verification" },
    { number: 2, title: "Address", description: "Pickup & destination locations" },
    { number: 3, title: "Schedule", description: "Date, time & additional notes" }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const sendOTP = async () => {
    if (!formData.phone) {
      setError("Phone number is required");
      return;
    }

    try {
      setLoading(true);
      const response = await client.post("/otp/send", { phone: formData.phone });
      setOtpSent(true);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp) {
      setError("OTP is required");
      return;
    }

    try {
      setLoading(true);
      await client.post("/otp/verify", { 
        phone: formData.phone, 
        otp: formData.otp 
      });
      setPhoneVerified(true);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = () => {
    if (!formData.patientName || !formData.fromAddress || !formData.toAddress || !formData.fromDate || !formData.time) {
      setError("Please fill in all required fields");
      return;
    }

    // Go to summary page instead of directly creating booking
    onSuccess(formData);
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.patientName || !phoneVerified)) {
      setError("Please complete patient name and phone verification");
      return;
    }
    if (currentStep === 2 && (!formData.fromAddress || !formData.toAddress)) {
      setError("Please select both pickup and destination addresses");
      return;
    }
    setCurrentStep(prev => prev + 1);
    setError("");
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError("");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                currentStep >= step.number 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-600"
              }`}>
                {step.number}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="text-xs font-medium text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Contact Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Patient Information</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Patient Name *
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter patient's full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone Number *
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
                disabled={phoneVerified}
              />
              {!phoneVerified && (
                <button
                  onClick={sendOTP}
                  disabled={loading || !formData.phone}
                  className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              )}
            </div>
          </div>

          {otpSent && !phoneVerified && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Enter OTP *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => handleInputChange("otp", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
                <button
                  onClick={verifyOTP}
                  disabled={loading || !formData.otp}
                  className="px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          )}

          {phoneVerified && (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              ✓ Phone number verified successfully
            </div>
          )}
        </div>
      )}

      {/* Step 2: Address Selection */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Address Information</h3>
          
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
      )}

      {/* Step 3: Date & Time */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Schedule & Notes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pickup Date *
              </label>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => handleInputChange("fromDate", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pickup Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Return Date (Optional)
            </label>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => handleInputChange("toDate", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              min={formData.fromDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

