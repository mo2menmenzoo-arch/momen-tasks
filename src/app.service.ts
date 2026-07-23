import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'momen-tasks-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
