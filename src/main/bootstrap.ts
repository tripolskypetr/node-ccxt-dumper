import signal from "../lib";

const PROCESS_MAX_LISTENERS = 15;

const main = async () => {
  process.setMaxListeners(PROCESS_MAX_LISTENERS);

  if (signal.bootstrapService.isRepl) {
    return;
  }

  if (signal.bootstrapService.isWorker) {
    return;
  }

  Object.entries(process.env)
    .filter(([key]) => key.startsWith("CC_"))
    .forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });

  process.once("SIGINT", () => process.exit(1));
  process.once("SIGTERM", () => process.exit(1));
};

main();
