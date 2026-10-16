import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'KUENEREE API — GraphQL: /graphql';
  }
}
