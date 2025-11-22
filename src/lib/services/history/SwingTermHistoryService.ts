import signal from "../../../lib";
import { inject } from "../../core/di";
import { log } from "pinolog";
import { TYPES } from "../../core/types";
import SwingTermDbService from "../db/SwingTermDbService";
import {
  ISwingTermDto,
  ISwingTermRow,
  SwingTermModel,
} from "../../../schema/SwingTerm.schema";
import { not, or, ttl } from "functools-kit";
import dayjs from "dayjs";
import SwingTermClientService from "../client/SwingTermClientService";
import ExchangeService from "../base/ExchangeService";

const SHUTDOWN_THRESHOLD_MS = 4 * 60 * 60 * 1_000;

// ОПТИМИЗИРОВАНО ДЛЯ СКАЛЬПИНГА: более частое сохранение истории (15 минут вместо 30)
const HISTORY_TTL = 15 * 60 * 1_000;
const HISTORY_ROWS = 10;

interface Column {
  key: keyof ISwingTermRow;
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
    key: "plusDI14",
    label: "+DI(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "minusDI14",
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
    key: "cci20",
    label: "CCI(20)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "bollingerUpper20_2",
    label: "Bollinger Upper(20,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerMiddle20_2",
    label: "Bollinger Middle(20,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerLower20_2",
    label: "Bollinger Lower(20,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerWidth20_2",
    label: "Bollinger Width(20,2.0)",
    format: (v) => v !== null ? `${Number(v).toFixed(2)}%` : 'N/A',
  },
  {
    key: "stochasticK14_3_3",
    label: "Stochastic K(14,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochasticD14_3_3",
    label: "Stochastic D(14,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "momentum8",
    label: "Momentum(8)",
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
    key: "sma20",
    label: "SMA(20)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "ema13",
    label: "EMA(13)",
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
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
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
    key: "volume",
    label: "Volume",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatQuantity(symbol, Number(v)) : 'N/A',
  },
  {
    key: "volatility",
    label: "Basic Volatility",
    format: (v) => v !== null ? `${Number(v).toFixed(2)}%` : 'N/A',
  },
  {
    key: "priceMomentum6",
    label: "Price Momentum(6)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
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
  indicators: ISwingTermRow[],
  symbol: string
): Promise<string> {
  let markdown = "";
  markdown += `# 30-Min Candles Analysis for ${symbol} (Historical Data)\n\n`;

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
  markdown += "- **Timeframe**: 30-minute candles\n";
  markdown += "- **Lookback Period**: 96 candles (48 hours)\n";
  markdown += "- **RSI(14)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic RSI(14)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **MACD(12,26,9)**: fast 12 and slow 26 periods on 30m timeframe before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Signal(9)**: over previous 9 candles (4.5 hours on 30m timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **ADX(14)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **+DI(14)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **-DI(14)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **ATR(14)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **CCI(20)**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Bollinger Upper(20,2.0)**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Middle(20,2.0)**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Lower(20,2.0)**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Width(20,2.0)**: width percentage before row timestamp (Min: 0%, Max: +∞)\n";
  markdown += "- **Stochastic K(14,3,3)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic D(14,3,3)**: over previous 14 candles (7 hours on 30m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **DEMA(21)**: over previous 21 candles (10.5 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **WMA(20)**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **SMA(20)**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(13)**: over previous 13 candles (6.5 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(34)**: over previous 34 candles (17 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Momentum(8)**: over previous 8 candles (4 hours on 30m timeframe) before row timestamp (Min: -∞ USD, Max: +∞ USD)\n";
  markdown += "- **Support**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Resistance**: over previous 20 candles (10 hours on 30m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Price Momentum(6)**: over previous 6 candles (3 hours on 30m timeframe) before row timestamp (Min: -∞ USD, Max: +∞ USD)\n";
  markdown += "- **Current Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Body Size**: candle body size at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Close Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Volume**: trading volume at row timestamp (Min: 0, Max: +∞)\n";
  markdown += "- **Volatility**: volatility percentage at row timestamp (Min: 0%, Max: +∞)\n";

  return markdown;
}

export class SwingTermHistoryService {
  private readonly swingTermClientService = inject<SwingTermClientService>(
    TYPES.swingTermClientService
  );

  private readonly swingTermDbService = inject<SwingTermDbService>(
    TYPES.swingTermDbService
  );

  private readonly exchangeService = inject<ExchangeService>(
    TYPES.exchangeService
  );

  public execute = ttl(
    async (symbol: string) => {
      log("swingTermHistoryService execute", {
        symbol,
      });

      const lastRecord = await this.swingTermDbService.findLastBySymbol(symbol);

      if (lastRecord) {
        const timeDiff = dayjs().diff(dayjs(lastRecord.date));
        if (timeDiff < HISTORY_TTL) {
          this.execute.clear(symbol);
          return;
        }
      }

      const data =
        await this.swingTermClientService.getSwingTermAnalysis(symbol);

      const lastPrice = await this.exchangeService.getMarketPrice(symbol);

      const dto: ISwingTermDto = {
        symbol,
        rsi14: data.rsi14,
        stochasticRSI14: data.stochasticRSI14,
        macd12_26_9: data.macd12_26_9?.macd ?? null,
        signal9: data.macd12_26_9?.signal ?? null,
        adx14: data.adx14?.adx ?? null,
        plusDI14: data.adx14?.plusDI ?? null,
        minusDI14: data.adx14?.minusDI ?? null,
        atr14: data.atr14,
        cci20: data.cci20,
        bollingerWidth20_2: data.bollingerBandWidth20_2,
        bollingerUpper20_2: data.bollinger20_2?.upper ?? null,
        bollingerMiddle20_2: data.bollinger20_2?.middle ?? null,
        bollingerLower20_2: data.bollinger20_2?.lower ?? null,
        stochasticK14_3_3: data.stochastic14_3_3?.k ?? null,
        stochasticD14_3_3: data.stochastic14_3_3?.d ?? null,
        momentum8: data.momentum8,
        dema21: data.dema21,
        wma20: data.wma20,
        sma20: data.sma20,
        ema13: data.ema13,
        ema34: data.ema34,
        currentPrice: data.currentPrice ?? lastPrice,
        support: data.support,
        resistance: data.resistance,
        volume: data.volume,
        volatility: data.volatility,
        priceMomentum6: data.priceMomentum6,
        volumeTrend: data.volumeTrend,
        bodySize:
          data.recentCandles.length > 0
            ? Math.abs(
                data.recentCandles[data.recentCandles.length - 1].close -
                  data.recentCandles[data.recentCandles.length - 1].open
              )
            : 0,
        closePrice: lastPrice ?? 0,
        date: new Date(),
        lookbackPeriod: '96 candles (48 hours)',
      };

      if (await not(this.swingTermDbService.validate(dto))) {
        log("swingTermHistoryService execute error", dto);
        return;
      }
      await this.swingTermDbService.create(dto);
    },
    {
      timeout: HISTORY_TTL,
      key: ([symbol]) => `${symbol}`,
    }
  );

  public generateSwingTermHistory = async (
    symbol: string
  ): Promise<string | null> => {
    log("swingTermHistoryService generateSwingTermHistory", {
      symbol,
    });

    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();

    const { rows, total } = await this.swingTermDbService.paginate(
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
    log("swingTermHistoryService validate", {
      symbol,
    });
    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();
    const total = await SwingTermModel.countDocuments(
      {
        symbol,
        date: { $gte: timeThreshold },
      },
      {
        limit: HISTORY_ROWS,
      }
    );
    console.log(`swingTermHistoryService validate symbol=${symbol} total=${total} required=${HISTORY_ROWS}`);
    return total >= HISTORY_ROWS;
  };
}

export default SwingTermHistoryService;
