# 🚀 ForkFit Developer Build Guide

## �� **Overview**

This guide explains how to build and test the ForkFit app in different environments. The app supports three build profiles with automatic keystore selection.

## 🎯 **Build Environments**

| Environment | Package Name | Keystore | Purpose |
|-------------|--------------|----------|---------|
| **Development** | `forkfit.app.forkfitdev` | Debug | Internal testing & development |
| **Preview** | `forkfit.app.forkfitpreview` | Debug | Team testing & QA |
| **Production** | `forkfit.app.forkfitprod` | Production | App store release |

## 🛠️ **Building the App**

### **Development Build (Default)**
```bash
# Standard development build
npx expo run:android

# Or explicitly set development profile
EAS_BUILD_PROFILE=development npx expo run:android
```

**What happens:**
- ✅ Uses `forkfit.app.forkfitdev` package name
- ✅ Signs with debug keystore
- ✅ Installs as separate app (won't conflict with production)
- ✅ Full debugging capabilities enabled

### **Preview Build**
```bash
# Preview build for team testing
EAS_BUILD_PROFILE=preview npx expo run:android
```

**What happens:**
- ✅ Uses `forkfit.app.forkfitpreview` package name
- ✅ Signs with debug keystore
- ✅ Installs as separate app
- ✅ Ready for team distribution

### **Production Build**
```bash
# ⚠️ PRODUCTION BUILD - RESTRICTED ACCESS
EAS_BUILD_PROFILE=production npx expo run:android --variant=release
```

**⚠️ Important:** Only authorized team members can create production builds.

## 📋 **Build Commands Reference**

| Command | Environment | Package | Keystore | Use Case |
|---------|-------------|---------|----------|----------|
| `npx expo run:android` | Development | `.forkfitdev` | Debug | Daily development |
| `EAS_BUILD_PROFILE=preview npx expo run:android` | Preview | `.forkfitpreview` | Debug | Team testing |
| `EAS_BUILD_PROFILE=production npx expo run:android --variant=release` | Production | `.forkfitprod` | Production | App store release |

## 🔍 **Verifying Your Build**

### **Check Package Name**
When building, you'll see console output like:
```bash
🔧 Building for profile: development
�� Using package name: forkfit.app.forkfitdev
```

### **Check Installed Apps**
```bash
# List all ForkFit apps on device
adb shell pm list packages | grep forkfit

# Expected output:
# package:forkfit.app.forkfitdev      (development)
# package:forkfit.app.forkfitpreview (preview)
# package:forkfit.app.forkfitprod    (production)
```

## 🚨 **Troubleshooting**

### **Build Fails with "signature mismatch"**
```bash
# Uninstall conflicting app
adb uninstall forkfit.app.forkfitprod

# Try building again
npx expo run:android
```

### **Metro Bundler Issues**
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro cache completely
npx expo start --clear --reset-cache
```

### **Gradle Build Issues**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Try building again
npx expo run:android
```

## 📱 **Testing on Multiple Devices**

### **Android Emulator**
```bash
# Start emulator from Android Studio Device Manager
# Then run your build command
npx expo run:android
```

### **Physical Device**
```bash
# Enable USB debugging on your device
# Connect via USB
# Run build command
npx expo run:android
```

### **Multiple Devices Simultaneously**
```bash
# Start Metro bundler
npx expo start

# Install on multiple devices
# Press 'a' in Metro terminal to install on all connected devices
```

## 🔒 **Security Notes**

### **What You Can Do:**
- ✅ Build development and preview versions
- ✅ Test all app functionality
- ✅ Debug and fix issues
- ✅ Distribute to team members

### **What You Cannot Do:**
- ❌ Create production builds
- ❌ Access production keystore
- ❌ Override production app
- ❌ Submit to app stores

## 📚 **Additional Resources**

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **Android Studio**: For emulator management
- **Team Lead**: For production build access

## �� **Need Help?**

If you encounter issues:
1. Check this guide first
2. Try the troubleshooting steps
3. Ask your team lead
4. Check the project's README.md

---

**Last Updated:** August 2024
**Version:** 1.0
**Maintained by:** Development Team