import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Wallet } from 'lucide-react-native';

export default function WalletConnectScreen() {
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);

  const wallets = [
    { name: 'MetaMask', color: '#F6851B' },
    { name: 'Coinbase Wallet', color: '#0052FF' },
    { name: 'Trust Wallet', color: '#3375BB' },
    { name: 'Rainbow', color: '#FF4A8D' },
  ];

  const amounts = [100, 300, 500, 1000, 2000, 5000];

  const handleConnect = () => {
    if (!selectedWallet) {
      Alert.alert('Error', 'Please select a wallet');
      return;
    }
    if (!selectedAmount) {
      Alert.alert('Error', 'Please select an amount');
      return;
    }

    Alert.alert(
      'Wallet Connection',
      `Connect ${selectedWallet} and deposit $${selectedAmount} USDC?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Connect', 
          onPress: () => {
            Alert.alert('Success', 'Wallet connected and funds deposited!', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Fund Your Account</Text>
        <Text style={styles.subtitle}>
          Connect your wallet and deposit stablecoins
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Wallet</Text>
        <View style={styles.walletGrid}>
          {wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.name}
              style={[
                styles.walletCard,
                selectedWallet === wallet.name && styles.selectedWallet
              ]}
              onPress={() => setSelectedWallet(wallet.name)}
            >
              <View style={[styles.walletIcon, { backgroundColor: `${wallet.color}20` }]}>
                <Wallet color={wallet.color} size={24} />
              </View>
              <Text style={styles.walletName}>{wallet.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Amount (USDC)</Text>
        <View style={styles.amountGrid}>
          {amounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountCard,
                selectedAmount === amount && styles.selectedAmount
              ]}
              onPress={() => setSelectedAmount(amount)}
            >
              <Text style={[
                styles.amountText,
                selectedAmount === amount && styles.selectedAmountText
              ]}>
                ${amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Supported Stablecoins</Text>
        <View style={styles.stablecoinList}>
          <View style={styles.stablecoin}>
            <Text style={styles.stablecoinName}>USDC</Text>
            <Text style={styles.stablecoinNetwork}>Base, Ethereum, Polygon</Text>
          </View>
          <View style={styles.stablecoin}>
            <Text style={styles.stablecoinName}>USDT</Text>
            <Text style={styles.stablecoinNetwork}>Ethereum, BSC, Tron</Text>
          </View>
          <View style={styles.stablecoin}>
            <Text style={styles.stablecoinName}>DAI</Text>
            <Text style={styles.stablecoinNetwork}>Ethereum, Polygon</Text>
          </View>
        </View>
      </View>

      <View style={styles.feeInfo}>
        <Text style={styles.feeTitle}>Fee Structure</Text>
        <Text style={styles.feeText}>
          • No deposit fees{'\n'}
          • 2% performance fee on profits only{'\n'}
          • Network gas fees apply{'\n'}
          • Withdraw anytime with no penalties
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.connectButton, (!selectedWallet || !selectedAmount) && styles.disabledButton]}
        onPress={handleConnect}
        disabled={!selectedWallet || !selectedAmount}
      >
        <Text style={styles.connectButtonText}>
          Connect & Deposit
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  walletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  walletCard: {
    width: '47%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedWallet: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366F1',
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  walletName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountCard: {
    width: '30%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedAmount: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#94A3B8',
  },
  selectedAmountText: {
    color: '#10B981',
  },
  infoSection: {
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  stablecoinList: {
    gap: 12,
  },
  stablecoin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stablecoinName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  stablecoinNetwork: {
    fontSize: 12,
    color: '#94A3B8',
  },
  feeInfo: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#10B981',
    marginBottom: 8,
  },
  feeText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 20,
  },
  connectButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
});