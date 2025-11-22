import signal from "../../../lib";
import { inject } from "../../core/di";
import { log } from "pinolog";
import { TYPES } from "../../core/types";
import MicroTermDbService from "../db/MicroTermDbService";
import {
  IMicroTermDto,
  IMicroTermRow,
  MicroTermModel,
} from "../../../schema/MicroTerm.schema";
import { not, or, ttl } from "functools-kit";
import dayjs from "dayjs";
import MicroTermClientService from "../client/MicroTermClientService";
import ExchangeService from "../base/ExchangeService";

const SHUTDOWN_THRESHOLD_MS = 1 * 60 * 60 * 1_000;

const HISTORY_TTL = 2 * 60 * 1_000;
const HISTORY_ROWS = 5040; // 7 дней: 7 * 24 * 60 / 2 = 5040

interface Column {
  key: keyof IMicroTermRow;
  label: string;
  format: (
    value: number | string | Date,
    symbol: string
  ) => Promise<string> | string;
}

const columns: Column[] = [
  // Ultra-fast RSI indicators
  {
    key: "rsi9",
    label: "RSI(9)",
    format: (v) => (v !== null ? Number(v).toFixed(2) : "N/A"),
  },
  {
    key: "stochasticRSI9",
    label: "StochRSI(9)",
    format: (v) => (v !== null ? Number(v).toFixed(2) : "N/A"),
  },
  // MACD for momentum
  {
    key: "macd8_21_5",
    label: "MACD(8,21,5)",
    format: (v) => v !== null ? Number(v).toFixed(4) : 'N/A',
  },
  {
    key: "signal5",
    label: "Signal(5)",
    format: (v) => v !== null ? Number(v).toFixed(4) : 'N/A',
  },
  {
    key: "macdHistogram",
    label: "MACD Histogram",
    format: (v) => v !== null ? Number(v).toFixed(4) : 'N/A',
  },
  
  // Bollinger bands
  {
    key: "bollingerUpper8_2",
    label: "BB Upper(8,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerMiddle8_2",
    label: "BB Middle(8,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerLower8_2",
    label: "BB Lower(8,2.0)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "bollingerWidth8_2",
    label: "BB Width(8,2.0)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "bollingerPosition",
    label: "BB Position",
    format: (v) => (v !== null ? `${Number(v).toFixed(1)}%` : "N/A"),
  },
  
  // Stochastic oscillator
  {
    key: "stochasticK3_3_3",
    label: "Stoch K(3,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochasticD3_3_3",
    label: "Stoch D(3,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochasticK5_3_3",
    label: "Stoch K(5,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "stochasticD5_3_3",
    label: "Stoch D(5,3,3)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  
  // Trend strength and direction
  {
    key: "adx9",
    label: "ADX(9)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "plusDI9",
    label: "+DI(9)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "minusDI9",
    label: "-DI(9)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  
  // Volatility and momentum
  {
    key: "atr5",
    label: "ATR(5)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "atr9",
    label: "ATR(9)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "cci9",
    label: "CCI(9)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "momentum5",
    label: "MOM(5)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "momentum10",
    label: "MOM(10)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "roc1",
    label: "ROC(1)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "roc3",
    label: "ROC(3)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "roc5",
    label: "ROC(5)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },

  // Moving averages
  {
    key: "ema3",
    label: "EMA(3)",
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
    key: "ema13",
    label: "EMA(13)",
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
    key: "sma8",
    label: "SMA(8)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "dema8",
    label: "DEMA(8)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "wma5",
    label: "WMA(5)",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  
  // Volume analysis
  {
    key: "volumeSma5",
    label: "Volume SMA(5)",
    format: (v) => v !== null ? Number(v).toFixed(2) : 'N/A',
  },
  {
    key: "volumeRatio",
    label: "Volume Ratio",
    format: (v) => (v !== null ? `${Number(v).toFixed(2)}x` : "N/A"),
  },

  // Price action metrics
  {
    key: "currentPrice",
    label: "Current Price",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "priceChange1m",
    label: "1m Change",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "priceChange3m",
    label: "3m Change",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "priceChange5m",
    label: "5m Change",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  
  // Volatility metrics
  {
    key: "volatility5",
    label: "Volatility(5)",
    format: (v) => (v !== null ? `${Number(v).toFixed(3)}%` : "N/A"),
  },
  {
    key: "trueRange",
    label: "True Range",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  
  // Support/resistance levels
  {
    key: "support",
    label: "Support",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  {
    key: "resistance",
    label: "Resistance",
    format: async (v, symbol) =>
      v !== null ? await signal.exchangeService.formatPrice(symbol, Number(v)) + ' USD' : 'N/A',
  },
  
  // Market microstructure
  // Advanced signals
  {
    key: "squeezeMomentum",
    label: "Squeeze Momentum",
    format: (v) => (v !== null ? Number(v).toFixed(3) : "N/A"),
  },
  {
    key: "pressureIndex",
    label: "Pressure Index",
    format: (v) => (v !== null ? `${Number(v).toFixed(1)}%` : "N/A"),
  },
  
  // Metadata
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
  indicators: IMicroTermRow[],
  symbol: string
): Promise<string> {
  let markdown = "";
  markdown += `# 1-Minute Candles Analysis for ${symbol} (Historical Data)\n\n`;

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
  markdown += "- **Timeframe**: 1-minute candles\n";
  markdown += "- **Lookback Period**: 60 candles (1 hour)\n";
  markdown += "- **History Interval**: Every 2 minutes\n";
  markdown += "- **RSI(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic RSI(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **MACD(8,21,5)**: fast 8 and slow 21 periods on 1m timeframe before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Signal(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **MACD Histogram**: histogram value before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **Bollinger Upper(8,2.0)**: over previous 8 candles (8 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Middle(8,2.0)**: over previous 8 candles (8 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Lower(8,2.0)**: over previous 8 candles (8 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Bollinger Width**: width percentage before row timestamp (Min: 0%, Max: +∞)\n";
  markdown += "- **Bollinger Position**: price position within bands before row timestamp (Min: 0%, Max: 100%)\n";
  markdown += "- **Stochastic K(3,3,3)**: over previous 3 candles (3 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic D(3,3,3)**: over previous 3 candles (3 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic K(5,3,3)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **Stochastic D(5,3,3)**: over previous 5 candles before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **ADX(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **+DI(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **-DI(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: 0, Max: 100)\n";
  markdown += "- **CCI(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: -∞, Max: +∞)\n";
  markdown += "- **ATR(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **ATR(9)**: over previous 9 candles (9 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Volatility(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: 0%, Max: +∞)\n";
  markdown += "- **True Range**: true range value at row timestamp (Min: 0 USD, Max: +∞)\n";
  markdown += "- **Momentum(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: -∞ USD, Max: +∞ USD)\n";
  markdown += "- **Momentum(10)**: over previous 10 candles (10 minutes on 1m timeframe) before row timestamp (Min: -∞ USD, Max: +∞ USD)\n";
  markdown += "- **ROC(1)**: over previous 1 candle (1 minute on 1m timeframe) before row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **ROC(3)**: over previous 3 candles (3 minutes on 1m timeframe) before row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **ROC(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **EMA(3)**: over previous 3 candles (3 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(8)**: over previous 8 candles (8 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(13)**: over previous 13 candles (13 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **EMA(21)**: over previous 21 candles (21 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **SMA(8)**: over previous 8 candles (8 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **DEMA(8)**: over previous 8 candles (8 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **WMA(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Volume SMA(5)**: over previous 5 candles (5 minutes on 1m timeframe) before row timestamp (Min: 0, Max: +∞)\n";
  markdown += "- **Volume Ratio**: volume relative to average at row timestamp (Min: 0x, Max: +∞x)\n";
  markdown += "- **Support**: over previous 30 candles (30 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Resistance**: over previous 30 candles (30 minutes on 1m timeframe) before row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **Current Price**: close price at row timestamp (Min: 0 USD, Max: +∞ USD)\n";
  markdown += "- **1m Change**: price change percentage over 1 minute at row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **3m Change**: price change percentage over 3 minutes at row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **5m Change**: price change percentage over 5 minutes at row timestamp (Min: -∞%, Max: +∞%)\n";
  markdown += "- **Squeeze Momentum**: squeeze momentum indicator at row timestamp (Min: 0, Max: +∞)\n";
  markdown += "- **Pressure Index**: buying/selling pressure percentage at row timestamp (Min: -100%, Max: +100%)\n";

  return markdown;
}

export class MicroTermHistoryService {
  private readonly microTermClientService = inject<MicroTermClientService>(
    TYPES.microTermClientService
  );

  private readonly microTermDbService = inject<MicroTermDbService>(
    TYPES.microTermDbService
  );

  private readonly exchangeService = inject<ExchangeService>(
    TYPES.exchangeService
  );

  public execute = ttl(
    async (symbol: string) => {
      log("microTermHistoryService execute", {
        symbol,
      });

      const lastRecord = await this.microTermDbService.findLastBySymbol(symbol);

      if (lastRecord) {
        const timeDiff = dayjs().diff(dayjs(lastRecord.date));
        if (timeDiff < HISTORY_TTL) {
          this.execute.clear(symbol);
          return;
        }
      }

      const data = await this.microTermClientService.getMicroTermAnalysis(symbol);
      const lastPrice = await this.exchangeService.getMarketPrice(symbol);

      const dto: IMicroTermDto = {
        symbol,
        // Ultra-fast RSI indicators
        rsi9: data.rsi9,
        rsi14: data.rsi14,
        stochasticRSI9: data.stochasticRSI9,
        stochasticRSI14: data.stochasticRSI14,
        
        // MACD for momentum
        macd8_21_5: data.macd8_21_5,
        signal5: data.signal5,
        macdHistogram: data.macdHistogram,
        
        // Bollinger bands
        bollingerUpper8_2: data.bollingerUpper8_2,
        bollingerMiddle8_2: data.bollingerMiddle8_2,
        bollingerLower8_2: data.bollingerLower8_2,
        bollingerWidth8_2: data.bollingerWidth8_2,
        bollingerPosition: data.bollingerPosition,
        
        // Stochastic oscillator
        stochasticK3_3_3: data.stochasticK3_3_3,
        stochasticD3_3_3: data.stochasticD3_3_3,
        stochasticK5_3_3: data.stochasticK5_3_3,
        stochasticD5_3_3: data.stochasticD5_3_3,
        
        // Trend strength and direction
        adx9: data.adx9,
        plusDI9: data.plusDI9,
        minusDI9: data.minusDI9,
        
        // Volatility and momentum
        atr5: data.atr5,
        atr9: data.atr9,
        cci9: data.cci9,
        momentum5: data.momentum5,
        momentum10: data.momentum10,
        roc1: data.roc1,
        roc3: data.roc3,
        roc5: data.roc5,

        // Moving averages
        ema3: data.ema3,
        ema8: data.ema8,
        ema13: data.ema13,
        ema21: data.ema21,
        sma8: data.sma8,
        dema8: data.dema8,
        wma5: data.wma5,
        
        // Volume analysis
        volumeSma5: data.volumeSma5,
        volumeRatio: data.volumeRatio,
        volumeTrend: data.volumeTrend,
        
        // Price action metrics
        currentPrice: data.currentPrice ?? lastPrice,
        priceChange1m: data.priceChange1m,
        priceChange3m: data.priceChange3m,
        priceChange5m: data.priceChange5m,
        
        // Volatility metrics
        volatility5: data.volatility5,
        trueRange: data.trueRange,
        
        // Support/resistance levels
        support: data.support,
        resistance: data.resistance,
        
        // Market microstructure
        tickDirection: data.tickDirection,
        
        // Advanced signals
        squeezeMomentum: data.squeezeMomentum,
        pressureIndex: data.pressureIndex,
        
        // Metadata
        lookbackPeriod: '60 candles (1 hour)',
        closePrice: lastPrice ?? 0,
        date: new Date(),
      };

      if (await not(this.microTermDbService.validate(dto))) {
        log("microTermHistoryService execute error", dto);
        return;
      }

      await this.microTermDbService.create(dto);
    },
    {
      timeout: HISTORY_TTL,
      key: ([symbol]) => `${symbol}`,
    }
  );

  public generateMicroTermHistory = async (
    symbol: string
  ): Promise<string | null> => {
    log("microTermHistoryService generateMicroTermHistory", {
      symbol,
    });

    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();

    const { rows, total } = await this.microTermDbService.paginate(
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
    log("microTermHistoryService validate", {
      symbol,
    });
    const timeThreshold = dayjs()
      .subtract(
        HISTORY_TTL * HISTORY_ROWS + SHUTDOWN_THRESHOLD_MS,
        "milliseconds"
      )
      .toDate();
    const total = await MicroTermModel.countDocuments(
      {
        symbol,
        date: { $gte: timeThreshold },
      },
      {
        limit: HISTORY_ROWS,
      }
    );
    console.log(
      `microTermHistoryService validate symbol=${symbol} total=${total} required=${HISTORY_ROWS}`
    );
    return total >= HISTORY_ROWS;
  };
}

export default MicroTermHistoryService;