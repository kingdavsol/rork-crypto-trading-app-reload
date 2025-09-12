import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, User, AlertCircle, Check, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const {
    signUpWithEmail,
    completeEmailSignUp,
    signInWithProvider,
    verifyEmailCode,
    resendVerificationCode,
    isLoading
  } = useAuth();

  const [step, setStep] = useState(1); // 1: Login/Signup, 2: Email Verification, 3: Terms
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRisks, setAgreedToRisks] = useState(false);

  const handleEmailSignUp = async () => {
    if (!email || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signUpWithEmail(email, name);
      setStep(2);
    } catch {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const handleEmailVerification = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      const isValid = await verifyEmailCode(email, verificationCode);
      if (isValid) {
        await completeEmailSignUp(email, name, verificationCode);
        setStep(3);
      } else {
        Alert.alert('Error', 'Invalid verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode(email);
      Alert.alert('Success', 'Verification code sent to your email');
    } catch {
      Alert.alert('Error', 'Failed to resend code');
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'yahoo' | 'x' | 'facebook' | 'instagram') => {
    try {
      await signInWithProvider(provider);
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Error', `Failed to sign in with ${provider}`);
    }
  };

  const handleCompleteSignUp = () => {
    if (!agreedToTerms || !agreedToRisks) {
      Alert.alert('Error', 'Please agree to all terms and conditions');
      return;
    }
    router.replace('/(tabs)/home');
  };

  const renderSocialButtons = () => (
    <View style={styles.socialContainer}>
      <Text style={styles.socialTitle}>Or continue with</Text>

      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={() => handleSocialSignIn('google')}
        disabled={isLoading}
      >
        <Text style={styles.socialButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, styles.yahooButton]}
        onPress={() => handleSocialSignIn('yahoo')}
        disabled={isLoading}
      >
        <Text style={styles.socialButtonText}>Yahoo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, styles.xButton]}
        onPress={() => handleSocialSignIn('x')}
        disabled={isLoading}
      >
        <Text style={styles.socialButtonText}>X (Twitter)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, styles.facebookButton]}
        onPress={() => handleSocialSignIn('facebook')}
        disabled={isLoading}
      >
        <Text style={styles.socialButtonText}>Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, styles.instagramButton]}
        onPress={() => handleSocialSignIn('instagram')}
        disabled={isLoading}
      >
        <Text style={styles.socialButtonText}>Instagram</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {isSignUp ? 'Create Your Account' : 'Welcome Back'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isSignUp ? 'Start your automated trading journey' : 'Sign in to continue'}
      </Text>

      <View style={styles.inputContainer}>
        <User color="#94A3B8" size={20} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#64748B"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Mail color="#94A3B8" size={20} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleEmailSignUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {renderSocialButtons()}

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={styles.switchButtonText}>
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don&apos;t have an account? Sign Up"
          }
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep(1)}
      >
        <ArrowLeft color="#6366F1" size={20} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Verify Your Email</Text>
      <Text style={styles.stepSubtitle}>
        We&apos;ve sent a 6-digit verification code to {email}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter verification code"
          placeholderTextColor="#64748B"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleEmailVerification}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Verify Email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendCode}
      >
        <Text style={styles.resendButtonText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Legal & Compliance</Text>
      <Text style={styles.stepSubtitle}>Please review and accept our terms</Text>

      <ScrollView style={styles.termsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.complianceSection}>
          <Text style={styles.complianceTitle}>Risk Disclosure</Text>
          <Text style={styles.complianceText}>
            Trading cryptocurrencies carries a high level of risk and may not be suitable for all investors.
            Before deciding to trade cryptocurrency you should carefully consider your investment objectives,
            level of experience, and risk appetite. The possibility exists that you could sustain a loss of
            some or all of your initial investment and therefore you should not invest money that you cannot
            afford to lose.
          </Text>
        </View>

        <View style={styles.complianceSection}>
          <Text style={styles.complianceTitle}>Fee Structure</Text>
          <Text style={styles.complianceText}>
            Our platform charges a 2% performance fee on realized profits only. This fee is automatically
            deducted and sent to the company wallet on the Base network. No fees are charged on losses or
            on your initial investment.
          </Text>
        </View>

        <View style={styles.complianceSection}>
          <Text style={styles.complianceTitle}>Regulatory Compliance</Text>
          <Text style={styles.complianceText}>
            This platform complies with applicable regulations in the United States, European Union, and
            other jurisdictions. We implement KYC/AML procedures and report to relevant authorities as required
            by law. Your data is protected in accordance with GDPR and other privacy regulations.
          </Text>
        </View>

        <View style={styles.complianceSection}>
          <Text style={styles.complianceTitle}>No Guarantee of Profits</Text>
          <Text style={styles.complianceText}>
            Past performance is not indicative of future results. Any testimonials or examples shown are not
            guaranteed and individual results will vary. We make no representations or warranties about the
            accuracy or completeness of any information provided.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          {agreedToTerms && <Check color="#10B981" size={16} />}
        </TouchableOpacity>
        <Text style={styles.checkboxText}>
          I agree to the Terms of Service and Privacy Policy
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAgreedToRisks(!agreedToRisks)}
        >
          {agreedToRisks && <Check color="#10B981" size={16} />}
        </TouchableOpacity>
        <Text style={styles.checkboxText}>
          I understand and accept the risks involved in crypto trading
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, (!agreedToTerms || !agreedToRisks) && styles.disabledButton]}
        onPress={handleCompleteSignUp}
        disabled={!agreedToTerms || !agreedToRisks || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Complete Setup</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A0E27', '#1A1F3A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>CryptoBot Pro</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${step * 33.33}%` }]} />
          </View>
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.warningBox}>
          <AlertCircle color="#F59E0B" size={20} />
          <Text style={styles.warningText}>
            Cryptocurrency trading involves substantial risk. Only invest what you can afford to lose.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 12,
    color: '#94A3B8',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  socialContainer: {
    marginBottom: 20,
  },
  socialTitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  socialButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#DB4437',
    borderColor: '#DB4437',
  },
  yahooButton: {
    backgroundColor: '#6001D2',
    borderColor: '#6001D2',
  },
  xButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
    borderColor: '#E4405F',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#94A3B8',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchButtonText: {
    fontSize: 14,
    color: '#6366F1',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    marginLeft: 8,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#6366F1',
  },
  termsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  complianceSection: {
    marginBottom: 20,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  complianceText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 12,
    lineHeight: 18,
  },
});

