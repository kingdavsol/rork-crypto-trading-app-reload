// ============================================================================
// SMART STAKING BOT ALGORITHM
// ============================================================================

export interface StakingOpportunity {
  symbol: string;
  platform: string;
  apy: number; // Annual Percentage Yield
  minStake: number;
  maxStake?: number;
  lockPeriod: number; // days
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
  compoundFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  fees: number; // percentage
  lastUpdated: number;
}

export interface StakingPosition {
  symbol: string;
  platform: string;
  stakedAmount: number;
  apy: number;
  startDate: number;
  endDate: number;
  lockPeriod: number;
  compoundFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  estimatedRewards: number;
  actualRewards: number;
  status: 'ACTIVE' | 'UNLOCKING' | 'UNLOCKED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface StakingAllocation {
  symbol: string;
  platform: string;
  amount: number;
  apy: number;
  priority: number; // 1-10, higher is better
  reason: string;
}

export class SmartStakingBot {
  private config: BotConfig;
  private positions: Map<string, StakingPosition> = new Map();
  private opportunities: Map<string, StakingOpportunity[]> = new Map();
  private performance: BotPerformance;
  private lastOptimization: number = 0;
  private static readonly MAX_OPPS_PER_SYMBOL = 10;

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

  // Main staking optimization algorithm
  analyzeMarket(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const now = Date.now();
    
    // Update staking opportunities (in production, this would fetch from APIs)
    this.updateStakingOpportunities(marketData);
    
    // Optimize staking allocation every hour
    if (now - this.lastOptimization > 60 * 60 * 1000) {
      const optimizationSignals = this.optimizeStakingAllocation(marketData);
      signals.push(...optimizationSignals);
      this.lastOptimization = now;
    }

    // Check for position management (unlocking, compounding, etc.)
    const managementSignals = this.manageExistingPositions(marketData);
    signals.push(...managementSignals);

    // Check for emergency unstaking (if configured)
    const emergencySignals = this.checkEmergencyUnstaking(marketData);
    signals.push(...emergencySignals);

    return signals;
  }

  private updateStakingOpportunities(marketData: MarketData[]): void {
    // In production, this would fetch real-time staking data from various platforms
    // For now, we'll simulate realistic staking opportunities
    
    marketData.forEach(asset => {
      const opportunities: StakingOpportunity[] = [];
      
      // Simulate different staking platforms for each asset
      const platforms = this.getStakingPlatforms(asset.symbol);
      
      platforms.forEach(platform => {
        const opportunity = this.generateStakingOpportunity(asset, platform);
        opportunities.push(opportunity);
      });
      
      // Limit stored opportunities per symbol to reduce memory
      this.opportunities.set(asset.symbol, opportunities.slice(0, SmartStakingBot.MAX_OPPS_PER_SYMBOL));
    });
  }

  private getStakingPlatforms(symbol: string): string[] {
    // Different assets have different staking platforms
    const platformMap: Record<string, string[]> = {
      'ETH': ['Lido', 'Rocket Pool', 'Coinbase', 'Kraken'],
      'SOL': ['Marinade', 'Jito', 'Solana Foundation'],
      'ADA': ['Cardano Pool', 'Binance', 'Kraken'],
      'DOT': ['Polkadot', 'Kraken', 'Binance'],
      'AVAX': ['Avalanche', 'Binance', 'Kraken'],
      'MATIC': ['Polygon', 'Binance', 'Kraken'],
      'ATOM': ['Cosmos Hub', 'Binance', 'Kraken'],
      'NEAR': ['NEAR Protocol', 'Binance', 'Kraken'],
    };
    
    return platformMap[symbol] || ['Binance', 'Kraken', 'Coinbase'];
  }

  private generateStakingOpportunity(asset: MarketData, platform: string): StakingOpportunity {
    // Generate realistic staking opportunities based on asset and platform
    const baseAPY = this.getBaseAPY(asset.symbol);
    const platformMultiplier = this.getPlatformMultiplier(platform);
    const riskAdjustment = this.getRiskAdjustment(asset.symbol, platform);
    
    const apy = baseAPY * platformMultiplier * riskAdjustment;
    
    return {
      symbol: asset.symbol,
      platform,
      apy: Math.max(0.5, Math.min(50, apy)), // Clamp between 0.5% and 50%
      minStake: this.getMinStake(asset.symbol, platform),
      maxStake: this.getMaxStake(asset.symbol, platform),
      lockPeriod: this.getLockPeriod(asset.symbol, platform),
      riskLevel: this.getRiskLevel(asset.symbol, platform),
      liquidity: this.getLiquidity(asset.symbol, platform),
      compoundFrequency: this.getCompoundFrequency(platform),
      fees: this.getFees(platform),
      lastUpdated: Date.now(),
    };
  }

  private getBaseAPY(symbol: string): number {
    // Base APY for different assets (annualized)
    const baseAPYs: Record<string, number> = {
      'ETH': 4.5,
      'SOL': 7.2,
      'ADA': 5.8,
      'DOT': 12.5,
      'AVAX': 8.9,
      'MATIC': 6.2,
      'ATOM': 19.5,
      'NEAR': 11.2,
    };
    
    return baseAPYs[symbol] || 5.0;
  }

  private getPlatformMultiplier(platform: string): number {
    // Platform-specific multipliers
    const multipliers: Record<string, number> = {
      'Lido': 1.0,
      'Rocket Pool': 0.95,
      'Coinbase': 0.85,
      'Kraken': 0.90,
      'Binance': 0.88,
      'Marinade': 1.05,
      'Jito': 1.1,
      'Solana Foundation': 1.0,
      'Cardano Pool': 1.0,
      'Polkadot': 1.0,
      'Avalanche': 1.0,
      'Polygon': 1.0,
      'Cosmos Hub': 1.0,
      'NEAR Protocol': 1.0,
    };
    
    return multipliers[platform] || 0.9;
  }

  private getRiskAdjustment(symbol: string, platform: string): number {
    // Risk-based adjustments
    let adjustment = 1.0;
    
    // Platform risk
    const platformRisk: Record<string, number> = {
      'Lido': 0.95,
      'Rocket Pool': 0.98,
      'Coinbase': 0.92,
      'Kraken': 0.94,
      'Binance': 0.90,
      'Marinade': 1.02,
      'Jito': 1.05,
      'Solana Foundation': 0.98,
    };
    
    adjustment *= platformRisk[platform] || 0.95;
    
    // Asset risk
    const assetRisk: Record<string, number> = {
      'ETH': 0.95,
      'SOL': 1.05,
      'ADA': 1.0,
      'DOT': 1.1,
      'AVAX': 1.08,
      'MATIC': 1.02,
      'ATOM': 1.15,
      'NEAR': 1.1,
    };
    
    adjustment *= assetRisk[symbol] || 1.0;
    
    return adjustment;
  }

  private getMinStake(symbol: string, platform: string): number {
    // Minimum stake amounts
    const minStakes: Record<string, Record<string, number>> = {
      'ETH': { 'Lido': 0.1, 'Rocket Pool': 0.1, 'Coinbase': 0.1, 'Kraken': 0.1 },
      'SOL': { 'Marinade': 1, 'Jito': 1, 'Solana Foundation': 1 },
      'ADA': { 'Cardano Pool': 10, 'Binance': 10, 'Kraken': 10 },
      'DOT': { 'Polkadot': 1, 'Kraken': 1, 'Binance': 1 },
    };
    
    return minStakes[symbol]?.[platform] || 1;
  }

  private getMaxStake(symbol: string, platform: string): number {
    // Maximum stake amounts (if any)
    const maxStakes: Record<string, Record<string, number>> = {
      'ETH': { 'Lido': 1000, 'Rocket Pool': 1000, 'Coinbase': 10000, 'Kraken': 10000 },
      'SOL': { 'Marinade': 10000, 'Jito': 10000, 'Solana Foundation': 10000 },
    };
    
    return maxStakes[symbol]?.[platform] || 10000;
  }

  private getLockPeriod(symbol: string, platform: string): number {
    // Lock periods in days
    const lockPeriods: Record<string, Record<string, number>> = {
      'ETH': { 'Lido': 0, 'Rocket Pool': 0, 'Coinbase': 0, 'Kraken': 0 },
      'SOL': { 'Marinade': 0, 'Jito': 0, 'Solana Foundation': 0 },
      'ADA': { 'Cardano Pool': 0, 'Binance': 0, 'Kraken': 0 },
      'DOT': { 'Polkadot': 28, 'Kraken': 0, 'Binance': 0 },
      'AVAX': { 'Avalanche': 0, 'Binance': 0, 'Kraken': 0 },
      'MATIC': { 'Polygon': 0, 'Binance': 0, 'Kraken': 0 },
      'ATOM': { 'Cosmos Hub': 21, 'Binance': 0, 'Kraken': 0 },
      'NEAR': { 'NEAR Protocol': 0, 'Binance': 0, 'Kraken': 0 },
    };
    
    return lockPeriods[symbol]?.[platform] || 0;
  }

  private getRiskLevel(symbol: string, platform: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    // Risk levels for different combinations
    const riskLevels: Record<string, Record<string, 'LOW' | 'MEDIUM' | 'HIGH'>> = {
      'ETH': { 'Lido': 'LOW', 'Rocket Pool': 'LOW', 'Coinbase': 'LOW', 'Kraken': 'LOW' },
      'SOL': { 'Marinade': 'MEDIUM', 'Jito': 'MEDIUM', 'Solana Foundation': 'LOW' },
      'ADA': { 'Cardano Pool': 'LOW', 'Binance': 'LOW', 'Kraken': 'LOW' },
      'DOT': { 'Polkadot': 'MEDIUM', 'Kraken': 'LOW', 'Binance': 'LOW' },
      'AVAX': { 'Avalanche': 'MEDIUM', 'Binance': 'LOW', 'Kraken': 'LOW' },
      'MATIC': { 'Polygon': 'MEDIUM', 'Binance': 'LOW', 'Kraken': 'LOW' },
      'ATOM': { 'Cosmos Hub': 'MEDIUM', 'Binance': 'LOW', 'Kraken': 'LOW' },
      'NEAR': { 'NEAR Protocol': 'MEDIUM', 'Binance': 'LOW', 'Kraken': 'LOW' },
    };
    
    return riskLevels[symbol]?.[platform] || 'MEDIUM';
  }

  private getLiquidity(symbol: string, platform: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    // Liquidity levels
    const liquidityLevels: Record<string, Record<string, 'HIGH' | 'MEDIUM' | 'LOW'>> = {
      'ETH': { 'Lido': 'HIGH', 'Rocket Pool': 'HIGH', 'Coinbase': 'HIGH', 'Kraken': 'HIGH' },
      'SOL': { 'Marinade': 'HIGH', 'Jito': 'HIGH', 'Solana Foundation': 'HIGH' },
      'ADA': { 'Cardano Pool': 'HIGH', 'Binance': 'HIGH', 'Kraken': 'HIGH' },
      'DOT': { 'Polkadot': 'MEDIUM', 'Kraken': 'HIGH', 'Binance': 'HIGH' },
      'AVAX': { 'Avalanche': 'MEDIUM', 'Binance': 'HIGH', 'Kraken': 'HIGH' },
      'MATIC': { 'Polygon': 'MEDIUM', 'Binance': 'HIGH', 'Kraken': 'HIGH' },
      'ATOM': { 'Cosmos Hub': 'MEDIUM', 'Binance': 'HIGH', 'Kraken': 'HIGH' },
      'NEAR': { 'NEAR Protocol': 'MEDIUM', 'Binance': 'HIGH', 'Kraken': 'HIGH' },
    };
    
    return liquidityLevels[symbol]?.[platform] || 'MEDIUM';
  }

  private getCompoundFrequency(platform: string): 'DAILY' | 'WEEKLY' | 'MONTHLY' {
    // Compound frequencies
    const frequencies: Record<string, 'DAILY' | 'WEEKLY' | 'MONTHLY'> = {
      'Lido': 'DAILY',
      'Rocket Pool': 'DAILY',
      'Coinbase': 'WEEKLY',
      'Kraken': 'WEEKLY',
      'Binance': 'DAILY',
      'Marinade': 'DAILY',
      'Jito': 'DAILY',
      'Solana Foundation': 'DAILY',
      'Cardano Pool': 'DAILY',
      'Polkadot': 'WEEKLY',
      'Avalanche': 'DAILY',
      'Polygon': 'DAILY',
      'Cosmos Hub': 'DAILY',
      'NEAR Protocol': 'DAILY',
    };
    
    return frequencies[platform] || 'WEEKLY';
  }

  private getFees(platform: string): number {
    // Platform fees (percentage)
    const fees: Record<string, number> = {
      'Lido': 10,
      'Rocket Pool': 15,
      'Coinbase': 25,
      'Kraken': 20,
      'Binance': 5,
      'Marinade': 6,
      'Jito': 8,
      'Solana Foundation': 0,
      'Cardano Pool': 0,
      'Polkadot': 0,
      'Avalanche': 0,
      'Polygon': 0,
      'Cosmos Hub': 0,
      'NEAR Protocol': 0,
    };
    
    return fees[platform] || 10;
  }

  private optimizeStakingAllocation(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    // Calculate optimal allocations for each asset
    const allocations = this.calculateOptimalAllocations(marketData);
    
    // Generate signals for rebalancing
    allocations.forEach(allocation => {
      const currentPosition = this.positions.get(`${allocation.symbol}-${allocation.platform}`);
      
      if (!currentPosition) {
        // New staking position
        signals.push({
          action: 'BUY',
          symbol: allocation.symbol,
          confidence: this.calculateStakingConfidence(allocation),
          price: marketData.find(d => d.symbol === allocation.symbol)?.price || 0,
          quantity: allocation.amount / (marketData.find(d => d.symbol === allocation.symbol)?.price || 1),
          reason: `Optimal staking allocation: ${allocation.apy.toFixed(2)}% APY on ${allocation.platform}`,
          timestamp: Date.now(),
          riskLevel: this.getRiskLevel(allocation.symbol, allocation.platform),
        });
      } else if (Math.abs(currentPosition.stakedAmount - allocation.amount) / allocation.amount > 0.1) {
        // Rebalance existing position
        const amountDiff = allocation.amount - currentPosition.stakedAmount;
        signals.push({
          action: amountDiff > 0 ? 'BUY' : 'SELL',
          symbol: allocation.symbol,
          confidence: 75,
          price: marketData.find(d => d.symbol === allocation.symbol)?.price || 0,
          quantity: Math.abs(amountDiff) / (marketData.find(d => d.symbol === allocation.symbol)?.price || 1),
          reason: 'Rebalancing staking position',
          timestamp: Date.now(),
          riskLevel: 'MEDIUM',
        });
      }
    });
    
    return signals;
  }

  private calculateOptimalAllocations(marketData: MarketData[]): StakingAllocation[] {
    const allocations: StakingAllocation[] = [];
    
    // Calculate total available capital
    const totalCapital = this.config.allocation;
    const currentStaked = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.stakedAmount, 0);
    const availableCapital = totalCapital - currentStaked;
    
    // Score and rank all opportunities
    const scoredOpportunities: Array<StakingOpportunity & { score: number }> = [];
    
    this.opportunities.forEach(opportunities => {
      opportunities.forEach(opp => {
        if (this.config.enabledAssets.includes(opp.symbol)) {
          const score = this.calculateStakingScore(opp, marketData);
          scoredOpportunities.push({ ...opp, score });
        }
      });
    });
    
    // Sort by score (highest first)
    scoredOpportunities.sort((a, b) => b.score - a.score);
    
    // Allocate capital to top opportunities
    let remainingCapital = availableCapital;
    
    scoredOpportunities.forEach(opp => {
      if (remainingCapital <= 0) return;
      
      const maxAllocation = Math.min(
        remainingCapital,
        opp.maxStake || remainingCapital,
        totalCapital * 0.3 // Max 30% per position
      );
      
      if (maxAllocation >= opp.minStake) {
        allocations.push({
          symbol: opp.symbol,
          platform: opp.platform,
          amount: maxAllocation,
          apy: opp.apy,
          priority: Math.round(opp.score),
          reason: `High APY: ${opp.apy.toFixed(2)}%, Risk: ${opp.riskLevel}`,
        });
        
        remainingCapital -= maxAllocation;
      }
    });
    
    return allocations;
  }

  private calculateStakingScore(opportunity: StakingOpportunity, marketData: MarketData[]): number {
    let score = opportunity.apy * 10; // Base score from APY
    
    // Risk adjustment
    switch (opportunity.riskLevel) {
      case 'LOW':
        score *= 1.2;
        break;
      case 'MEDIUM':
        score *= 1.0;
        break;
      case 'HIGH':
        score *= 0.7;
        break;
    }
    
    // Liquidity adjustment
    switch (opportunity.liquidity) {
      case 'HIGH':
        score *= 1.1;
        break;
      case 'MEDIUM':
        score *= 1.0;
        break;
      case 'LOW':
        score *= 0.8;
        break;
    }
    
    // Fee adjustment
    score *= (1 - opportunity.fees / 100);
    
    // Lock period adjustment (shorter is better)
    if (opportunity.lockPeriod > 0) {
      score *= Math.max(0.5, 1 - (opportunity.lockPeriod / 365));
    }
    
    // Compound frequency adjustment
    switch (opportunity.compoundFrequency) {
      case 'DAILY':
        score *= 1.1;
        break;
      case 'WEEKLY':
        score *= 1.0;
        break;
      case 'MONTHLY':
        score *= 0.9;
        break;
    }
    
    // Market condition adjustment
    const assetData = marketData.find(d => d.symbol === opportunity.symbol);
    if (assetData) {
      // Prefer staking when market is stable or bullish
      if (assetData.change24h > -2 && assetData.change24h < 5) {
        score *= 1.1;
      } else if (assetData.change24h < -10) {
        score *= 0.8; // Reduce staking in severe downturns
      }
    }
    
    return Math.max(0, score);
  }

  private calculateStakingConfidence(allocation: StakingAllocation): number {
    let confidence = 70; // Base confidence
    
    // APY-based confidence
    if (allocation.apy > 15) {
      confidence += 15;
    } else if (allocation.apy > 10) {
      confidence += 10;
    } else if (allocation.apy > 5) {
      confidence += 5;
    }
    
    // Priority-based confidence
    confidence += allocation.priority * 2;
    
    return Math.min(95, confidence);
  }

  private manageExistingPositions(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    const now = Date.now();
    
    this.positions.forEach((position, key) => {
      // Check if position is ready to unlock
      if (position.status === 'ACTIVE' && now >= position.endDate) {
        position.status = 'UNLOCKED';
        
        signals.push({
          action: 'SELL',
          symbol: position.symbol,
          confidence: 100,
          price: marketData.find(d => d.symbol === position.symbol)?.price || 0,
          quantity: position.stakedAmount / (marketData.find(d => d.symbol === position.symbol)?.price || 1),
          reason: 'Staking period completed - unlocking funds',
          timestamp: now,
          riskLevel: 'LOW',
        });
      }
      
      // Check for compound opportunities
      if (position.status === 'ACTIVE' && this.shouldCompound(position, now)) {
        signals.push({
          action: 'BUY',
          symbol: position.symbol,
          confidence: 85,
          price: marketData.find(d => d.symbol === position.symbol)?.price || 0,
          quantity: position.estimatedRewards / (marketData.find(d => d.symbol === position.symbol)?.price || 1),
          reason: 'Compounding staking rewards',
          timestamp: now,
          riskLevel: 'LOW',
        });
      }
    });
    
    return signals;
  }

  private shouldCompound(position: StakingPosition, now: number): boolean {
    const timeSinceStart = now - position.startDate;
    const compoundInterval = this.getCompoundIntervalMs(position.compoundFrequency);
    
    return timeSinceStart > compoundInterval && position.estimatedRewards > 0;
  }

  private getCompoundIntervalMs(frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'): number {
    switch (frequency) {
      case 'DAILY':
        return 24 * 60 * 60 * 1000;
      case 'WEEKLY':
        return 7 * 24 * 60 * 60 * 1000;
      case 'MONTHLY':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private checkEmergencyUnstaking(marketData: MarketData[]): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    if (this.config.stopLoss <= 0) return signals;
    
    this.positions.forEach((position, key) => {
      if (position.status !== 'ACTIVE') return;
      
      const assetData = marketData.find(d => d.symbol === position.symbol);
      if (!assetData) return;
      
      // Calculate current value and PnL
      const currentValue = position.stakedAmount * assetData.price;
      const totalInvested = position.stakedAmount * assetData.price; // Simplified
      const pnlPercentage = ((currentValue - totalInvested) / totalInvested) * 100;
      
      // Emergency unstaking if loss exceeds stop-loss
      if (pnlPercentage <= -this.config.stopLoss) {
        signals.push({
          action: 'SELL',
          symbol: position.symbol,
          confidence: 100,
          price: assetData.price,
          quantity: position.stakedAmount / assetData.price,
          reason: `Emergency unstaking: ${pnlPercentage.toFixed(2)}% loss exceeds stop-loss`,
          timestamp: Date.now(),
          riskLevel: 'HIGH',
        });
      }
    });
    
    return signals;
  }

  // Update position after trade execution
  updatePosition(symbol: string, action: 'BUY' | 'SELL', quantity: number, price: number, platform?: string): void {
    const key = platform ? `${symbol}-${platform}` : symbol;
    const currentPosition = this.positions.get(key);
    
    if (action === 'BUY') {
      const opportunity = this.findBestOpportunity(symbol);
      if (!opportunity) return;
      
      const stakedAmount = quantity * price;
      
      if (currentPosition) {
        // Update existing position
        this.positions.set(key, {
          ...currentPosition,
          stakedAmount: currentPosition.stakedAmount + stakedAmount,
          estimatedRewards: this.calculateEstimatedRewards(currentPosition.stakedAmount + stakedAmount, opportunity.apy),
        });
      } else {
        // Create new position
        this.positions.set(key, {
          symbol,
          platform: opportunity.platform,
          stakedAmount,
          apy: opportunity.apy,
          startDate: Date.now(),
          endDate: Date.now() + (opportunity.lockPeriod * 24 * 60 * 60 * 1000),
          lockPeriod: opportunity.lockPeriod,
          compoundFrequency: opportunity.compoundFrequency,
          estimatedRewards: this.calculateEstimatedRewards(stakedAmount, opportunity.apy),
          actualRewards: 0,
          status: 'ACTIVE',
          riskLevel: opportunity.riskLevel,
        });
      }
    } else if (action === 'SELL') {
      if (currentPosition) {
        // Close position
        this.positions.delete(key);
      }
    }
    
    this.updatePerformance();
  }

  private findBestOpportunity(symbol: string): StakingOpportunity | null {
    const opportunities = this.opportunities.get(symbol);
    if (!opportunities || opportunities.length === 0) return null;
    
    // Find the best opportunity based on score
    return opportunities.reduce((best, current) => {
      const bestScore = this.calculateStakingScore(best, []);
      const currentScore = this.calculateStakingScore(current, []);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateEstimatedRewards(stakedAmount: number, apy: number): number {
    // Calculate estimated rewards based on APY
    const dailyRate = apy / 365 / 100;
    return stakedAmount * dailyRate;
  }

  private updatePerformance(): void {
    let totalPnL = 0;
    let totalInvested = 0;
    let totalTrades = 0;
    let winningTrades = 0;
    
    this.positions.forEach(position => {
      totalInvested += position.stakedAmount;
      totalPnL += position.actualRewards;
      totalTrades++;
      
      if (position.actualRewards > 0) {
        winningTrades++;
      }
    });
    
    this.performance = {
      totalPnL,
      totalPnLPercentage: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalTrades,
      maxDrawdown: 0, // Staking typically has low drawdown
      sharpeRatio: this.calculateSharpeRatio(),
      lastUpdate: Date.now(),
    };
  }

  private calculateSharpeRatio(): number {
    // Simplified Sharpe ratio for staking
    const avgAPY = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.apy, 0) / this.positions.size;
    
    // Assume risk-free rate of 2% and low volatility for staking
    const riskFreeRate = 2;
    const volatility = 2; // Low volatility for staking
    
    return this.positions.size > 0 ? (avgAPY - riskFreeRate) / volatility : 0;
  }

  getPositions(): StakingPosition[] {
    return Array.from(this.positions.values());
  }

  getPerformance(): BotPerformance {
    return this.performance;
  }

  getConfig(): BotConfig {
    return this.config;
  }

  getOpportunities(): Map<string, StakingOpportunity[]> {
    return this.opportunities;
  }

  // Get total staked value across all positions
  getTotalStakedValue(marketData: MarketData[]): number {
    let totalValue = 0;
    
    this.positions.forEach(position => {
      const assetData = marketData.find(d => d.symbol === position.symbol);
      if (assetData) {
        totalValue += position.stakedAmount * assetData.price;
      }
    });
    
    return totalValue;
  }
}

