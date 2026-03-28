// ============================================================================
// ADVANCED RISK MANAGEMENT & ALGORITHM OPTIMIZER
// ============================================================================

export interface RiskMetrics {
  portfolioValue: number;
  totalExposure: number;
  maxDrawdown: number;
  currentDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  var95: number; // Value at Risk 95%
  cvar95: number; // Conditional Value at Risk 95%
  beta: number;
  correlation: number;
  volatility: number;
  lastUpdated: number;
}

export interface MarketCondition {
  trend: 'BULL' | 'BEAR' | 'SIDEWAYS';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  volume: 'LOW' | 'NORMAL' | 'HIGH';
  sentiment: 'FEAR' | 'NEUTRAL' | 'GREED';
  strength: number; // 0-100
  confidence: number; // 0-100
}

export interface RiskLimits {
  maxPositionSize: number; // % of portfolio
  maxTotalExposure: number; // % of portfolio
  maxDrawdown: number; // % of portfolio
  maxCorrelation: number; // 0-1
  maxVolatility: number; // % daily
  minLiquidity: number; // minimum volume
  maxLeverage: number; // 1x = no leverage
  emergencyStopLoss: number; // % of portfolio
}

export interface OptimizationResult {
  algorithm: string;
  optimized: boolean;
  improvements: string[];
  newParameters: Record<string, any>;
  expectedImprovement: number; // % improvement
  riskReduction: number; // % risk reduction
  confidence: number; // 0-100
}

export class RiskManager {
  private riskLimits: RiskLimits;
  private marketHistory: MarketData[] = [];
  private performanceHistory: Array<{timestamp: number, value: number, drawdown: number}> = [];
  private correlationMatrix: Map<string, Map<string, number>> = new Map();

  constructor(riskLimits: RiskLimits) {
    this.riskLimits = riskLimits;
  }

  // Analyze market conditions for risk assessment
  analyzeMarketConditions(marketData: MarketData[]): MarketCondition {
    this.updateMarketHistory(marketData);
    
    const trend = this.analyzeTrend(marketData);
    const volatility = this.analyzeVolatility(marketData);
    const volume = this.analyzeVolume(marketData);
    const sentiment = this.analyzeSentiment(marketData);
    const strength = this.calculateTrendStrength(marketData);
    const confidence = this.calculateConfidence(marketData);

    return {
      trend,
      volatility,
      volume,
      sentiment,
      strength,
      confidence,
    };
  }

  // Calculate comprehensive risk metrics
  calculateRiskMetrics(positions: Position[], marketData: MarketData[]): RiskMetrics {
    const portfolioValue = this.calculatePortfolioValue(positions, marketData);
    const totalExposure = this.calculateTotalExposure(positions, marketData);
    const maxDrawdown = this.calculateMaxDrawdown();
    const currentDrawdown = this.calculateCurrentDrawdown(portfolioValue);
    const sharpeRatio = this.calculateSharpeRatio();
    const sortinoRatio = this.calculateSortinoRatio();
    const calmarRatio = this.calculateCalmarRatio();
    const var95 = this.calculateVaR(0.95);
    const cvar95 = this.calculateCVaR(0.95);
    const beta = this.calculateBeta(positions, marketData);
    const correlation = this.calculatePortfolioCorrelation(positions);
    const volatility = this.calculatePortfolioVolatility(positions, marketData);

    return {
      portfolioValue,
      totalExposure,
      maxDrawdown,
      currentDrawdown,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      var95,
      cvar95,
      beta,
      correlation,
      volatility,
      lastUpdated: Date.now(),
    };
  }

  // Validate trading signals against risk limits
  validateSignal(signal: TradingSignal, positions: Position[], marketData: MarketData[]): {
    approved: boolean;
    adjustedQuantity?: number;
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    const riskMetrics = this.calculateRiskMetrics(positions, marketData);
    const marketCondition = this.analyzeMarketConditions(marketData);

    // Check position size limits
    const positionValue = signal.quantity * signal.price;
    const positionSizePercent = (positionValue / riskMetrics.portfolioValue) * 100;
    
    if (positionSizePercent > this.riskLimits.maxPositionSize) {
      const adjustedQuantity = (this.riskLimits.maxPositionSize / 100) * riskMetrics.portfolioValue / signal.price;
      return {
        approved: true,
        adjustedQuantity,
        reason: `Position size reduced from ${positionSizePercent.toFixed(2)}% to ${this.riskLimits.maxPositionSize}%`,
        riskLevel: 'HIGH',
      };
    }

    // Check total exposure limits
    const newTotalExposure = riskMetrics.totalExposure + positionValue;
    const exposurePercent = (newTotalExposure / riskMetrics.portfolioValue) * 100;
    
    if (exposurePercent > this.riskLimits.maxTotalExposure) {
      return {
        approved: false,
        reason: `Total exposure would exceed limit: ${exposurePercent.toFixed(2)}% > ${this.riskLimits.maxTotalExposure}%`,
        riskLevel: 'HIGH',
      };
    }

    // Check drawdown limits
    if (riskMetrics.currentDrawdown > this.riskLimits.maxDrawdown) {
      return {
        approved: false,
        reason: `Current drawdown exceeds limit: ${riskMetrics.currentDrawdown.toFixed(2)}% > ${this.riskLimits.maxDrawdown}%`,
        riskLevel: 'HIGH',
      };
    }

    // Check volatility limits
    if (riskMetrics.volatility > this.riskLimits.maxVolatility) {
      return {
        approved: false,
        reason: `Portfolio volatility exceeds limit: ${riskMetrics.volatility.toFixed(2)}% > ${this.riskLimits.maxVolatility}%`,
        riskLevel: 'HIGH',
      };
    }

    // Check correlation limits
    if (riskMetrics.correlation > this.riskLimits.maxCorrelation) {
      return {
        approved: false,
        reason: `Portfolio correlation exceeds limit: ${riskMetrics.correlation.toFixed(2)} > ${this.riskLimits.maxCorrelation}`,
        riskLevel: 'MEDIUM',
      };
    }

    // Check market condition adjustments
    const marketAdjustment = this.getMarketConditionAdjustment(marketCondition, signal);
    if (!marketAdjustment.approved) {
      return marketAdjustment;
    }

    // Check liquidity requirements
    const assetData = marketData.find(d => d.symbol === signal.symbol);
    if (assetData && assetData.volume < this.riskLimits.minLiquidity) {
      return {
        approved: false,
        reason: `Insufficient liquidity: ${assetData.volume} < ${this.riskLimits.minLiquidity}`,
        riskLevel: 'HIGH',
      };
    }

    return {
      approved: true,
      reason: 'Signal approved by risk management',
      riskLevel: this.calculateSignalRiskLevel(signal, marketCondition),
    };
  }

  // Emergency risk management actions
  emergencyRiskManagement(positions: Position[], marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const riskMetrics = this.calculateRiskMetrics(positions, marketData);
    const marketCondition = this.analyzeMarketConditions(marketData);

    // Emergency stop-loss if drawdown exceeds emergency limit
    if (riskMetrics.currentDrawdown > this.riskLimits.emergencyStopLoss) {
      positions.forEach(position => {
        signals.push({
          action: 'SELL',
          symbol: position.symbol,
          confidence: 100,
          price: position.currentPrice,
          quantity: position.quantity,
          reason: `Emergency stop-loss: Drawdown ${riskMetrics.currentDrawdown.toFixed(2)}% exceeds ${this.riskLimits.emergencyStopLoss}%`,
          timestamp: Date.now(),
          riskLevel: 'HIGH',
        });
      });
    }

    // Reduce exposure in extreme market conditions
    if (marketCondition.volatility === 'EXTREME' && marketCondition.sentiment === 'FEAR') {
      positions.forEach(position => {
        const reductionPercent = 0.5; // Reduce by 50%
        const reduceQuantity = position.quantity * reductionPercent;
        
        signals.push({
          action: 'SELL',
          symbol: position.symbol,
          confidence: 95,
          price: position.currentPrice,
          quantity: reduceQuantity,
          reason: `Risk reduction: Extreme market volatility and fear sentiment`,
          timestamp: Date.now(),
          riskLevel: 'HIGH',
        });
      });
    }

    // Correlation-based position reduction
    if (riskMetrics.correlation > this.riskLimits.maxCorrelation * 1.5) {
      // Reduce positions with highest correlation
      const sortedPositions = positions.sort((a, b) => {
        const correlationA = this.getPositionCorrelation(a.symbol, positions);
        const correlationB = this.getPositionCorrelation(b.symbol, positions);
        return correlationB - correlationA;
      });

      // Reduce top 50% most correlated positions
      const positionsToReduce = sortedPositions.slice(0, Math.ceil(sortedPositions.length / 2));
      positionsToReduce.forEach(position => {
        signals.push({
          action: 'SELL',
          symbol: position.symbol,
          confidence: 85,
          price: position.currentPrice,
          quantity: position.quantity * 0.3, // Reduce by 30%
          reason: `Correlation reduction: High portfolio correlation ${riskMetrics.correlation.toFixed(2)}`,
          timestamp: Date.now(),
          riskLevel: 'MEDIUM',
        });
      });
    }

    return signals;
  }

  // Optimize algorithm parameters based on market conditions
  optimizeAlgorithm(algorithm: string, currentParams: Record<string, any>, marketCondition: MarketCondition): OptimizationResult {
    const optimizations: OptimizationResult = {
      algorithm,
      optimized: false,
      improvements: [],
      newParameters: { ...currentParams },
      expectedImprovement: 0,
      riskReduction: 0,
      confidence: 0,
    };

    switch (algorithm) {
      case 'momentum':
        return this.optimizeMomentumAlgorithm(currentParams, marketCondition);
      case 'dca':
        return this.optimizeDCAAlgorithm(currentParams, marketCondition);
      case 'staking':
        return this.optimizeStakingAlgorithm(currentParams, marketCondition);
      case 'cci':
        return this.optimizeCCIAlgorithm(currentParams, marketCondition);
      default:
        return optimizations;
    }
  }

  private optimizeMomentumAlgorithm(params: Record<string, any>, marketCondition: MarketCondition): OptimizationResult {
    const result: OptimizationResult = {
      algorithm: 'momentum',
      optimized: false,
      improvements: [],
      newParameters: { ...params },
      expectedImprovement: 0,
      riskReduction: 0,
      confidence: 0,
    };

    // Adjust parameters based on market conditions
    if (marketCondition.volatility === 'EXTREME') {
      result.newParameters.maxPositions = Math.max(2, Math.floor(params.maxPositions * 0.5));
      result.newParameters.stopLoss = Math.min(5, params.stopLoss * 0.7);
      result.improvements.push('Reduced position count and tighter stop-loss for extreme volatility');
      result.riskReduction += 20;
    }

    if (marketCondition.trend === 'BEAR') {
      result.newParameters.rebalanceFrequency = Math.max(60, params.rebalanceFrequency * 1.5); // minutes
      result.newParameters.momentumThreshold = Math.max(0.05, params.momentumThreshold * 1.2);
      result.improvements.push('Increased rebalance frequency and momentum threshold for bear market');
      result.riskReduction += 15;
    }

    if (marketCondition.sentiment === 'FEAR') {
      result.newParameters.maxPositionSize = Math.max(0.05, params.maxPositionSize * 0.8);
      result.improvements.push('Reduced position size for fear sentiment');
      result.riskReduction += 10;
    }

    if (marketCondition.volatility === 'LOW' && marketCondition.trend === 'BULL') {
      result.newParameters.maxPositions = Math.min(10, params.maxPositions * 1.2);
      result.newParameters.momentumThreshold = Math.max(0.02, params.momentumThreshold * 0.8);
      result.improvements.push('Increased position count and lowered momentum threshold for stable bull market');
      result.expectedImprovement += 15;
    }

    result.optimized = result.improvements.length > 0;
    result.confidence = Math.min(90, 60 + result.improvements.length * 10);

    return result;
  }

  private optimizeDCAAlgorithm(params: Record<string, any>, marketCondition: MarketCondition): OptimizationResult {
    const result: OptimizationResult = {
      algorithm: 'dca',
      optimized: false,
      improvements: [],
      newParameters: { ...params },
      expectedImprovement: 0,
      riskReduction: 0,
      confidence: 0,
    };

    // Adjust DCA parameters based on market conditions
    if (marketCondition.volatility === 'HIGH' || marketCondition.volatility === 'EXTREME') {
      result.newParameters.frequency = 'WEEKLY'; // Slow down DCA in high volatility
      result.newParameters.amount = Math.max(params.amount * 0.7, params.amount * 0.5);
      result.improvements.push('Reduced DCA frequency and amount for high volatility');
      result.riskReduction += 25;
    }

    if (marketCondition.trend === 'BEAR') {
      result.newParameters.amount = Math.max(params.amount * 0.8, params.amount * 0.6);
      result.improvements.push('Reduced DCA amount for bear market');
      result.riskReduction += 15;
    }

    if (marketCondition.trend === 'BULL' && marketCondition.volatility === 'LOW') {
      result.newParameters.amount = Math.min(params.amount * 1.3, params.amount * 1.5);
      result.improvements.push('Increased DCA amount for stable bull market');
      result.expectedImprovement += 20;
    }

    result.optimized = result.improvements.length > 0;
    result.confidence = Math.min(85, 70 + result.improvements.length * 8);

    return result;
  }

  private optimizeStakingAlgorithm(params: Record<string, any>, marketCondition: MarketCondition): OptimizationResult {
    const result: OptimizationResult = {
      algorithm: 'staking',
      optimized: false,
      improvements: [],
      newParameters: { ...params },
      expectedImprovement: 0,
      riskReduction: 0,
      confidence: 0,
    };

    // Adjust staking parameters based on market conditions
    if (marketCondition.volatility === 'EXTREME') {
      result.newParameters.maxStakePercent = Math.max(0.1, params.maxStakePercent * 0.5);
      result.newParameters.minAPY = Math.max(5, params.minAPY * 1.2);
      result.improvements.push('Reduced staking allocation and increased minimum APY for extreme volatility');
      result.riskReduction += 30;
    }

    if (marketCondition.trend === 'BEAR') {
      result.newParameters.lockPeriodPreference = 'SHORT'; // Prefer shorter lock periods
      result.improvements.push('Prefer shorter lock periods for bear market');
      result.riskReduction += 20;
    }

    if (marketCondition.trend === 'BULL' && marketCondition.volatility === 'LOW') {
      result.newParameters.maxStakePercent = Math.min(0.8, params.maxStakePercent * 1.2);
      result.improvements.push('Increased staking allocation for stable bull market');
      result.expectedImprovement += 25;
    }

    result.optimized = result.improvements.length > 0;
    result.confidence = Math.min(80, 65 + result.improvements.length * 7);

    return result;
  }

  private optimizeCCIAlgorithm(params: Record<string, any>, marketCondition: MarketCondition): OptimizationResult {
    const result: OptimizationResult = {
      algorithm: 'cci',
      optimized: false,
      improvements: [],
      newParameters: { ...params },
      expectedImprovement: 0,
      riskReduction: 0,
      confidence: 0,
    };

    // Adjust CCI parameters based on market conditions
    if (marketCondition.volatility === 'EXTREME') {
      result.newParameters.overboughtLevel = Math.min(150, params.overboughtLevel * 1.2);
      result.newParameters.oversoldLevel = Math.max(-150, params.oversoldLevel * 1.2);
      result.newParameters.period = Math.max(15, params.period * 0.8);
      result.improvements.push('Adjusted CCI levels and period for extreme volatility');
      result.riskReduction += 20;
    }

    if (marketCondition.trend === 'SIDEWAYS') {
      result.newParameters.overboughtLevel = Math.min(120, params.overboughtLevel * 1.1);
      result.newParameters.oversoldLevel = Math.max(-120, params.oversoldLevel * 1.1);
      result.improvements.push('Tightened CCI levels for sideways market');
      result.expectedImprovement += 10;
    }

    if (marketCondition.volume === 'LOW') {
      result.newParameters.volumeThreshold = Math.max(1.5, params.volumeThreshold * 1.2);
      result.improvements.push('Increased volume threshold for low volume conditions');
      result.riskReduction += 15;
    }

    result.optimized = result.improvements.length > 0;
    result.confidence = Math.min(85, 70 + result.improvements.length * 8);

    return result;
  }

  // Helper methods for risk calculations
  private updateMarketHistory(marketData: MarketData[]): void {
    this.marketHistory.push(...marketData);
    
    // Keep only last 1000 data points
    if (this.marketHistory.length > 1000) {
      this.marketHistory = this.marketHistory.slice(-1000);
    }
  }

  private analyzeTrend(marketData: MarketData[]): 'BULL' | 'BEAR' | 'SIDEWAYS' {
    if (marketData.length < 10) return 'SIDEWAYS';
    
    const prices = marketData.map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const change = (lastPrice - firstPrice) / firstPrice;
    
    if (change > 0.05) return 'BULL';
    if (change < -0.05) return 'BEAR';
    return 'SIDEWAYS';
  }

  private analyzeVolatility(marketData: MarketData[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    if (marketData.length < 10) return 'MEDIUM';
    
    const returns = [];
    for (let i = 1; i < marketData.length; i++) {
      returns.push((marketData[i].price - marketData[i - 1].price) / marketData[i - 1].price);
    }
    
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
    
    if (volatility < 0.02) return 'LOW';
    if (volatility < 0.05) return 'MEDIUM';
    if (volatility < 0.1) return 'HIGH';
    return 'EXTREME';
  }

  private analyzeVolume(marketData: MarketData[]): 'LOW' | 'NORMAL' | 'HIGH' {
    if (marketData.length < 10) return 'NORMAL';
    
    const volumes = marketData.map(d => d.volume);
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const latestVolume = volumes[volumes.length - 1];
    
    const volumeRatio = latestVolume / avgVolume;
    
    if (volumeRatio < 0.7) return 'LOW';
    if (volumeRatio > 1.5) return 'HIGH';
    return 'NORMAL';
  }

  private analyzeSentiment(marketData: MarketData[]): 'FEAR' | 'NEUTRAL' | 'GREED' {
    if (marketData.length < 10) return 'NEUTRAL';
    
    const changes = marketData.map(d => d.change24h);
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const volatility = Math.sqrt(changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length);
    
    // Fear & Greed Index calculation
    const fearGreedScore = (avgChange + 10) * 5; // Convert to 0-100 scale
    
    if (fearGreedScore < 30) return 'FEAR';
    if (fearGreedScore > 70) return 'GREED';
    return 'NEUTRAL';
  }

  private calculateTrendStrength(marketData: MarketData[]): number {
    if (marketData.length < 10) return 50;
    
    const prices = marketData.map(d => d.price);
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

  private calculateConfidence(marketData: MarketData[]): number {
    const trendStrength = this.calculateTrendStrength(marketData);
    const volume = this.analyzeVolume(marketData);
    const volatility = this.analyzeVolatility(marketData);
    
    let confidence = trendStrength;
    
    // Adjust based on volume
    switch (volume) {
      case 'HIGH':
        confidence += 10;
        break;
      case 'LOW':
        confidence -= 15;
        break;
    }
    
    // Adjust based on volatility
    switch (volatility) {
      case 'LOW':
        confidence += 5;
        break;
      case 'HIGH':
        confidence -= 10;
        break;
      case 'EXTREME':
        confidence -= 20;
        break;
    }
    
    return Math.max(0, Math.min(100, confidence));
  }

  private calculatePortfolioValue(positions: Position[], marketData: MarketData[]): number {
    return positions.reduce((total, position) => {
      const assetData = marketData.find(d => d.symbol === position.symbol);
      return total + (assetData ? position.quantity * assetData.price : position.value);
    }, 0);
  }

  private calculateTotalExposure(positions: Position[], marketData: MarketData[]): number {
    return this.calculatePortfolioValue(positions, marketData);
  }

  private calculateMaxDrawdown(): number {
    if (this.performanceHistory.length < 2) return 0;
    
    let maxDrawdown = 0;
    let peak = this.performanceHistory[0].value;
    
    this.performanceHistory.forEach(point => {
      if (point.value > peak) {
        peak = point.value;
      } else {
        const drawdown = (peak - point.value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });
    
    return maxDrawdown * 100;
  }

  private calculateCurrentDrawdown(currentValue: number): number {
    if (this.performanceHistory.length < 2) return 0;
    
    const peak = Math.max(...this.performanceHistory.map(p => p.value));
    return peak > 0 ? ((peak - currentValue) / peak) * 100 : 0;
  }

  private calculateSharpeRatio(): number {
    if (this.performanceHistory.length < 10) return 0;
    
    const returns = [];
    for (let i = 1; i < this.performanceHistory.length; i++) {
      const ret = (this.performanceHistory[i].value - this.performanceHistory[i - 1].value) / this.performanceHistory[i - 1].value;
      returns.push(ret);
    }
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    const riskFreeRate = 0.02 / 365; // Daily risk-free rate
    return stdDev > 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
  }

  private calculateSortinoRatio(): number {
    if (this.performanceHistory.length < 10) return 0;
    
    const returns = [];
    for (let i = 1; i < this.performanceHistory.length; i++) {
      const ret = (this.performanceHistory[i].value - this.performanceHistory[i - 1].value) / this.performanceHistory[i - 1].value;
      returns.push(ret);
    }
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const negativeReturns = returns.filter(ret => ret < 0);
    const downsideDeviation = Math.sqrt(negativeReturns.reduce((sum, ret) => sum + ret * ret, 0) / negativeReturns.length);
    
    const riskFreeRate = 0.02 / 365; // Daily risk-free rate
    return downsideDeviation > 0 ? (meanReturn - riskFreeRate) / downsideDeviation : 0;
  }

  private calculateCalmarRatio(): number {
    const maxDrawdown = this.calculateMaxDrawdown();
    if (maxDrawdown === 0) return 0;
    
    const annualReturn = this.calculateAnnualReturn();
    return annualReturn / (maxDrawdown / 100);
  }

  private calculateAnnualReturn(): number {
    if (this.performanceHistory.length < 2) return 0;
    
    const firstValue = this.performanceHistory[0].value;
    const lastValue = this.performanceHistory[this.performanceHistory.length - 1].value;
    const days = (this.performanceHistory[this.performanceHistory.length - 1].timestamp - this.performanceHistory[0].timestamp) / (24 * 60 * 60 * 1000);
    
    const totalReturn = (lastValue - firstValue) / firstValue;
    return Math.pow(1 + totalReturn, 365 / days) - 1;
  }

  private calculateVaR(confidence: number): number {
    if (this.performanceHistory.length < 10) return 0;
    
    const returns = [];
    for (let i = 1; i < this.performanceHistory.length; i++) {
      const ret = (this.performanceHistory[i].value - this.performanceHistory[i - 1].value) / this.performanceHistory[i - 1].value;
      returns.push(ret);
    }
    
    returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * returns.length);
    return returns[index] * 100;
  }

  private calculateCVaR(confidence: number): number {
    if (this.performanceHistory.length < 10) return 0;
    
    const returns = [];
    for (let i = 1; i < this.performanceHistory.length; i++) {
      const ret = (this.performanceHistory[i].value - this.performanceHistory[i - 1].value) / this.performanceHistory[i - 1].value;
      returns.push(ret);
    }
    
    returns.sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidence) * returns.length);
    const tailReturns = returns.slice(0, varIndex);
    
    return tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length * 100;
  }

  private calculateBeta(positions: Position[], marketData: MarketData[]): number {
    // Simplified beta calculation
    // In production, compare against a market index
    return 1.0; // Placeholder
  }

  private calculatePortfolioCorrelation(positions: Position[]): number {
    if (positions.length < 2) return 0;
    
    // Simplified correlation calculation
    // In production, calculate actual correlation matrix
    return 0.3; // Placeholder
  }

  private calculatePortfolioVolatility(positions: Position[], marketData: MarketData[]): number {
    if (positions.length === 0) return 0;
    
    const returns = [];
    for (let i = 1; i < marketData.length; i++) {
      const portfolioValue1 = this.calculatePortfolioValue(positions, [marketData[i - 1]]);
      const portfolioValue2 = this.calculatePortfolioValue(positions, [marketData[i]]);
      const ret = (portfolioValue2 - portfolioValue1) / portfolioValue1;
      returns.push(ret);
    }
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100;
  }

  private getMarketConditionAdjustment(marketCondition: MarketCondition, signal: TradingSignal): {
    approved: boolean;
    reason: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    // Adjust signals based on market conditions
    if (marketCondition.volatility === 'EXTREME' && signal.action === 'BUY') {
      return {
        approved: false,
        reason: 'Buy signals blocked during extreme volatility',
        riskLevel: 'HIGH',
      };
    }

    if (marketCondition.sentiment === 'FEAR' && signal.action === 'BUY') {
      return {
        approved: true,
        reason: 'Buy signal approved despite fear sentiment',
        riskLevel: 'HIGH',
      };
    }

    if (marketCondition.trend === 'BEAR' && signal.action === 'BUY') {
      return {
        approved: true,
        reason: 'Buy signal approved in bear market (potential reversal)',
        riskLevel: 'HIGH',
      };
    }

    return {
      approved: true,
      reason: 'Signal approved by market condition analysis',
      riskLevel: 'MEDIUM',
    };
  }

  private calculateSignalRiskLevel(signal: TradingSignal, marketCondition: MarketCondition): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;
    
    // Base risk from signal confidence
    if (signal.confidence < 60) riskScore += 2;
    else if (signal.confidence < 80) riskScore += 1;
    
    // Market condition risk
    if (marketCondition.volatility === 'EXTREME') riskScore += 3;
    else if (marketCondition.volatility === 'HIGH') riskScore += 2;
    else if (marketCondition.volatility === 'MEDIUM') riskScore += 1;
    
    if (marketCondition.sentiment === 'FEAR') riskScore += 2;
    else if (marketCondition.sentiment === 'GREED') riskScore += 1;
    
    if (marketCondition.trend === 'BEAR') riskScore += 2;
    
    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  private getPositionCorrelation(symbol: string, positions: Position[]): number {
    // Simplified correlation calculation
    // In production, calculate actual correlation with other positions
    return 0.3; // Placeholder
  }

  // Update performance history
  updatePerformanceHistory(portfolioValue: number): void {
    this.performanceHistory.push({
      timestamp: Date.now(),
      value: portfolioValue,
      drawdown: this.calculateCurrentDrawdown(portfolioValue),
    });
    
    // Keep only last 1000 data points
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }
  }

  getRiskLimits(): RiskLimits {
    return this.riskLimits;
  }

  updateRiskLimits(newLimits: Partial<RiskLimits>): void {
    this.riskLimits = { ...this.riskLimits, ...newLimits };
  }
}

