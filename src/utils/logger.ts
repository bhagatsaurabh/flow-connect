export enum LogLevel {
  TRACE = 'Trace', INFO = 'Info', WARN = 'Warn', ERROR = 'Error', DISABLED = 'Disabled'
}

export class Logger {
  static LOG_LEVEL: LogLevel = LogLevel.DISABLED;

  static log(...args: any): void {
    if (this.LOG_LEVEL !== LogLevel.TRACE) return;
    console.log.apply(this, args);
  }
  static info(...args: any): void {
    if (this.LOG_LEVEL !== LogLevel.INFO) return;
    console.info.apply(this, args);
  }
  static warn(...args: any): void {
    if (this.LOG_LEVEL !== LogLevel.WARN) return;
    console.warn.apply(this, args);
  }
  static error(...args: any): void {
    if (this.LOG_LEVEL !== LogLevel.ERROR) return;
    console.error.apply(this, args);
  }
}