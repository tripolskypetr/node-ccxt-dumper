import { serve } from "@hono/node-server";
import { app, injectWebSocket } from "../config/app";

import { createServer } from "http";

import "../routes/exchange";
import "../routes/export";
import "../routes/health";

import signal from "../lib";

const HONO_PORT = 30050;
const MAX_CONNECTIONS = 1_000;
const SOCKET_TIMEOUT = 60 * 10 * 1000;

const main = () => {

  if (signal.bootstrapService.isRepl) {
    return;
  }

  if (signal.bootstrapService.isWorker) {
    return;
  }

  if (!signal.bootstrapService.isServe) {
    return;
  }

  const server = serve({
    fetch: app.fetch,
    port: HONO_PORT,
    createServer: (...args) => {
      const server = createServer(...args);
      server.maxConnections = MAX_CONNECTIONS;
      server.setTimeout(SOCKET_TIMEOUT);
      return server;
    },
  });

  server.addListener("listening", () => {
    console.log(`Server listening on http://localhost:${HONO_PORT}`);
  });

  injectWebSocket(server);
};

main();
