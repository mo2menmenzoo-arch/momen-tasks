import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly requests: Map<string, { count: number; resetTime: number }>;
  private readonly ttl: number;
  private readonly max: number;

  constructor(configService: ConfigService) {
    this.requests = new Map();
    this.ttl = configService.get<number>('RATE_LIMIT_TTL', 60) * 1000;
    this.max = configService.get<number>('RATE_LIMIT_MAX', 100);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const key = `${req.ip}:${req.user?.sub || 'anonymous'}`;
    const now = Date.now();
    const entry = this.requests.get(key);

    if (entry && now < entry.resetTime) {
      if (entry.count >= this.max) {
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests',
          error: 'Too Many Requests',
        });
        return;
      }
      entry.count++;
    } else {
      this.requests.set(key, { count: 1, resetTime: now + this.ttl });
    }

    res.setHeader('X-RateLimit-Limit', this.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - (entry?.count || 1)));

    next();
  }
}
