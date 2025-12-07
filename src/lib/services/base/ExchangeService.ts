import { log } from "pinolog";
import { getExchange } from "../../../config/ccxt";
import { CC_AVG_PRICE_CANDLES_COUNT } from "../../../config/params";

const roundTicks = (price: string | number, tickSize: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
  });
  // @ts-ignore
  const precision = formatter.format(tickSize).split('.')[1].length || 0;
  if (typeof price === 'string') price = parseFloat(price);
  return price.toFixed(precision);
};

type CandleInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h";

const INTERVAL_MINUTES: Record<CandleInterval, number> = {
  "1m": 1,
  "3m": 3,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "2h": 120,
  "4h": 240,
  "6h": 360,
  "8h": 480,
};

export class ExchangeService {
  public getCandles = async (
    symbol: string,
    interval: CandleInterval,
    limit: number
  ) => {
    log("exchangeService getCandles", {
      symbol,
      interval,
      limit,
    });
    const exchange = await getExchange();

    const step = INTERVAL_MINUTES[interval];
    const adjust = step * limit - step;

    if (!adjust) {
      throw new Error(
        `ExchangeService unknown time adjust for interval=${interval}`
      );
    }

    // Calculate 'since' timestamp - going backwards from now
    const now = Date.now();
    const since = now - adjust * 60 * 1_000;

    const candles = await exchange.fetchOHLCV(
      symbol,
      interval,
      since,
      limit
    );

    const data = candles.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));

    // Filter candles to strictly match the requested range
    const filteredData = data.filter(
      (candle) =>
        candle.timestamp >= since && candle.timestamp <= now
    );

    if (filteredData.length < limit) {
      log(`exchangeService Expected ${limit} candles, got ${filteredData.length}`);
    }

    return filteredData;
  };

  public async getMarketPrice(symbol: string): Promise<number> {
    log(`exchangeService getAveragePrice`, {
      symbol,
    });
    const candles = await this.getCandles(
      symbol,
      "1m",
      CC_AVG_PRICE_CANDLES_COUNT
    );

    if (candles.length === 0) {
      throw new Error(
        `exchangeService getAveragePrice: no candles data for symbol=${symbol}`
      );
    }

    // VWAP (Volume Weighted Average Price)
    // Используем типичную цену (typical price) = (high + low + close) / 3
    const sumPriceVolume = candles.reduce((acc, candle) => {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      return acc + typicalPrice * candle.volume;
    }, 0);

    const totalVolume = candles.reduce((acc, candle) => acc + candle.volume, 0);

    if (totalVolume === 0) {
      // Если объем нулевой, возвращаем простое среднее close цен
      const sum = candles.reduce((acc, candle) => acc + candle.close, 0);
      return sum / candles.length;
    }

    const vwap = sumPriceVolume / totalVolume;

    return vwap;
  }

  public formatQuantity = async (symbol: string, quantity: number) => {
    log("exchangeService formatQuantity", {
      symbol,
    });
    const exchange = await getExchange();
    const market = exchange.market(symbol);
    const stepSize = market.limits?.amount?.min || market.precision?.amount;
    if (stepSize !== undefined) {
      return roundTicks(quantity, stepSize);
    }
    return exchange.amountToPrecision(symbol, quantity);
  };

  public formatPrice = async (symbol: string, price: number) => {
    log("exchangeService formatPrice", {
      price,
    });
    const exchange = await getExchange();
    const market = exchange.market(symbol);
    const tickSize = market.limits?.price?.min || market.precision?.price;
    if (tickSize !== undefined) {
      return roundTicks(price, tickSize);
    }
    return exchange.priceToPrecision(symbol, price);
  };
}

export default ExchangeService;
