// ============================================================================
// CCI (COMMODITY CHANNEL INDEX) MARKET BOT ALGORITHM
// ============================================================================

export interface CCIData {
  symbol: string;
  timestamp: number;
  price: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  cci: number;
  cciMA: number; // CCI moving average
  cciSignal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  strength: number; // Trend strength 0-100
}

export interface CCIPosition {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
  entrySignal: string;
  entryTimestamp: number;
  stopLoss: number;
  takeProfit: number;
  status: 'ACTIVE' | 'CLOSED';
}

export interface CCIConfig {
  period: number; // CCI calculation period (default 20)
  overboughtLevel: number; // Default 100
  oversoldLevel: number; // Default -100
  extremeOverbought: number; // Default 200
  extremeOversold: number; // Default -200
  maPeriod: number; // Moving average period for CCI smoothing
  volumeThreshold: number; // Minimum volume for signals
  trendConfirmationPeriod: number; // Period for trend confirmation
}

export class CCIMarketBot {
  private config: BotConfig;
  private cciConfig: CCIConfig;
  private positions: Map<string, CCIPosition> = new Map();
  private performance: BotPerformance;
  private priceHistory: Map<string, CCIData[]> = new Map();
  private lastAnalysis: number = 0;

  constructor(config: BotConfig, cciConfig?: Partial<CCIConfig>) {
    this.config = config;
    this.cciConfig = {
      period: 20,
      overboughtLevel: 100,
      oversoldLevel: -100,
      extremeOverbought: 200,
      extremeOversold: -200,
      maPeriod: 5,
      volumeThreshold: 1.2, // 20% above average volume
      trendConfirmationPeriod: 10,
      ...cciConfig,
    };
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

  // Main CCI analysis algorithm
  analyzeMarket(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const now = Date.now();
    
    // Update price history and calculate CCI
    marketData.forEach(data => {
      this.updatePriceHistory(data);
    });

    // Analyze each asset for CCI signals
    this.config.enabledAssets.forEach(symbol => {
      const cciData = this.calculateCCI(symbol);
      if (!cciData) return;

      // Generate signals based on CCI analysis
      const assetSignals = this.generateCCISignals(symbol, cciData);
      signals.push(...assetSignals);
    });

    // Check for position management
    const managementSignals = this.managePositions(marketData);
    signals.push(...managementSignals);

    this.lastAnalysis = now;
    return signals;
  }

  private updatePriceHistory(marketData: MarketData): void {
    if (!this.priceHistory.has(marketData.symbol)) {
      this.priceHistory.set(marketData.symbol, []);
    }

    const history = this.priceHistory.get(marketData.symbol)!;
    
    // Create CCIData from MarketData
    const cciData: CCIData = {
      symbol: marketData.symbol,
      timestamp: marketData.timestamp,
      price: marketData.price,
      high: marketData.high24h,
      low: marketData.low24h,
      close: marketData.price,
      volume: marketData.volume,
      cci: 0, // Will be calculated
      cciMA: 0, // Will be calculated
      cciSignal: 'NEUTRAL',
      trend: 'SIDEWAYS',
      strength: 0,
    };

    history.push(cciData);
    
    // Keep only necessary history (period + maPeriod + buffer)
    const maxHistory = this.cciConfig.period + this.cciConfig.maPeriod + 10;
    if (history.length > maxHistory) {
      history.shift();
    }
  }

  private calculateCCI(symbol: string): CCIData | null {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < this.cciConfig.period) {
      return null;
    }

    const latest = history[history.length - 1];
    
    // Calculate CCI
    const cci = this.computeCCI(history);
    latest.cci = cci;
    
    // Calculate CCI moving average
    const cciMA = this.calculateCCIMA(history);
    latest.cciMA = cciMA;
    
    // Determine CCI signal
    latest.cciSignal = this.determineCCISignal(cci, cciMA);
    
    // Determine trend
    latest.trend = this.determineTrend(history);
    
    // Calculate trend strength
    latest.strength = this.calculateTrendStrength(history);
    
    return latest;
  }

  private computeCCI(history: CCIData[]): number {
    const period = this.cciConfig.period;
    const recent = history.slice(-period);
    
    // Calculate Typical Price (TP) for each period
    const typicalPrices = recent.map(data => (data.high + data.low + data.close) / 3);
    
    // Calculate Simple Moving Average of TP
    const smaTP = typicalPrices.reduce((sum, tp) => sum + tp, 0) / period;
    
    // Calculate Mean Deviation
    const meanDeviation = typicalPrices.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / period;
    
    // Calculate CCI
    const currentTP = typicalPrices[typicalPrices.length - 1];
    return meanDeviation !== 0 ? (currentTP - smaTP) / (0.015 * meanDeviation) : 0;
  }

  private calculateCCIMA(history: CCIData[]): number {
    const maPeriod = this.cciConfig.maPeriod;
    const recent = history.slice(-maPeriod);
    
    const cciValues = recent.map(data => data.cci).filter(cci => cci !== 0);
    if (cciValues.length === 0) return 0;
    
    return cciValues.reduce((sum, cci) => sum + cci, 0) / cciValues.length;
  }

  private determineCCISignal(cci: number, cciMA: number): 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' {
    if (cci >= this.cciConfig.extremeOverbought) {
      return 'OVERBOUGHT';
    } else if (cci <= this.cciConfig.extremeOversold) {
      return 'OVERSOLD';
    } else if (cci >= this.cciConfig.overboughtLevel) {
      return 'OVERBOUGHT';
    } else if (cci <= this.cciConfig.oversoldLevel) {
      return 'OVERSOLD';
    } else {
      return 'NEUTRAL';
    }
  }

  private determineTrend(history: CCIData[]): 'BULLISH' | 'BEARISH' | 'SIDEWAYS' {
    const confirmationPeriod = this.cciConfig.trendConfirmationPeriod;
    if (history.length < confirmationPeriod) return 'SIDEWAYS';
    
    const recent = history.slice(-confirmationPeriod);
    const prices = recent.map(data => data.close);
    
    // Calculate price trend
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = (lastPrice - firstPrice) / firstPrice;
    
    // Calculate CCI trend
    const cciValues = recent.map(data => data.cci).filter(cci => cci !== 0);
    if (cciValues.length < 2) return 'SIDEWAYS';
    
    const cciTrend = cciValues[cciValues.length - 1] - cciValues[0];
    
    // Combine price and CCI trends
    if (priceChange > 0.05 && cciTrend > 0) {
      return 'BULLISH';
    } else if (priceChange < -0.05 && cciTrend < 0) {
      return 'BEARISH';
    } else {
      return 'SIDEWAYS';
    }
  }

  private calculateTrendStrength(history: CCIData[]): number {
    const confirmationPeriod = this.cciConfig.trendConfirmationPeriod;
    if (history.length < confirmationPeriod) return 0;
    
    const recent = history.slice(-confirmationPeriod);
    const prices = recent.map(data => data.close);
    
    // Calculate R-squared for trend strength
    const n = prices.length;
    const x = Array.from({length: n}, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * prices[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const meanY = sumY / n;
    
    let ssRes = 0;
    let ssTot = 0;
    
    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i];
      ssRes += Math.pow(prices[i] - predicted, 2);
      ssTot += Math.pow(prices[i] - meanY, 2);
    }
    
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
    return Math.max(0, Math.min(100, rSquared * 100));
  }

  private generateCCISignals(symbol: string, cciData: CCIData): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const currentPosition = this.positions.get(symbol);
    
    // Check volume confirmation
    if (!this.isVolumeConfirmed(symbol)) {
      return signals;
    }
    
    // Generate buy signals
    if (!currentPosition) {
      const buySignal = this.generateBuySignal(symbol, cciData);
      if (buySignal) {
        signals.push(buySignal);
      }
    }
    
    // Generate sell signals for existing positions
    if (currentPosition) {
      const sellSignal = this.generateSellSignal(symbol, cciData, currentPosition);
      if (sellSignal) {
        signals.push(sellSignal);
      }
    }
    
    return signals;
  }

  private isVolumeConfirmed(symbol: string): boolean {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 10) return false;
    
    const recent = history.slice(-10);
    const avgVolume = recent.reduce((sum, data) => sum + data.volume, 0) / recent.length;
    const latestVolume = recent[recent.length - 1].volume;
    
    return latestVolume >= avgVolume * this.cciConfig.volumeThreshold;
  }

  private generateBuySignal(symbol: string, cciData: CCIData): TradingSignal | null {
    // Buy conditions
    const isOversold = cciData.cciSignal === 'OVERSOLD';
    const isExtremeOversold = cciData.cci <= this.cciConfig.extremeOversold;
    const isBullishTrend = cciData.trend === 'BULLISH';
    const hasStrongTrend = cciData.strength > 60;
    
    // CCI divergence check
    const hasBullishDivergence = this.checkBullishDivergence(symbol);
    
    // Risk level adjustments
    let confidence = 0;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    if (isExtremeOversold && hasBullishDivergence && hasStrongTrend) {
      confidence = 90;
      riskLevel = 'LOW';
    } else if (isOversold && isBullishTrend && hasStrongTrend) {
      confidence = 80;
      riskLevel = 'MEDIUM';
    } else if (isOversold && hasBullishDivergence) {
      confidence = 70;
      riskLevel = 'MEDIUM';
    } else if (isOversold) {
      confidence = 60;
      riskLevel = 'HIGH';
    }
    
    // Risk level adjustments
    switch (this.config.riskLevel) {
      case 'CONSERVATIVE':
        confidence *= 0.8;
        break;
      case 'AGGRESSIVE':
        confidence *= 1.1;
        break;
    }
    
    if (confidence >= 60) {
      const allocation = this.config.allocation / this.config.maxPositions;
      const quantity = allocation / cciData.price;
      
      return {
        action: 'BUY',
        symbol,
        confidence: Math.min(95, confidence),
        price: cciData.price,
        quantity,
        reason: `CCI oversold: ${cciData.cci.toFixed(2)}, Trend: ${cciData.trend}, Strength: ${cciData.strength.toFixed(1)}%`,
        timestamp: Date.now(),
        riskLevel,
      };
    }
    
    return null;
  }

  private generateSellSignal(symbol: string, cciData: CCIData, position: CCIPosition): TradingSignal | null {
    // Sell conditions
    const isOverbought = cciData.cciSignal === 'OVERBOUGHT';
    const isExtremeOverbought = cciData.cci >= this.cciConfig.extremeOverbought;
    const isBearishTrend = cciData.trend === 'BEARISH';
    const hasBearishDivergence = this.checkBearishDivergence(symbol);
    
    // Stop-loss check
    if (position.pnlPercentage <= -this.config.stopLoss) {
      return {
        action: 'SELL',
        symbol,
        confidence: 100,
        price: cciData.price,
        quantity: position.quantity,
        reason: `Stop-loss triggered: ${position.pnlPercentage.toFixed(2)}% loss`,
        timestamp: Date.now(),
        riskLevel: 'HIGH',
      };
    }
    
    // Take-profit check
    if (this.config.takeProfit && position.pnlPercentage >= this.config.takeProfit) {
      return {
        action: 'SELL',
        symbol,
        confidence: 90,
        price: cciData.price,
        quantity: position.quantity,
        reason: `Take-profit triggered: ${position.pnlPercentage.toFixed(2)}% gain`,
        timestamp: Date.now(),
        riskLevel: 'LOW',
      };
    }
    
    // CCI-based sell signals
    let confidence = 0;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    if (isExtremeOverbought && hasBearishDivergence && isBearishTrend) {
      confidence = 90;
      riskLevel = 'LOW';
    } else if (isOverbought && isBearishTrend) {
      confidence = 80;
      riskLevel = 'MEDIUM';
    } else if (isOverbought && hasBearishDivergence) {
      confidence = 75;
      riskLevel = 'MEDIUM';
    } else if (isOverbought) {
      confidence = 65;
      riskLevel = 'HIGH';
    }
    
    if (confidence >= 65) {
      return {
        action: 'SELL',
        symbol,
        confidence: Math.min(95, confidence),
        price: cciData.price,
        quantity: position.quantity,
        reason: `CCI overbought: ${cciData.cci.toFixed(2)}, Trend: ${cciData.trend}`,
        timestamp: Date.now(),
        riskLevel,
      };
    }
    
    return null;
  }

  private checkBullishDivergence(symbol: string): boolean {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 20) return false;
    
    const recent = history.slice(-20);
    const prices = recent.map(data => data.close);
    const cciValues = recent.map(data => data.cci);
    
    // Find recent lows
    const priceLow = Math.min(...prices.slice(-10));
    const cciLow = Math.min(...cciValues.slice(-10));
    
    // Find previous lows
    const prevPrices = prices.slice(0, 10);
    const prevCCI = cciValues.slice(0, 10);
    const prevPriceLow = Math.min(...prevPrices);
    const prevCCILow = Math.min(...prevCCI);
    
    // Bullish divergence: price makes lower low, CCI makes higher low
    return priceLow < prevPriceLow && cciLow > prevCCILow;
  }

  private checkBearishDivergence(symbol: string): boolean {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 20) return false;
    
    const recent = history.slice(-20);
    const prices = recent.map(data => data.close);
    const cciValues = recent.map(data => data.cci);
    
    // Find recent highs
    const priceHigh = Math.max(...prices.slice(-10));
    const cciHigh = Math.max(...cciValues.slice(-10));
    
    // Find previous highs
    const prevPrices = prices.slice(0, 10);
    const prevCCI = cciValues.slice(0, 10);
    const prevPriceHigh = Math.max(...prevPrices);
    const prevCCIHigh = Math.max(...prevCCI);
    
    // Bearish divergence: price makes higher high, CCI makes lower high
    return priceHigh > prevPriceHigh && cciHigh < prevCCIHigh;
  }

  private managePositions(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    this.positions.forEach((position, symbol) => {
      const assetData = marketData.find(d => d.symbol === symbol);
      if (!assetData) return;
      
      // Update position with current price
      position.currentPrice = assetData.price;
      position.pnl = (assetData.price - position.entryPrice) * position.quantity;
      position.pnlPercentage = ((assetData.price - position.entryPrice) / position.entryPrice) * 100;
      
      // Check for trailing stop-loss
      if (this.shouldUpdateTrailingStop(position)) {
        // Update trailing stop logic here
      }
    });
    
    return signals;
  }

  private shouldUpdateTrailingStop(position: CCIPosition): boolean {
    // Implement trailing stop logic
    // This would track the highest price since entry and adjust stop-loss accordingly
    return false; // Placeholder
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
          ...currentPosition,
          quantity: totalQuantity,
          entryPrice: newEntryPrice,
          currentPrice: price,
          pnl: (price - newEntryPrice) * totalQuantity,
          pnlPercentage: ((price - newEntryPrice) / newEntryPrice) * 100,
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
          entrySignal: 'CCI Oversold',
          entryTimestamp: Date.now(),
          stopLoss: price * (1 - this.config.stopLoss / 100),
          takeProfit: this.config.takeProfit ? price * (1 + this.config.takeProfit / 100) : 0,
          status: 'ACTIVE',
        });
      }
    } else if (action === 'SELL') {
      if (currentPosition) {
        const remainingQuantity = currentPosition.quantity - quantity;
        if (remainingQuantity <= 0.001) {
          this.positions.delete(symbol);
        } else {
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
    // Calculate maximum drawdown from peak
    let maxDrawdown = 0;
    let peakValue = 0;
    
    this.positions.forEach(position => {
      const currentValue = position.currentPrice * position.quantity;
      if (currentValue > peakValue) {
        peakValue = currentValue;
      } else {
        const drawdown = (peakValue - currentValue) / peakValue;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });
    
    return maxDrawdown * 100;
  }

  private calculateSharpeRatio(): number {
    // Simplified Sharpe ratio calculation
    const returns = [];
    
    this.positions.forEach(position => {
      const returnRate = position.pnlPercentage / 100;
      returns.push(returnRate);
    });
    
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Assume risk-free rate of 2% annually
    const riskFreeRate = 0.02 / 365; // Daily risk-free rate
    return stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
  }

  getPositions(): CCIPosition[] {
    return Array.from(this.positions.values());
  }

  getPerformance(): BotPerformance {
    return this.performance;
  }

  getConfig(): BotConfig {
    return this.config;
  }

  getCCIConfig(): CCIConfig {
    return this.cciConfig;
  }

  // Get current CCI data for all tracked symbols
  getCurrentCCIData(): CCIData[] {
    const cciData: CCIData[] = [];
    
    this.priceHistory.forEach((history, symbol) => {
      if (history.length > 0) {
        const latest = history[history.length - 1];
        cciData.push(latest);
      }
    });
    
    return cciData;
  }

  // Get CCI history for a specific symbol
  getCCIHistory(symbol: string): CCIData[] {
    return this.priceHistory.get(symbol) || [];
  }
}

