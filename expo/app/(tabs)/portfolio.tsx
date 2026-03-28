import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
// import { PieChart } from 'react-native-svg-charts';
// import { Circle, G, Line } from 'react-native-svg';
import { Bitcoin, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTradingBot } from '@/providers/TradingBotProvider';



export default function PortfolioScreen() {
  const { portfolio } = useTradingBot();

  // const pieData = portfolio.holdings.map((holding, index) => ({
  //   value: holding.value,
  //   svg: {
  //     fill: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5],
  //   },
  //   key: `pie-${index}`,
  // }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total Portfolio Value</Text>
        <Text style={styles.totalValue}>${portfolio.totalValue.toLocaleString()}</Text>
        <View style={styles.changeContainer}>
          <TrendingUp color="#10B981" size={16} />
          <Text style={styles.changeText}>+$1,458.32 (12.5%) Today</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Portfolio Chart</Text>
          </View>
        </View>
        <View style={styles.legend}>
          {portfolio.holdings.map((holding, index) => (
            <View key={holding.symbol} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5] }
                ]}
              />
              <Text style={styles.legendText}>
                {holding.symbol} ({((holding.value / portfolio.totalValue) * 100).toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.holdingsSection}>
        <Text style={styles.sectionTitle}>Holdings</Text>
        {portfolio.holdings.map((holding) => (
          <View key={holding.symbol} style={styles.holdingCard}>
            <View style={styles.holdingIcon}>
              <Bitcoin color="#F7931A" size={24} />
            </View>
            <View style={styles.holdingInfo}>
              <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
              <Text style={styles.holdingAmount}>{holding.amount} {holding.symbol}</Text>
            </View>
            <View style={styles.holdingValue}>
              <Text style={styles.holdingUsdValue}>${holding.value.toLocaleString()}</Text>
              <View style={styles.holdingChange}>
                {holding.change24h > 0 ? (
                  <TrendingUp color="#10B981" size={12} />
                ) : (
                  <TrendingDown color="#EF4444" size={12} />
                )}
                <Text style={[
                  styles.holdingChangeText,
                  holding.change24h > 0 ? styles.positive : styles.negative
                ]}>
                  {holding.change24h > 0 ? '+' : ''}{holding.change24h}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <DollarSign color="#FFFFFF" size={20} />
          <Text style={styles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]}>
          <DollarSign color="#6366F1" size={20} />
          <Text style={[styles.actionButtonText, styles.withdrawButtonText]}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Withdrawal Information</Text>
        <Text style={styles.infoText}>
          • Withdraw funds anytime with no lock-up period{'\n'}
          • Minimum withdrawal: $10 USDC{'\n'}
          • Processing time: 1-3 business days{'\n'}
          • Network fees apply based on blockchain congestion{'\n'}
          • 2% performance fee deducted from profits only
        </Text>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  totalLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 6,
  },
  chartSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  holdingsSection: {
    padding: 20,
  },
  holdingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  holdingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  holdingAmount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  holdingValue: {
    alignItems: 'flex-end',
  },
  holdingUsdValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  holdingChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holdingChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  actionsSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  withdrawButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  withdrawButtonText: {
    color: '#6366F1',
  },
  infoSection: {
    padding: 20,
    margin: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
  },
  chartPlaceholder: {
    height: 200,
    width: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});