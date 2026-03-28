export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
}

class MarketService {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  static async fetchMarkets(perPage: number = 100): Promise<MarketCoin[]> {
    const url = `${this.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h,7d`;

    const headers: Record<string, string> = {};
    // Optional API key support if provided via public env var
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const apiKey: string | undefined = process.env.EXPO_PUBLIC_COINGECKO_API_KEY || undefined;
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`CoinGecko error ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    return data as MarketCoin[];
  }
}

export default MarketService;

