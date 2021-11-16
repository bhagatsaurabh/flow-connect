export enum LogLevel {
  TRACE = 0, DEBUG = 1, INFO = 2, LOG = 2, WARN = 3, ERROR = 4, DISABLED = 5
}

export class Log {
  static LOG_LEVEL: LogLevel = LogLevel.WARN;

  static trace(...args: any): void {
    if (this.LOG_LEVEL > LogLevel.TRACE) return;
    console.trace.apply(this, args);
  }
  static debug(...args: any): void {
    if (this.LOG_LEVEL > LogLevel.DEBUG) return;
    console.debug.apply(this, args);
  }
  static info(...args: any): void {
    if (this.LOG_LEVEL > LogLevel.INFO) return;
    console.info.apply(this, args);
  }
  static log(...args: any): void {
    if (this.LOG_LEVEL > LogLevel.LOG) return;
    console.log.apply(this, args);
  }
  static warn(...args: any): void {
    if (this.LOG_LEVEL > LogLevel.WARN) return;
    console.warn.apply(this, args);
  }
  static error(...args: any): void {
    if (this.LOG_LEVEL > LogLevel.ERROR) return;
    console.error.apply(this, args);
  }
}