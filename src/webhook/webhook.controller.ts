import { Controller, Get, Post, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Response } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const isValid = this.webhookService.verifyMetaToken(mode, token);

    if (isValid) {
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      return res.status(HttpStatus.FORBIDDEN).send('Token de verificación inválido');
    }
  }

  @Post()
  receiveMessage(@Body() body: any, @Res() res: Response) {

    console.log('Mensaje recibido de WhatsApp:', JSON.stringify(body, null, 2));

    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

  }
}