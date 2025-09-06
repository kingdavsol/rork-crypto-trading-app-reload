import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface Bot {
  id: string;
  name: string;
  type: 'momentum' | 'dca' | 'staking' | 'cci';
  status: 'Running' | 'Paused';
  allocation: number;
  profit: number;
  trades?: number;
}

interface Holding {
  symbol: string;
  amount: number;
  value: number;
  change24h: number;
}

interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  pnl: number;
  time: string;
}

interface TradingBotContextType {
  activeBots: Bot[];
  portfolio: {
    totalValue: number;
    holdings: Holding[];
  };
  recentTrades: Trade[];
  createBot: (bot: Omit<Bot, 'id' | 'status' | 'profit' | 'trades'> & { stopLoss: number; config: any }) => void;
  toggleBot: (id: string) => void;
}

export const [TradingBotProvider, useTradingBot] = createContextHook<TradingBotContextType>(() => {
  const [activeBots, setActiveBots] = useState<Bot[]>([
    {
      id: '1',
      name: 'Momentum Hunter',
      type: 'momentum',
      status: 'Running',
      allocation: 5000,
      profit: 12.5,
      trades: 24,
    },
    {
      id: '2',
      name: 'BTC DCA',
      type: 'dca',
      status: 'Running',
      allocation: 3000,
      profit: 8.3,
      trades: 15,
    },
  ]);

  const [portfolio] = useState({
    totalValue: 12458.32,
    holdings: [
      { symbol: 'BTC', amount: 0.15, value: 6500, change24h: 2.5 },
      { symbol: 'ETH', amount: 2.5, value: 4000, change24h: 3.8 },
      { symbol: 'SOL', amount: 25, value: 1500, change24h: -1.2 },
      { symbol: 'MATIC', amount: 300, value: 458.32, change24h: 5.6 },
    ],
  });

  const [recentTrades] = useState<Trade[]>([
    { id: '1', pair: 'BTC/USDT', type: 'buy', pnl: 2.5, time: '2 hours ago' },
    { id: '2', pair: 'ETH/USDT', type: 'sell', pnl: 3.8, time: '4 hours ago' },
    { id: '3', pair: 'SOL/USDT', type: 'buy', pnl: -1.2, time: '6 hours ago' },
  ]);

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const botsData = await AsyncStorage.getItem('bots');
      if (botsData) {
        setActiveBots(JSON.parse(botsData));
      }
    } catch (error) {
      console.error('Error loading bots:', error);
    }
  };

  const saveBots = async (bots: Bot[]) => {
    try {
      await AsyncStorage.setItem('bots', JSON.stringify(bots));
    } catch (error) {
      console.error('Error saving bots:', error);
    }
  };

  const createBot = useCallback((botData: Omit<Bot, 'id' | 'status' | 'profit' | 'trades'> & { stopLoss: number; config: any }) => {
    const newBot: Bot = {
      id: Date.now().toString(),
      name: botData.name,
      type: botData.type,
      status: 'Paused',
      allocation: botData.allocation,
      profit: 0,
      trades: 0,
    };
    
    const updatedBots = [...activeBots, newBot];
    setActiveBots(updatedBots);
    saveBots(updatedBots);
  }, [activeBots]);

  const toggleBot = useCallback((id: string) => {
    const updatedBots = activeBots.map(bot =>
      bot.id === id
        ? { ...bot, status: bot.status === 'Running' ? 'Paused' as const : 'Running' as const }
        : bot
    );
    setActiveBots(updatedBots);
    saveBots(updatedBots);
  }, [activeBots]);

  return useMemo(() => ({
    activeBots,
    portfolio,
    recentTrades,
    createBot,
    toggleBot,
  }), [activeBots, portfolio, recentTrades, createBot, toggleBot]);
});