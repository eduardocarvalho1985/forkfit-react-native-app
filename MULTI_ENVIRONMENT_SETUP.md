# ForkFit Multi-Environment Setup Guide

This document explains how to configure and use the multi-environment architecture for the ForkFit mobile app.

## 🏗️ Architecture Overview

The ForkFit app uses a dual environment approach:

| Component | Development/Preview | Production |
|-----------|-------------------|------------|
| **Build Profiles** | `development`, `preview` | `production` |
| **Firebase Project** | ForkFit Dev | ForkFit Prod |
| **Backend API** | forkfit-api-dev (Replit) | forkfit-api-prod (Replit) |
| **API URLs** | Managed via `API_URL_DEV` secret | Managed via `API_URL_PROD` secret |

## 🔧 EAS Secrets Configuration

### Required Secrets

You need to configure the following EAS secrets for your project:

```bash
# Development/Preview Environment API URL
API_URL_DEV=https://your-dev-repl-url.replit.app/api

# Production Environment API URL  
API_URL_PROD=https://forkfit.app/api
```

### Setting Up EAS Secrets

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to EAS**:
   ```bash
   eas login
   ```

3. **Configure the secrets**:
   ```bash
   # Set development API URL
   eas secret:create --scope project --name API_URL_DEV --value "https://your-dev-repl-url.replit.app/api"
   
   # Set production API URL
   eas secret:create --scope project --name API_URL_PROD --value "https://forkfit.app/api"
   ```

4. **Verify secrets are set**:
   ```bash
   eas secret:list --scope project
   ```

## 🚀 Build Commands

### Development Build
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Preview Build (TestFlight/Internal Testing)
```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Production Build (App Store/Google Play)
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## 🔍 How It Works

### Build-Time Configuration

The `app.config.js` file automatically selects the correct API URL based on the build profile:

```javascript
const getApiUrl = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  
  if (profile === 'development') {
    return process.env.API_URL_DEV || 'https://forkfit-api-dev.replit.app/api';
  } else if (profile === 'preview') {
    return process.env.API_URL_DEV || 'https://forkfit-api-dev.replit.app/api';
  } else {
    return process.env.API_URL_PROD || 'https://forkfit.app/api';
  }
};
```

### Runtime Configuration

The API service (`services/api.ts`) dynamically reads the URL at runtime:

```javascript
private getBaseUrl(): string {
  const Constants = require('expo-constants').default;
  const apiUrl = Constants.expoConfig?.extra?.API_URL;
  return apiUrl || "https://forkfit.app/api"; // Fallback
}
```

## 🧪 Testing the Setup

### Verify Environment Selection

1. **Check build logs** for the selected API URL:
   ```
   🌐 API URL for development profile: https://your-dev-repl-url.replit.app/api
   ```

2. **Check runtime logs** in the app:
   ```
   🌐 Using dynamic API URL: https://your-dev-repl-url.replit.app/api
   ```

### Test API Connectivity

The app will automatically connect to the correct backend based on the build profile. You can verify this by:

1. **Development builds** should connect to your dev Replit backend
2. **Preview builds** should also connect to your dev Replit backend  
3. **Production builds** should connect to the production backend

## 🔄 Fallback Behavior

If EAS secrets are not configured, the system will fall back to:

- **Development/Preview**: `https://forkfit-api-dev.replit.app/api`
- **Production**: `https://forkfit.app/api`

## 📝 Important Notes

1. **Preview builds use DEV environment**: This allows testing with dev data before production deployment
2. **Secrets are project-scoped**: Each project has its own set of secrets
3. **Fallback URLs**: Always provide fallback URLs for development/testing
4. **No APIv1 changes**: The `apiV1.ts` service remains unchanged as requested

## 🚨 Troubleshooting

### Common Issues

1. **"Dynamic API URL not found" warning**:
   - Check if EAS secrets are properly configured
   - Verify the secret names match exactly: `API_URL_DEV` and `API_URL_PROD`

2. **API calls failing**:
   - Verify the backend URLs in your EAS secrets are correct and accessible
   - Check if the Replit backends are running

3. **Wrong environment being used**:
   - Verify the build profile is correct in your `eas build` command
   - Check the build logs for the selected profile

### Debug Commands

```bash
# Check current secrets
eas secret:list --scope project

# Update a secret
eas secret:create --scope project --name API_URL_DEV --value "new-url"

# Delete a secret (if needed)
eas secret:delete --scope project --name API_URL_DEV
```

## 🎯 Next Steps

1. **Set up your Replit backends** for dev and prod environments
2. **Configure EAS secrets** with the correct URLs
3. **Test builds** with each profile to verify connectivity
4. **Update documentation** with your actual backend URLs

---

**Last Updated**: January 2025  
**Version**: 1.0
