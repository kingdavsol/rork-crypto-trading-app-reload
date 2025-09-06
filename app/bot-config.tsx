import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { useTradingBot } from '@/providers/TradingBotProvider';

export default function BotConfigScreen() {
  const { type } = useLocalSearchParams();
  const { createBot } = useTradingBot();
  
  const [botName, setBotName] = useState('');
  const [allocation, setAllocation] = useState('1000');
  const [stopLoss, setStopLoss] = useState(3);
  const [selectedType, setSelectedType] = useState(type || 'momentum');
  const [timeframe, setTimeframe] = useState('4h');

  const handleCreate = () => {
    if (!botName || !allocation) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    createBot({
      name: botName,
      type: selectedType as any,
      allocation: parseFloat(allocation),
      stopLoss,
      config: { timeframe },
    });

    Alert.alert('Success', 'Bot created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bot Configuration</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bot Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter bot name"
            placeholderTextColor="#64748B"
            value={botName}
            onChangeText={setBotName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bot Type</Text>
          <View style={styles.typeSelector}>
            {['momentum', 'dca', 'staking', 'cci'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeButton, selectedType === t && styles.activeType]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={[styles.typeText, selectedType === t && styles.activeTypeText]}>
                  {t.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Allocation (USDC)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#64748B"
            value={allocation}
            onChangeText={setAllocation}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stop Loss: {stopLoss}%</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={stopLoss}
            onValueChange={setStopLoss}
            minimumTrackTintColor="#6366F1"
            maximumTrackTintColor="#374151"
            thumbTintColor="#FFFFFF"
          />
        </View>

        {selectedType === 'momentum' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Timeframe</Text>
            <View style={styles.timeframeSelector}>
              {['1h', '4h', '12h', '24h'].map((tf) => (
                <TouchableOpacity
                  key={tf}
                  style={[styles.timeframeButton, timeframe === tf && styles.activeTimeframe]}
                  onPress={() => setTimeframe(tf)}
                >
                  <Text style={[styles.timeframeText, timeframe === tf && styles.activeTimeframeText]}>
                    {tf}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createText}>Create Bot</Text>
        </TouchableOpacity>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeType: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  typeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  activeTypeText: {
    color: '#FFFFFF',
  },
  slider: {
    height: 40,
  },
  timeframeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  activeTimeframe: {
    backgroundColor: '#6366F1',
  },
  timeframeText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  activeTimeframeText: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#6366F1',
  },
  createButton: {
    flex: 2,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  createText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
});