import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Shield, Zap, DollarSign, ChevronRight, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

console.log('LandingPage: Component loaded');

export default function LandingPage() {
  console.log('LandingPage: Rendering');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('LandingPage: Checking authentication', isAuthenticated);
    if (isAuthenticated) {
      console.log('LandingPage: User authenticated, redirecting to tabs');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated]);

  const topGainers = [
    { symbol: 'PEPE', change: '+127.3%', period: '24h' },
    { symbol: 'BONK', change: '+89.5%', period: '24h' },
    { symbol: 'WIF', change: '+67.2%', period: '7d' },
    { symbol: 'RNDR', change: '+45.8%', period: '7d' },
  ];

  const buyInAmounts = [100, 300, 500, 1000, 2000, 5000];

  return (
    <SafeAreaView style={styles.container} testID="landing-page">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0A0E27', '#1A1F3A', '#0A0E27']}
          style={styles.hero}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>CryptoBot Pro</Text>
            <Text style={styles.tagline}>AI-Powered Trading Excellence</Text>
          </View>

          <View style={styles.profitShowcase}>
            <Text style={styles.profitTitle}>Today&apos;s Top Performers</Text>
            <View style={styles.gainersGrid}>
              {topGainers.map((coin, index) => (
                <View key={index} style={styles.gainerCard} testID={`gainer-${index}`}>
                  <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                  <Text style={styles.coinGain}>{coin.change}</Text>
                  <Text style={styles.coinPeriod}>{coin.period}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.profitSubtext}>
              Our momentum bot captured 73% of these gains automatically
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => {
              console.log('LandingPage: CTA button pressed');
              router.push('/onboarding');
            }}
            testID="cta-button"
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>Start Trading Now</Text>
              <ChevronRight color="#FFFFFF" size={24} />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

          <View style={styles.features}>
            <Text style={styles.sectionTitle}>Intelligent Trading Strategies</Text>
            
            <View style={styles.featureCard} testID="momentum-feature">
              <View style={styles.featureIcon}>
                <TrendingUp color="#10B981" size={28} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Momentum Trading Bot</Text>
                <Text style={styles.featureDescription}>
                  Automatically moves funds to the fastest rising cryptos based on 1-24 hour performance
                </Text>
              </View>
            </View>

            <View style={styles.featureCard} testID="dca-feature">
              <View style={styles.featureIcon}>
                <DollarSign color="#3B82F6" size={28} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>DCA Bot</Text>
                <Text style={styles.featureDescription}>
                  Dollar-cost averaging with customizable daily to monthly purchases
                </Text>
              </View>
            </View>

            <View style={styles.featureCard} testID="staking-feature">
              <View style={styles.featureIcon}>
                <Zap color="#F59E0B" size={28} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Smart Staking Bot</Text>
                <Text style={styles.featureDescription}>
                  Maximizes yields by moving funds to highest-paying staking opportunities
                </Text>
              </View>
            </View>

            <View style={styles.featureCard} testID="cci-feature">
              <View style={styles.featureIcon}>
                <Shield color="#8B5CF6" size={28} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>CCI Market Bot</Text>
                <Text style={styles.featureDescription}>
                  Trades based on Commodity Channel Index for optimal entry/exit points
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buyInSection}>
            <Text style={styles.sectionTitle}>Choose Your Investment</Text>
            <Text style={styles.buyInSubtext}>Start with as little as $100 USDC</Text>
            <View style={styles.amountGrid}>
              {buyInAmounts.map((amount) => (
                <TouchableOpacity key={amount} style={styles.amountCard} testID={`amount-${amount}`}>
                  <Text style={styles.amountText}>${amount}</Text>
                  <Text style={styles.amountLabel}>USDC</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.securitySection}>
            <Shield color="#10B981" size={32} />
            <Text style={styles.securityTitle}>Your Funds, Your Control</Text>
            <Text style={styles.securityText}>
              • Withdraw anytime - no lock-up periods{"\n"}
              • 1-5% customizable stop-loss protection{"\n"}
              • Connect top 15 exchanges securely{"\n"}
              • Non-custodial wallet integration
            </Text>
          </View>

          <View style={styles.disclaimer}>
            <AlertCircle color="#F59E0B" size={20} />
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Risk Disclosure: </Text>
              Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors. 
              Past performance does not guarantee future results. This platform charges a 2% fee on profits. 
              Please trade responsibly and only invest what you can afford to lose. Compliant with US, EU, 
              and international regulations.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => {
                console.log('LandingPage: Get started button pressed');
                router.push('/onboarding');
              }}
              testID="get-started-button"
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Join 50,000+ traders maximizing their crypto profits
            </Text>
          </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#0A0E27',
      },
      scrollView: {
        flex: 1,
      },
      hero: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
      },
      header: {
        alignItems: 'center',
        marginBottom: 30,
      },
      logo: {
        fontSize: 32,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
        marginBottom: 8,
      },
      tagline: {
        fontSize: 16,
        color: '#94A3B8',
      },
      profitShowcase: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
      },
      profitTitle: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
      },
      gainersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
      gainerCard: {
        width: '48%',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
      },
      coinSymbol: {
        fontSize: 16,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
        marginBottom: 4,
      },
      coinGain: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        color: '#10B981',
        marginBottom: 2,
      },
      coinPeriod: {
        fontSize: 12,
        color: '#94A3B8',
      },
      profitSubtext: {
        fontSize: 14,
        color: '#10B981',
        textAlign: 'center',
        fontStyle: 'italic',
      },
      ctaButton: {
        marginBottom: 20,
      },
      ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
      },
      ctaText: {
        fontSize: 18,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
        marginRight: 8,
      },
      features: {
        padding: 20,
      },
      sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
      },
      featureCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      },
      featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      },
      featureContent: {
        flex: 1,
      },
      featureTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#FFFFFF',
        marginBottom: 4,
      },
      featureDescription: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 20,
      },
      buyInSection: {
        padding: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
      },
      buyInSubtext: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 20,
      },
      amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      amountCard: {
        width: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
      },
      amountText: {
        fontSize: 18,
        fontWeight: 'bold' as const,
        color: '#6366F1',
        marginBottom: 4,
      },
      amountLabel: {
        fontSize: 12,
        color: '#94A3B8',
      },
      securitySection: {
        padding: 20,
        alignItems: 'center',
      },
      securityTitle: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
        marginTop: 12,
        marginBottom: 16,
      },
      securityText: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 24,
      },
      disclaimer: {
        flexDirection: 'row',
        margin: 20,
        padding: 16,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
      },
      disclaimerText: {
        flex: 1,
        fontSize: 12,
        color: '#94A3B8',
        lineHeight: 18,
        marginLeft: 12,
      },
      disclaimerBold: {
        fontWeight: 'bold' as const,
        color: '#F59E0B',
      },
      footer: {
        padding: 20,
        paddingBottom: 40,
      },
      getStartedButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
      },
      getStartedText: {
        fontSize: 16,
        fontWeight: 'bold' as const,
        color: '#FFFFFF',
      },
      footerText: {
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
      },
    });