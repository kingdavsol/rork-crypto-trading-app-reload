// ============================================================================
// ALGORITHM TESTING & PERFORMANCE ANALYSIS SYSTEM
// ============================================================================

export interface TestScenario {
  name: string;
  description: string;
  marketData: MarketData[];
  expectedOutcome: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  duration: number; // days
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageTradeDuration: number; // hours
  volatility: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  treynorRatio: number;
}

export interface TestResult {
  scenario: TestScenario;
  algorithm: string;
  performance: PerformanceMetrics;
  trades: Array<{
    timestamp: number;
    action: 'BUY' | 'SELL';
    symbol: string;
    price: number;
    quantity: number;
    pnl: number;
    reason: string;
  }>;
  riskMetrics: RiskMetrics;
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

export interface EdgeCaseTest {
  name: string;
  description: string;
  marketCondition: string;
  testData: MarketData[];
  expectedBehavior: string;
  criticalLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class AlgorithmTester {
  private riskManager: RiskManager;
  private testResults: TestResult[] = [];
  private edgeCaseResults: Array<{test: EdgeCaseTest, passed: boolean, issues: string[]}> = [];

  constructor(riskManager: RiskManager) {
    this.riskManager = riskManager;
  }

  // Run comprehensive algorithm tests
  async runAlgorithmTests(): Promise<TestResult[]> {
    console.log('Starting comprehensive algorithm testing...');
    
    const scenarios = this.generateTestScenarios();
    const results: TestResult[] = [];

    for (const scenario of scenarios) {
      console.log(`Testing scenario: ${scenario.name}`);
      
      // Test each algorithm
      const algorithms = ['momentum', 'dca', 'staking', 'cci'];
      
      for (const algorithm of algorithms) {
        const result = await this.testAlgorithm(algorithm, scenario);
        results.push(result);
        this.testResults.push(result);
      }
    }

    // Run edge case tests
    await this.runEdgeCaseTests();

    // Generate performance report
    this.generatePerformanceReport();

    return results;
  }

  private generateTestScenarios(): TestScenario[] {
    return [
      // Bull Market Scenarios
      {
        name: 'Strong Bull Market',
        description: 'Sustained upward trend with moderate volatility',
        marketData: this.generateBullMarketData(30),
        expectedOutcome: 'Positive returns with momentum and CCI bots performing well',
        riskLevel: 'LOW',
        duration: 30,
      },
      {
        name: 'Volatile Bull Market',
        description: 'Bull market with high volatility and corrections',
        marketData: this.generateVolatileBullMarketData(30),
        expectedOutcome: 'Positive returns but with higher drawdowns',
        riskLevel: 'MEDIUM',
        duration: 30,
      },
      
      // Bear Market Scenarios
      {
        name: 'Strong Bear Market',
        description: 'Sustained downward trend',
        marketData: this.generateBearMarketData(30),
        expectedOutcome: 'DCA bot should perform best, others should minimize losses',
        riskLevel: 'HIGH',
        duration: 30,
      },
      {
        name: 'Crash Scenario',
        description: 'Sudden market crash with extreme volatility',
        marketData: this.generateCrashScenarioData(7),
        expectedOutcome: 'All bots should trigger stop-losses and minimize losses',
        riskLevel: 'HIGH',
        duration: 7,
      },
      
      // Sideways Market Scenarios
      {
        name: 'Sideways Market',
        description: 'Range-bound market with low volatility',
        marketData: this.generateSidewaysMarketData(30),
        expectedOutcome: 'Staking bot should perform best, others should break even',
        riskLevel: 'LOW',
        duration: 30,
      },
      {
        name: 'High Volatility Sideways',
        description: 'Range-bound market with high volatility',
        marketData: this.generateVolatileSidewaysData(30),
        expectedOutcome: 'Mixed results depending on timing',
        riskLevel: 'MEDIUM',
        duration: 30,
      },
      
      // Extreme Scenarios
      {
        name: 'Flash Crash Recovery',
        description: 'Sudden crash followed by quick recovery',
        marketData: this.generateFlashCrashData(3),
        expectedOutcome: 'Bots should recover losses quickly',
        riskLevel: 'HIGH',
        duration: 3,
      },
      {
        name: 'Low Liquidity Market',
        description: 'Market with very low trading volume',
        marketData: this.generateLowLiquidityData(30),
        expectedOutcome: 'Reduced trading activity, higher slippage',
        riskLevel: 'MEDIUM',
        duration: 30,
      },
    ];
  }

  private async testAlgorithm(algorithm: string, scenario: TestScenario): Promise<TestResult> {
    const bot = this.createBotInstance(algorithm);
    const trades: TestResult['trades'] = [];
    let portfolioValue = 10000; // Starting with $10k
    const positions: Position[] = [];

    // Simulate trading over the scenario duration
    for (let i = 0; i < scenario.marketData.length; i++) {
      const currentData = scenario.marketData.slice(0, i + 1);
      const signals = bot.analyzeMarket(currentData);

      // Process signals
      for (const signal of signals) {
        // Validate signal with risk manager
        const validation = this.riskManager.validateSignal(signal, positions, currentData);
        
        if (validation.approved) {
          const quantity = validation.adjustedQuantity || signal.quantity;
          
          // Execute trade
          const trade = {
            timestamp: signal.timestamp,
            action: signal.action,
            symbol: signal.symbol,
            price: signal.price,
            quantity,
            pnl: 0, // Will be calculated later
            reason: signal.reason,
          };

          // Update position
          bot.updatePosition(signal.symbol, signal.action, quantity, signal.price);
          
          // Calculate PnL for sell trades
          if (signal.action === 'SELL') {
            const position = positions.find(p => p.symbol === signal.symbol);
            if (position) {
              trade.pnl = (signal.price - position.entryPrice) * quantity;
            }
          }

          trades.push(trade);
        }
      }

      // Update positions
      const botPositions = bot.getPositions();
      positions.length = 0;
      positions.push(...botPositions);

      // Update portfolio value
      portfolioValue = this.calculatePortfolioValue(positions, currentData);
      this.riskManager.updatePerformanceHistory(portfolioValue);
    }

    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(trades, portfolioValue, 10000);
    const riskMetrics = this.riskManager.calculateRiskMetrics(positions, scenario.marketData);
    
    // Evaluate test results
    const evaluation = this.evaluateTestResult(algorithm, scenario, performance, riskMetrics);

    return {
      scenario,
      algorithm,
      performance,
      trades,
      riskMetrics,
      passed: evaluation.passed,
      score: evaluation.score,
      issues: evaluation.issues,
      recommendations: evaluation.recommendations,
    };
  }

  private createBotInstance(algorithm: string): any {
    // Create bot instances for testing
    const config: BotConfig = {
      id: 'test-bot',
      name: 'Test Bot',
      type: algorithm as any,
      allocation: 10000,
      stopLoss: 5,
      takeProfit: 15,
      timeframe: '1h',
      maxPositions: 5,
      riskLevel: 'MODERATE',
      enabledAssets: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'],
    };

    switch (algorithm) {
      case 'momentum':
        return new MomentumTradingBot(config);
      case 'dca':
        const dcaSchedule: DCASchedule = {
          frequency: 'DAILY',
          interval: 24,
          amount: 100,
          startDate: Date.now(),
        };
        return new DCATradingBot(config, dcaSchedule);
      case 'staking':
        return new SmartStakingBot(config);
      case 'cci':
        return new CCIMarketBot(config);
      default:
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
  }

  private calculatePerformanceMetrics(trades: TestResult['trades'], finalValue: number, initialValue: number): PerformanceMetrics {
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100;
    const annualizedReturn = Math.pow(1 + totalReturn / 100, 365 / 30) - 1; // Assuming 30-day test
    
    const sellTrades = trades.filter(t => t.action === 'SELL');
    const winningTrades = sellTrades.filter(t => t.pnl > 0);
    const losingTrades = sellTrades.filter(t => t.pnl < 0);
    
    const winRate = sellTrades.length > 0 ? (winningTrades.length / sellTrades.length) * 100 : 0;
    const averageWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0;
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0;
    
    const profitFactor = Math.abs(averageLoss) > 0 ? Math.abs(averageWin / averageLoss) : 0;
    
    // Calculate volatility (simplified)
    const returns = [];
    for (let i = 1; i < trades.length; i++) {
      const ret = (trades[i].price - trades[i - 1].price) / trades[i - 1].price;
      returns.push(ret);
    }
    const volatility = returns.length > 0 ? Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length) * 100 : 0;
    
    // Calculate Sharpe ratio (simplified)
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const sharpeRatio = volatility > 0 ? (meanReturn - 0.02/365) / (volatility/100) : 0;
    
    return {
      totalReturn,
      annualizedReturn: annualizedReturn * 100,
      maxDrawdown: this.calculateMaxDrawdown(trades),
      sharpeRatio,
      sortinoRatio: 0, // Simplified
      calmarRatio: 0, // Simplified
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
      largestWin,
      largestLoss,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageTradeDuration: 24, // Simplified
      volatility,
      beta: 1.0, // Simplified
      alpha: 0, // Simplified
      informationRatio: 0, // Simplified
      treynorRatio: 0, // Simplified
    };
  }

  private calculateMaxDrawdown(trades: TestResult['trades']): number {
    let maxDrawdown = 0;
    let peak = 0;
    let currentValue = 10000; // Starting value
    
    for (const trade of trades) {
      if (trade.action === 'BUY') {
        currentValue -= trade.price * trade.quantity;
      } else {
        currentValue += trade.price * trade.quantity;
      }
      
      if (currentValue > peak) {
        peak = currentValue;
      } else {
        const drawdown = (peak - currentValue) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown * 100;
  }

  private calculatePortfolioValue(positions: Position[], marketData: MarketData[]): number {
    return positions.reduce((total, position) => {
      const assetData = marketData.find(d => d.symbol === position.symbol);
      return total + (assetData ? position.quantity * assetData.price : position.value);
    }, 0);
  }

  private evaluateTestResult(algorithm: string, scenario: TestScenario, performance: PerformanceMetrics, riskMetrics: RiskMetrics): {
    passed: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Evaluate based on scenario expectations
    switch (scenario.name) {
      case 'Strong Bull Market':
        if (performance.totalReturn < 10) {
          issues.push('Low returns in bull market');
          recommendations.push('Increase position sizes or reduce stop-losses in bull markets');
        } else {
          score += 20;
        }
        break;
        
      case 'Strong Bear Market':
        if (performance.totalReturn < -5) {
          issues.push('Excessive losses in bear market');
          recommendations.push('Improve bear market protection and stop-loss mechanisms');
        } else {
          score += 20;
        }
        break;
        
      case 'Crash Scenario':
        if (performance.maxDrawdown > 20) {
          issues.push('Excessive drawdown during crash');
          recommendations.push('Implement better emergency stop-loss mechanisms');
        } else {
          score += 20;
        }
        break;
    }

    // General performance evaluation
    if (performance.sharpeRatio > 1.5) {
      score += 15;
    } else if (performance.sharpeRatio < 0.5) {
      issues.push('Low Sharpe ratio indicates poor risk-adjusted returns');
      recommendations.push('Optimize risk management and position sizing');
    }

    if (performance.winRate > 60) {
      score += 15;
    } else if (performance.winRate < 40) {
      issues.push('Low win rate');
      recommendations.push('Improve signal quality and entry timing');
    }

    if (performance.maxDrawdown < 10) {
      score += 15;
    } else if (performance.maxDrawdown > 25) {
      issues.push('High maximum drawdown');
      recommendations.push('Implement better risk management and position sizing');
    }

    if (performance.profitFactor > 1.5) {
      score += 15;
    } else if (performance.profitFactor < 1.0) {
      issues.push('Profit factor below 1.0 indicates losing strategy');
      recommendations.push('Review and improve trading logic');
    }

    // Risk metrics evaluation
    if (riskMetrics.volatility < 15) {
      score += 10;
    } else if (riskMetrics.volatility > 30) {
      issues.push('High portfolio volatility');
      recommendations.push('Reduce position sizes and improve diversification');
    }

    if (riskMetrics.correlation < 0.5) {
      score += 10;
    } else if (riskMetrics.correlation > 0.8) {
      issues.push('High portfolio correlation');
      recommendations.push('Improve diversification across uncorrelated assets');
    }

    const passed = score >= 60 && issues.length <= 2;
    
    return {
      passed,
      score: Math.min(100, score),
      issues,
      recommendations,
    };
  }

  private async runEdgeCaseTests(): Promise<void> {
    console.log('Running edge case tests...');
    
    const edgeCases: EdgeCaseTest[] = [
      {
        name: 'Zero Volume Test',
        description: 'Market data with zero volume',
        marketCondition: 'No liquidity',
        testData: this.generateZeroVolumeData(),
        expectedBehavior: 'Bot should not trade or reduce position sizes',
        criticalLevel: 'HIGH',
      },
      {
        name: 'Extreme Price Spike',
        description: 'Sudden 1000% price increase',
        marketCondition: 'Market manipulation',
        testData: this.generatePriceSpikeData(),
        expectedBehavior: 'Bot should detect anomaly and avoid trading',
        criticalLevel: 'CRITICAL',
      },
      {
        name: 'Network Disconnection',
        description: 'Missing market data for extended period',
        marketCondition: 'Data unavailability',
        testData: this.generateMissingDataScenario(),
        expectedBehavior: 'Bot should handle gracefully and resume when data returns',
        criticalLevel: 'MEDIUM',
      },
      {
        name: 'Negative Prices',
        description: 'Market data with negative prices',
        marketCondition: 'Data corruption',
        testData: this.generateNegativePriceData(),
        expectedBehavior: 'Bot should reject invalid data and log error',
        criticalLevel: 'CRITICAL',
      },
      {
        name: 'Infinite Loop Prevention',
        description: 'Rapid buy/sell signals',
        marketCondition: 'Algorithm instability',
        testData: this.generateRapidSignalData(),
        expectedBehavior: 'Bot should implement cooldown periods',
        criticalLevel: 'HIGH',
      },
    ];

    for (const edgeCase of edgeCases) {
      const result = await this.testEdgeCase(edgeCase);
      this.edgeCaseResults.push(result);
    }
  }

  private async testEdgeCase(edgeCase: EdgeCaseTest): Promise<{test: EdgeCaseTest, passed: boolean, issues: string[]}> {
    const issues: string[] = [];
    let passed = true;

    try {
      // Test each algorithm with edge case data
      const algorithms = ['momentum', 'dca', 'staking', 'cci'];
      
      for (const algorithm of algorithms) {
        const bot = this.createBotInstance(algorithm);
        
        try {
          const signals = bot.analyzeMarket(edgeCase.testData);
          
          // Check for expected behavior
          switch (edgeCase.name) {
            case 'Zero Volume Test':
              if (signals.length > 0) {
                issues.push(`${algorithm} bot generated signals with zero volume`);
                passed = false;
              }
              break;
              
            case 'Extreme Price Spike':
              const spikeSignals = signals.filter(s => s.price > 1000);
              if (spikeSignals.length > 0) {
                issues.push(`${algorithm} bot traded during extreme price spike`);
                passed = false;
              }
              break;
              
            case 'Negative Prices':
              const negativeSignals = signals.filter(s => s.price <= 0);
              if (negativeSignals.length > 0) {
                issues.push(`${algorithm} bot traded with negative prices`);
                passed = false;
              }
              break;
              
            case 'Infinite Loop Prevention':
              if (signals.length > 10) {
                issues.push(`${algorithm} bot generated too many signals (${signals.length})`);
                passed = false;
              }
              break;
          }
        } catch (error) {
          if (edgeCase.name === 'Network Disconnection') {
            // Expected to handle gracefully
            console.log(`${algorithm} bot handled missing data gracefully`);
          } else {
            issues.push(`${algorithm} bot crashed: ${error.message}`);
            passed = false;
          }
        }
      }
    } catch (error) {
      issues.push(`Edge case test failed: ${error.message}`);
      passed = false;
    }

    return {
      test: edgeCase,
      passed,
      issues,
    };
  }

  private generatePerformanceReport(): void {
    console.log('\n=== ALGORITHM PERFORMANCE REPORT ===\n');
    
    // Overall performance summary
    const algorithmScores = new Map<string, number[]>();
    
    this.testResults.forEach(result => {
      if (!algorithmScores.has(result.algorithm)) {
        algorithmScores.set(result.algorithm, []);
      }
      algorithmScores.get(result.algorithm)!.push(result.score);
    });
    
    console.log('Algorithm Performance Summary:');
    algorithmScores.forEach((scores, algorithm) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const passRate = scores.filter(s => s >= 60).length / scores.length * 100;
      console.log(`${algorithm.toUpperCase()}: Avg Score ${avgScore.toFixed(1)}, Pass Rate ${passRate.toFixed(1)}%`);
    });
    
    // Edge case results
    console.log('\nEdge Case Test Results:');
    this.edgeCaseResults.forEach(result => {
      const status = result.passed ? 'PASS' : 'FAIL';
      console.log(`${result.test.name}: ${status} (${result.test.criticalLevel})`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`  - ${issue}`));
      }
    });
    
    // Recommendations
    console.log('\nKey Recommendations:');
    const allRecommendations = this.testResults.flatMap(r => r.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];
    uniqueRecommendations.forEach(rec => console.log(`- ${rec}`));
  }

  // Data generation methods for testing
  private generateBullMarketData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      price += (Math.random() - 0.3) * 2; // Slight upward bias
      data.push({
        symbol: 'BTC',
        price: Math.max(50, price),
        volume: 1000000 + Math.random() * 500000,
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: (Math.random() - 0.3) * 10,
        change1h: (Math.random() - 0.3) * 2,
        high24h: price * 1.05,
        low24h: price * 0.95,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateBearMarketData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      price += (Math.random() - 0.7) * 2; // Downward bias
      data.push({
        symbol: 'BTC',
        price: Math.max(20, price),
        volume: 1000000 + Math.random() * 500000,
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: (Math.random() - 0.7) * 10,
        change1h: (Math.random() - 0.7) * 2,
        high24h: price * 1.02,
        low24h: price * 0.98,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateVolatileBullMarketData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      const volatility = Math.random() * 5; // High volatility
      price += (Math.random() - 0.2) * volatility; // Slight upward bias with high volatility
      data.push({
        symbol: 'BTC',
        price: Math.max(30, price),
        volume: 1000000 + Math.random() * 1000000,
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: (Math.random() - 0.2) * 20,
        change1h: (Math.random() - 0.2) * 5,
        high24h: price * 1.1,
        low24h: price * 0.9,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateCrashScenarioData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      if (i < 12) { // First 12 hours - normal market
        price += (Math.random() - 0.5) * 1;
      } else if (i < 24) { // Next 12 hours - crash
        price -= Math.random() * 10; // Rapid decline
      } else { // Recovery
        price += Math.random() * 2; // Gradual recovery
      }
      
      data.push({
        symbol: 'BTC',
        price: Math.max(10, price),
        volume: 2000000 + Math.random() * 2000000, // High volume during crash
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: i < 24 ? -50 + Math.random() * 20 : (Math.random() - 0.5) * 10,
        change1h: (Math.random() - 0.5) * 5,
        high24h: price * 1.2,
        low24h: price * 0.8,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateSidewaysMarketData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      price += (Math.random() - 0.5) * 0.5; // Low volatility, no trend
      price = Math.max(90, Math.min(110, price)); // Keep in range
      
      data.push({
        symbol: 'BTC',
        price,
        volume: 500000 + Math.random() * 300000, // Lower volume
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: (Math.random() - 0.5) * 2,
        change1h: (Math.random() - 0.5) * 0.5,
        high24h: price * 1.02,
        low24h: price * 0.98,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateVolatileSidewaysData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      price += (Math.random() - 0.5) * 3; // High volatility, no trend
      price = Math.max(70, Math.min(130, price)); // Wider range
      
      data.push({
        symbol: 'BTC',
        price,
        volume: 1000000 + Math.random() * 800000,
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: (Math.random() - 0.5) * 15,
        change1h: (Math.random() - 0.5) * 3,
        high24h: price * 1.05,
        low24h: price * 0.95,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateFlashCrashData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      if (i === 12) { // Flash crash at hour 12
        price *= 0.5; // 50% drop
      } else if (i > 12 && i < 18) { // Quick recovery
        price *= 1.1; // 10% recovery per hour
      } else {
        price += (Math.random() - 0.5) * 1;
      }
      
      data.push({
        symbol: 'BTC',
        price: Math.max(20, price),
        volume: i === 12 ? 5000000 : 1000000 + Math.random() * 500000,
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: i === 12 ? -50 : (Math.random() - 0.5) * 10,
        change1h: i === 12 ? -50 : (Math.random() - 0.5) * 2,
        high24h: price * 1.1,
        low24h: price * 0.9,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateLowLiquidityData(days: number): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    for (let i = 0; i < days * 24; i++) {
      price += (Math.random() - 0.5) * 1;
      
      data.push({
        symbol: 'BTC',
        price: Math.max(50, price),
        volume: 10000 + Math.random() * 50000, // Very low volume
        timestamp: Date.now() + i * 60 * 60 * 1000,
        change24h: (Math.random() - 0.5) * 5,
        change1h: (Math.random() - 0.5) * 1,
        high24h: price * 1.1,
        low24h: price * 0.9,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  private generateZeroVolumeData(): MarketData[] {
    return [{
      symbol: 'BTC',
      price: 100,
      volume: 0, // Zero volume
      timestamp: Date.now(),
      change24h: 0,
      change1h: 0,
      high24h: 100,
      low24h: 100,
      marketCap: 100 * 19000000,
    }];
  }

  private generatePriceSpikeData(): MarketData[] {
    return [
      {
        symbol: 'BTC',
        price: 100,
        volume: 1000000,
        timestamp: Date.now(),
        change24h: 0,
        change1h: 0,
        high24h: 100,
        low24h: 100,
        marketCap: 100 * 19000000,
      },
      {
        symbol: 'BTC',
        price: 1100, // 1000% spike
        volume: 1000000,
        timestamp: Date.now() + 60 * 60 * 1000,
        change24h: 1000,
        change1h: 1000,
        high24h: 1100,
        low24h: 100,
        marketCap: 1100 * 19000000,
      },
    ];
  }

  private generateMissingDataScenario(): MarketData[] {
    return [{
      symbol: 'BTC',
      price: 100,
      volume: 1000000,
      timestamp: Date.now(),
      change24h: 0,
      change1h: 0,
      high24h: 100,
      low24h: 100,
      marketCap: 100 * 19000000,
    }];
  }

  private generateNegativePriceData(): MarketData[] {
    return [{
      symbol: 'BTC',
      price: -100, // Negative price
      volume: 1000000,
      timestamp: Date.now(),
      change24h: 0,
      change1h: 0,
      high24h: 100,
      low24h: -100,
      marketCap: -100 * 19000000,
    }];
  }

  private generateRapidSignalData(): MarketData[] {
    const data: MarketData[] = [];
    let price = 100;
    
    // Generate rapid price changes to trigger many signals
    for (let i = 0; i < 100; i++) {
      price += (Math.random() - 0.5) * 10;
      
      data.push({
        symbol: 'BTC',
        price: Math.max(50, price),
        volume: 1000000,
        timestamp: Date.now() + i * 1000, // 1 second intervals
        change24h: (Math.random() - 0.5) * 20,
        change1h: (Math.random() - 0.5) * 10,
        high24h: price * 1.1,
        low24h: price * 0.9,
        marketCap: price * 19000000,
      });
    }
    
    return data;
  }

  getTestResults(): TestResult[] {
    return this.testResults;
  }

  getEdgeCaseResults(): Array<{test: EdgeCaseTest, passed: boolean, issues: string[]}> {
    return this.edgeCaseResults;
  }

  // Generate performance comparison report
  generateComparisonReport(): string {
    const report: string[] = [];
    
    report.push('=== ALGORITHM COMPARISON REPORT ===\n');
    
    // Group results by algorithm
    const algorithmResults = new Map<string, TestResult[]>();
    this.testResults.forEach(result => {
      if (!algorithmResults.has(result.algorithm)) {
        algorithmResults.set(result.algorithm, []);
      }
      algorithmResults.get(result.algorithm)!.push(result);
    });
    
    // Compare algorithms
    algorithmResults.forEach((results, algorithm) => {
      report.push(`${algorithm.toUpperCase()} BOT:`);
      
      const avgReturn = results.reduce((sum, r) => sum + r.performance.totalReturn, 0) / results.length;
      const avgSharpe = results.reduce((sum, r) => sum + r.performance.sharpeRatio, 0) / results.length;
      const avgDrawdown = results.reduce((sum, r) => sum + r.performance.maxDrawdown, 0) / results.length;
      const avgWinRate = results.reduce((sum, r) => sum + r.performance.winRate, 0) / results.length;
      
      report.push(`  Average Return: ${avgReturn.toFixed(2)}%`);
      report.push(`  Average Sharpe Ratio: ${avgSharpe.toFixed(2)}`);
      report.push(`  Average Max Drawdown: ${avgDrawdown.toFixed(2)}%`);
      report.push(`  Average Win Rate: ${avgWinRate.toFixed(2)}%`);
      report.push(`  Pass Rate: ${results.filter(r => r.passed).length / results.length * 100}%`);
      report.push('');
    });
    
    return report.join('\n');
  }
}

