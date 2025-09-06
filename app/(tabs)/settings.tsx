import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { User, Bell, Shield, Link, LogOut, ChevronRight, AlertCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [stopLoss, setStopLoss] = useState('3');

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <User color="#6366F1" size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Profile</Text>
            <Text style={styles.settingValue}>{user?.email}</Text>
          </View>
          <ChevronRight color="#94A3B8" size={20} />
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Bell color="#F59E0B" size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Get alerts for trades and market changes</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#374151', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Shield color="#10B981" size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            <Text style={styles.settingDescription}>Extra security for your account</Text>
          </View>
          <Switch
            value={twoFactor}
            onValueChange={setTwoFactor}
            trackColor={{ false: '#374151', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trading Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Default Stop Loss</Text>
            <Text style={styles.settingDescription}>Automatically close positions at loss percentage</Text>
          </View>
          <View style={styles.stopLossInput}>
            <TextInput
              style={styles.input}
              value={stopLoss}
              onChangeText={setStopLoss}
              keyboardType="numeric"
              maxLength={1}
            />
            <Text style={styles.inputSuffix}>%</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/exchange-connect')}
        >
          <View style={styles.settingIcon}>
            <Link color="#3B82F6" size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Connected Exchanges</Text>
            <Text style={styles.settingDescription}>Manage exchange API connections</Text>
          </View>
          <ChevronRight color="#94A3B8" size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/wallet-connect')}
        >
          <View style={styles.settingIcon}>
            <Shield color="#8B5CF6" size={20} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Connected Wallets</Text>
            <Text style={styles.settingDescription}>Manage wallet connections</Text>
          </View>
          <ChevronRight color="#94A3B8" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Compliance</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.legalLink}>Terms of Service</Text>
          <ChevronRight color="#94A3B8" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
          <ChevronRight color="#94A3B8" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.legalLink}>Risk Disclosure</Text>
          <ChevronRight color="#94A3B8" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.warningSection}>
        <AlertCircle color="#F59E0B" size={20} />
        <Text style={styles.warningText}>
          Trading cryptocurrencies carries risk. Past performance does not guarantee future results. 
          2% performance fee applies to profits.
        </Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut color="#EF4444" size={20} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 CryptoBot Pro. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#94A3B8',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  stopLossInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 8,
    width: 30,
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: 16,
    color: '#94A3B8',
  },
  legalLink: {
    fontSize: 16,
    color: '#6366F1',
    flex: 1,
  },
  warningSection: {
    flexDirection: 'row',
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  version: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#64748B',
  },
});