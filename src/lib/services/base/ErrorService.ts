import {
  errorData,
  getErrorMessage,
  str,
  Subject,
  TSubject,
} from "functools-kit";
import fs from "fs";
import BootstrapService from "./BootstrapService";
import * as stackTrace from "stack-trace";
import { TYPES } from "../../core/types";
import { inject } from "../../core/di";

const ERROR_HANDLER_INSTALLED = Symbol.for("error-handler-installed");
const ERROR_EXECUTE_BEFORE_EXIT = Symbol.for("error-execute-before-exit");

function dumpStackTrace() {
  const trace = stackTrace.get();
  const result: string[] = [];
  trace.forEach((callSite) => {
    result.push(`File: ${callSite.getFileName()}`);
    result.push(`Line: ${callSite.getLineNumber()}`);
    result.push(`Function: ${callSite.getFunctionName() || "anonymous"}`);
    result.push(`Method: ${callSite.getMethodName() || "none"}`);
    result.push("---");
  });
  return str.newline(result);
}

const timeNow = () => {
  const d = new Date();
  const h = (d.getHours() < 10 ? "0" : "") + d.getHours();
  const m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
  return `${h}:${m}`;
};

export class ErrorService {
  private readonly bootstrapService = inject<BootstrapService>(
    TYPES.bootstrapService
  );

  get beforeExitSubject(): TSubject<void> {
    const global = <any>globalThis;
    if (!global[ERROR_EXECUTE_BEFORE_EXIT]) {
      global[ERROR_EXECUTE_BEFORE_EXIT] = new Subject<void>();
    }
    return global[ERROR_EXECUTE_BEFORE_EXIT];
  }

  public handleGlobalError = async (error: Error) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const date = `${dd}/${mm}/${yyyy} ${timeNow()}`;
    const msg = JSON.stringify(errorData(error), null, 2);
    const trace = dumpStackTrace();
    fs.appendFileSync("./error.txt", `${date}\n${msg}\n${trace}\n\n`);
    try {
      await this.beforeExitSubject.next();
    } catch (error) {
      console.error(
        `Error while emit beforeExitSubject error=${getErrorMessage(error)}`,
        errorData(error)
      );
    }
    process.kill(process.pid, "SIGTERM");
  };

  private _listenForError = () => {
    process.on("uncaughtException", (err) => {
      console.log(err);
      this.handleGlobalError(err);
    });
    process.on("unhandledRejection", (err) => {
      console.log(err);
      this.handleGlobalError(err as Error);
    });
  };

  protected init = () => {
    if (this.bootstrapService.isRepl) {
      return;
    }
    const global = <any>globalThis;
    if (global[ERROR_HANDLER_INSTALLED]) {
      return;
    }
    this._listenForError();
    global[ERROR_HANDLER_INSTALLED] = 1;
  };
}

export default ErrorService;
