import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import signal from "../lib";
import { singleshot } from "functools-kit";

export const app = new Hono();

const waitForInit = singleshot(async () => {
  try {
    await signal.mongoService.waitForInit();
  } catch (error) {
    console.log("app init failed");
    waitForInit.clear();
    throw error;
  }
});

app.use(async (_, next) => {
  await waitForInit();
  await next();
});

app.use("*", cors());


app.notFound(async (ctx) => {
  return ctx.text("node-ccxt-dumper", 404);
});

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});
