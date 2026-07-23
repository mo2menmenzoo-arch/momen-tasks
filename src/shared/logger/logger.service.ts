import { Injectable, LoggerService as INestLoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class AppLoggerService implements INestLoggerService {
  private readonly context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'App';
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    return `[${timestamp}] [${level}] [${ctx}] ${msg}`;
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage('LOG', message, context));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(this.formatMessage('ERROR', message, context));
    if (trace) console.error(trace);
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('VERBOSE', message, context));
    }
  }
}
