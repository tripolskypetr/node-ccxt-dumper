import { errorData, getErrorMessage, randomString } from "functools-kit";
import { createLogger } from "pinolog";
import { app } from "../config/app";
import signal from "../lib";
import { CandleInterval } from "../model/CandleInterval.model";

interface GetCandlesRequest {
  requestId: string;
  serviceName: string;
  symbol: string;
  interval: CandleInterval;
  limit: number;
  since: number;
}

const logger = createLogger(`http_exchange.log`);

const generateRequestId = () => randomString();

app.post("/exchange/candles", async (ctx) => {
  const request = await ctx.req.json<GetCandlesRequest>();
  console.time(`/exchange/candles ${request.requestId}`);
  try {
    const data = await signal.candleViewService.getCandles(
      request.symbol,
      request.interval,
      request.limit,
      request.since
    );

    const result = {
      data,
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };

    logger.log("/exchange/candles ok", { request });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/exchange/candles error", {
      request,
      error: errorData(error),
    });
    return ctx.json(
      {
        status: "error",
        error: getErrorMessage(error),
        requestId: request.requestId,
        serviceName: request.serviceName,
      },
      200
    );
  } finally {
    console.timeEnd(`/exchange/candles ${request.requestId}`);
  }
});

app.get("/exchange/candles", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.query("symbol");
  const interval = ctx.req.query("interval") as CandleInterval;
  const limit = parseInt(ctx.req.query("limit") || "100", 10);
  const since = parseInt(ctx.req.query("since") || "0", 10);

  console.time(`/exchange/candles GET ${requestId}`);

  logger.log("/exchange/candles GET called", {
    requestId,
    symbol,
    interval,
    limit,
    since,
  });

  try {
    const data = await signal.candleViewService.getCandles(
      symbol,
      interval,
      limit,
      since
    );

    const result = {
      data,
      status: "ok",
      error: "",
      requestId,
    };

    logger.log("/exchange/candles GET ok", { requestId, symbol, interval });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/exchange/candles GET error", {
      requestId,
      symbol,
      interval,
      error: errorData(error),
    });
    return ctx.json(
      {
        status: "error",
        error: getErrorMessage(error),
        requestId,
      },
      200
    );
  } finally {
    console.timeEnd(`/exchange/candles GET ${requestId}`);
  }
});
