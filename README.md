# 🍴 ForkFit React Native App

A comprehensive fitness and nutrition tracking application built with React Native and Expo.

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm 9+
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### **Package Manager Requirements**
⚠️ **IMPORTANT**: This project uses **npm** as the package manager. Please do not use yarn.

```bash
# ✅ Correct: Use npm
npm install
npm start
npm run android

# ❌ Incorrect: Do not use yarn
yarn install
yarn start
yarn android
```

## 🛠️ Development Setup

### **1. Clone and Install**
```bash
# Clone the repository
git clone <your-repo-url>
cd forkfit-react-native-app

# Install dependencies (npm only)
npm install

# Start the development server
npm start
```

### **2. Available Scripts**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run test       # Run Jest tests
npm run lint       # Run ESLint
npm run reset-project # Reset project configuration
```

### **3. Build Profiles**
The app supports three build environments:

| Environment | Package Name | Purpose |
|-------------|--------------|---------|
| **Development** | `forkfit.app.forkfitdev` | Internal testing & development |
| **Preview** | `forkfit.app.forkfitpreview` | Team testing & QA |
| **Production** | `forkfit.app.forkfitprod` | App store release |

### **4. Building the App**
```bash
# Development build
eas build --profile development --platform android
eas build --profile development --platform ios

#dev build command (does not build a new app on Expo, uses a previous build to rebuild locally, only use if not building native code)
eas build:dev --platform android --profile development

# Preview build
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Production build (restricted access)
eas build --profile production --platform android
eas build --profile production --platform ios
```

## 📱 Platform-Specific Setup

### **Android Development**
```bash
# Ensure Android Studio is installed with:
# - Android SDK
# - Android SDK Platform-Tools
# - Android Emulator

# Start Android emulator or connect device
npm run android
```

### **iOS Development (macOS only)**
```bash
# Ensure Xcode is installed with:
# - iOS Simulator
# - Command Line Tools

# Start iOS simulator or connect device
npm run ios
```

## 🔧 Project Configuration

### **Key Files**
- `app.config.js` - Expo configuration with dynamic bundle IDs
- `eas.json` - EAS Build profiles and configuration
- `android/app/build.gradle` - Android build configuration
- `ios/` - iOS project configuration

### **Environment Variables**
The app automatically detects build profiles:
- `EAS_BUILD_PROFILE=development` → Development build
- `EAS_BUILD_PROFILE=preview` → Preview build
- `EAS_BUILD_PROFILE=production` → Production build

## 🚨 Troubleshooting

### **Build Fails with "invalid config plugin"**
```bash
# Clean and reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

### **Metro Bundler Issues**
```bash
# Clear Metro cache
npm start -- --clear

# Reset Metro cache completely
npm start -- --clear --reset-cache
```

### **Android Build Issues**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Try building again
npm run android
```

### **iOS Build Issues**
```bash
# Clean iOS build
cd ios
xcodebuild clean
cd ..

# Try building again
npm run ios
```

### **Package Manager Conflicts**
```bash
# If you see yarn.lock, remove it
rm yarn.lock

# Ensure you're using npm
npm install
```

## 📚 Project Structure

```
forkfit-react-native-app/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── contexts/               # React Context providers
├── services/               # API and external services
├── utils/                  # Utility functions
├── assets/                 # Images, fonts, etc.
├── android/                # Android native code
├── ios/                    # iOS native code
├── app.config.js           # Expo configuration
├── eas.json               # EAS Build configuration
└── package.json           # Dependencies and scripts
```

## 🔒 Security & Build Notes

### **What You Can Do:**
- ✅ Build development and preview versions
- ✅ Test all app functionality
- ✅ Debug and fix issues
- ✅ Distribute to team members

### **What You Cannot Do:**
- ❌ Create production builds (restricted access)
- ❌ Access production keystores
- ❌ Override production app
- ❌ Submit to app stores

## 📖 Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **EAS Build Documentation**: https://docs.expo.dev/build/introduction/
- **Developer Build Guide**: See `DEVELOPER_BUILD_GUIDE.md`

## 🆘 Need Help?

If you encounter issues:
1. Check this README first
2. Try the troubleshooting steps above
3. Check the `DEVELOPER_BUILD_GUIDE.md`
4. Ask your team lead
5. Check the project's issues or documentation

## 📝 Contributing

1. **Always use npm** - never yarn
2. **Follow the existing code style**
3. **Test your changes** before committing
4. **Update documentation** if needed
5. **Use the correct build profile** for testing

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintained by:** Development Team  
**Package Manager:** npm (required)


## Development flow and branch naming conventions

🌱 Branch Naming Convention
Prefix	Use case	Example
feat/	New features or functionality	feat/onboarding-survey
fix/	Bug fixes, patches	fix/apple-sso-token
chore/	Maintenance tasks (deps, CI, configs, docs)	chore/update-readme
ref/	Refactors (no behavior change)	ref/onboarding-cleanup
hotfix/	Urgent fix directly to main	hotfix/android-crash
🔑 Rules of Thumb

Lowercase, hyphen-separated:
✅ feat/add-payment-api
❌ Feature/AddPaymentAPI

Keep scope clear but short (2–4 words max).
✅ fix/ios-ui-sso
❌ fix/ios-ui-sso-bug-when-clicking-button-in-settings

Branch lifetime: open → PR → merge → delete (ideally < 1 week).

Optional issue ID (if you use GitHub Issues or Jira):
feat/123-add-profile-screen