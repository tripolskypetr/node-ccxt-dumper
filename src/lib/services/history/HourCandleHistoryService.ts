import { inject } from "../../core/di";
import { TYPES } from "../../core/types";
import ExchangeService from "../base/ExchangeService";
import ICandleData from "../../../model/Candle.model";

const RECENT_CANDLES = 6;


export class HourCandleHistoryService {
  private readonly exchangeService = inject<ExchangeService>(TYPES.exchangeService);

  public generateHourCandleHistory = async (
    symbol: string
  ): Promise<string> => {
    const candles: ICandleData[] = await this.exchangeService.getCandles(symbol, "1h", RECENT_CANDLES);
    let markdown = "";
    
    markdown += `## Hourly Candles History (Last ${RECENT_CANDLES})\n`;
    
    for (let index = 0; index < candles.length; index++) {
      const candle = candles[index];
      const open = candle.open;
      const high = candle.high;
      const low = candle.low;
      const close = candle.close;
      const volume = candle.volume;
      
      const volatilityPercent = ((high - low) / close) * 100;
      const bodySize = Math.abs(close - open);
      const candleRange = high - low;
      const bodyPercent = candleRange > 0 ? (bodySize / candleRange) * 100 : 0;
      const candleType = close > open ? "Green" : close < open ? "Red" : "Doji";

      const formattedTime = new Date(candle.timestamp).toISOString();
      
      markdown += `### 1h Candle ${index + 1} (${candleType})\n`;
      markdown += `- **Time**: ${formattedTime}\n`;
      markdown += `- **Open**: ${await this.exchangeService.formatPrice(symbol, open)} USD\n`;
      markdown += `- **High**: ${await this.exchangeService.formatPrice(symbol, high)} USD\n`;
      markdown += `- **Low**: ${await this.exchangeService.formatPrice(symbol, low)} USD\n`;
      markdown += `- **Close**: ${await this.exchangeService.formatPrice(symbol, close)} USD\n`;
      markdown += `- **Volume**: ${await this.exchangeService.formatQuantity(symbol, volume)}\n`;
      markdown += `- **1h Volatility**: ${volatilityPercent.toFixed(2)}%\n`;
      markdown += `- **Body Size**: ${bodyPercent.toFixed(1)}%\n\n`;
    }

    return markdown;
  };
}

export default HourCandleHistoryService;