import signal from "../../../lib";
import { inject } from "../../core/di";
import { log } from "pinolog";
import { TYPES } from "../../core/types";
import LongTermDbService from "../db/LongTermDbService";
import { ILongTermDto, ILongTermRow, LongTermModel } from "../../../schema/LongTerm.schema";
import { not, ttl } from "functools-kit";
import dayjs from "dayjs";
import LongTermClientService from "../client/LongTermClientService";
import ExchangeService from "../base/ExchangeService";

const SHUTDOWN_THRESHOLD_MS = 4 * 60 * 60 * 1_000;

// ОПТИМИЗИРОВАНО ДЛЯ СКАЛЬПИНГА: более частое сохранение истории (30 минут вместо 1 часа)
const HISTORY_TTL = 30 * 60 * 1_000;
const HISTORY_ROWS = 5;

interface Column {
  key: keyof ILongTermRow;
  label: string;
  format: (
    value: number | string | Date,
    symbol: string
  ) => Promise<string> | string;
}

const columns: Column[] = [
  {
    key: "rsi14",
    label: "RSI(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochasticRSI14",
    label: "Stochastic RSI(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "macd12_26_9",
    label: "MACD(12,26,9)",
    format: (v) => v !== null ? Number(v).toFixed(4) : 'N/A',
  },
  {
    key: "signal9",
    label: "Signal(9)",
    format: (v) => v !== null ? Number(v).toFixed(4) : 'N/A',
  },
  {
    key: "adx14",
    label: "ADX(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "pdi14",
    label: "+DI(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "ndi14",
    label: "-DI(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "atr14",
    label: "ATR(14)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "atr14_raw",
    label: "ATR(14) Raw",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "atr20",
    label: "ATR(20)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "cci20",
    label: "CCI(20)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochastic14_3_3_K",
    label: "Stochastic K(14,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochastic14_3_3_D",
    label: "Stochastic D(14,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "momentum10",
    label: "Momentum(10)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "dema21",
    label: "DEMA(21)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "wma20",
    label: "WMA(20)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "sma50",
    label: "SMA(50)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "ema20",
    label: "EMA(20)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "ema34",
    label: "EMA(34)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "currentPrice",
    label: "Current Price",
    format: async (v, symbol) =>
      await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD',
  },
  {
    key: "support",
    label: "Support Level",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "resistance",
    label: "Resistance Level",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollinger20_2_upper",
    label: "Bollinger Upper(20,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollinger20_2_middle",
    label: "Bollinger Middle(20,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollinger20_2_lower",
    label: "Bollinger Lower(20,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "fibonacciNearestLevel",
    label: "Fibonacci Nearest Level",
    format: (v) => String(v),
  },
  {
    key: "fibonacciNearestPrice",
    label: "Fibonacci Nearest Price",
    format: async (v, symbol) =>
      await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD',
  },
  {
    key: "fibonacciDistance",
    label: "Fibonacci Distance",
    format: async (v, symbol) =>
      await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD',
  },
  {
    key: "bodySize",
    label: "Body Size",
    format: async (v, symbol) =>
      await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD',
  },
  {
    key: "closePrice",
    label: "Close Price",
    format: async (v, symbol) =>
      await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD',
  },
  {
    key: "date",
    label: "Timestamp",
    format: (v) => new Date(v).toISOString(),
  },
];

async function generateHistoryTable(
  indicators: ILongTermRow[],
  symbol: string
): Promise<string> {
  let markdown = "";
  markdown += `# 1-Hour Candles Trading Analysis for ${symbol} (Historical Data)\n\n`;

  const header = `| ${columns.map((col) => col.label).join(" | ")} |\n`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |\n`;

  const rows = await Promise.all(
    indicators.map(async (ind) => {
      const cells = await Promise.all(
        columns.map(async (col) => await col.format(ind[col.key], symbol))
      );
      return `| ${cells.join(" | ")} |`;
    })
  );

  markdown += header;
  markdown += separator;
  markdown += rows.join("\n");
  markdown += "\n\n";
  
  markdown += "## Data Sources\n";
  markdown += "- **Timeframe**: 1-hour candles\n";
  markdown += "- **Lookback Period**: 48 candles (48 hours)\n";
  markdown += "- **RSI(14)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic RSI(14)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **MACD(12,26,9)**: fast 12 and slow 26 periods on 1h timeframe before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Signal(9)**: over previous 9 candles (9 hours on 1h timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **ADX(14)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **+DI(14)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **-DI(14)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **ATR(14)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **ATR(14) Raw**: raw value over previous 14 candles before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **ATR(20) Raw**: raw value over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **CCI(20)**: over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Bollinger Upper(20,2.0)**: over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Middle(20,2.0)**: over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Lower(20,2.0)**: over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Stochastic K(14,3,3)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic D(14,3,3)**: over previous 14 candles (14 hours on 1h timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **DEMA(21)**: over previous 21 candles (21 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **WMA(20)**: over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **SMA(50)**: over previous 50 candles (50 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(20)**: over previous 20 candles (20 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(34)**: over previous 34 candles (34 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Momentum(10)**: over previous 10 candles (10 hours on 1h timeframe) before row timestamp (Min: -∞ USD, Max: +∞ USD)\n";
  markdown += "- **Support**: over previous 4 candles (4 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Resistance**: over previous 4 candles (4 hours on 1h timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Fibonacci Nearest Level**: nearest level name before row timestamp\n";
  markdown += "- **Fibonacci Nearest Price**: nearest price level before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Fibonacci Distance**: distance to nearest level before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Current Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Body Size**: candle body size at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Close Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";

  return markdown;
}

export class LongTermHistoryService {
  private readonly longTermClientService = inject<LongTermClientService>(
    TYPES.longTermClientService
  );

  private readonly longTermDbService = inject<LongTermDbService>(
    TYPES.longTermDbService
  );

  private readonly exchangeService = inject<ExchangeService>(
    TYPES.exchangeService
  );

  public execute = ttl(
    async (symbol: string) => {
      log("longTermHistoryService execute", {
        symbol,
      });

      const lastRecord = await this.longTermDbService.findLastBySymbol(symbol);

      if (lastRecord) {
        const timeDiff = dayjs().diff(dayjs(lastRecord.date));
        if (timeDiff < HISTORY_TTL) {
          this.execute.clear(symbol);
          return;
        }
      }

      const data = await this.longTermClientService.getLongTermAnalysis(symbol);

      const lastPrice = await this.exchangeService.getMarketPrice(symbol);

      const dto: ILongTermDto = {
        symbol,
        rsi14: data.rsi14,
        stochasticRSI14: data.stochasticRSI14,
        macd12_26_9: data.macd12_26_9,
        signal9: data.signal9,
        adx14: data.adx14,
        pdi14: data.pdi14,
        ndi14: data.ndi14,
        atr14: data.atr14,
        atr14_raw: data.atr14_raw,
        atr20: data.atr20,
        cci20: data.cci20,
        bollinger20_2_upper: data.bollinger20_2_upper,
        bollinger20_2_middle: data.bollinger20_2_middle,
        bollinger20_2_lower: data.bollinger20_2_lower,
        stochastic14_3_3_K: data.stochastic14_3_3_K,
        stochastic14_3_3_D: data.stochastic14_3_3_D,
        momentum10: data.momentum10,
        dema21: data.dema21,
        wma20: data.wma20,
        sma50: data.sma50,
        ema20: data.ema20,
        ema34: data.ema34,
        currentPrice: data.currentPrice ?? lastPrice,
        support: data.support,
        resistance: data.resistance,
        volumeTrend: data.volumeTrend,
        fibonacciNearestLevel: data.fibonacci.nearestLevel.level,
        fibonacciNearestPrice: data.fibonacci.nearestLevel.price,
        fibonacciDistance: data.fibonacci.nearestLevel.distance,
        bodySize:
          data.recentCandles.length > 0
            ? Math.abs(
                data.recentCandles[data.recentCandles.length - 1].close -
                  data.recentCandles[data.recentCandles.length - 1].open
              )
            : 0,
        closePrice: lastPrice ?? 0,
        date: new Date(),
        lookbackPeriod: '48 candles (48 hours) with SMA(50) from 100 hours',
      };

      if (await not(this.longTermDbService.validate(dto))) {
        log("longTermHistoryService execute error", dto);
        return;
      }

      await this.longTermDbService.create(dto);
    },
    {
      timeout: HISTORY_TTL,
      key: ([symbol]) => `${symbol}`,
    }
  );

  public generateLongTermHistory = async (
    symbol: string
  ): Promise<string | null> => {
    log("longTermHistoryService generateLongTermHistory", {
      symbol,
    });

    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();

    const { rows, total } = await this.longTermDbService.paginate(
      {
        symbol,
        date: { $gte: timeThreshold },
      },
      { limit: HISTORY_ROWS, offset: 0 },
      { date: -1 }
    );
    if (total === 0) {
      return null;
    }
    return await generateHistoryTable(rows, symbol);
  };

  public validate = async (symbol: string) => {
    log("longTermHistoryService validate", {
      symbol,
    });
    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();
    const total = await LongTermModel.countDocuments(
      {
        symbol,
        date: { $gte: timeThreshold },
      },
      {
        limit: HISTORY_ROWS,
      }
    );
    console.log(`longTermHistoryService validate symbol=${symbol} total=${total} required=${HISTORY_ROWS}`);
    return total >= HISTORY_ROWS;
  };
}

export default LongTermHistoryService;
