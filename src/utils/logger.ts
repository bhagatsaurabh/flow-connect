export enum LogLevel {
  TRACE = 'TRACE', DEBUG = 'DEBUG', WARN = 'WARN', INFO = 'INFO', LOG = 'LOG', ERROR = 'ERROR', DISABLED = 'DISABLED'
}

export class Log {
  static LOG_LEVEL: LogLevel = LogLevel.INFO;

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
