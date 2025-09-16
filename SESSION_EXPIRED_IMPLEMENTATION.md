# Session Expired Implementation

This document describes the implementation of the session expired popup functionality that displays when a 403 FORBIDDEN or 401 UNAUTHORIZED response is returned due to an expired token.

## Overview

The implementation consists of several components working together to detect session expiration and display a user-friendly popup with a countdown timer.

## Components

### 1. SessionExpiredPopup Component
**Location**: `app/client/components/SessionExpiredPopup.tsx`

A modal popup that displays when a session expires, featuring:
- Clean, modern UI with red color scheme to indicate error
- 5-second countdown timer that automatically closes the popup
- "Okay, Understood" button for manual dismissal
- Automatic redirect to login page after countdown or button click
- Responsive design that works on all screen sizes

### 2. SessionExpiredService
**Location**: `app/services/SessionExpiredService.tsx`

A context provider and service that manages the session expired state:
- `SessionExpiredProvider`: Context provider that wraps the application
- `useSessionExpired`: Hook to access session expired functionality
- `handleApiError`: Utility function to detect 403 and 401 responses
- `fetchWithSessionHandling`: Enhanced fetch wrapper with session handling

### 3. useApiWithSessionHandling Hook
**Location**: `app/hooks/useApiWithSessionHandling.ts`

A custom hook that provides session-aware API calls:
- Wraps all fetch calls with session expiration detection
- Automatically triggers the session expired popup on 403 and 401 responses
- Can be used throughout the application for consistent error handling

## Integration

### 1. Provider Setup
The `SessionExpiredProvider` is integrated into the main layout (`app/layout.tsx`):

```tsx
<LanguageProvider>
  <AuthProvider>
    <SessionExpiredProvider>{children}</SessionExpiredProvider>
  </AuthProvider>
</LanguageProvider>
```

### 2. API Call Updates
All existing API calls have been updated to use the session handling:

**Before:**
```tsx
const response = await fetch('/api/endpoint');
```

**After:**
```tsx
const { fetchWithSessionHandling } = useApiWithSessionHandling();
const response = await fetchWithSessionHandling('/api/endpoint');
```

### 3. Updated Files
The following files have been updated to use the new session handling:

- `app/hooks/useUserProfile.ts`
- `app/auth/components/LoginForm.tsx`
- `app/client/(modules)/coo/page.tsx`
- `app/client/(modules)/ntb/page.tsx`

## Usage

### Basic Usage
```tsx
import { useApiWithSessionHandling } from "@/app/hooks/useApiWithSessionHandling";

function MyComponent() {
  const { fetchWithSessionHandling } = useApiWithSessionHandling();

  const handleApiCall = async () => {
    try {
      const response = await fetchWithSessionHandling('/api/my-endpoint');
      // Handle response
    } catch (error) {
      // Handle error (session expired popup will show automatically)
    }
  };
}
```

### Manual Trigger
```tsx
import { useSessionExpired } from "@/app/services/SessionExpiredService";

function MyComponent() {
  const { showSessionExpired } = useSessionExpired();

  const handleSessionExpired = () => {
    showSessionExpired();
  };
}
```

## Features

### Session Expired Popup
- **Visual Design**: Clean, modern popup with red color scheme
- **Countdown Timer**: 5-second countdown with visual indicator
- **Auto-close**: Automatically closes and redirects after countdown
- **Manual Close**: "Okay, Understood" button for immediate dismissal
- **Responsive**: Works on all screen sizes
- **Accessibility**: Proper focus management and keyboard navigation

### Error Detection
- **401/403 Detection**: Automatically detects 401 UNAUTHORIZED and 403 FORBIDDEN responses
- **Global Handling**: Works across all API endpoints
- **Consistent UX**: Same behavior regardless of where the error occurs

### Integration Benefits
- **Non-intrusive**: Only shows when actually needed
- **User-friendly**: Clear messaging and countdown
- **Automatic**: No manual intervention required
- **Consistent**: Same behavior across the entire application

## Testing

### Test Component
A test component is available at `app/client/components/SessionExpiredTest.tsx` that allows you to manually trigger the session expired popup for testing purposes.

### Manual Testing
1. Use the test component to trigger the popup
2. Verify the countdown timer works correctly
3. Test both automatic and manual dismissal
4. Verify redirect to login page works

### API Testing
1. Make API calls with expired tokens
2. Verify 401 and 403 responses trigger the popup
3. Test across different modules and components

## Future Enhancements

1. **Customizable Timer**: Make the countdown duration configurable
2. **Different Error Types**: Handle different types of authentication errors
3. **Retry Logic**: Add option to retry the failed request
4. **Analytics**: Track session expiration events
5. **Custom Styling**: Allow theme customization

## Troubleshooting

### Common Issues
1. **Popup not showing**: Ensure `SessionExpiredProvider` is properly wrapped around your components
2. **Timer not working**: Check that the component is properly mounted
3. **Redirect not working**: Verify the redirect logic in the service

### Debug Mode
Add console logs to the service to debug session expiration detection:

```tsx
console.log('Response status:', response.status);
if (response.status === 403) {
  console.log('Session expired detected');
  showSessionExpired();
}
```

## Conclusion

This implementation provides a robust, user-friendly solution for handling session expiration across the entire application. The popup ensures users are informed about session expiration and are smoothly redirected to the login page, improving the overall user experience.
