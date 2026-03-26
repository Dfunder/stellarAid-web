# Authentication Flow Documentation

## Password Reset Flow

This document describes the complete password reset flow implemented in the StellarAid application.

## Flow Overview

1. **Forgot Password** - User requests password reset via email
2. **Email Sent** - Success message shown (even for non-existent emails)
3. **Reset Password** - User clicks link and sets new password
4. **Success** - User redirected to login with new password

## Pages

### 1. Forgot Password Page
**Route:** `/auth/forgot-password`

**Features:**
- Email input with validation
- Secure submission (shows success for all emails)
- Clear instructions and next steps
- Option to try again or return to login

**Security:**
- Shows success message even if email doesn't exist (prevents email enumeration)
- Rate limiting should be implemented on the backend
- Email validation before submission

### 2. Reset Password Page
**Route:** `/auth/reset-password?token=<reset_token>`

**Features:**
- Token validation from URL parameters
- New password and confirm password fields
- Real-time password requirements checking
- Visual feedback for all requirements
- Handles expired/invalid tokens gracefully

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character

**Security:**
- Token validation before form display
- Password strength requirements
- Confirmation password matching
- Secure token handling

## API Endpoints

### Forgot Password
```
POST /users/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:** 200 OK (always returns success for security)

### Reset Password
```
POST /users/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "new_secure_password"
}
```

**Response:** 200 OK on success

**Error Responses:**
- 400: Token expired or invalid
- 400: Password doesn't meet requirements
- 500: Server error

## User Experience

### Success States

#### Forgot Password Success
- Email icon with success message
- Clear next steps instructions
- Option to return to login or try again

#### Reset Password Success  
- Checkmark icon with success message
- Direct link to login page
- Confirmation that password was changed

### Error States

#### Invalid/Expired Token
- Warning icon with error message
- Options to request new reset link
- Option to return to login

#### Form Validation Errors
- Real-time field validation
- Clear error messages
- Visual indicators for requirements

## Security Considerations

### Email Enumeration Protection
- Always show success message for forgot password
- Don't reveal if email exists in system

### Token Security
- Tokens should have expiration (recommended: 1 hour)
- Tokens should be single-use
- Secure token generation on backend

### Password Security
- Strong password requirements
- Password confirmation
- Secure transmission (HTTPS)

### Rate Limiting
- Implement rate limiting on forgot password endpoint
- Prevent brute force attacks
- Limit password reset attempts

## Integration Points

### Navigation Links
- Login form → "Forgot password?" link
- Forgot password → "Return to sign in" link  
- Reset password → "Request new reset link" for invalid tokens

### Email Templates
Backend should send emails with:
- Reset link with token
- Expiration information
- Security warnings
- Clear call-to-action

### Error Handling
- Graceful degradation for network errors
- User-friendly error messages
- Recovery options for all error states

## Testing Scenarios

### Happy Path
1. User enters valid email → receives reset email
2. User clicks valid link → sets valid password → success
3. User redirected to login → can sign in with new password

### Edge Cases
1. Invalid email format → validation error
2. Non-existent email → success message (security)
3. Expired token → error message with option to request new
4. Invalid token → error message with option to request new
5. Weak password → validation error with requirements
6. Password mismatch → validation error
7. Network errors → retry options

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

## Mobile Responsiveness

- Optimized for mobile devices
- Touch-friendly interface
- Readable text sizes
- Proper spacing for touch targets

## Future Enhancements

- Multi-factor authentication support
- Password strength meter
- Social login integration
- Passwordless login options
- Account recovery via security questions
