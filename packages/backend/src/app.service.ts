import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): { status: string; message :string; timestamp: Date } {
    return {
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date(),
    };
  }
}
