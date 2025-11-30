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

interface GetRangeRequest {
  requestId: string;
  serviceName: string;
  symbol: string;
  startDate: number;
  endDate: number;
  limit: number;
  offset: number;
}

const logger = createLogger(`http_view.log`);

const generateRequestId = () => randomString();

// Long Term endpoints
app.post("/view/long-term", async (ctx) => {
  const request = await ctx.req.json<GetDataRequest>();
  console.time(`/view/long-term POST ${request.requestId}`);
  try {
    const data = await signal.longTermViewService.getData(
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

    logger.log("/view/long-term POST ok", { request });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/long-term POST error", {
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
    console.timeEnd(`/view/long-term POST ${request.requestId}`);
  }
});

app.get("/view/long-term", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.query("symbol");
  const limit = parseInt(ctx.req.query("limit") || "100", 10);
  const offset = parseInt(ctx.req.query("offset") || "0", 10);

  console.time(`/view/long-term GET ${requestId}`);

  logger.log("/view/long-term GET called", {
    requestId,
    symbol,
    limit,
    offset,
  });

  try {
    const data = await signal.longTermViewService.getData(
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

    logger.log("/view/long-term GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/long-term GET error", {
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
    console.timeEnd(`/view/long-term GET ${requestId}`);
  }
});

// Swing Term endpoints
app.post("/view/swing-term", async (ctx) => {
  const request = await ctx.req.json<GetDataRequest>();
  console.time(`/view/swing-term POST ${request.requestId}`);
  try {
    const data = await signal.swingTermViewService.getData(
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

    logger.log("/view/swing-term POST ok", { request });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/swing-term POST error", {
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
    console.timeEnd(`/view/swing-term POST ${request.requestId}`);
  }
});

app.get("/view/swing-term", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.query("symbol");
  const limit = parseInt(ctx.req.query("limit") || "100", 10);
  const offset = parseInt(ctx.req.query("offset") || "0", 10);

  console.time(`/view/swing-term GET ${requestId}`);

  logger.log("/view/swing-term GET called", {
    requestId,
    symbol,
    limit,
    offset,
  });

  try {
    const data = await signal.swingTermViewService.getData(
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

    logger.log("/view/swing-term GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/swing-term GET error", {
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
    console.timeEnd(`/view/swing-term GET ${requestId}`);
  }
});

// Short Term endpoints
app.post("/view/short-term", async (ctx) => {
  const request = await ctx.req.json<GetDataRequest>();
  console.time(`/view/short-term POST ${request.requestId}`);
  try {
    const data = await signal.shortTermViewService.getData(
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

    logger.log("/view/short-term POST ok", { request });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/short-term POST error", {
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
    console.timeEnd(`/view/short-term POST ${request.requestId}`);
  }
});

app.get("/view/short-term", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.query("symbol");
  const limit = parseInt(ctx.req.query("limit") || "100", 10);
  const offset = parseInt(ctx.req.query("offset") || "0", 10);

  console.time(`/view/short-term GET ${requestId}`);

  logger.log("/view/short-term GET called", {
    requestId,
    symbol,
    limit,
    offset,
  });

  try {
    const data = await signal.shortTermViewService.getData(
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

    logger.log("/view/short-term GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/short-term GET error", {
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
    console.timeEnd(`/view/short-term GET ${requestId}`);
  }
});

// Micro Term endpoints
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

// Long Term Range endpoints
app.post("/view/long-term-range", async (ctx) => {
  const request = await ctx.req.json<GetRangeRequest>();
  console.time(`/view/long-term-range POST ${request.requestId}`);
  try {
    const data = await signal.longTermViewService.getRange(
      request.symbol,
      request.startDate,
      request.endDate,
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

    logger.log("/view/long-term-range POST ok", { request });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/long-term-range POST error", {
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
    console.timeEnd(`/view/long-term-range POST ${request.requestId}`);
  }
});

app.get("/view/long-term-range", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.query("symbol");
  const startDate = parseInt(ctx.req.query("startDate") || "0", 10);
  const endDate = parseInt(ctx.req.query("endDate") || String(Date.now()), 10);
  const limit = parseInt(ctx.req.query("limit") || "100", 10);
  const offset = parseInt(ctx.req.query("offset") || "0", 10);

  console.time(`/view/long-term-range GET ${requestId}`);

  logger.log("/view/long-term-range GET called", {
    requestId,
    symbol,
    startDate,
    endDate,
    limit,
    offset,
  });

  try {
    const data = await signal.longTermViewService.getRange(
      symbol,
      startDate,
      endDate,
      limit,
      offset
    );

    const result = {
      data,
      status: "ok",
      error: "",
      requestId,
    };

    logger.log("/view/long-term-range GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/view/long-term-range GET error", {
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
    console.timeEnd(`/view/long-term-range GET ${requestId}`);
  }
});
