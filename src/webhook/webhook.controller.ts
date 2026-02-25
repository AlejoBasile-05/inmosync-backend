import { Controller, Get, Post, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import type { Response } from 'express';
import { messageWhatsAppDto } from './dto/messageWhatsApp.dto';
import { SaveClientMessagesDto } from './dto/saveClientMessages.dto';

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
  receiveMessage(@Body() body: messageWhatsAppDto, @Res() res: Response) {

    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const data: SaveClientMessagesDto = {
        name: body.entry[0].changes[0].value.contacts[0].profile.name,
        number: body.entry[0].changes[0].value.messages[0].from,
        messages: body.entry[0].changes[0].value.messages[0].text.body
      };
      this.webhookService.saveClientMessage(data).catch((error) => {
        console.error('Error guardando el mensaje en la BD:', error);
      });;
    }

    res.status(HttpStatus.OK).send('EVENT_RECEIVED');

  }
}