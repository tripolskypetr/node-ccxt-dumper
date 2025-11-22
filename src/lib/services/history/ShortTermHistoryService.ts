import signal from "../../../lib";
import { inject } from "../../core/di";
import { log } from "pinolog";
import { TYPES } from "../../core/types";
import ShortTermDbService from "../db/ShortTermDbService";
import {
  IShortTermDto,
  IShortTermRow,
  ShortTermModel,
} from "../../../schema/ShortTerm.schema";
import { not, or, ttl } from "functools-kit";
import dayjs from "dayjs";
import ShortTermClientService from "../client/ShortTermClientService";
import ExchangeService from "../base/ExchangeService";

const SHUTDOWN_THRESHOLD_MS = 4 * 60 * 60 * 1_000;

const HISTORY_TTL = 5 * 60 * 1_000;
const HISTORY_ROWS = 2016; // 7 дней: 7 * 24 * 60 / 5 = 2016

interface Column {
  key: keyof IShortTermRow;
  label: string;
  format: (
    value: number | string | Date,
    symbol: string
  ) => Promise<string> | string;
}

const columns: Column[] = [
  {
    key: "rsi9",
    label: "RSI(9)",
    format: (v) => (v !== null ? Number(v).toFixed(2) : "N/A"),
  },
  {
    key: "stochasticRSI9",
    label: "Stochastic RSI(9)",
    format: (v) => (v !== null ? Number(v).toFixed(2) : "N/A"),
  },
  {
    key: "macd8_21_5",
    label: "MACD(8,21,5)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "signal5",
    label: "Signal(5)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
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
    key: "atr9",
    label: "ATR(9)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "cci14",
    label: "CCI(14)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "bollingerUpper10_2",
    label: "Bollinger Upper(10,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerMiddle10_2",
    label: "Bollinger Middle(10,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerLower10_2",
    label: "Bollinger Lower(10,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerWidth10_2",
    label: "Bollinger Width(10,2.0)",
    format: (v) => (v !== null ? `${Number(v).toFixed(2)}%` : "N/A"),
  },
  {
    key: "stochasticK5_3_3",
    label: "Stochastic K(5,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochasticD5_3_3",
    label: "Stochastic D(5,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "momentum8",
    label: "Momentum(8)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "roc5",
    label: "ROC(5)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "roc10",
    label: "ROC(10)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "sma50",
    label: "SMA(50)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "ema8",
    label: "EMA(8)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "ema21",
    label: "EMA(21)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
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
  indicators: IShortTermRow[],
  symbol: string
): Promise<string> {
  let markdown = "";
  markdown += `# 15-Minute Candles Trading Analysis for ${symbol} (Historical Data)\n\n`;

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
  markdown += "- **Timeframe**: 15-minute candles\n";
  markdown += "- **RSI(9)**: over previous 9 candles (135 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic RSI(9)**: over previous 9 candles (135 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **MACD(8,21,5)**: fast 8 and slow 21 periods on 15m timeframe before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Signal(5)**: over previous 5 candles (75 minutes on 15m timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **ADX(14)**: over previous 14 candles (210 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **+DI(14)**: over previous 14 candles (210 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **-DI(14)**: over previous 14 candles (210 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **ATR(9)**: over previous 9 candles (135 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **CCI(14)**: over previous 14 candles (210 minutes on 15m timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Bollinger Upper(10,2.0)**: over previous 10 candles (150 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Middle(10,2.0)**: over previous 10 candles (150 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Lower(10,2.0)**: over previous 10 candles (150 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Width(10,2.0)**: width percentage before row timestamp (Min: 0%, Max: +∞)\n";
  markdown += "- **Stochastic K(5,3,3)**: over previous 5 candles (75 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic D(5,3,3)**: over previous 5 candles (75 minutes on 15m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Momentum(8)**: over previous 8 candles (120 minutes on 15m timeframe) before row timestamp (Min: -∞ USD, Max: +∞ USD)\n";
  markdown += "- **ROC(5)**: over previous 5 candles (75 minutes on 15m timeframe) before row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **ROC(10)**: over previous 10 candles (150 minutes on 15m timeframe) before row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **SMA(50)**: over previous 50 candles (750 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(8)**: over previous 8 candles (120 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(21)**: over previous 21 candles (315 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **DEMA(21)**: over previous 21 candles (315 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **WMA(20)**: over previous 20 candles (300 minutes on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Support**: over previous 48 candles (12 hours on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Resistance**: over previous 48 candles (12 hours on 15m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Current Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Body Size**: candle body size at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Close Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";

  return markdown;
}

export class ShortTermHistoryService {
  private readonly shortTermClientService = inject<ShortTermClientService>(
    TYPES.shortTermClientService
  );

  private readonly shortTermDbService = inject<ShortTermDbService>(
    TYPES.shortTermDbService
  );

  private readonly exchangeService = inject<ExchangeService>(
    TYPES.exchangeService
  );

  public execute = ttl(
    async (symbol: string) => {
      log("shortTermHistoryService execute", {
        symbol,
      });

      const lastRecord = await this.shortTermDbService.findLastBySymbol(symbol);

      if (lastRecord) {
        const timeDiff = dayjs().diff(dayjs(lastRecord.date));
        if (timeDiff < HISTORY_TTL) {
          this.execute.clear(symbol);
          return;
        }
      }

      const data =
        await this.shortTermClientService.getShortTermAnalysis(symbol);

      const lastPrice = await this.exchangeService.getMarketPrice(symbol);

      const dto: IShortTermDto = {
        symbol,
        rsi9: data.rsi9,
        stochasticRSI9: data.stochasticRSI9,
        macd8_21_5: data.macd8_21_5,
        signal5: data.signal5,
        adx14: data.adx14,
        plusDI14: data.plusDI14,
        minusDI14: data.minusDI14,
        atr9: data.atr9,
        cci14: data.cci14,
        bollingerWidth10_2: data.bollingerWidth10_2,
        bollingerUpper10_2: data.bollingerUpper10_2,
        bollingerMiddle10_2: data.bollingerMiddle10_2,
        bollingerLower10_2: data.bollingerLower10_2,
        stochasticK5_3_3: data.stochasticK5_3_3,
        stochasticD5_3_3: data.stochasticD5_3_3,
        momentum8: data.momentum8,
        roc5: data.roc5,
        roc10: data.roc10,
        sma50: data.sma50,
        ema8: data.ema8,
        ema21: data.ema21,
        dema21: data.dema21,
        wma20: data.wma20,
        currentPrice: data.currentPrice ?? lastPrice,
        support: data.support,
        resistance: data.resistance,
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
        lookbackPeriod: '144 candles (36 hours)',
      };

      if (await not(this.shortTermDbService.validate(dto))) {
        log("shortTermHistoryService execute error", dto);
        return;
      }

      await this.shortTermDbService.create(dto);
    },
    {
      timeout: HISTORY_TTL,
      key: ([symbol]) => `${symbol}`,
    }
  );

  public generateShortTermHistory = async (
    symbol: string
  ): Promise<string | null> => {
    log("shortTermHistoryService generateShortTermHistory", {
      symbol,
    });

    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();

    const { rows, total } = await this.shortTermDbService.paginate(
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
    log("shortTermHistoryService validate", {
      symbol,
    });
    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();
    const total = await ShortTermModel.countDocuments(
      {
        symbol,
        date: { $gte: timeThreshold },
      },
      {
        limit: HISTORY_ROWS,
      }
    );
    console.log(
      `shortTermHistoryService validate symbol=${symbol} total=${total} required=${HISTORY_ROWS}`
    );
    return total >= HISTORY_ROWS;
  };
}

export default ShortTermHistoryService;
