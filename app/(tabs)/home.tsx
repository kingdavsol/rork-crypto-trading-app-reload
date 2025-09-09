import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, DollarSign, Activity, Zap, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTradingBot } from '@/providers/TradingBotProvider';
import { useQuery } from '@tanstack/react-query';
import MarketService, { MarketCoin } from '@/services/MarketService';

export default function DashboardScreen() {
  const { portfolio, activeBots, recentTrades } = useTradingBot();

  const { data: markets, isLoading, error } = useQuery<MarketCoin[]>({
    queryKey: ['markets', 'coingecko'],
    queryFn: () => MarketService.fetchMarkets(200),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const top24h = useMemo(() => {
    if (!markets) return [] as MarketCoin[];
    return [...markets]
      .filter(c => typeof c.price_change_percentage_24h_in_currency === 'number')
      .sort((a, b) => (b.price_change_percentage_24h_in_currency || 0) - (a.price_change_percentage_24h_in_currency || 0))
      .slice(0, 4);
  }, [markets]);

  const top7d = useMemo(() => {
    if (!markets) return [] as MarketCoin[];
    return [...markets]
      .filter(c => typeof c.price_change_percentage_7d_in_currency === 'number')
      .sort((a, b) => (b.price_change_percentage_7d_in_currency || 0) - (a.price_change_percentage_7d_in_currency || 0))
      .slice(0, 4);
  }, [markets]);

  const stats = [
    { label: 'Total Value', value: '$12,458.32', change: '+12.5%', positive: true },
    { label: '24h P&L', value: '+$458.32', change: '+3.8%', positive: true },
    { label: 'Active Bots', value: activeBots.length.toString(), change: '', positive: true },
    { label: 'Win Rate', value: '67%', change: '+5%', positive: true },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Portfolio Balance</Text>
          <Text style={styles.balanceValue}>${portfolio.totalValue.toLocaleString()}</Text>
          <View style={styles.balanceChange}>
            <ArrowUpRight color="#10B981" size={16} />
            <Text style={styles.balanceChangeText}>+12.5% (24h)</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/wallet-connect')}
          >
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.actionText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/bot-config')}
          >
            <Zap color="#FFFFFF" size={20} />
            <Text style={styles.actionText}>New Bot</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.change !== '' && (
              <View style={styles.statChange}>
                {stat.positive ? (
                  <ArrowUpRight color="#10B981" size={12} />
                ) : (
                  <ArrowDownRight color="#EF4444" size={12} />
                )}
                <Text style={[styles.statChangeText, stat.positive ? styles.positive : styles.negative]}>
                  {stat.change}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Bots</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/bots')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {activeBots.map((bot) => (
          <TouchableOpacity key={bot.id} style={styles.botCard}>
            <View style={styles.botIcon}>
              {bot.type === 'momentum' && <TrendingUp color="#10B981" size={24} />}
              {bot.type === 'dca' && <DollarSign color="#3B82F6" size={24} />}
              {bot.type === 'staking' && <Zap color="#F59E0B" size={24} />}
              {bot.type === 'cci' && <Activity color="#8B5CF6" size={24} />}
            </View>
            <View style={styles.botInfo}>
              <Text style={styles.botName}>{bot.name}</Text>
              <Text style={styles.botStatus}>
                {bot.status} • ${bot.allocation.toLocaleString()}
              </Text>
            </View>
            <View style={styles.botPerformance}>
              <Text style={styles.botProfit}>+{bot.profit}%</Text>
              <Text style={styles.botPeriod}>24h</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Trades</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentTrades.map((trade) => (
          <View key={trade.id} style={styles.tradeCard}>
            <View style={styles.tradeInfo}>
              <Text style={styles.tradePair}>{trade.pair}</Text>
              <Text style={styles.tradeTime}>{trade.time}</Text>
            </View>
            <View style={styles.tradeDetails}>
              <Text style={[styles.tradeType, trade.type === 'buy' ? styles.buyType : styles.sellType]}>
                {trade.type.toUpperCase()}
              </Text>
              <Text style={[styles.tradePnl, trade.pnl > 0 ? styles.positive : styles.negative]}>
                {trade.pnl > 0 ? '+' : ''}{trade.pnl}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performers (24h)</Text>
        </View>
        {isLoading && <Text style={{ color: '#94A3B8' }}>Loading market data…</Text>}
        {error && <Text style={{ color: '#EF4444' }}>Failed to load market data</Text>}
        {!isLoading && !error && top24h.map((coin) => (
          <View key={coin.id} style={styles.tradeCard}>
            <View style={styles.tradeInfo}>
              <Text style={styles.tradePair}>{coin.symbol.toUpperCase()} • {coin.name}</Text>
              <Text style={styles.tradeTime}>${coin.current_price.toLocaleString()}</Text>
            </View>
            <View style={styles.tradeDetails}>
              <Text style={[styles.tradePnl, (coin.price_change_percentage_24h_in_currency || 0) >= 0 ? styles.positive : styles.negative]}>
                {(coin.price_change_percentage_24h_in_currency || 0).toFixed(2)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performers (7d)</Text>
        </View>
        {!isLoading && !error && top7d.map((coin) => (
          <View key={coin.id} style={styles.tradeCard}>
            <View style={styles.tradeInfo}>
              <Text style={styles.tradePair}>{coin.symbol.toUpperCase()} • {coin.name}</Text>
              <Text style={styles.tradeTime}>${coin.current_price.toLocaleString()}</Text>
            </View>
            <View style={styles.tradeDetails}>
              <Text style={[styles.tradePnl, (coin.price_change_percentage_7d_in_currency || 0) >= 0 ? styles.positive : styles.negative]}>
                {(coin.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChangeText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    margin: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366F1',
  },
  botCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  botIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  botInfo: {
    flex: 1,
  },
  botName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  botStatus: {
    fontSize: 12,
    color: '#94A3B8',
  },
  botPerformance: {
    alignItems: 'flex-end',
  },
  botProfit: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#10B981',
    marginBottom: 2,
  },
  botPeriod: {
    fontSize: 10,
    color: '#94A3B8',
  },
  tradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tradeInfo: {
    flex: 1,
  },
  tradePair: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tradeTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tradeDetails: {
    alignItems: 'flex-end',
  },
  tradeType: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  buyType: {
    color: '#10B981',
  },
  sellType: {
    color: '#EF4444',
  },
  tradePnl: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
});