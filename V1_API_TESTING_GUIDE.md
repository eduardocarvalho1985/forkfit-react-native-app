# 🧪 V1 API Testing Guide

## 🎯 **Overview**

This guide explains how to test the new ForkFit V1 API integration using the debug panel we've added to the app. The V1 API provides JWT-based authentication, user registration with onboarding data, and fitness calculations.

## 🚀 **Getting Started**

### **1. Access the Debug Panel**

The debug panel can be accessed from two locations:

- **Dashboard**: Tap the bug icon (🐛) in the top-right corner of the dashboard
- **Onboarding Flow**: Tap the bug icon (🐛) in the onboarding progress bar

### **2. Debug Panel Features**

The debug panel provides the following testing capabilities:

#### **Connection Tests**
- **Test Connection**: Verifies the V1 API is reachable
- **Check Token Status**: Shows current JWT token status

#### **Authentication Tests**
- **Test Registration**: Creates a new user with complete onboarding data
- **Test Login**: Authenticates an existing user
- **Test Logout**: Logs out the current user

#### **Profile Tests**
- **Get User Profile**: Retrieves the complete user profile
- **Update User Profile**: Updates profile information

#### **Fitness Engine Tests**
- **Test Fitness Calculation**: Tests BMR, TDEE, and macro calculations

#### **Onboarding Tests**
- **Save Onboarding Step**: Saves individual onboarding step data
- **Get Onboarding Progress**: Retrieves onboarding progress

## 📋 **Test Scenarios**

### **Scenario 1: Complete User Registration Flow**

1. **Open Debug Panel** from dashboard or onboarding
2. **Set Test Data**:
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - First Name: `João`
   - Last Name: `Silva`
3. **Test Connection** to verify API is reachable
4. **Test Registration** with the sample onboarding data
5. **Verify Results**:
   - ✅ User ID and Profile ID created
   - ✅ BMR, TDEE, and daily calories calculated
   - ✅ Macro distribution (protein, carbs, fat) set
   - ✅ JWT tokens received

### **Scenario 2: User Login and Profile Access**

1. **Test Login** with registered credentials
2. **Verify Authentication**:
   - ✅ Access token received
   - ✅ User profile loaded
   - ✅ Onboarding data preserved
3. **Get User Profile** to see complete data
4. **Check Token Status** to verify tokens are stored

### **Scenario 3: Fitness Calculations**

1. **Test Fitness Calculation** with sample data:
   - Gender: `male`
   - Age: `33`
   - Height: `175` cm
   - Weight: `80.5` kg
   - Activity Level: `moderate`
   - Goal: `lose_weight`
2. **Verify Calculations**:
   - ✅ BMR calculated using Mifflin-St Jeor equation
   - ✅ TDEE calculated with activity multiplier
   - ✅ Daily calories adjusted for weight loss goal
   - ✅ Macro ratios calculated correctly

### **Scenario 4: Onboarding Step Management**

1. **Save Onboarding Step** with sample data
2. **Get Onboarding Progress** to see current status
3. **Verify Step Data** is properly saved and retrieved

## 🔍 **Expected Results**

### **Registration Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "test@example.com",
      "firstName": "João",
      "lastName": "Silva",
      "profileComplete": true
    },
    "profile": {
      "goal": "lose_weight",
      "bmr": 1750,
      "tdee": 2712,
      "dailyCalories": 2212,
      "dailyProtein": 194,
      "dailyCarbs": 221,
      "dailyFat": 74
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

### **Fitness Calculation Response**
```json
{
  "success": true,
  "data": {
    "bmr": 1750,
    "tdee": 2712,
    "dailyCalories": 2212,
    "dailyProtein": 194,
    "dailyCarbs": 221,
    "dailyFat": 74,
    "calculations": {
      "method": "mifflin_st_jeor",
      "activityMultiplier": 1.55,
      "calorieDeficit": 500,
      "proteinRatio": 0.35,
      "fatRatio": 0.25,
      "carbsRatio": 0.40
    }
  }
}
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Connection Failed**
- **Symptom**: "V1 API connection failed" error
- **Cause**: Backend server not running or network issues
- **Solution**: Verify backend is running at `https://forkfit.app/api/v1`

#### **Authentication Errors**
- **Symptom**: "Authentication failed" or 401 errors
- **Cause**: Invalid or expired JWT tokens
- **Solution**: Re-register or re-login to get fresh tokens

#### **Validation Errors**
- **Symptom**: "Validation failed" errors
- **Cause**: Invalid input data format
- **Solution**: Check test data format matches expected schema

#### **Token Refresh Issues**
- **Symptom**: "Token refresh failed" errors
- **Cause**: Refresh token expired or invalid
- **Solution**: Re-authenticate to get new refresh token

### **Debug Tips**

1. **Check Console Logs**: All API calls are logged with detailed information
2. **Verify Token Status**: Use "Check Token Status" to see current authentication state
3. **Test Step by Step**: Run tests in sequence to isolate issues
4. **Clear Results**: Use "Clear" button to reset test results for fresh testing

## 📱 **Integration Testing**

### **Test the Complete Flow**

1. **Start Onboarding**: Begin the onboarding process
2. **Use Debug Panel**: Test API endpoints during onboarding
3. **Complete Onboarding**: Go through all steps
4. **Verify Data**: Check that all data is properly saved
5. **Test Dashboard**: Verify user data appears correctly

### **Test Edge Cases**

- **Invalid Data**: Try submitting invalid onboarding data
- **Network Issues**: Test with poor network conditions
- **Token Expiry**: Test behavior when tokens expire
- **Concurrent Requests**: Test multiple API calls simultaneously

## 🎉 **Success Criteria**

The V1 API integration is working correctly when:

- ✅ **Registration** creates users with complete profiles
- ✅ **Login** authenticates users and returns profiles
- ✅ **Fitness Calculations** produce accurate BMR/TDEE/macro values
- ✅ **Token Management** handles refresh and expiry correctly
- ✅ **Data Persistence** saves and retrieves onboarding data
- ✅ **Error Handling** provides clear error messages
- ✅ **Performance** responds within reasonable time limits

## 🔄 **Next Steps**

After successful testing:

1. **Remove Debug Panel**: Clean up debug code for production
2. **Integrate with Onboarding**: Connect real onboarding flow to V1 API
3. **Update Auth Context**: Modify authentication to use V1 API
4. **Data Migration**: Plan migration from old API to V1 API
5. **Production Deployment**: Deploy V1 API to production environment

---

## 📞 **Support**

If you encounter issues during testing:

1. **Check the logs** in the debug panel results
2. **Verify backend status** and API endpoints
3. **Review this guide** for common solutions
4. **Contact the backend team** for API-specific issues

Happy testing! 🚀
