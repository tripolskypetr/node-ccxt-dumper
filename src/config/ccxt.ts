import { singleshot } from "functools-kit";
import ccxt, { Exchange } from "ccxt";

export const getExchange = singleshot(async (): Promise<Exchange> => {
  const exchange = new ccxt.binance({
    options: {
      defaultType: "spot",
      adjustForTimeDifference: true,
      recvWindow: 60000,
    },
    enableRateLimit: true,
  });
  await exchange.loadMarkets();
  return exchange;
});
