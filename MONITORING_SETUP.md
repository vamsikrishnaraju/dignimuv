# Ambulance Monitoring Module Setup

## Overview
The ambulance monitoring module provides real-time tracking of ambulances with Mapbox integration, control room features, and live ride tracking similar to Uber/Ola.

## Features Implemented

### 🗺️ **Real-time Map Visualization**
- **Mapbox Integration**: Interactive map showing all ambulance locations
- **Custom Ambulance Symbols**: Different colors for available vs. on-ride ambulances
- **Live Location Updates**: Real-time position tracking with auto-refresh
- **Route Visualization**: Active ride routes displayed on map like Uber/Ola

### 🚑 **Ambulance Tracking**
- **Location History**: Track ambulance movement over time
- **Status Indicators**: Visual status (available, on-duty, on-ride)
- **Driver Information**: Show assigned driver details
- **Equipment Details**: Display ambulance model and type

### 📊 **Control Room Dashboard**
- **Status Overview**: Fleet utilization, available ambulances, active rides
- **Quick Stats**: Real-time statistics and metrics
- **Auto-refresh**: Configurable refresh intervals (5s, 10s, 30s, 1min)
- **Dual View**: Map view and list view for different monitoring needs

### 🎯 **Active Ride Monitoring**
- **Patient Information**: Name, phone, pickup/destination addresses
- **Route Tracking**: Visual route from pickup to destination
- **Ambulance Assignment**: See which ambulance and driver are assigned
- **Status Updates**: Real-time ride status (assigned, in-progress, completed)

## Setup Instructions

### 1. **Database Schema Updates**
The following models have been added to support location tracking:

```prisma
model Ambulance {
  // ... existing fields
  currentLatitude Float?
  currentLongitude Float?
  lastLocationUpdate DateTime?
  locationHistory AmbulanceLocation[]
}

model AmbulanceLocation {
  id          String    @id @default(uuid())
  ambulanceId String
  latitude    Float
  longitude   Float
  speed       Float?
  heading     Float?
  accuracy    Float?
  timestamp   DateTime  @default(now())
  ambulance   Ambulance @relation(fields: [ambulanceId], references: [id])
}
```

### 2. **Backend API Endpoints**
New monitoring routes added:
- `GET /admin/monitoring/ambulances` - Get all ambulances with locations
- `POST /admin/monitoring/ambulances/:id/location` - Update ambulance location
- `GET /admin/monitoring/ambulances/:id/location-history` - Get location history
- `GET /admin/monitoring/active-rides` - Get active rides with routes
- `GET /admin/monitoring/status-overview` - Get fleet status overview

### 3. **Frontend Components**
- **Monitoring.jsx**: Main monitoring page with map/list views
- **AmbulanceMap.jsx**: Mapbox integration with ambulance markers and routes
- **StatusOverview.jsx**: Control room dashboard with fleet statistics
- **ActiveRidesList.jsx**: List view of active rides with details

### 4. **Mapbox Configuration**
To enable the map functionality, you need to:

1. **Get a Mapbox Token**:
   - Go to https://account.mapbox.com/access-tokens/
   - Create a new token or use an existing one
   - Copy the token

2. **Set Environment Variable**:
   Create a `.env` file in the `admin-frontend` directory:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. **Install Dependencies**:
   ```bash
   cd admin-frontend
   npm install mapbox-gl
   ```

### 5. **Navigation**
The monitoring module has been added to the sidebar navigation with a radar icon.

## Usage

### **Accessing the Module**
1. Navigate to `/dashboard/monitoring` in the admin panel
2. The page loads with real-time ambulance locations

### **Map Features**
- **Ambulance Markers**: Blue circles for available, red for on-ride
- **Click Ambulances**: View details in sidebar
- **Route Lines**: Red lines show active ride routes
- **Pickup/Destination**: Green/red markers for ride endpoints

### **Control Room Features**
- **Auto-refresh**: Toggle automatic data updates
- **Refresh Intervals**: Choose update frequency
- **Status Overview**: Fleet utilization metrics
- **Quick Stats**: Real-time ambulance counts

### **Active Ride Monitoring**
- **Patient Details**: Name, phone, addresses
- **Ambulance Info**: Vehicle number, model, type
- **Driver Info**: Assigned driver details
- **Location Tracking**: Current position and last update

## Technical Implementation

### **Real-time Updates**
- Auto-refresh every 5-60 seconds (configurable)
- Manual refresh button for immediate updates
- Location history tracking for movement analysis

### **Map Integration**
- Mapbox GL JS for interactive maps
- Custom markers with status indicators
- Route visualization for active rides
- Popup information on marker click

### **Data Flow**
1. **Backend**: Stores location data in `AmbulanceLocation` table
2. **API**: Provides real-time data via monitoring endpoints
3. **Frontend**: Displays data on map and in control room dashboard
4. **Updates**: Auto-refresh keeps data current

## Future Enhancements

### **Potential Additions**
- **Geofencing**: Alert when ambulances enter/leave zones
- **Route Optimization**: Suggest optimal routes for assignments
- **Historical Analysis**: Track patterns and performance metrics
- **Mobile App**: Driver app for location updates
- **Notifications**: Real-time alerts for status changes
- **Analytics**: Fleet utilization reports and insights

## Troubleshooting

### **Map Not Loading**
- Check Mapbox token is correctly set in `.env`
- Verify token has proper permissions
- Check browser console for errors

### **No Location Data**
- Ensure ambulances have `currentLatitude` and `currentLongitude` set
- Check if location updates are being sent to the API
- Verify database has location history records

### **Performance Issues**
- Adjust refresh interval if too frequent
- Check database indexes on location fields
- Monitor API response times

The monitoring module provides a comprehensive control room experience for managing ambulance fleets with real-time tracking, just like professional ride-sharing platforms! 🚑📍
