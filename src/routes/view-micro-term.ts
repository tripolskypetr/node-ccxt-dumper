import { errorData, getErrorMessage, randomString } from "functools-kit";
import { createLogger } from "pinolog";
import { app } from "../config/app";
import signal from "../lib";

interface GetDataRequest {
  requestId: string;
  serviceName: string;
  symbol: string;
  limit: number;
  offset: number;
}

const logger = createLogger(`http_view_micro_term.log`);

const generateRequestId = () => randomString();

app.post("/view/micro-term", async (ctx) => {
  const request = await ctx.req.json<GetDataRequest>();
  console.time(`/view/micro-term POST ${request.requestId}`);
  try {
    const data = await signal.microTermViewService.getData(
      request.symbol,
      request.limit,
      request.offset
    );

    const result = {
      data,
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };

    logger.log("/view/micro-term POST ok", { request });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/micro-term POST error", {
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
    console.timeEnd(`/view/micro-term POST ${request.requestId}`);
  }
});

app.get("/view/micro-term", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.query("symbol");
  const limit = parseInt(ctx.req.query("limit") || "100", 10);
  const offset = parseInt(ctx.req.query("offset") || "0", 10);

  console.time(`/view/micro-term GET ${requestId}`);

  logger.log("/view/micro-term GET called", {
    requestId,
    symbol,
    limit,
    offset,
  });

  try {
    const data = await signal.microTermViewService.getData(
      symbol,
      limit,
      offset
    );

    const result = {
      data,
      status: "ok",
      error: "",
      requestId,
    };

    logger.log("/view/micro-term GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/micro-term GET error", {
      requestId,
      symbol,
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
    console.timeEnd(`/view/micro-term GET ${requestId}`);
  }
});
