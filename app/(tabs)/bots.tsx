import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { TrendingUp, DollarSign, Activity, Zap, Plus, Settings as SettingsIcon, Pause, Play } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTradingBot } from '@/providers/TradingBotProvider';

export default function BotsScreen() {
  const { activeBots, toggleBot } = useTradingBot();

  const botTypes = [
    {
      id: 'momentum',
      name: 'Momentum Trading',
      description: 'Automatically moves funds to fastest rising cryptos',
      icon: TrendingUp,
      color: '#10B981',
      features: ['1-24 hour timeframes', 'Auto-rebalancing', 'Trend detection'],
    },
    {
      id: 'dca',
      name: 'DCA Bot',
      description: 'Dollar-cost averaging with scheduled purchases',
      icon: DollarSign,
      color: '#3B82F6',
      features: ['Daily to monthly', 'Multiple assets', 'Auto-compound'],
    },
    {
      id: 'staking',
      name: 'Smart Staking',
      description: 'Maximizes yields across staking opportunities',
      icon: Zap,
      color: '#F59E0B',
      features: ['Auto-compound', 'Risk assessment', 'Yield optimization'],
    },
    {
      id: 'cci',
      name: 'CCI Market Bot',
      description: 'Trades based on Commodity Channel Index',
      icon: Activity,
      color: '#8B5CF6',
      features: ['Overbought/oversold', 'Market cycles', 'Risk management'],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/bot-config')}
      >
        <Plus color="#FFFFFF" size={20} />
        <Text style={styles.createButtonText}>Create New Bot</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Bots ({activeBots.length})</Text>
        {activeBots.map((bot) => {
          const botType = botTypes.find(t => t.id === bot.type);
          const Icon = botType?.icon || TrendingUp;
          
          return (
            <View key={bot.id} style={styles.activeBot}>
              <View style={[styles.botIcon, { backgroundColor: `${botType?.color}20` }]}>
                <Icon color={botType?.color} size={24} />
              </View>
              <View style={styles.botContent}>
                <View style={styles.botHeader}>
                  <Text style={styles.botName}>{bot.name}</Text>
                  <Switch
                    value={bot.status === 'Running'}
                    onValueChange={() => toggleBot(bot.id)}
                    trackColor={{ false: '#374151', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                <Text style={styles.botDescription}>{botType?.description}</Text>
                <View style={styles.botStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Allocation</Text>
                    <Text style={styles.statValue}>${bot.allocation.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>24h P&L</Text>
                    <Text style={[styles.statValue, styles.positive]}>+{bot.profit}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Trades</Text>
                    <Text style={styles.statValue}>{bot.trades || 0}</Text>
                  </View>
                </View>
                <View style={styles.botActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <SettingsIcon color="#6366F1" size={16} />
                    <Text style={styles.actionText}>Configure</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    {bot.status === 'Running' ? (
                      <>
                        <Pause color="#F59E0B" size={16} />
                        <Text style={styles.actionText}>Pause</Text>
                      </>
                    ) : (
                      <>
                        <Play color="#10B981" size={16} />
                        <Text style={styles.actionText}>Start</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Bot Types</Text>
        {botTypes.map((bot) => {
          const Icon = bot.icon;
          return (
            <TouchableOpacity
              key={bot.id}
              style={styles.botTypeCard}
              onPress={() => router.push({
                pathname: '/bot-config',
                params: { type: bot.id }
              })}
            >
              <View style={[styles.botTypeIcon, { backgroundColor: `${bot.color}20` }]}>
                <Icon color={bot.color} size={28} />
              </View>
              <View style={styles.botTypeContent}>
                <Text style={styles.botTypeName}>{bot.name}</Text>
                <Text style={styles.botTypeDescription}>{bot.description}</Text>
                <View style={styles.features}>
                  {bot.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginLeft: 8,
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
  activeBot: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  botIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  botContent: {
    flex: 1,
  },
  botHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  botName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  botDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  botStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  positive: {
    color: '#10B981',
  },
  botActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
  },
  botTypeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  botTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  botTypeContent: {
    flex: 1,
  },
  botTypeName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  botTypeDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 11,
    color: '#6366F1',
  },
});