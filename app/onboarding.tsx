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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, AlertCircle, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function OnboardingScreen() {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRisks, setAgreedToRisks] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreedToTerms || !agreedToRisks) {
      Alert.alert('Error', 'Please agree to all terms and conditions');
      return;
    }

    await signUp(email, password, name);
    router.replace('/(tabs)/home');
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Create Your Account</Text>
      <Text style={styles.stepSubtitle}>Start your automated trading journey</Text>

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

      <View style={styles.inputContainer}>
        <Lock color="#94A3B8" size={20} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Lock color="#94A3B8" size={20} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#64748B"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.completeButton, (!agreedToTerms || !agreedToRisks) && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={!agreedToTerms || !agreedToRisks}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
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
            <View style={[styles.progressFill, { width: `${step * 50}%` }]} />
          </View>
          <Text style={styles.stepIndicator}>Step {step} of 2</Text>
        </View>

        {step === 1 ? renderStep1() : renderStep2()}

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
  nextButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6366F1',
  },
  completeButton: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
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