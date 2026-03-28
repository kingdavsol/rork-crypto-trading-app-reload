// OAuth Configuration
// Replace these placeholder values with your actual OAuth app credentials

export const OAUTH_CONFIG = {
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@your-expo-username/your-app-slug',
    scopes: ['openid', 'profile', 'email'],
    // Get from: https://console.developers.google.com/
  },
  yahoo: {
    clientId: 'YOUR_YAHOO_CLIENT_ID',
    redirectUri: 'https://auth.expo.io/@your-expo-username/your-app-slug',
    scopes: ['openid', 'profile', 'email'],
    // Get from: https://developer.yahoo.com/
  },
  x: {
    clientId: 'YOUR_X_CLIENT_ID',
    redirectUri: 'https://auth.expo.io/@your-expo-username/your-app-slug',
    scopes: ['tweet.read', 'users.read'],
    // Get from: https://developer.twitter.com/
  },
  facebook: {
    clientId: 'YOUR_FACEBOOK_CLIENT_ID',
    redirectUri: 'https://auth.expo.io/@your-expo-username/your-app-slug',
    scopes: ['public_profile', 'email'],
    // Get from: https://developers.facebook.com/
  },
  instagram: {
    clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
    redirectUri: 'https://auth.expo.io/@your-expo-username/your-app-slug',
    scopes: ['user_profile', 'user_media'],
    // Get from: https://developers.facebook.com/ (Instagram Basic Display)
  },
};

// Email Service Configuration
export const EMAIL_CONFIG = {
  // For production, integrate with services like:
  // - SendGrid: https://sendgrid.com/
  // - AWS SES: https://aws.amazon.com/ses/
  // - Mailgun: https://www.mailgun.com/
  // - Resend: https://resend.com/
  
  service: 'mock', // Change to 'sendgrid', 'ses', 'mailgun', etc.
  apiKey: 'YOUR_EMAIL_SERVICE_API_KEY',
  fromEmail: 'noreply@yourdomain.com',
  fromName: 'CryptoBot Pro',
};

// Security Configuration
export const SECURITY_CONFIG = {
  verificationCodeLength: 6,
  codeExpiryMinutes: 10,
  maxVerificationAttempts: 3,
  passwordMinLength: 8,
  sessionTimeoutMinutes: 60,
};

