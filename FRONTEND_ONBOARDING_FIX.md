# Frontend Onboarding Fix - SQL Error Resolution

## Problem Identified
The `PUT /api/users/{uid}` endpoint has a SQL syntax error: `"syntax error at or near \"where\""`

This affects:
- ❌ `PUT /api/users/{uid}` - General user updates
- ❌ `PUT /api/users/{uid}/onboarding` - Dedicated onboarding updates

## Solution: Use Working `syncUser` Endpoint

### Working Endpoint
```
POST /api/users
```

This endpoint works perfectly and can handle onboarding status updates.

## Frontend Implementation

### 1. Update API Service

```typescript
// services/api.ts
class ApiService {
  private baseURL = 'https://forkfit.app/api'; // or your backend URL

  // Use this for onboarding completion
  async completeOnboarding(uid: string, userData: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        uid: uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        onboardingCompleted: true // This will update the status
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, '-', errorText);
      throw new Error(`API request failed: ${errorText}`);
    }

    return response.json();
  }

  // Use this for general profile updates
  async updateProfile(uid: string, profileData: any): Promise<any> {
    // Use syncUser endpoint instead of PUT
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        uid: uid,
        email: profileData.email,
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        ...profileData // Include all profile fields
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, '-', errorText);
      throw new Error(`API request failed: ${errorText}`);
    }

    return response.json();
  }
}
```

### 2. Onboarding Screen Implementation

```typescript
// screens/OnboardingScreen.tsx
import { useState } from 'react';
import { api } from '../services/api';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteOnboarding = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome.');
      return;
    }

    setLoading(true);
    try {
      // Get current user data
      const currentUser = getCurrentUser(); // Your auth method
      
      // Use the working syncUser endpoint
      const updatedUser = await api.completeOnboarding(currentUser.uid, {
        email: currentUser.email,
        displayName: name,
        photoURL: currentUser.photoURL,
        onboardingCompleted: true
      });

      console.log('Onboarding completed successfully:', updatedUser);
      
      // Update local user state
      updateUserState(updatedUser);
      
      // Navigate to main app
      navigation.navigate('MainApp');
      
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Erro', 'Não foi possível completar o onboarding. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao ForkFit! 🍓</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Seu nome"
        autoFocus
      />
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCompleteOnboarding}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Salvando...' : 'Começar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3. Profile Update Implementation

```typescript
// screens/ProfileScreen.tsx
const handleSaveProfile = async (profileData: any) => {
  try {
    const currentUser = getCurrentUser();
    
    // Use syncUser endpoint for profile updates
    const updatedUser = await api.updateProfile(currentUser.uid, {
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      ...profileData // Include all profile fields
    });

    console.log('Profile updated successfully:', updatedUser);
    updateUserState(updatedUser);
    
  } catch (error) {
    console.error('Profile update error:', error);
    Alert.alert('Erro', 'Não foi possível salvar o perfil.');
  }
};
```

## Debug Functions

### Test API Connection
```typescript
const testAPI = async () => {
  try {
    // Test status endpoint
    const statusResponse = await fetch('https://forkfit.app/api/status');
    const statusData = await statusResponse.json();
    console.log('API Status:', statusData);

    // Test user endpoint
    const userResponse = await fetch('https://forkfit.app/api/users/test-uid');
    const userData = await userResponse.json();
    console.log('User Data:', userData);

  } catch (error) {
    console.error('API Test failed:', error);
  }
};
```

### Debug API Calls
```typescript
const debugAPICall = async (url: string, options: any) => {
  console.log('=== API Call Debug ===');
  console.log('URL:', url);
  console.log('Options:', options);

  try {
    const response = await fetch(url, options);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log('Raw Response:', responseText.substring(0, 200));

    if (responseText.startsWith('<!DOCTYPE html>')) {
      console.error('❌ Received HTML instead of JSON!');
      throw new Error('API returned HTML');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};
```

## Expected API Responses

### Successful Onboarding Completion
```json
{
  "id": 123,
  "uid": "user-firebase-uid",
  "email": "user@example.com",
  "name": "User Name",
  "onboardingCompleted": true,
  "updatedAt": "2025-07-19T12:30:45.123Z"
}
```

### Successful Profile Update
```json
{
  "id": 123,
  "uid": "user-firebase-uid",
  "email": "user@example.com",
  "name": "Updated Name",
  "age": 25,
  "height": 175,
  "weight": 70,
  "onboardingCompleted": true,
  "updatedAt": "2025-07-19T12:35:22.456Z"
}
```

## Error Handling

### Common Errors
```typescript
// 400 Bad Request - Invalid data
{
  "message": "Validation error: {details}"
}

// 404 Not Found - User doesn't exist
{
  "message": "User not found"
}

// 500 Internal Server Error - Backend issue
{
  "message": "Internal server error"
}
```

## Testing Checklist

- [ ] Test `/api/status` endpoint returns JSON
- [ ] Test `/api/users/{uid}` returns user data
- [ ] Test onboarding completion with `POST /api/users`
- [ ] Test profile updates with `POST /api/users`
- [ ] Verify `onboardingCompleted` field updates correctly
- [ ] Test error handling for invalid data
- [ ] Test network error handling

## Backend Fix Status

The backend team is aware of the SQL syntax error and working on a fix. Once deployed:

1. **Remove temporary workarounds**
2. **Switch back to `PUT /api/users/{uid}` endpoint**
3. **Use dedicated `PUT /api/users/{uid}/onboarding` endpoint**

## Mobile-Specific Considerations

### iOS Network Security
```xml
<!-- Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

### Android Network Security
```xml
<!-- network_security_config.xml -->
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">forkfit.app</domain>
  </domain-config>
</network-security-config>
```

This solution will work immediately while the backend team fixes the SQL syntax error. 