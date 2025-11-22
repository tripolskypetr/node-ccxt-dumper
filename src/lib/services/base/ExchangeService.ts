import { log } from "pinolog";
import { getExchange } from "src/config/ccxt";

export class ExchangeService {
  public getCandles = async (
    symbol: string,
    interval: string,
    limit: number
  ) => {
    log("exchangeService getCandles", {
      symbol,
    });
    const exchange = await getExchange();
    const candles = await exchange.fetchOHLCV(
      symbol,
      interval,
      await exchange.fetchTime(),
      limit
    );
    return candles.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));
  };

  public async getMarketPrice(symbol: string): Promise<number> {
    log(`exchangeService getAveragePrice`, {
      symbol,
    });

    const candles = await this.getCandles(symbol, "1m", 5);

    if (candles.length === 0) {
      throw new Error(
        `ClientExchange getAveragePrice: no candles data for symbol=${symbol}`
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
    return await exchange.amountToPrecision(symbol, quantity);
  };

  public formatPrice = async (symbol: string, price: number) => {
    log("exchangeService formatPrice", {
      price,
    });
    const exchange = await getExchange();
    return await exchange.priceToPrecision(symbol, price);
  };
}

export default ExchangeService;
