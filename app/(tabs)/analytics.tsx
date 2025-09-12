import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
// import { LineChart, BarChart } from 'react-native-svg-charts';
import { TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [timeframe, setTimeframe] = useState('7D');

  const stats = [
    { label: 'Total Profit', value: '$2,458', icon: DollarSign, color: '#10B981' },
    { label: 'Win Rate', value: '67%', icon: TrendingUp, color: '#6366F1' },
    { label: 'Total Trades', value: '342', icon: Activity, color: '#F59E0B' },
    { label: 'Avg. Daily', value: '$125', icon: Calendar, color: '#8B5CF6' },
  ];

  const timeframes = ['24H', '7D', '1M', '3M', '1Y', 'ALL'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Analytics</Text>
        <View style={styles.timeframeSelector}>
          {timeframes.map((tf) => (
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

      <View style={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Icon color={stat.color} size={20} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Portfolio Performance</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Performance Chart</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Trading Volume</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>Volume Chart</Text>
        </View>
      </View>

      <View style={styles.tradesSection}>
        <Text style={styles.sectionTitle}>Recent Performance</Text>
        <View style={styles.tradesList}>
          {[
            { bot: 'Momentum Bot', profit: '+$234', percentage: '+5.2%', time: '2 hours ago' },
            { bot: 'DCA Bot', profit: '+$125', percentage: '+2.8%', time: '4 hours ago' },
            { bot: 'CCI Bot', profit: '-$45', percentage: '-1.2%', time: '6 hours ago' },
            { bot: 'Staking Bot', profit: '+$89', percentage: '+1.9%', time: '8 hours ago' },
          ].map((trade, index) => (
            <View key={index} style={styles.tradeCard}>
              <View style={styles.tradeInfo}>
                <Text style={styles.tradeBotName}>{trade.bot}</Text>
                <Text style={styles.tradeTime}>{trade.time}</Text>
              </View>
              <View style={styles.tradeProfit}>
                <Text style={[styles.tradeProfitValue, trade.profit.startsWith('+') ? styles.positive : styles.negative]}>
                  {trade.profit}
                </Text>
                <Text style={[styles.tradeProfitPercentage, trade.profit.startsWith('+') ? styles.positive : styles.negative]}>
                  {trade.percentage}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Market Trend Analysis</Text>
          <Text style={styles.insightText}>
            Current market conditions favor momentum strategies. Consider increasing allocation to momentum bot by 15%.
          </Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Risk Assessment</Text>
          <Text style={styles.insightText}>
            Portfolio volatility is within acceptable range. Current stop-loss settings are optimal for market conditions.
          </Text>
        </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTimeframe: {
    backgroundColor: '#6366F1',
  },
  timeframeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600' as const,
  },
  activeTimeframeText: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: (width - 30) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    margin: 5,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  chartSection: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tradesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tradesList: {
    gap: 12,
  },
  tradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  tradeInfo: {
    flex: 1,
  },
  tradeBotName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tradeTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tradeProfit: {
    alignItems: 'flex-end',
  },
  tradeProfitValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  tradeProfitPercentage: {
    fontSize: 12,
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  insightsSection: {
    padding: 20,
  },
  insightCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});