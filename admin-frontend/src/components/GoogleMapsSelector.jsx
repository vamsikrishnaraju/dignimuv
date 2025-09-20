// src/components/GoogleMapsSelector.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDrEWRzmwe2Vmhb1d99lk88xgHcRHIFHG8";

// Debounce function for search optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function GoogleMapsSelector({ 
  placeholder, 
  onSelect, 
  selectedAddress, 
  isPickup = false,
  onCurrentLocation 
}) {
  const [searchTerm, setSearchTerm] = useState(selectedAddress || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, []);

  // Auto-detect current location for both pickup and destination when map is ready
  useEffect(() => {
    if (map && !selectedAddress && !searchTerm) {
      getCurrentLocation();
    }
  }, [map, selectedAddress, searchTerm]);

  const initializeMap = useCallback(() => {
    if (window.google && mapRef.current) {
      // Default to current location or fallback to Bangalore
      const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Bangalore coordinates as fallback
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      setMap(mapInstance);
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setPlacesService(new window.google.maps.places.PlacesService(mapInstance));

      // Add click listener to map
      mapInstance.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        reverseGeocode(lat, lng);
      });
    }
  }, [isPickup, selectedAddress]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Update map center
          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }
          
          // Reverse geocode to get address
          reverseGeocode(lat, lng);
          
          if (onCurrentLocation) {
            onCurrentLocation(lat, lng);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          setLoading(false);
        }
      );
    }
  };

  const reverseGeocode = useCallback((lat, lng) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setSearchTerm(address);
          setSuggestions([]);
          
          // Update marker
          if (map) {
            if (marker) {
              marker.setMap(null);
            }
            const newMarker = new window.google.maps.Marker({
              position: { lat, lng },
              map: map,
              title: address
            });
            setMarker(newMarker);
          }
          
          onSelect(address, lat, lng);
        }
        setLoading(false);
      });
    }
  }, [map, marker, onSelect]);

  // Debounced search function for better performance
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      if (autocompleteService) {
        setLoading(true);
        autocompleteService.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'in' }, // Restrict to India
            types: ['address']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
            } else {
              setSuggestions([]);
            }
            setLoading(false);
          }
        );
      }
    }, 300), // 300ms debounce
    [autocompleteService]
  );

  const handleSearch = (query) => {
    debouncedSearch(query);
  };

  const handleSelect = (prediction) => {
    if (placesService) {
      placesService.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['formatted_address', 'geometry']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const address = place.formatted_address;
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            setSearchTerm(address);
            setSuggestions([]);
            
            // Update map
            if (map) {
              map.setCenter({ lat, lng });
              map.setZoom(15);
              
              if (marker) {
                marker.setMap(null);
              }
              const newMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: address
              });
              setMarker(newMarker);
            }
            
            onSelect(address, lat, lng);
          }
        }
      );
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        
        {/* Current Location Button */}
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="absolute inset-y-0 right-0 pr-2 flex items-center text-blue-600 hover:text-blue-800"
          title="Use current location"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                <div className="text-gray-500 text-xs">{suggestion.structured_formatting.secondary_text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Map */}
      <div className="w-full h-48 border border-gray-300 rounded" ref={mapRef}></div>
      
      {/* Selected Location Info */}
      {(selectedAddress || searchTerm) && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="font-medium">Selected Location:</div>
          <div className="truncate">{selectedAddress || searchTerm}</div>
        </div>
      )}
    </div>
  );
}
