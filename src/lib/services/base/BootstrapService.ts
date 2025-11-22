import { memoize, singleshot, Subject } from "functools-kit";
import { log } from "pinolog";
import { WorkerName } from "../../../enum/WorkerName";
import { parseArgs } from "util";
import ErrorService from "./ErrorService";
import { TYPES } from "../../core/types";
import { inject } from "../../core/di";

const WORKER_LIST = [
  WorkerName.LongTermWorker,
  WorkerName.SwingTermWorker,
  WorkerName.ShortTermWorker,
  WorkerName.MicroTermWorker,
  WorkerName.SlopeDataWorker,
  WorkerName.VolumeDataWorker,
];

interface IBroadcastMessage<T extends object = object> {
  __type__: typeof BROADCAST_CHANNEL;
  topic: string;
  data: T;
}

type Message = Omit<IBroadcastMessage, "__type__">;

const BROADCAST_CHANNEL = "node-ccxt-dumper-broadcast-channel";

export class BootstrapService {
  private readonly errorService = inject<ErrorService>(TYPES.errorService);

  private _childProcMap = new Map<string, Bun.Subprocess>();
  private _shutdown = false;

  public getMessageSubject = memoize<(topic: string) => Subject<object>>(
    (topic) => `${topic}`,
    () => new Subject<object>()
  );

  private getArgs = singleshot(() => {
    log("bootstrapService getArgs");
    const { values } = parseArgs({
      args: process.argv,
      options: {
        worker: {
          type: "string",
        },
        repl: {
          type: "boolean",
        },
        noJob: {
          type: "boolean",
        },
        serve: {
          type: "boolean",
        },
      },
      strict: true,
      allowPositionals: true,
    });
    return values;
  });

  private spawnChildProc = (worker: string) => {
    log("bootstrapService spawnChildProc", { worker });
    const cmd = [process.execPath, Bun.main, `--worker=${worker}`];
    return Bun.spawn(cmd, {
      cwd: process.cwd(),
      env: process.env,
      killSignal: "SIGKILL",
      windowsHide: true,
      stdio: ["inherit", "inherit", "inherit"],
      ipc: async (message: IBroadcastMessage, childProc) => {
        if (message.__type__ !== BROADCAST_CHANNEL) {
          return;
        }
        log(`bootstrapService ipc recieved message worker=${worker}`, {
          worker,
          message,
        });
        for (const [worker, proc] of this._childProcMap) {
          if (proc.pid === childProc.pid) {
            continue;
          }
          if (proc.killed) {
            throw new Error(
              `bootstrapService ipc emit error process exited worker=${worker}`
            );
          }
          proc.send(message);
        }
        this.getMessageSubject(message.topic).next(message);
      },
      onExit: () => {
        if (this._shutdown) {
          return;
        }
        this._shutdown = true;
        for (const process of this._childProcMap.values()) {
          process.kill();
        }
        throw new Error(
          `bootstrapService Child process exited unexpectedly worker=${worker}`
        );
      },
      serialization: "json",
    });
  };

  public broadcast = async <T extends Message = Message>(
    topic: T["topic"],
    data: T["data"]
  ) => {
    log("bootstrapService broadcast", { topic, data });
    const message: IBroadcastMessage = {
      __type__: BROADCAST_CHANNEL,
      topic,
      data,
    };
    for (const [worker, proc] of this._childProcMap) {
      if (proc.killed) {
        throw new Error(
          `bootstrapService broadcast error process exited worker=${worker} topic=${topic}`
        );
      }
      proc.send(message);
    }
    if (!this._childProcMap.size) {
      process.send && process.send(message);
    }
    this.getMessageSubject(topic).next(message);
  };

  public listen = <T extends Message = Message>(
    topic: string,
    fn: (data: T["data"]) => void
  ) => {
    log("bootstrapService listen");
    return this.getMessageSubject(topic).subscribe(({ data }) => fn(data));
  };

  public get isRepl() {
    const args = this.getArgs();
    return args.repl;
  }

  public get isServe() {
    const args = this.getArgs();
    return args.serve;
  }

  public get isNoJob() {
    const args = this.getArgs();
    return args.noJob;
  }

  public get isWorker() {
    const { worker } = this.getArgs();
    return !!worker;
  }

  public get isLongTermWorker() {
    const { worker } = this.getArgs();
    return worker === WorkerName.LongTermWorker;
  }

  public get isSwingTermWorker() {
    const { worker } = this.getArgs();
    return worker === WorkerName.SwingTermWorker;
  }

  public get isShortTermWorker() {
    const { worker } = this.getArgs();
    return worker === WorkerName.ShortTermWorker;
  }

  public get isMicroTermWorker() {
    const { worker } = this.getArgs();
    return worker === WorkerName.MicroTermWorker;
  }

  public get isSlopeDataWorker() {
    const { worker } = this.getArgs();
    return worker === WorkerName.SlopeDataWorker;
  }

  public get isVolumeDataWorker() {
    const { worker } = this.getArgs();
    return worker === WorkerName.VolumeDataWorker;
  }

  protected init = singleshot(() => {
    process.on("message", (message: IBroadcastMessage) => {
      if (message.__type__ !== BROADCAST_CHANNEL) {
        return;
      }
      log(`bootstrapService ipc recieved message`, {
        message,
      });
      this.getMessageSubject(message.topic).next(message);
    });
    if (this.isWorker) {
      return;
    }
    WORKER_LIST.forEach((worker) =>
      this._childProcMap.set(worker, this.spawnChildProc(worker))
    );
    this.errorService.beforeExitSubject.subscribe(() => {
      this._shutdown = true;
      for (const process of this._childProcMap.values()) {
        process.kill();
      }
    });
  });
}

export default BootstrapService;
