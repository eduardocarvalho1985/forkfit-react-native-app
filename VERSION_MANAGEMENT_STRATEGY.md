# ForkFit Version Management Strategy

## Overview
This document outlines how we manage different types of versions across development, preview, and production builds.

## Version Types Explained

### 1. App Version (Semantic Versioning)
- **Format**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`, `1.1.0`, `1.2.3`)
- **Purpose**: User-facing version number
- **Management**: Manual updates in `app.config.js`

### 2. Build Number/Version Code
- **iOS**: Build Number (e.g., 1, 2, 3, 4...)
- **Android**: Version Code (e.g., 1, 2, 3, 4...)
- **Purpose**: Internal build tracking
- **Management**: Automatic via EAS `autoIncrement: true`

## Build Profile Strategy

### Development Builds (`development` profile)
```json
{
  "development": {
    "autoIncrement": true,
    "env": {
      "APP_NAME": "ForkFit Dev"
    }
  }
}
```

**Version Management:**
- **App Version**: `1.0.0` (stays same during development cycle)
- **Build Numbers**: Auto-incremented (1, 2, 3, 4...)
- **When to update App Version**: Only when starting a new development cycle
- **Display**: `DEV v1.0.0` with red badge

**Example Timeline:**
```
Week 1: DEV v1.0.0 (Build 1, 2, 3, 4, 5)
Week 2: DEV v1.0.0 (Build 6, 7, 8, 9, 10)
Week 3: DEV v1.1.0 (Build 1, 2, 3, 4, 5) ← New feature cycle
```

### Preview Builds (`preview` profile)
```json
{
  "preview": {
    "autoIncrement": true,
    "env": {
      "APP_NAME": "ForkFit Preview"
    }
  }
}
```

**Version Management:**
- **App Version**: `1.0.0` → `1.0.1` → `1.0.2` (manual updates for each preview)
- **Build Numbers**: Auto-incremented (1, 2, 3, 4...)
- **When to update App Version**: Each time you create a new preview for testing
- **Display**: `PREVIEW v1.0.1` with teal badge

**Example Timeline:**
```
Preview 1: PREVIEW v1.0.0 (Build 1)
Preview 2: PREVIEW v1.0.1 (Build 2) ← Bug fixes
Preview 3: PREVIEW v1.0.2 (Build 3) ← More fixes
Preview 4: PREVIEW v1.1.0 (Build 4) ← New features
```

### Production Builds (`production` profile)
```json
{
  "production": {
    "autoIncrement": true,
    "env": {
      "APP_NAME": "ForkFit"
    }
  }
}
```

**Version Management:**
- **App Version**: `1.0.0` → `1.1.0` → `1.2.0` (manual updates for releases)
- **Build Numbers**: Auto-incremented (1, 2, 3, 4...)
- **When to update App Version**: Each App Store/Play Store release
- **Display**: `v1.1.0` (clean, no badge)

**Example Timeline:**
```
Release 1: v1.0.0 (Build 1) ← Initial release
Release 2: v1.0.1 (Build 2) ← Bug fix release
Release 3: v1.1.0 (Build 3) ← Feature release
Release 4: v1.1.1 (Build 4) ← Another bug fix
```

## How to Update App Versions

### For Development Cycle Changes:
```bash
# Update app.config.js
version: '1.1.0'  # New feature development

# Build development
eas build --profile development --platform ios
# Result: DEV v1.1.0 (Build 1)
```

### For Preview Testing:
```bash
# Update app.config.js
version: '1.0.1'  # Bug fixes for testing

# Build preview
eas build --profile preview --platform ios
# Result: PREVIEW v1.0.1 (Build 2)
```

### For Production Release:
```bash
# Update app.config.js
version: '1.1.0'  # New features ready for store

# Build production
eas build --profile production --platform ios
# Result: v1.1.0 (Build 3)
```

## Version Update Workflow

### 1. Development Phase
- Keep `version: '1.0.0'` in `app.config.js`
- Build multiple dev builds with auto-incremented build numbers
- No manual version updates needed

### 2. Preview Phase
- Update `version: '1.0.1'` for bug fixes
- Update `version: '1.1.0'` for new features
- Build previews with auto-incremented build numbers

### 3. Production Phase
- Update `version: '1.1.0'` for major releases
- Update `version: '1.1.1'` for patch releases
- Build production with auto-incremented build numbers

## Benefits of This Strategy

1. **No Build Number Conflicts**: EAS handles all build number incrementing
2. **Clear Version Progression**: Easy to track which version is which
3. **Store Compliance**: No duplicate build numbers
4. **Developer Friendly**: Minimal manual work required
5. **User Clarity**: Clear distinction between dev, preview, and production

## Quick Reference Commands

```bash
# Check current versions
eas build:version:get

# Update app version (manual)
# Edit app.config.js version field

# Build with auto-increment
eas build --profile development --platform ios
eas build --profile preview --platform ios  
eas build --profile production --platform ios
```
