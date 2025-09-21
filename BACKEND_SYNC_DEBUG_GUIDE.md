# Backend Sync Debugging Implementation

## 🎯 Overview

This guide documents the comprehensive debugging solution implemented to diagnose backend sync issues in the ForkFit mobile app, specifically for TestFlight production builds.

## 🔧 Changes Made

### 1. **Debug Screen Component** (`components/DebugScreen.tsx`)

A comprehensive debugging interface that provides:

- **Build Configuration Display**: Shows API URL, build profile, and current user
- **Firebase User Information**: Displays UID, email, and verification status
- **Token Analysis**: Decodes and validates Firebase ID tokens
- **API Connectivity Testing**: Tests health endpoints
- **Manual Sync Testing**: Simulates the exact user sync API call
- **Debug Information Export**: Logs all debug data to console

**Key Features:**
- Real-time API connectivity testing
- Token validation and expiration checking
- Manual API call simulation with full request/response logging
- Portuguese UI for Brazilian users

### 2. **Enhanced AuthContext Logging** (`contexts/AuthContext.tsx`)

Added comprehensive debug logging throughout the authentication flow:

- **Environment Configuration Logging**: Logs API URL and build profile on startup
- **Enhanced Token Debugging**: Decodes tokens to show claims, expiration, and Firebase project
- **API Call Logging**: Logs request data and API URLs being used
- **Detailed Error Tracking**: Enhanced error messages with context

**Debug Points Added:**
```typescript
// Environment logging on auth state setup
console.log('🌐 DEBUG: Current API URL from Constants:', Constants.expoConfig?.extra?.API_URL);
console.log('🔧 DEBUG: Build Profile from env:', process.env.EAS_BUILD_PROFILE);

// Token debugging with claims analysis
const debugToken = async (firebaseUser: FirebaseAuthTypes.User) => {
  // Decodes token and logs audience, issuer, expiration, etc.
};

// API call debugging
console.log('📤 DEBUG: Sync API call data:', syncData);
console.log('🌐 DEBUG: API URL being used:', Constants.expoConfig?.extra?.API_URL);
```

### 3. **Navigation Integration** (`app/(app)/(tabs)/settings.tsx`)

Added debug screen access through the Settings tab:

- **New Debug Option**: "Debug Backend" option in General section
- **Smart Visibility**: Always visible for TestFlight testing
- **Portuguese Labels**: "Diagnosticar problemas de conectividade"
- **Easy Access**: Single tap to open debug interface

### 4. **Debug Route** (`app/(app)/debug.tsx`)

Simple route wrapper for the debug screen component.

## 🚀 How to Use for TestFlight Testing

### **Step 1: Access Debug Screen**
1. Open the app in TestFlight
2. Go to **Settings** tab
3. Scroll to **General** section
4. Tap **"Debug Backend"**

### **Step 2: Run Diagnostics**
1. **Check Build Configuration**: Verify API URL and build profile
2. **Debug Token**: Tap to analyze Firebase token
3. **Test API Connectivity**: Check if backend is reachable
4. **Test Manual Sync**: Simulate the exact sync call that's failing

### **Step 3: Collect Debug Information**
1. Tap **"Copy All Debug Info"** to log complete diagnostic data
2. Check device console/logs for detailed output
3. Share relevant debug information with development team

## 🔍 What Each Test Reveals

### **API URL Configuration**
- **Expected**: `https://api.forkfit.app/api` for production builds
- **If Wrong**: Environment variables not properly configured

### **Token Analysis**
- **Audience**: Should match Firebase project ID
- **Issuer**: Should be `https://securetoken.google.com/[project-id]`
- **Expiration**: Should be valid (not expired)
- **Firebase Project**: Should match production project

### **API Connectivity**
- **Status 200**: Backend is reachable
- **Connection Error**: Network/DNS issues
- **SSL Error**: Certificate problems

### **Manual Sync Test**
- **Status 200**: Sync endpoint working
- **Status 401**: Authentication/token issues
- **Status 404**: Endpoint not found
- **Status 500**: Backend server error

## 🚨 Common Issues & Solutions

### **Issue: API URL is undefined or wrong**
**Cause**: Environment variables not properly set in EAS build
**Solution**: Check `eas.json` production profile environment variables

### **Issue: Token decode fails**
**Cause**: Invalid or corrupted Firebase token
**Solution**: Check Firebase project configuration and user authentication state

### **Issue: API connectivity fails**
**Cause**: Network issues or backend downtime
**Solution**: Verify backend status and network connectivity

### **Issue: Manual sync returns 401**
**Cause**: Token authentication failure
**Solution**: Check Firebase project configuration and token validity

### **Issue: Manual sync returns 404**
**Cause**: API endpoint not found
**Solution**: Verify backend deployment and endpoint configuration

## 📱 Production Considerations

### **Security**
- Debug screen is safe for production as it only displays diagnostic information
- No sensitive data is exposed beyond what's already available to authenticated users
- All API calls use proper authentication tokens

### **Performance**
- Debug functions only run when manually triggered
- No impact on normal app performance
- Minimal memory footprint

### **User Experience**
- Debug option is clearly labeled and positioned appropriately
- Portuguese interface maintains app consistency
- Easy to access but not intrusive

## 🔄 Next Steps

After gathering debug information:

1. **Analyze API URL**: Ensure production builds use correct endpoint
2. **Verify Token Claims**: Check Firebase project configuration
3. **Test Backend Endpoints**: Verify backend deployment status
4. **Check Environment Variables**: Ensure EAS build configuration is correct
5. **Review Backend Logs**: Check for incoming requests and errors

## 🛠️ Temporary vs Permanent

This debug implementation is designed to be:
- **Safe for production**: No security or performance risks
- **Easily removable**: Can be hidden or removed after debugging
- **Comprehensive**: Covers all potential failure points
- **User-friendly**: Clear interface and Portuguese labels

The debug screen can remain in the app permanently as a diagnostic tool or be removed once the backend sync issues are resolved.
