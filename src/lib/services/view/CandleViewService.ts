import { errorData, getErrorMessage, sleep } from "functools-kit";
import { getExchange } from "../../../config/ccxt";
import {
  CC_GET_CANDLES_MIN_CANDLES_FOR_MEDIAN,
  CC_GET_CANDLES_PRICE_ANOMALY_THRESHOLD_FACTOR,
  CC_GET_CANDLES_RETRY_COUNT,
  CC_GET_CANDLES_RETRY_DELAY_MS,
} from "../../../config/params";
import ICandleData from "../../../model/Candle.model";
import { CandleInterval } from "../../../model/CandleInterval.model";
import { inject } from "../../core/di";
import { TYPES } from "../../../lib/core/types";
import { log } from "pinolog";
import CandleDataDbService from "../db/CandleDataDbService";

const VALIDATE_NO_INCOMPLETE_CANDLES_FN = (candles: ICandleData[]): void => {
  if (candles.length === 0) {
    return;
  }

  // Calculate reference price (median or average depending on candle count)
  const allPrices = candles.flatMap((c) => [c.open, c.high, c.low, c.close]);
  const validPrices = allPrices.filter((p) => p > 0);

  let referencePrice: number;
  if (candles.length >= CC_GET_CANDLES_MIN_CANDLES_FOR_MEDIAN) {
    // Use median for reliable statistics with enough data
    const sortedPrices = [...validPrices].sort((a, b) => a - b);
    referencePrice = sortedPrices[Math.floor(sortedPrices.length / 2)] || 0;
  } else {
    // Use average for small datasets (more stable than median)
    const sum = validPrices.reduce((acc, p) => acc + p, 0);
    referencePrice = validPrices.length > 0 ? sum / validPrices.length : 0;
  }

  if (referencePrice === 0) {
    throw new Error(
      `VALIDATE_NO_INCOMPLETE_CANDLES_FN: cannot calculate reference price (all prices are zero)`
    );
  }

  const minValidPrice =
    referencePrice / CC_GET_CANDLES_PRICE_ANOMALY_THRESHOLD_FACTOR;

  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];

    // Check for invalid numeric values
    if (
      !Number.isFinite(candle.open) ||
      !Number.isFinite(candle.high) ||
      !Number.isFinite(candle.low) ||
      !Number.isFinite(candle.close) ||
      !Number.isFinite(candle.volume) ||
      !Number.isFinite(candle.timestamp)
    ) {
      throw new Error(
        `VALIDATE_NO_INCOMPLETE_CANDLES_FN: candle[${i}] has invalid numeric values (NaN or Infinity)`
      );
    }

    // Check for negative values
    if (
      candle.open <= 0 ||
      candle.high <= 0 ||
      candle.low <= 0 ||
      candle.close <= 0 ||
      candle.volume < 0
    ) {
      throw new Error(
        `VALIDATE_NO_INCOMPLETE_CANDLES_FN: candle[${i}] has zero or negative values`
      );
    }

    // Check for anomalously low prices (incomplete candle indicator)
    if (
      candle.open < minValidPrice ||
      candle.high < minValidPrice ||
      candle.low < minValidPrice ||
      candle.close < minValidPrice
    ) {
      throw new Error(
        `VALIDATE_NO_INCOMPLETE_CANDLES_FN: candle[${i}] has anomalously low price. ` +
          `OHLC: [${candle.open}, ${candle.high}, ${candle.low}, ${candle.close}], ` +
          `reference: ${referencePrice}, threshold: ${minValidPrice}`
      );
    }
  }
};

const GET_CANDLES_FN = async (
  dto: {
    symbol: string;
    interval: CandleInterval;
    limit: number;
  },
  since: number
) => {
  const exchange = await getExchange();
  let lastError: Error;
  for (let i = 0; i !== CC_GET_CANDLES_RETRY_COUNT; i++) {
    try {
      const raw = await exchange.fetchOHLCV(
        dto.symbol,
        dto.interval,
        since,
        dto.limit
      );

      const candles = raw.map(
        ([timestamp, open, high, low, close, volume]) => ({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
        })
      );

      VALIDATE_NO_INCOMPLETE_CANDLES_FN(candles);

      return candles;
    } catch (err) {
      console.warn(
        `ClientExchange GET_CANDLES_FN: attempt ${i + 1} failed for symbol=${
          dto.symbol
        }, interval=${dto.interval}, since=${new Date(
          since
        ).toISOString()}, limit=${dto.limit}}`,
        {
          error: errorData(err),
          message: getErrorMessage(err),
        }
      );
      lastError = err;
      await sleep(CC_GET_CANDLES_RETRY_DELAY_MS);
    }
  }
  throw lastError;
};

export class CandleViewService {
  private readonly candleDataDbService: CandleDataDbService =
    inject<CandleDataDbService>(TYPES.candleDataDbService);

  public getCandles = async (
    symbol: string,
    interval: CandleInterval,
    limit: number,
    since: number
  ) => {
    log("candleViewService getCandles called", {
      symbol,
      interval,
      limit,
      since,
    });

    // Try to get candles from database
    const cachedCandles = await this.candleDataDbService.findAll(
      {
        symbol,
        interval,
        timestamp: { $gte: since },
      },
      { timestamp: -1 },
      { limit }
    );

    log("candleViewService found cached candles", {
      count: cachedCandles.length,
    });

    // If we have enough candles in cache, return them
    if (cachedCandles.length >= limit) {
      const sortedCandles = cachedCandles
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, limit);

      log("candleViewService returning cached candles", {
        count: sortedCandles.length,
      });

      return sortedCandles.map(
        ({ timestamp, open, high, low, close, volume }) => ({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
        })
      );
    }

    // Fetch fresh candles from exchange
    log("candleViewService fetching fresh candles from exchange");
    const freshCandles = await GET_CANDLES_FN(
      { symbol, interval, limit },
      since
    );

    // Save fresh candles to database
    log("candleViewService saving fresh candles to database", {
      count: freshCandles.length,
    });

    for (const candle of freshCandles) {
      try {
        // Check if candle already exists
        const existing = await this.candleDataDbService.findByFilter(
          {
            symbol,
            interval,
            timestamp: candle.timestamp,
          },
          { timestamp: -1 }
        );

        if (!existing) {
          await this.candleDataDbService.create({
            symbol,
            interval,
            timestamp: candle.timestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
          });
        }
      } catch (error) {
        log("candleViewService failed to save candle", {
          error: errorData(error),
          message: getErrorMessage(error),
          candle,
        });
      }
    }

    log("candleViewService returning fresh candles", {
      count: freshCandles.length,
    });
    return freshCandles;
  };
}

export default CandleViewService;
