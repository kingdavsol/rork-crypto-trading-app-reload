import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';

export default function ExchangeConnectScreen() {
  const [selectedExchange, setSelectedExchange] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const exchanges = [
    'Binance', 'Coinbase', 'Kraken', 'Bitfinex', 'Huobi',
    'OKX', 'KuCoin', 'Gate.io', 'Bybit', 'Bitstamp',
    'Gemini', 'Crypto.com', 'FTX', 'Bittrex', 'Poloniex'
  ];

  const handleConnect = () => {
    if (!selectedExchange || !apiKey || !apiSecret) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Success',
      `${selectedExchange} connected successfully!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Exchange</Text>
        <Text style={styles.subtitle}>
          Select an exchange and enter your API credentials
        </Text>
      </View>

      <View style={styles.exchangeGrid}>
        {exchanges.map((exchange) => (
          <TouchableOpacity
            key={exchange}
            style={[
              styles.exchangeCard,
              selectedExchange === exchange && styles.selectedExchange
            ]}
            onPress={() => setSelectedExchange(exchange)}
          >
            <Text style={[
              styles.exchangeName,
              selectedExchange === exchange && styles.selectedExchangeName
            ]}>
              {exchange}
            </Text>
            {selectedExchange === exchange && (
              <Check color="#10B981" size={20} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedExchange && (
        <View style={styles.credentialsSection}>
          <Text style={styles.sectionTitle}>API Credentials</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your API key"
              placeholderTextColor="#64748B"
              value={apiKey}
              onChangeText={setApiKey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Secret</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your API secret"
              placeholderTextColor="#64748B"
              value={apiSecret}
              onChangeText={setApiSecret}
              secureTextEntry
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Security Note</Text>
            <Text style={styles.infoText}>
              • Only grant read and trade permissions{'\n'}
              • Never share your API credentials{'\n'}
              • Whitelist our IP addresses for extra security{'\n'}
              • Enable 2FA on your exchange account
            </Text>
          </View>

          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Connect {selectedExchange}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  exchangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  exchangeCard: {
    width: '31%',
    margin: '1%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedExchange: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366F1',
  },
  exchangeName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  selectedExchangeName: {
    color: '#FFFFFF',
  },
  credentialsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#10B981',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 20,
  },
  connectButton: {
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
});