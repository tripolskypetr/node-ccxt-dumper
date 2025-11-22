import { isObject } from "functools-kit";
import readline from "readline";
import fs from "fs";

// @ts-ignore
globalThis[Symbol.for("error-handler-installed")] = 1;

import "../build/index.mjs";

declare var signal: any;

const main = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question("bun => ", async (input) => {
      if (input.startsWith("exit")) {
        rl.close();
        return;
      }

      try {
        const output = await eval(input);
        console.log(
          isObject(output) ? JSON.stringify(output, null, 2) : output
        );
      } catch (error) {
        console.log(error);
      } finally {
        askQuestion();
      }
    });
  };

  askQuestion();

  rl.on("close", () => {
    process.exit(0);
  });
};

if (!signal.bootstrapService.isWorker) {
  main();
}

// @ts-ignore
globalThis.fs = fs;

