import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  
  verifyMetaToken(mode: string, token: string): boolean {

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

    return mode === 'subscribe' && token === verifyToken;
  }
}