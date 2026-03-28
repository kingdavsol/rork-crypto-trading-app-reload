import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure WebBrowser for auth sessions
WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'google' | 'yahoo' | 'x' | 'facebook' | 'instagram' | 'email';
  isEmailVerified?: boolean;
}

export interface EmailVerificationCode {
  code: string;
  expiresAt: number;
  attempts: number;
}

class AuthService {
  private readonly STORAGE_KEY = 'user_data';
  private readonly EMAIL_CODE_KEY = 'email_verification_code';
  private readonly MAX_ATTEMPTS = 3;
  private readonly CODE_EXPIRY_MINUTES = 10;

  // OAuth Configuration
  private readonly OAUTH_CONFIG = {
    google: {
      clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['openid', 'profile', 'email'],
    },
    yahoo: {
      clientId: 'YOUR_YAHOO_CLIENT_ID', // Replace with actual client ID
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['openid', 'profile', 'email'],
    },
    x: {
      clientId: 'YOUR_X_CLIENT_ID', // Replace with actual client ID
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['tweet.read', 'users.read'],
    },
    facebook: {
      clientId: 'YOUR_FACEBOOK_CLIENT_ID', // Replace with actual client ID
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['public_profile', 'email'],
    },
    instagram: {
      clientId: 'YOUR_INSTAGRAM_CLIENT_ID', // Replace with actual client ID
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['user_profile', 'user_media'],
    },
  };

  // Generate a random 6-digit verification code
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification code via email (mock implementation)
  private async sendVerificationEmail(email: string, code: string): Promise<void> {
    // In a real app, this would send an actual email
    console.log(`Sending verification code ${code} to ${email}`);
    
    // For demo purposes, we'll store the code and show it in console
    // In production, integrate with email service like SendGrid, AWS SES, etc.
    const verificationData: EmailVerificationCode = {
      code,
      expiresAt: Date.now() + (this.CODE_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
    };
    
    await AsyncStorage.setItem(this.EMAIL_CODE_KEY, JSON.stringify(verificationData));
  }

  // Verify email code
  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    try {
      const storedData = await AsyncStorage.getItem(this.EMAIL_CODE_KEY);
      if (!storedData) {
        throw new Error('No verification code found');
      }

      const verificationData: EmailVerificationCode = JSON.parse(storedData);
      
      // Check if code has expired
      if (Date.now() > verificationData.expiresAt) {
        await AsyncStorage.removeItem(this.EMAIL_CODE_KEY);
        throw new Error('Verification code has expired');
      }

      // Check if max attempts exceeded
      if (verificationData.attempts >= this.MAX_ATTEMPTS) {
        await AsyncStorage.removeItem(this.EMAIL_CODE_KEY);
        throw new Error('Maximum verification attempts exceeded');
      }

      // Increment attempts
      verificationData.attempts++;
      await AsyncStorage.setItem(this.EMAIL_CODE_KEY, JSON.stringify(verificationData));

      // Check if code matches
      if (verificationData.code === code) {
        await AsyncStorage.removeItem(this.EMAIL_CODE_KEY);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Sign up with email only
  async signUpWithEmail(email: string, name: string): Promise<{ user: User; needsVerification: boolean }> {
    try {
      // Generate verification code
      const code = this.generateVerificationCode();
      
      // Send verification email
      await this.sendVerificationEmail(email, code);

      // Create user object
      const user: User = {
        id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email + Date.now()),
        email,
        name,
        provider: 'email',
        isEmailVerified: false,
      };

      return { user, needsVerification: true };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Complete email verification and create account
  async completeEmailSignUp(email: string, name: string, verificationCode: string): Promise<User> {
    try {
      const isValid = await this.verifyEmailCode(email, verificationCode);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      const user: User = {
        id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email + Date.now()),
        email,
        name,
        provider: 'email',
        isEmailVerified: true,
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Complete sign up error:', error);
      throw error;
    }
  }

  // Social login with OAuth
  async signInWithProvider(provider: 'google' | 'yahoo' | 'x' | 'facebook' | 'instagram'): Promise<User> {
    try {
      const config = this.OAUTH_CONFIG[provider];
      if (!config) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Create auth request
      const request = new AuthSession.AuthRequest({
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri: config.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {},
        additionalParameters: {},
        prompt: AuthSession.Prompt.Login,
      });

      // Start auth session
      const result = await request.promptAsync({
        authorizationEndpoint: this.getAuthorizationEndpoint(provider),
      });

      if (result.type === 'success') {
        // Exchange code for user info
        const userInfo = await this.exchangeCodeForUserInfo(provider, result.params.code);
        
        // Create user object
        const user: User = {
          id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, userInfo.email + provider),
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.avatar,
          provider,
          isEmailVerified: true, // Social providers typically have verified emails
        };

        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        return user;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      throw error;
    }
  }

  // Get authorization endpoint for each provider
  private getAuthorizationEndpoint(provider: string): string {
    const endpoints = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      yahoo: 'https://api.login.yahoo.com/oauth2/request_auth',
      x: 'https://twitter.com/i/oauth2/authorize',
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
      instagram: 'https://api.instagram.com/oauth/authorize',
    };
    return endpoints[provider as keyof typeof endpoints] || '';
  }

  // Exchange authorization code for user info (mock implementation)
  private async exchangeCodeForUserInfo(provider: string, code: string): Promise<{ email: string; name: string; avatar?: string }> {
    // In a real app, this would make API calls to the provider's token endpoint
    // and then fetch user info from their user info endpoint
    
    // Mock implementation for demo
    const mockUsers = {
      google: { email: 'user@gmail.com', name: 'Google User', avatar: 'https://via.placeholder.com/100' },
      yahoo: { email: 'user@yahoo.com', name: 'Yahoo User', avatar: 'https://via.placeholder.com/100' },
      x: { email: 'user@twitter.com', name: 'X User', avatar: 'https://via.placeholder.com/100' },
      facebook: { email: 'user@facebook.com', name: 'Facebook User', avatar: 'https://via.placeholder.com/100' },
      instagram: { email: 'user@instagram.com', name: 'Instagram User', avatar: 'https://via.placeholder.com/100' },
    };

    return mockUsers[provider as keyof typeof mockUsers] || { email: 'user@example.com', name: 'User' };
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.EMAIL_CODE_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Resend verification code
  async resendVerificationCode(email: string): Promise<void> {
    try {
      const code = this.generateVerificationCode();
      await this.sendVerificationEmail(email, code);
    } catch (error) {
      console.error('Resend verification code error:', error);
      throw error;
    }
  }
}

export default new AuthService();

