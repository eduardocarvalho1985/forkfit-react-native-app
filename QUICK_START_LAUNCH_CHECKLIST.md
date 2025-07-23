# Quick Start Launch Checklist

## 🚀 Immediate Action Items (This Week)

### 1. Developer Accounts Setup
- [ ] **Apple Developer Account** ($99/year)
  - [ ] Go to https://developer.apple.com
  - [ ] Enroll in Apple Developer Program
  - [ ] Complete account verification
  - [ ] Set up payment information

- [ ] **Google Play Developer Account** ($25 one-time)
  - [ ] Go to https://play.google.com/console
  - [ ] Create Google Play Developer account
  - [ ] Complete account verification
  - [ ] Set up payment information

### 2. App Store Connect Setup
- [ ] **iOS App Store Connect**
  - [ ] Login to https://appstoreconnect.apple.com
  - [ ] Click "My Apps" → "+" → "New App"
  - [ ] Fill basic information:
    - Name: "ForkFit - Nutrição Inteligente"
    - Bundle ID: (from your app.json)
    - SKU: "forkfit-ios"
    - User Access: "Full Access"

- [ ] **Google Play Console**
  - [ ] Login to https://play.google.com/console
  - [ ] Click "Create app"
  - [ ] Fill basic information:
    - App name: "ForkFit - Nutrição Inteligente"
    - Default language: Portuguese (Brazil)
    - App or game: App
    - Free or paid: Free

### 3. App Configuration Updates
- [ ] **Update app.json for Production**
```json
{
  "expo": {
    "name": "ForkFit - Nutrição Inteligente",
    "slug": "forkfit",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FF725E"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.forkfit.app",
      "buildNumber": "1",
      "infoPlist": {
        "CFBundleDisplayName": "ForkFit"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF725E"
      },
      "package": "com.forkfit.app",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

### 4. Essential Assets Creation
- [ ] **App Icon** (1024x1024 PNG)
  - [ ] Create high-quality ForkFit icon
  - [ ] Test on different backgrounds
  - [ ] Ensure visibility at small sizes

- [ ] **Screenshots** (Required for both stores)
  - [ ] **iOS Screenshots** (6.7" iPhone 14 Pro Max)
    - [ ] Onboarding screen
    - [ ] Dashboard with progress rings
    - [ ] Food logging interface
    - [ ] Progress tab with streak
    - [ ] Profile screen
  - [ ] **Android Screenshots** (Pixel 7 Pro)
    - [ ] Same screens as iOS

### 5. Privacy Policy & Legal
- [ ] **Privacy Policy** (Required)
  - [ ] Create privacy policy document
  - [ ] Host at https://forkfit.app/privacy
  - [ ] Include data collection, usage, and user rights
  - [ ] Ensure LGPD compliance

- [ ] **Terms of Service** (Recommended)
  - [ ] Create terms of service
  - [ ] Host at https://forkfit.app/terms

### 6. Testing Priority
- [ ] **Critical Path Testing**
  - [ ] Complete user registration flow
  - [ ] Test food logging functionality
  - [ ] Verify weight tracking persistence
  - [ ] Test streak functionality
  - [ ] Verify all screens load correctly

- [ ] **Device Testing**
  - [ ] Test on iPhone (latest iOS)
  - [ ] Test on Android (latest version)
  - [ ] Test on older devices if possible

## 📋 Week 1 Goals

### Day 1-2: Setup
- [ ] Complete developer account setup
- [ ] Create app store listings
- [ ] Update app configuration

### Day 3-4: Assets
- [ ] Create app icon
- [ ] Take screenshots
- [ ] Write app description

### Day 5-7: Testing
- [ ] Complete critical path testing
- [ ] Fix any critical bugs
- [ ] Prepare for first build

## 🛠️ Build Commands

### First Production Build
```bash
# 1. Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS Build
eas build:configure

# 4. Build for iOS
eas build --platform ios --profile production

# 5. Build for Android
eas build --platform android --profile production
```

### Submit to Stores
```bash
# Submit to App Store Connect
eas submit --platform ios

# Submit to Google Play Console
eas submit --platform android
```

## 🎯 Success Checklist

### Before Submission
- [ ] All critical features working
- [ ] App icon and screenshots ready
- [ ] Privacy policy hosted
- [ ] App description written
- [ ] Keywords optimized
- [ ] Test accounts created for review

### After Submission
- [ ] Monitor review status
- [ ] Prepare for launch announcement
- [ ] Set up analytics tracking
- [ ] Plan marketing activities

## 📞 Support Resources

### Documentation
- [ ] Apple Developer Documentation: https://developer.apple.com/documentation
- [ ] Google Play Console Help: https://support.google.com/googleplay/android-developer
- [ ] Expo Documentation: https://docs.expo.dev

### Community
- [ ] Expo Discord: https://discord.gg/expo
- [ ] React Native Community: https://github.com/react-native-community

## 🚨 Common Issues & Solutions

### App Store Rejection
- **Issue**: Missing privacy policy
- **Solution**: Create and host privacy policy before submission

### Build Failures
- **Issue**: Missing app icon
- **Solution**: Ensure icon.png exists in assets folder

### Google Play Rejection
- **Issue**: Missing content rating
- **Solution**: Complete content rating questionnaire

This quick start checklist will get you moving immediately toward your MVP launch! 