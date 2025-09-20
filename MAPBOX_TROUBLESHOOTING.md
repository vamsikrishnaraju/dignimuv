# Mapbox Connection Troubleshooting

## Current Status
- ✅ **Token Configured**: `VITE_MAPBOX_TOKEN` is set in `.env`
- ✅ **Token Format**: Valid Mapbox token format
- ✅ **Dependencies**: `mapbox-gl` package installed

## Troubleshooting Steps

### 1. **Test Mapbox Connection**
Navigate to: `http://localhost:3000/dashboard/mapbox-test`

This will show:
- Token status
- Map loading progress
- Any error messages
- Live map display

### 2. **Check Browser Console**
Open browser DevTools (F12) and look for:
- Mapbox initialization logs
- Token validation messages
- Any JavaScript errors
- Network requests to Mapbox API

### 3. **Common Issues & Solutions**

#### **Issue: "Mapbox token not configured properly"**
**Solution**: Check your `.env` file:
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoidmFtc2kwMDA3IiwiYSI6ImNtZnFrcHY3MDBpeWoyaXBtNXZ5OXRycmUifQ.jD2o95-w2mboFI8bkCyhUg
```

#### **Issue: "Map error: Invalid token"**
**Solution**: 
1. Verify token at: https://account.mapbox.com/access-tokens/
2. Check token permissions (needs `styles:read` scope)
3. Ensure token is not expired

#### **Issue: "Network error"**
**Solution**:
1. Check internet connection
2. Verify Mapbox API is accessible
3. Check firewall/proxy settings

#### **Issue: "Container not found"**
**Solution**:
1. Ensure map container div exists
2. Check CSS height/width settings
3. Verify React component mounting

### 4. **Debug Information**

#### **Token Validation**
Your token: `pk.eyJ1IjoidmFtc2kwMDA3IiwiYSI6ImNtZnFrcHY3MDBpeWoyaXBtNXZ5OXRycmUifQ.jD2o95-w2mboFI8bkCyhUg`

#### **Expected Console Output**
```
MapboxTest: Starting map initialization
Token: Present
MapboxTest: Map loaded successfully
```

#### **Expected Map Display**
- Interactive map centered on Bangalore
- Zoom controls
- Street view with roads and buildings
- No error overlays

### 5. **Manual Token Test**
Test your token directly:
```bash
curl "https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=YOUR_TOKEN"
```

### 6. **Alternative Solutions**

#### **If Token is Invalid**
1. Generate new token at: https://account.mapbox.com/access-tokens/
2. Update `.env` file
3. Restart development server

#### **If Map Still Doesn't Load**
1. Try different map style: `mapbox://styles/mapbox/light-v11`
2. Check browser compatibility
3. Disable browser extensions
4. Try incognito mode

### 7. **Monitoring Page Specific**
If test page works but monitoring page doesn't:
1. Check ambulance data loading
2. Verify API endpoints
3. Check console for data errors
4. Ensure backend is running

## Next Steps
1. Visit `/dashboard/mapbox-test` to test connection
2. Check browser console for errors
3. Report specific error messages if issues persist
