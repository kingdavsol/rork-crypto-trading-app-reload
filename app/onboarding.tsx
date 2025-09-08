import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A0E27', '#1A1F3A']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>CryptoBot Pro</Text>
            <Text style={styles.tagline}>Automated Crypto Trading Made Simple</Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureTitle}>🤖 Smart Trading Bots</Text>
              <Text style={styles.featureDescription}>
                AI-powered algorithms that trade 24/7 for maximum profit
              </Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureTitle}>📊 Real-time Analytics</Text>
              <Text style={styles.featureDescription}>
                Track performance with detailed charts and insights
              </Text>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureTitle}>🔒 Secure & Compliant</Text>
              <Text style={styles.featureDescription}>
                Bank-level security with regulatory compliance
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ArrowRight color="#FFFFFF" size={20} />
          </TouchableOpacity>

          <View style={styles.warningBox}>
            <AlertCircle color="#F59E0B" size={20} />
            <Text style={styles.warningText}>
              Cryptocurrency trading involves substantial risk. Only invest what you can afford to lose.
            </Text>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  feature: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  getStartedButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginRight: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
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