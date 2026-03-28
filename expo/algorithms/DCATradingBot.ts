// ============================================================================
// DCA (DOLLAR-COST AVERAGING) TRADING BOT ALGORITHM
// ============================================================================

export interface DCASchedule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number; // hours for custom frequency
  amount: number; // USD amount per purchase
  startDate: number;
  endDate?: number; // optional end date
  maxPurchases?: number; // optional max number of purchases
}

export interface DCAPosition {
  symbol: string;
  totalQuantity: number;
  totalInvested: number;
  averagePrice: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  purchases: Array<{
    date: number;
    price: number;
    quantity: number;
    amount: number;
  }>;
  lastPurchase: number;
  nextPurchase: number;
}

export class DCATradingBot {
  private config: BotConfig;
  private schedule: DCASchedule;
  private positions: Map<string, DCAPosition> = new Map();
  private performance: BotPerformance;
  private marketData: Map<string, MarketData[]> = new Map();
  private static readonly MAX_HISTORY = 1000;
  private static readonly PRUNE_CHUNK = 200;

  constructor(config: BotConfig, schedule: DCASchedule) {
    this.config = config;
    this.schedule = schedule;
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

  // Main DCA algorithm - optimized for consistent purchasing
  analyzeMarket(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const now = Date.now();
    
    // Update market data
    marketData.forEach(data => {
      if (!this.marketData.has(data.symbol)) {
        this.marketData.set(data.symbol, []);
      }
      const history = this.marketData.get(data.symbol)!;
      history.push(data);
      
      // Keep only last MAX_HISTORY data points with chunked pruning
      if (history.length > DCATradingBot.MAX_HISTORY + DCATradingBot.PRUNE_CHUNK) {
        history.splice(0, history.length - DCATradingBot.MAX_HISTORY);
      }
    });

    // Check each enabled asset for DCA opportunities
    this.config.enabledAssets.forEach(symbol => {
      const position = this.positions.get(symbol);
      const assetData = marketData.find(d => d.symbol === symbol);
      
      if (!assetData) return;

      // Check if it's time for next purchase
      if (this.shouldMakePurchase(position, now)) {
        const signal = this.generateDCASignal(symbol, assetData, position);
        if (signal) {
          signals.push(signal);
        }
      }

      // Check for emergency stop-loss (if configured)
      if (position && this.config.stopLoss > 0) {
        const stopLossSignal = this.checkEmergencyStopLoss(position, assetData);
        if (stopLossSignal) {
          signals.push(stopLossSignal);
        }
      }

      // Check for take-profit opportunities (if configured)
      if (position && this.config.takeProfit && this.shouldTakeProfit(position, assetData)) {
        const takeProfitSignal = this.generateTakeProfitSignal(position, assetData);
        if (takeProfitSignal) {
          signals.push(takeProfitSignal);
        }
      }
    });

    return signals;
  }

  private shouldMakePurchase(position: DCAPosition | undefined, now: number): boolean {
    // Check if we're within the schedule timeframe
    if (now < this.schedule.startDate) return false;
    if (this.schedule.endDate && now > this.schedule.endDate) return false;
    if (this.schedule.maxPurchases && position && position.purchases.length >= this.schedule.maxPurchases) {
      return false;
    }

    // Check frequency
    if (!position) {
      // First purchase - make it immediately if within timeframe
      return true;
    }

    const timeSinceLastPurchase = now - position.lastPurchase;
    const intervalMs = this.getIntervalMs();

    return timeSinceLastPurchase >= intervalMs;
  }

  private getIntervalMs(): number {
    switch (this.schedule.frequency) {
      case 'DAILY':
        return 24 * 60 * 60 * 1000;
      case 'WEEKLY':
        return 7 * 24 * 60 * 60 * 1000;
      case 'MONTHLY':
        return 30 * 24 * 60 * 60 * 1000;
      case 'CUSTOM':
        return this.schedule.interval * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private generateDCASignal(symbol: string, assetData: MarketData, position: DCAPosition | undefined): TradingSignal | null {
    const amount = this.schedule.amount;
    const quantity = amount / assetData.price;
    
    // Apply dynamic sizing based on market conditions
    const adjustedAmount = this.applyDynamicSizing(amount, assetData, position);
    const adjustedQuantity = adjustedAmount / assetData.price;

    // Calculate confidence based on market conditions
    const confidence = this.calculateDCAConfidence(assetData, position);

    return {
      action: 'BUY',
      symbol,
      confidence,
      price: assetData.price,
      quantity: adjustedQuantity,
      reason: `DCA purchase - ${this.schedule.frequency.toLowerCase()} schedule`,
      timestamp: Date.now(),
      riskLevel: this.calculateRiskLevel(assetData, position),
    };
  }

  private applyDynamicSizing(baseAmount: number, assetData: MarketData, position: DCAPosition | undefined): number {
    let multiplier = 1.0;

    // Volatility-based adjustment
    const volatility = this.calculateVolatility(assetData.symbol);
    if (volatility > 0.05) { // High volatility
      multiplier *= 0.8; // Reduce size in high volatility
    } else if (volatility < 0.02) { // Low volatility
      multiplier *= 1.2; // Increase size in low volatility
    }

    // Price trend adjustment
    if (position) {
      const priceChange = (assetData.price - position.averagePrice) / position.averagePrice;
      if (priceChange < -0.1) { // Down 10% or more
        multiplier *= 1.5; // Increase size when buying dips
      } else if (priceChange > 0.2) { // Up 20% or more
        multiplier *= 0.7; // Reduce size when buying highs
      }
    }

    // Volume confirmation
    const volumeRatio = this.calculateVolumeRatio(assetData.symbol);
    if (volumeRatio > 1.5) { // High volume
      multiplier *= 1.1; // Slightly increase size
    } else if (volumeRatio < 0.5) { // Low volume
      multiplier *= 0.9; // Slightly decrease size
    }

    // Risk level adjustment
    switch (this.config.riskLevel) {
      case 'CONSERVATIVE':
        multiplier *= 0.8;
        break;
      case 'AGGRESSIVE':
        multiplier *= 1.3;
        break;
      default:
        // MODERATE - no adjustment
        break;
    }

    return Math.max(baseAmount * 0.5, Math.min(baseAmount * 2.0, baseAmount * multiplier));
  }

  private calculateDCAConfidence(assetData: MarketData, position: DCAPosition | undefined): number {
    let confidence = 70; // Base confidence for DCA

    // Market condition adjustments
    if (assetData.change24h < -5) { // Down 5% or more
      confidence += 15; // Higher confidence when buying dips
    } else if (assetData.change24h > 10) { // Up 10% or more
      confidence -= 10; // Lower confidence when buying highs
    }

    // Volume confirmation
    const volumeRatio = this.calculateVolumeRatio(assetData.symbol);
    if (volumeRatio > 1.2) {
      confidence += 5; // Higher confidence with good volume
    } else if (volumeRatio < 0.8) {
      confidence -= 5; // Lower confidence with low volume
    }

    // Position size adjustment
    if (position) {
      const positionSize = (position.totalInvested / this.config.allocation) * 100;
      if (positionSize < 20) { // Small position
        confidence += 10; // Higher confidence for smaller positions
      } else if (positionSize > 50) { // Large position
        confidence -= 10; // Lower confidence for larger positions
      }
    }

    return Math.max(30, Math.min(95, confidence));
  }

  private calculateRiskLevel(assetData: MarketData, position: DCAPosition | undefined): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;

    // Volatility risk
    const volatility = this.calculateVolatility(assetData.symbol);
    if (volatility > 0.08) {
      riskScore += 3;
    } else if (volatility > 0.05) {
      riskScore += 2;
    } else if (volatility > 0.03) {
      riskScore += 1;
    }

    // Price movement risk
    if (Math.abs(assetData.change24h) > 15) {
      riskScore += 2;
    } else if (Math.abs(assetData.change24h) > 10) {
      riskScore += 1;
    }

    // Volume risk
    const volumeRatio = this.calculateVolumeRatio(assetData.symbol);
    if (volumeRatio < 0.5) {
      riskScore += 1;
    }

    // Position concentration risk
    if (position) {
      const positionSize = (position.totalInvested / this.config.allocation) * 100;
      if (positionSize > 40) {
        riskScore += 1;
      }
    }

    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  private checkEmergencyStopLoss(position: DCAPosition, assetData: MarketData): TradingSignal | null {
    if (!position) return null;

    const currentValue = position.totalQuantity * assetData.price;
    const totalPnLPercentage = ((currentValue - position.totalInvested) / position.totalInvested) * 100;
    
    // Emergency stop-loss only triggers on significant losses
    if (totalPnLPercentage <= -this.config.stopLoss) {
      return {
        action: 'SELL',
        symbol: position.symbol,
        confidence: 100,
        price: assetData.price,
        quantity: position.totalQuantity,
        reason: `Emergency stop-loss triggered: ${totalPnLPercentage.toFixed(2)}% loss`,
        timestamp: Date.now(),
        riskLevel: 'HIGH',
      };
    }

    return null;
  }

  private shouldTakeProfit(position: DCAPosition, assetData: MarketData): boolean {
    if (!this.config.takeProfit) return false;

    const currentValue = position.totalQuantity * assetData.price;
    const totalPnLPercentage = ((currentValue - position.totalInvested) / position.totalInvested) * 100;
    
    return totalPnLPercentage >= this.config.takeProfit;
  }

  private generateTakeProfitSignal(position: DCAPosition, assetData: MarketData): TradingSignal {
    return {
      action: 'SELL',
      symbol: position.symbol,
      confidence: 90,
      price: assetData.price,
      quantity: position.totalQuantity,
      reason: `Take-profit triggered: ${((assetData.price * position.totalQuantity - position.totalInvested) / position.totalInvested * 100).toFixed(2)}% gain`,
      timestamp: Date.now(),
      riskLevel: 'LOW',
    };
  }

  private calculateVolatility(symbol: string): number {
    const history = this.marketData.get(symbol);
    if (!history || history.length < 10) return 0;

    const prices = history.slice(-20).map(d => d.price);
    const returns = [];
    
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateVolumeRatio(symbol: string): number {
    const history = this.marketData.get(symbol);
    if (!history || history.length < 10) return 1;

    const recentVolumes = history.slice(-10).map(d => d.volume);
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const latestVolume = recentVolumes[recentVolumes.length - 1];
    
    return latestVolume / avgVolume;
  }

  // Update position after trade execution
  updatePosition(symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number): void {
    const currentPosition = this.positions.get(symbol);
    
    if (action === 'BUY') {
      const amount = quantity * price;
      
      if (currentPosition) {
        // Update existing position
        const newTotalQuantity = currentPosition.totalQuantity + quantity;
        const newTotalInvested = currentPosition.totalInvested + amount;
        const newAveragePrice = newTotalInvested / newTotalQuantity;
        
        this.positions.set(symbol, {
          symbol,
          totalQuantity: newTotalQuantity,
          totalInvested: newTotalInvested,
          averagePrice: newAveragePrice,
          currentValue: newTotalQuantity * price,
          totalPnL: (price - newAveragePrice) * newTotalQuantity,
          totalPnLPercentage: ((price - newAveragePrice) / newAveragePrice) * 100,
          purchases: [
            ...currentPosition.purchases,
            {
              date: Date.now(),
              price,
              quantity,
              amount,
            }
          ],
          lastPurchase: Date.now(),
          nextPurchase: Date.now() + this.getIntervalMs(),
        });
      } else {
        // Create new position
        this.positions.set(symbol, {
          symbol,
          totalQuantity: quantity,
          totalInvested: amount,
          averagePrice: price,
          currentValue: quantity * price,
          totalPnL: 0,
          totalPnLPercentage: 0,
          purchases: [{
            date: Date.now(),
            price,
            quantity,
            amount,
          }],
          lastPurchase: Date.now(),
          nextPurchase: Date.now() + this.getIntervalMs(),
        });
      }
    } else if (action === 'SELL') {
      if (currentPosition) {
        // Close position
        this.positions.delete(symbol);
      }
    }
    
    this.updatePerformance();
  }

  private updatePerformance(): void {
    let totalPnL = 0;
    let totalInvested = 0;
    let totalTrades = 0;
    let winningTrades = 0;
    
    this.positions.forEach(position => {
      totalPnL += position.totalPnL;
      totalInvested += position.totalInvested;
      totalTrades += position.purchases.length;
      
      if (position.totalPnL > 0) {
        winningTrades += position.purchases.length;
      }
    });
    
    this.performance = {
      totalPnL,
      totalPnLPercentage: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
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
      const currentValue = position.currentValue;
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
    // In production, calculate based on historical returns and risk-free rate
    const returns = [];
    
    this.positions.forEach(position => {
      if (position.purchases.length > 1) {
        const firstPurchase = position.purchases[0];
        const lastPurchase = position.purchases[position.purchases.length - 1];
        const returnRate = (lastPurchase.price - firstPurchase.price) / firstPurchase.price;
        returns.push(returnRate);
      }
    });
    
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Assume risk-free rate of 2% annually
    const riskFreeRate = 0.02 / 365; // Daily risk-free rate
    return stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
  }

  getPositions(): DCAPosition[] {
    return Array.from(this.positions.values());
  }

  getPerformance(): BotPerformance {
    return this.performance;
  }

  getConfig(): BotConfig {
    return this.config;
  }

  getSchedule(): DCASchedule {
    return this.schedule;
  }

  // Get next purchase times for all positions
  getNextPurchases(): Array<{symbol: string, nextPurchase: number}> {
    const nextPurchases: Array<{symbol: string, nextPurchase: number}> = [];
    
    this.positions.forEach(position => {
      nextPurchases.push({
        symbol: position.symbol,
        nextPurchase: position.nextPurchase,
      });
    });
    
    return nextPurchases;
  }
}

