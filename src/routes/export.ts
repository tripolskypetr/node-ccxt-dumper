import { errorData, getErrorMessage, randomString } from "functools-kit";
import { createLogger } from "pinolog";
import { app } from "../config/app";
import signal from "../lib";

interface ExportRequest {
  requestId: string;
  serviceName: string;
}

const logger = createLogger(`http_export.log`);

const generateRequestId = () => randomString();

// Math Services Reports
app.post("/export/long-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/long-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.longTermClientService.generateLongTermReport(symbol),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/long-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/long-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/long-term/:symbol ${request.requestId}`);
  }
});

app.post("/export/short-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/short-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.shortTermClientService.generateShortTermReport(symbol),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/short-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/short-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/short-term/:symbol ${request.requestId}`);
  }
});

app.post("/export/slope-data/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/slope-data/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.slopeDataClientService.generateSlopeDataReport(symbol),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/slope-data/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/slope-data/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/slope-data/:symbol ${request.requestId}`);
  }
});

app.post("/export/swing-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/swing-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.swingTermClientService.generateSwingTermReport(symbol),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/swing-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/swing-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/swing-term/:symbol ${request.requestId}`);
  }
});

app.post("/export/volume-data/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/volume-data/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.volumeDataClientService.generateVolumeDataReport(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/volume-data/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/volume-data/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/volume-data/:symbol ${request.requestId}`);
  }
});

app.post("/export/micro-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/micro-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.microTermClientService.generateMicroTermReport(symbol),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/micro-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/micro-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/micro-term/:symbol ${request.requestId}`);
  }
});

// History Services Reports
app.post("/export/history/one-minute/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/one-minute/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.oneMinuteCandleHistoryService.generateOneMinuteCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/one-minute/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/one-minute/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/history/one-minute/:symbol ${request.requestId}`);
  }
});

app.post("/export/history/fifteen-minute/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/fifteen-minute/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.fifteenMinuteCandleHistoryService.generateFifteenMinuteCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/fifteen-minute/:symbol ok", {
      request,
      symbol,
    });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/fifteen-minute/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(
      `/export/history/fifteen-minute/:symbol ${request.requestId}`
    );
  }
});

app.post("/export/history/thirty-minute/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/thirty-minute/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.thirtyMinuteCandleHistoryService.generateThirtyMinuteCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/thirty-minute/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/thirty-minute/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(
      `/export/history/thirty-minute/:symbol ${request.requestId}`
    );
  }
});

app.post("/export/history/hour/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/hour/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.hourCandleHistoryService.generateHourCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/hour/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/hour/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/history/hour/:symbol ${request.requestId}`);
  }
});

app.post("/export/history/long-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/long-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.longTermHistoryService.generateLongTermHistory(symbol),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/long-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/long-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/history/long-term/:symbol ${request.requestId}`);
  }
});

app.post("/export/history/short-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/short-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.shortTermHistoryService.generateShortTermHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/short-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/short-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/history/short-term/:symbol ${request.requestId}`);
  }
});

app.post("/export/history/swing-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/swing-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.swingTermHistoryService.generateSwingTermHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/swing-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/swing-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/history/swing-term/:symbol ${request.requestId}`);
  }
});

app.post("/export/history/micro-term/:symbol", async (ctx) => {
  const symbol = ctx.req.param("symbol");
  const request = await ctx.req.json<ExportRequest>();
  console.time(`/export/history/micro-term/:symbol ${request.requestId}`);
  try {
    const result = {
      data: await signal.microTermHistoryService.generateMicroTermHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId: request.requestId,
      serviceName: request.serviceName,
    };
    logger.log("/export/history/micro-term/:symbol ok", { request, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/micro-term/:symbol error", {
      request,
      symbol,
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
    console.timeEnd(`/export/history/micro-term/:symbol ${request.requestId}`);
  }
});

// Simplified GET endpoints

// Math Services Reports
app.get("/export/long-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/long-term/:symbol GET ${requestId}`);
  logger.log("/export/long-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.longTermClientService.generateLongTermReport(symbol),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/long-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/long-term/:symbol GET error", {
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
    console.timeEnd(`/export/long-term/:symbol GET ${requestId}`);
  }
});

app.get("/export/short-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/short-term/:symbol GET ${requestId}`);
  logger.log("/export/short-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.shortTermClientService.generateShortTermReport(symbol),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/short-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/short-term/:symbol GET error", {
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
    console.timeEnd(`/export/short-term/:symbol GET ${requestId}`);
  }
});

app.get("/export/slope-data/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/slope-data/:symbol GET ${requestId}`);
  logger.log("/export/slope-data/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.slopeDataClientService.generateSlopeDataReport(symbol),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/slope-data/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/slope-data/:symbol GET error", {
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
    console.timeEnd(`/export/slope-data/:symbol GET ${requestId}`);
  }
});

app.get("/export/swing-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/swing-term/:symbol GET ${requestId}`);
  logger.log("/export/swing-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.swingTermClientService.generateSwingTermReport(symbol),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/swing-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/swing-term/:symbol GET error", {
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
    console.timeEnd(`/export/swing-term/:symbol GET ${requestId}`);
  }
});

app.get("/export/volume-data/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/volume-data/:symbol GET ${requestId}`);
  logger.log("/export/volume-data/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.volumeDataClientService.generateVolumeDataReport(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/volume-data/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/volume-data/:symbol GET error", {
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
    console.timeEnd(`/export/volume-data/:symbol GET ${requestId}`);
  }
});

app.get("/export/micro-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/micro-term/:symbol GET ${requestId}`);
  logger.log("/export/micro-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.microTermClientService.generateMicroTermReport(symbol),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/micro-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/micro-term/:symbol GET error", {
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
    console.timeEnd(`/export/micro-term/:symbol GET ${requestId}`);
  }
});

// History Services Reports
app.get("/export/history/one-minute/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/one-minute/:symbol GET ${requestId}`);
  logger.log("/export/history/one-minute/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.oneMinuteCandleHistoryService.generateOneMinuteCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/one-minute/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/one-minute/:symbol GET error", {
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
    console.timeEnd(`/export/history/one-minute/:symbol GET ${requestId}`);
  }
});

app.get("/export/history/fifteen-minute/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/fifteen-minute/:symbol GET ${requestId}`);
  logger.log("/export/history/fifteen-minute/:symbol GET called", {
    requestId,
    symbol,
  });
  try {
    const result = {
      data: await signal.fifteenMinuteCandleHistoryService.generateFifteenMinuteCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/fifteen-minute/:symbol GET ok", {
      requestId,
      symbol,
    });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/fifteen-minute/:symbol GET error", {
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
    console.timeEnd(
      `/export/history/fifteen-minute/:symbol GET ${requestId}`
    );
  }
});

app.get("/export/history/thirty-minute/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/thirty-minute/:symbol GET ${requestId}`);
  logger.log("/export/history/thirty-minute/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.thirtyMinuteCandleHistoryService.generateThirtyMinuteCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/thirty-minute/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/thirty-minute/:symbol GET error", {
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
    console.timeEnd(
      `/export/history/thirty-minute/:symbol GET ${requestId}`
    );
  }
});

app.get("/export/history/hour/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/hour/:symbol GET ${requestId}`);
  logger.log("/export/history/hour/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.hourCandleHistoryService.generateHourCandleHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/hour/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/hour/:symbol GET error", {
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
    console.timeEnd(`/export/history/hour/:symbol GET ${requestId}`);
  }
});

app.get("/export/history/long-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/long-term/:symbol GET ${requestId}`);
  logger.log("/export/history/long-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.longTermHistoryService.generateLongTermHistory(symbol),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/long-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/long-term/:symbol GET error", {
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
    console.timeEnd(`/export/history/long-term/:symbol GET ${requestId}`);
  }
});

app.get("/export/history/short-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/short-term/:symbol GET ${requestId}`);
  logger.log("/export/history/short-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.shortTermHistoryService.generateShortTermHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/short-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/short-term/:symbol GET error", {
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
    console.timeEnd(`/export/history/short-term/:symbol GET ${requestId}`);
  }
});

app.get("/export/history/swing-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/swing-term/:symbol GET ${requestId}`);
  logger.log("/export/history/swing-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.swingTermHistoryService.generateSwingTermHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/swing-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/swing-term/:symbol GET error", {
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
    console.timeEnd(`/export/history/swing-term/:symbol GET ${requestId}`);
  }
});

app.get("/export/history/micro-term/:symbol", async (ctx) => {
  const requestId = generateRequestId();
  const symbol = ctx.req.param("symbol");
  console.time(`/export/history/micro-term/:symbol GET ${requestId}`);
  logger.log("/export/history/micro-term/:symbol GET called", { requestId, symbol });
  try {
    const result = {
      data: await signal.microTermHistoryService.generateMicroTermHistory(
        symbol
      ),
      status: "ok",
      error: "",
      requestId,
    };
    logger.log("/export/history/micro-term/:symbol GET ok", { requestId, symbol });
    return ctx.json(result, 200);
  } catch (error) {
    logger.log("/export/history/micro-term/:symbol GET error", {
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
    console.timeEnd(`/export/history/micro-term/:symbol GET ${requestId}`);
  }
});
