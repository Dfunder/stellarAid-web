# Session Timeout Implementation

This document describes the session timeout and automatic logout functionality implemented in the StellarAid web application.

## Overview

The session timeout system monitors JWT token expiration and provides users with warnings before their session expires. Users can extend their session or will be automatically logged out when the token expires.

## Features

### ✅ Implemented Features

1. **Session Timeout Utility** (`lib/auth/sessionTimeout.ts`)
   - Monitors token expiration time
   - Configurable warning threshold (default: 5 minutes)
   - Configurable check interval (default: 30 seconds)
   - Automatic token refresh attempts
   - Cleanup of timers and intervals

2. **Warning Modal** (`components/SessionWarningModal.tsx`)
   - Shows session expiration warning
   - Displays remaining time in real-time
   - "Stay Logged In" button to refresh token
   - "Logout Now" button for manual logout
   - Auto-logout countdown when less than 30 seconds remain

3. **Session Manager** (`components/SessionManager.tsx`)
   - Integrates all session timeout components
   - Handles automatic logout on expiration
   - Manages refresh token flow
   - Provides user notifications
   - Clears session data on logout

4. **Refresh Token Support**
   - Added refresh token to auth store
   - Updated API types to include refresh token
   - Automatic refresh attempts before expiration
   - Fallback to logout if refresh fails

## Configuration

### Default Settings
- **Warning Threshold**: 5 minutes before expiration
- **Check Interval**: Every 30 seconds
- **Auto-logout**: When token expires

### Customization
You can customize the session timeout behavior by modifying the options passed to `useSessionTimeout`:

```typescript
const { refreshToken, getSessionState } = useSessionTimeout({
  onWarning: handleSessionWarning,
  onExpired: handleSessionExpired,
  onRefreshSuccess: handleRefreshSuccess,
  onRefreshFailure: handleRefreshFailure,
  warningThreshold: 5 * 60 * 1000, // 5 minutes
  checkInterval: 30 * 1000, // 30 seconds
});
```

## API Endpoints

### Required Backend Endpoints

1. **POST /auth/refresh-token**
   - Refreshes an expired access token using a refresh token
   - Returns new access token and refresh token
   - Should validate the refresh token and issue new tokens

2. **POST /auth/logout**
   - Invalidates the user's session on the server
   - Clears refresh tokens
   - Called during automatic and manual logout

## Integration

### 1. Auth Store Updates

The auth store has been updated to include refresh token support:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null; // Added
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User, token: string, refreshToken?: string) => void; // Updated
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setTokens: (token: string, refreshToken: string) => void; // Added
}
```

### 2. Session Manager Integration

The `SessionManager` component is wrapped around the main application layout:

```typescript
// app/(main)/layout.tsx
<SessionManager>
  <Header />
  {children}
</SessionManager>
```

## Testing

### Demo Page

A demo page is available at `/session-test` to test the session timeout functionality:

1. Navigate to `/session-test`
2. Use the test controls to create tokens with different expiration times
3. Test the warning modal and refresh functionality
4. Verify automatic logout behavior

### Manual Testing Steps

1. **Warning Display Test**
   - Create a token that expires in 30 seconds
   - Verify warning modal appears
   - Check that countdown timer works correctly

2. **Session Extension Test**
   - Click "Stay Logged In" button
   - Verify token is refreshed successfully
   - Check that modal closes and session is extended

3. **Auto-logout Test**
   - Wait for token to expire naturally
   - Verify automatic logout occurs
   - Check that user is redirected to login page
   - Verify session data is cleared

4. **Refresh Token Failure Test**
   - Simulate refresh token failure
   - Verify user is logged out gracefully
   - Check that appropriate notification is shown

## Acceptance Criteria Met

✅ **Warning shows before timeout**
- Warning modal appears 5 minutes before token expiration
- Real-time countdown displays remaining time

✅ **Can extend session with button**
- "Stay Logged In" button successfully refreshes token
- Modal closes after successful refresh
- Session is extended without user interruption

✅ **Auto-logout on expiration**
- Automatic logout occurs when token expires
- User is redirected to login page
- Session data is cleared from storage

✅ **Refresh token flow works**
- Automatic refresh attempts before expiration
- Manual refresh through warning modal
- Proper error handling when refresh fails

✅ **User notified of logout reason**
- Clear notifications for session expiration
- Different messages for manual vs automatic logout
- Success/error feedback for refresh attempts

## File Structure

```
lib/auth/
├── sessionTimeout.ts          # Core session timeout utility
├── ProtectedRoute.tsx          # Updated with session awareness
└── ...

components/
├── SessionManager.tsx          # Main session management component
├── SessionWarningModal.tsx    # Warning modal UI
├── SessionTimeoutDemo.tsx     # Demo/testing component
└── ...

store/
└── authStore.ts               # Updated with refresh token support

types/
├── api.ts                     # Updated LoginResponse interface
└── index.ts                   # Updated Auth interfaces

app/(main)/
├── layout.tsx                 # SessionManager integration
└── session-test/page.tsx      # Demo page
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage with Zustand persistence
2. **Cleanup**: All session data is cleared on logout
3. **Refresh Token Validation**: Backend should validate refresh tokens
4. **HTTPS**: Ensure tokens are transmitted over HTTPS in production
5. **Token Rotation**: Consider implementing refresh token rotation for enhanced security

## Troubleshooting

### Common Issues

1. **Warning not appearing**
   - Check that token has proper `exp` claim
   - Verify warning threshold and check interval settings
   - Ensure SessionManager is properly integrated

2. **Refresh token not working**
   - Verify backend `/auth/refresh-token` endpoint exists
   - Check that refresh token is being stored properly
   - Ensure refresh token is not expired on backend

3. **Auto-logout not working**
   - Check that token expiration is being detected correctly
   - Verify cleanup functions are called
   - Check browser console for JavaScript errors

### Debug Information

Use the demo page at `/session-test` to view:
- Current token status
- Time remaining calculations
- Token expiration time
- Real-time session state

## Future Enhancements

1. **Idle Detection**: Add mouse/keyboard activity detection to extend session
2. **Multiple Tabs**: Sync session state across browser tabs
3. **Configurable Settings**: Allow users to configure session timeout preferences
4. **Enhanced Notifications**: Use toast notifications instead of alerts
5. **Session Analytics**: Track session duration and timeout events
