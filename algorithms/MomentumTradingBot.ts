// Advanced Trading Algorithms for Crypto Trading Bots
// Optimized for fast-moving markets with comprehensive risk management

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  change24h: number;
  change1h: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  confidence: number; // 0-100
  price: number;
  quantity?: number;
  reason: string;
  timestamp: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface BotConfig {
  id: string;
  name: string;
  type: 'momentum' | 'dca' | 'staking' | 'cci';
  allocation: number;
  stopLoss: number; // percentage
  takeProfit?: number; // percentage
  timeframe: string;
  maxPositions: number;
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  enabledAssets: string[];
  customParams?: Record<string, any>;
}

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  timestamp: number;
}

export interface BotPerformance {
  totalPnL: number;
  totalPnLPercentage: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  lastUpdate: number;
}

// ============================================================================
// MOMENTUM TRADING BOT ALGORITHM
// ============================================================================

export class MomentumTradingBot {
  private config: BotConfig;
  private positions: Map<string, Position> = new Map();
  private performance: BotPerformance;
  private priceHistory: Map<string, MarketData[]> = new Map();
  private lastRebalance: number = 0;

  constructor(config: BotConfig) {
    this.config = config;
    this.performance = {
      totalPnL: 0,
      totalPnLPercentage: 0,
      winRate: 0,
      totalTrades: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      lastUpdate: Date.now(),
    };
  }

  // Main momentum algorithm - optimized for fast markets
  analyzeMarket(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const now = Date.now();
    
    // Update price history
    marketData.forEach(data => {
      if (!this.priceHistory.has(data.symbol)) {
        this.priceHistory.set(data.symbol, []);
      }
      const history = this.priceHistory.get(data.symbol)!;
      history.push(data);
      
      // Keep only last 1000 data points for memory efficiency
      if (history.length > 1000) {
        history.shift();
      }
    });

    // Check if rebalancing is needed (every 15 minutes minimum)
    if (now - this.lastRebalance < 15 * 60 * 1000) {
      return signals;
    }

    // Calculate momentum scores for all assets
    const momentumScores = this.calculateMomentumScores(marketData);
    
    // Sort by momentum score (highest first)
    const sortedAssets = momentumScores
      .sort((a, b) => b.score - a.score)
      .filter(asset => this.config.enabledAssets.includes(asset.symbol));

    // Determine top performers
    const topPerformers = sortedAssets.slice(0, this.config.maxPositions);
    const currentPositions = Array.from(this.positions.keys());

    // Generate signals for rebalancing
    signals.push(...this.generateRebalancingSignals(topPerformers, currentPositions));

    // Check for stop-loss triggers
    signals.push(...this.checkStopLossTriggers());

    // Check for take-profit triggers
    if (this.config.takeProfit) {
      signals.push(...this.checkTakeProfitTriggers());
    }

    this.lastRebalance = now;
    return signals;
  }

  private calculateMomentumScores(marketData: MarketData[]): Array<{symbol: string, score: number, data: MarketData}> {
    return marketData.map(data => {
      const history = this.priceHistory.get(data.symbol) || [];
      
      if (history.length < 10) {
        return { symbol: data.symbol, score: 0, data };
      }

      // Multi-timeframe momentum calculation
      const scores = {
        // Short-term momentum (1-4 hours)
        shortTerm: this.calculateShortTermMomentum(history),
        // Medium-term momentum (4-24 hours)
        mediumTerm: this.calculateMediumTermMomentum(history),
        // Volume-weighted momentum
        volumeWeighted: this.calculateVolumeWeightedMomentum(history),
        // Volatility-adjusted momentum
        volatilityAdjusted: this.calculateVolatilityAdjustedMomentum(history),
        // Trend strength
        trendStrength: this.calculateTrendStrength(history),
      };

      // Weighted combination based on risk level
      const weights = this.getMomentumWeights();
      const finalScore = 
        scores.shortTerm * weights.shortTerm +
        scores.mediumTerm * weights.mediumTerm +
        scores.volumeWeighted * weights.volumeWeighted +
        scores.volatilityAdjusted * weights.volatilityAdjusted +
        scores.trendStrength * weights.trendStrength;

      return { symbol: data.symbol, score: finalScore, data };
    });
  }

  private calculateShortTermMomentum(history: MarketData[]): number {
    if (history.length < 4) return 0;
    
    const recent = history.slice(-4); // Last 4 data points
    const priceChange = (recent[recent.length - 1].price - recent[0].price) / recent[0].price;
    const volumeTrend = this.calculateVolumeTrend(recent);
    
    return priceChange * 100 * (1 + volumeTrend);
  }

  private calculateMediumTermMomentum(history: MarketData[]): number {
    if (history.length < 24) return 0;
    
    const recent = history.slice(-24); // Last 24 data points
    const priceChange = (recent[recent.length - 1].price - recent[0].price) / recent[0].price;
    const consistency = this.calculateTrendConsistency(recent);
    
    return priceChange * 100 * consistency;
  }

  private calculateVolumeWeightedMomentum(history: MarketData[]): number {
    if (history.length < 10) return 0;
    
    const recent = history.slice(-10);
    let totalVolume = 0;
    let weightedPriceChange = 0;
    
    recent.forEach((data, index) => {
      if (index > 0) {
        const priceChange = (data.price - recent[index - 1].price) / recent[index - 1].price;
        weightedPriceChange += priceChange * data.volume;
        totalVolume += data.volume;
      }
    });
    
    return totalVolume > 0 ? (weightedPriceChange / totalVolume) * 100 : 0;
  }

  private calculateVolatilityAdjustedMomentum(history: MarketData[]): number {
    if (history.length < 20) return 0;
    
    const recent = history.slice(-20);
    const volatility = this.calculateVolatility(recent);
    const momentum = this.calculateShortTermMomentum(recent);
    
    // Adjust momentum by volatility (lower volatility = higher confidence)
    return volatility > 0 ? momentum / (1 + volatility) : momentum;
  }

  private calculateTrendStrength(history: MarketData[]): number {
    if (history.length < 10) return 0;
    
    const recent = history.slice(-10);
    const prices = recent.map(d => d.price);
    
    // Calculate linear regression slope
    const n = prices.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * prices[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rSquared = this.calculateRSquared(prices, x, slope);
    
    return slope * rSquared * 100;
  }

  private calculateVolumeTrend(history: MarketData[]): number {
    if (history.length < 4) return 0;
    
    const recent = history.slice(-4);
    const volumes = recent.map(d => d.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const latestVolume = volumes[volumes.length - 1];
    
    return (latestVolume - avgVolume) / avgVolume;
  }

  private calculateTrendConsistency(history: MarketData[]): number {
    if (history.length < 10) return 0;
    
    const recent = history.slice(-10);
    let positiveChanges = 0;
    
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].price > recent[i - 1].price) {
        positiveChanges++;
      }
    }
    
    return positiveChanges / (recent.length - 1);
  }

  private calculateVolatility(history: MarketData[]): number {
    if (history.length < 10) return 0;
    
    const prices = history.map(d => d.price);
    const returns = [];
    
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateRSquared(prices: number[], x: number[], slope: number): number {
    const n = prices.length;
    const sumY = prices.reduce((a, b) => a + b, 0);
    const meanY = sumY / n;
    
    let ssRes = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i];
      ssRes += Math.pow(prices[i] - predicted, 2);
      ssTot += Math.pow(prices[i] - meanY, 2);
    }
    
    return ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  }

  private getMomentumWeights(): Record<string, number> {
    switch (this.config.riskLevel) {
      case 'CONSERVATIVE':
        return {
          shortTerm: 0.2,
          mediumTerm: 0.4,
          volumeWeighted: 0.2,
          volatilityAdjusted: 0.15,
          trendStrength: 0.05,
        };
      case 'MODERATE':
        return {
          shortTerm: 0.3,
          mediumTerm: 0.3,
          volumeWeighted: 0.2,
          volatilityAdjusted: 0.15,
          trendStrength: 0.05,
        };
      case 'AGGRESSIVE':
        return {
          shortTerm: 0.4,
          mediumTerm: 0.2,
          volumeWeighted: 0.2,
          volatilityAdjusted: 0.1,
          trendStrength: 0.1,
        };
      default:
        return {
          shortTerm: 0.3,
          mediumTerm: 0.3,
          volumeWeighted: 0.2,
          volatilityAdjusted: 0.15,
          trendStrength: 0.05,
        };
    }
  }

  private generateRebalancingSignals(
    topPerformers: Array<{symbol: string, score: number, data: MarketData}>,
    currentPositions: string[]
  ): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    // Calculate total allocation per position
    const allocationPerPosition = this.config.allocation / this.config.maxPositions;
    
    // Sell positions not in top performers
    currentPositions.forEach(symbol => {
      const isInTopPerformers = topPerformers.some(asset => asset.symbol === symbol);
      if (!isInTopPerformers) {
        const position = this.positions.get(symbol);
        if (position) {
          signals.push({
            action: 'SELL',
            symbol,
            confidence: 85,
            price: position.currentPrice,
            quantity: position.quantity,
            reason: 'Not in top performers - rebalancing',
            timestamp: Date.now(),
            riskLevel: 'MEDIUM',
          });
        }
      }
    });
    
    // Buy new top performers
    topPerformers.forEach(asset => {
      const currentPosition = this.positions.get(asset.symbol);
      const targetQuantity = allocationPerPosition / asset.data.price;
      
      if (!currentPosition) {
        // New position
        signals.push({
          action: 'BUY',
          symbol: asset.symbol,
          confidence: Math.min(95, 60 + asset.score),
          price: asset.data.price,
          quantity: targetQuantity,
          reason: `High momentum score: ${asset.score.toFixed(2)}`,
          timestamp: Date.now(),
          riskLevel: asset.score > 50 ? 'HIGH' : 'MEDIUM',
        });
      } else if (Math.abs(currentPosition.quantity - targetQuantity) / targetQuantity > 0.1) {
        // Rebalance existing position
        const quantityDiff = targetQuantity - currentPosition.quantity;
        signals.push({
          action: quantityDiff > 0 ? 'BUY' : 'SELL',
          symbol: asset.symbol,
          confidence: 75,
          price: asset.data.price,
          quantity: Math.abs(quantityDiff),
          reason: 'Rebalancing position',
          timestamp: Date.now(),
          riskLevel: 'MEDIUM',
        });
      }
    });
    
    return signals;
  }

  private checkStopLossTriggers(): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    this.positions.forEach((position, symbol) => {
      const lossPercentage = Math.abs(position.pnlPercentage);
      if (lossPercentage >= this.config.stopLoss) {
        signals.push({
          action: 'SELL',
          symbol,
          confidence: 100,
          price: position.currentPrice,
          quantity: position.quantity,
          reason: `Stop-loss triggered: ${lossPercentage.toFixed(2)}% loss`,
          timestamp: Date.now(),
          riskLevel: 'HIGH',
        });
      }
    });
    
    return signals;
  }

  private checkTakeProfitTriggers(): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    if (!this.config.takeProfit) return signals;
    
    this.positions.forEach((position, symbol) => {
      if (position.pnlPercentage >= this.config.takeProfit) {
        signals.push({
          action: 'SELL',
          symbol,
          confidence: 90,
          price: position.currentPrice,
          quantity: position.quantity,
          reason: `Take-profit triggered: ${position.pnlPercentage.toFixed(2)}% gain`,
          timestamp: Date.now(),
          riskLevel: 'LOW',
        });
      }
    });
    
    return signals;
  }

  // Update position after trade execution
  updatePosition(symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number): void {
    const currentPosition = this.positions.get(symbol);
    
    if (action === 'BUY') {
      if (currentPosition) {
        // Average down/up
        const totalQuantity = currentPosition.quantity + quantity;
        const totalValue = (currentPosition.quantity * currentPosition.entryPrice) + (quantity * price);
        const newEntryPrice = totalValue / totalQuantity;
        
        this.positions.set(symbol, {
          symbol,
          quantity: totalQuantity,
          entryPrice: newEntryPrice,
          currentPrice: price,
          pnl: (price - newEntryPrice) * totalQuantity,
          pnlPercentage: ((price - newEntryPrice) / newEntryPrice) * 100,
          timestamp: Date.now(),
        });
      } else {
        // New position
        this.positions.set(symbol, {
          symbol,
          quantity,
          entryPrice: price,
          currentPrice: price,
          pnl: 0,
          pnlPercentage: 0,
          timestamp: Date.now(),
        });
      }
    } else if (action === 'SELL') {
      if (currentPosition) {
        const remainingQuantity = currentPosition.quantity - quantity;
        if (remainingQuantity <= 0.001) { // Close position if quantity is negligible
          this.positions.delete(symbol);
        } else {
          // Partial sell
          this.positions.set(symbol, {
            ...currentPosition,
            quantity: remainingQuantity,
            currentPrice: price,
            pnl: (price - currentPosition.entryPrice) * remainingQuantity,
            pnlPercentage: ((price - currentPosition.entryPrice) / currentPosition.entryPrice) * 100,
          });
        }
      }
    }
    
    this.updatePerformance();
  }

  private updatePerformance(): void {
    let totalPnL = 0;
    let totalTrades = 0;
    let winningTrades = 0;
    
    this.positions.forEach(position => {
      totalPnL += position.pnl;
      totalTrades++;
      if (position.pnl > 0) winningTrades++;
    });
    
    this.performance = {
      totalPnL,
      totalPnLPercentage: this.config.allocation > 0 ? (totalPnL / this.config.allocation) * 100 : 0,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalTrades,
      maxDrawdown: this.calculateMaxDrawdown(),
      sharpeRatio: this.calculateSharpeRatio(),
      lastUpdate: Date.now(),
    };
  }

  private calculateMaxDrawdown(): number {
    // Simplified max drawdown calculation
    // In production, maintain a running peak and calculate drawdown from peak
    return 0; // Placeholder
  }

  private calculateSharpeRatio(): number {
    // Simplified Sharpe ratio calculation
    // In production, calculate based on historical returns and risk-free rate
    return 0; // Placeholder
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getPerformance(): BotPerformance {
    return this.performance;
  }

  getConfig(): BotConfig {
    return this.config;
  }
}

