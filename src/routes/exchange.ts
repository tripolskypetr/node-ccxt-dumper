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
  since?: number;
  when?: number;
}

const logger = createLogger(`http_exchange.log`);

const generateRequestId = () => randomString();

app.post("/exchange/candles", async (ctx) => {
  const request = await ctx.req.json<GetCandlesRequest>();
  console.time(`/exchange/candles ${request.requestId}`);
  try {
    // If since is provided, use it directly; otherwise calculate from when (default to now)
    let since: number;
    if (request.since !== undefined) {
      since = request.since;
    } else {
      const when = request.when ?? Date.now();
      since = await signal.candleViewService.getSince({
        interval: request.interval,
        limit: request.limit,
        when,
      });
    }

    const data = await signal.candleViewService.getCandles(
      request.symbol,
      request.interval,
      request.limit,
      since
    );

    const result = {
      data,
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };

    logger.log("/exchange/candles ok", { request, calculatedSince: since });
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
  const sinceParam = ctx.req.query("since");
  const whenParam = ctx.req.query("when");

  console.time(`/exchange/candles GET ${requestId}`);

  logger.log("/exchange/candles GET called", {
    requestId,
    symbol,
    interval,
    limit,
    since: sinceParam,
    when: whenParam,
  });

  try {
    // If since is provided, use it directly; otherwise calculate from when (default to now)
    let since: number;
    if (sinceParam !== undefined) {
      since = parseInt(sinceParam, 10);
    } else {
      const when = whenParam !== undefined ? parseInt(whenParam, 10) : Date.now();
      since = await signal.candleViewService.getSince({
        interval,
        limit,
        when,
      });
    }

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

    logger.log("/exchange/candles GET ok", { requestId, symbol, interval, calculatedSince: since });
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
