# Mobile App Quick Reference

## Copy-Paste Ready Code

### 1. Replace YOUR_REPL_URL in API client
Find your actual repl URL and replace in the API client:
```
baseUrl: 'https://your-actual-repl-name--your-username.replit.app/api'
```

### 2. Test Component (Add to any screen)
```jsx
import { APITest } from '../components/APITest';

// Add in render:
<APITest />
```

### 3. Enhanced User Type
```typescript
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  token: string; // For API calls
  // Backend data
  id?: number;
  onboardingCompleted?: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
```

## Verification Checklist

- [ ] API client added to services/api.ts
- [ ] AuthContext updated with backend sync
- [ ] Test component shows "✅ Connected! Found 13 food categories"
- [ ] Console shows Brazilian food categories
- [ ] No CORS errors in network tab

## Common Issues

**CORS Error**: Backend needs to allow mobile requests
**401 Unauthorized**: Firebase token not being sent correctly
**Network Error**: Check if backend URL is correct and accessible

## Next Steps After Testing
1. Food search screen
2. Meal logging
3. Dashboard with nutrition data
4. Offline caching