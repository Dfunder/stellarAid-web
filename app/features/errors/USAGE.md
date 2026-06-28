# Error Handling Usage Guide

This guide explains how to use the global error handling system implemented in StellarAid.

## 1. Error Boundary
The ErrorBoundary component is already wrapped around the entire application in `app/layout.tsx`. It catches any unhandled React errors and displays a user-friendly fallback UI.

### Features:
- Catches all unexpected errors in the React component tree
- Displays a clean, user-friendly error page
- Includes a "Reload Page" button to reset the application
- Shows detailed error information in development mode only
- Logs errors to the console for debugging

## 2. Inline ErrorMessage Component
Use the `ErrorMessage` component to display API errors inline in your forms and components.

### Usage Example:
```tsx
import { ErrorMessage } from '@/components/common';
import { useDispatch } from 'react-redux';
import { setApiError, clearApiError } from './errorSlice';

function MyForm() {
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      // Clear any previous errors
      dispatch(clearApiError('login'));
      
      // Attempt API call
      await loginApi();
    } catch (error) {
      // Set error to display
      dispatch(setApiError({ 
        key: 'login', 
        message: error.message || 'Login failed. Please try again.' 
      }));
    }
  };

  return (
    <div>
      <ErrorMessage errorKey="login" className="mb-4" />
      {/* Rest of your form */}
    </div>
  );
}
```

## 3. Redux Error Slice
The error slice manages global error state. Available actions:

### Actions:
- `setGlobalError(message)` - Set a global application error
- `clearGlobalError()` - Clear the global error
- `setApiError({ key, message })` - Set a specific API error
- `clearApiError(key)` - Clear a specific API error
- `clearAllApiErrors()` - Clear all API errors
- `clearAllErrors()` - Clear all errors (global and API)

### Selectors:
- `selectGlobalError(state)` - Get the current global error
- `selectApiErrors(state)` - Get all API errors
- `selectApiErrorByKey(key)(state)` - Get a specific API error

## 4. Best Practices
1. **Always clear errors** before making new API calls to prevent stale error messages
2. **Use specific error keys** for different API calls (e.g., 'login', 'create-campaign', 'donate')
3. **Provide user-friendly messages** - avoid technical jargon in production
4. **Log errors appropriately** - extend the ErrorBoundary to send errors to services like Sentry in production
5. **Test error states** - intentionally throw errors to verify the fallback UI works correctly

## Example Thunk Usage
```typescript
// In your thunks
const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(clearApiError('fetch-campaigns'));
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      const message = error.message || 'Failed to load campaigns';
      dispatch(setApiError({ key: 'fetch-campaigns', message }));
      return rejectWithValue(message);
    }
  }
);
```