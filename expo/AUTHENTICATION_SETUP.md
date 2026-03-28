# CryptoBot Pro - Authentication Setup

This document provides instructions for setting up the authentication system with social logins and email verification.

## Features Implemented

✅ **Social Authentication**
- Google OAuth
- Yahoo OAuth  
- X (Twitter) OAuth
- Facebook OAuth
- Instagram OAuth

✅ **Email-Only Signup**
- Email verification with 6-digit codes
- 2FA security with email confirmation
- Resend verification codes
- Code expiration and attempt limits

✅ **Security Features**
- Secure token storage
- Session management
- Input validation
- Error handling

## Setup Instructions

### 1. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your redirect URI: `https://auth.expo.io/@your-expo-username/your-app-slug`
6. Copy Client ID to `config/auth.ts`

#### Yahoo OAuth
1. Go to [Yahoo Developer Network](https://developer.yahoo.com/)
2. Create a new app
3. Configure OAuth settings
4. Add redirect URI
5. Copy Client ID to `config/auth.ts`

#### X (Twitter) OAuth
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0
4. Add redirect URI
5. Copy Client ID to `config/auth.ts`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth settings
5. Copy App ID to `config/auth.ts`

#### Instagram OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create Instagram Basic Display app
3. Configure OAuth settings
4. Copy App ID to `config/auth.ts`

### 2. Email Service Setup

For production, integrate with an email service:

#### SendGrid (Recommended)
```bash
npm install @sendgrid/mail
```

#### AWS SES
```bash
npm install aws-sdk
```

#### Mailgun
```bash
npm install mailgun-js
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
YAHOO_CLIENT_ID=your_yahoo_client_id
X_CLIENT_ID=your_x_client_id
FACEBOOK_CLIENT_ID=your_facebook_client_id
INSTAGRAM_CLIENT_ID=your_instagram_client_id

# Email Service
EMAIL_SERVICE_API_KEY=your_email_service_api_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# App Configuration
EXPO_USERNAME=your_expo_username
APP_SLUG=your_app_slug
```

### 4. Update Configuration

Edit `config/auth.ts` with your actual credentials:

```typescript
export const OAUTH_CONFIG = {
  google: {
    clientId: 'your-actual-google-client-id.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@your-expo-username/your-app-slug',
    // ... other config
  },
  // ... other providers
};
```

## Usage

### Email Signup Flow
1. User enters email and name
2. System sends verification code to email
3. User enters 6-digit code
4. Account is created and verified

### Social Login Flow
1. User taps social provider button
2. OAuth flow opens in browser
3. User authorizes app
4. Account is created automatically

### Security Features
- **Email Verification**: Required for email signups
- **Code Expiration**: Codes expire after 10 minutes
- **Attempt Limits**: Max 3 verification attempts
- **Secure Storage**: User data encrypted in AsyncStorage

## Testing

### Mock Mode
The app runs in mock mode by default for development:
- Social logins return mock user data
- Email codes are logged to console
- No actual emails are sent

### Production Mode
To enable production features:
1. Set up real OAuth providers
2. Configure email service
3. Update `AuthService.ts` to use real APIs
4. Test with real email addresses

## File Structure

```
├── services/
│   └── AuthService.ts          # Main authentication logic
├── providers/
│   └── AuthProvider.tsx        # React context provider
├── config/
│   └── auth.ts                # OAuth and email configuration
├── app/
│   ├── login.tsx              # Login/signup screen
│   ├── onboarding.tsx         # Welcome screen
│   └── index.tsx              # Landing page with auth check
```

## Security Considerations

1. **Never commit OAuth secrets** to version control
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** for verification codes
4. **Add CSRF protection** for OAuth flows
5. **Validate all inputs** on both client and server
6. **Use HTTPS** for all OAuth redirects
7. **Implement proper session management**

## Troubleshooting

### Common Issues

1. **OAuth redirect errors**: Check redirect URI matches exactly
2. **Email not sending**: Verify email service configuration
3. **Code verification fails**: Check expiration and attempt limits
4. **Social login not working**: Verify OAuth app configuration

### Debug Mode

Enable debug logging by setting:
```typescript
const DEBUG_AUTH = true;
```

This will log all authentication events to console.

## Next Steps

1. Set up OAuth providers with real credentials
2. Integrate email service for production
3. Add server-side validation
4. Implement user profile management
5. Add password reset functionality
6. Set up analytics and monitoring

