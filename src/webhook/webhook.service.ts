import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveClientMessagesDto } from './dto/saveClientMessages.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Send } from 'express';
import { SendClientMessageDto } from './dto/sendClientMessage.dto';
import { LeadStatus } from '@prisma/client';

interface IAResponse {
  score: number;
  message: string;
  status: LeadStatus;
}

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  verifyMetaToken(mode: string, token: string): boolean {

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

    return mode === 'subscribe' && token === verifyToken;
  }

  async saveClientMessage(data: SaveClientMessagesDto) {
    const nameClient = data.name;
    const numberClient = data.number.toString();
    const textMessage = data.messages;

    const cliente = await this.prisma.client.upsert({
      where: { number: numberClient },
      update: { messages: {
        create: { text: textMessage, origin: 'whatsapp', number: numberClient}
      } },
      create: { name: nameClient, number: numberClient, score: 0, messages: {
        create: { text: textMessage, origin: 'whatsapp', number: numberClient }
      } },
    });

    const clienteFormateado: SaveClientMessagesDto = {
      name: cliente.name,
      number: cliente.number,
      score: cliente.score,
      messages: textMessage
    };

    this.sendToAI(clienteFormateado).then((response) => {
      const score = response.score || 0;
      this.prisma.client.update({
        where: { id: cliente.id },
        data: { score: score, status: response.status, messages: {
          create: { text: response.message, origin: 'FastAPI', number: cliente.number }
        } }
      }).catch((error) => {
        console.error('Error actualizando el score en la BD:', error);
      });
      const messageCliente: SendClientMessageDto = {
        number: this.numberFormatting(cliente.number),
        message: response.message,
      };
      this.sendMessageToClient(messageCliente).catch((error) => {
        console.error('Error enviando el mensaje de respuesta al cliente:', error);
      });
      if (response.status === LeadStatus.HOT) {
        const messageToAgent: SendClientMessageDto = {
          number: process.env.AGENT_PHONE_NUMBER || "542625635902",
          message: `🔥 ¡LEAD CALIENTE! El cliente ${clienteFormateado.name} (${clienteFormateado.number}) tiene un score de ${response.score}`

        }
        this.sendMessageToClient(messageToAgent)
      }
    }).catch((error) => {
      console.error('Error enviando el mensaje a la IA:', error);
    });
  }

  async sendToAI(data: SaveClientMessagesDto) {
    const iaUrl = process.env.IA_SERVICE_URL || 'http://localhost:8000/chat';

    const payload = {
      number: data.number.toString(),
      score: Number(data.score) || 0,
      message: data.messages
    };

    const response = await firstValueFrom(
      this.httpService.post(iaUrl, payload)
    );

    return response.data;
  }

  async sendMessageToClient(data : SendClientMessageDto) {
    const clientURL = `https://graph.facebook.com/v15.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: data.number.toString(),
      type: 'text',
      text: { body: data.message },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(clientURL, payload, {
          headers: {
            Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (error) {
      console.error('Error enviando mensaje:', error.response?.data || error.message);
    }
  }

  numberFormatting(number: string): string {
    const cleanedNumber = number.replace(/[\s\-()]/g, '');
  
    if (!cleanedNumber.startsWith('54')) {
      return '54' + cleanedNumber;
    }

    if (cleanedNumber.startsWith("549")) {
        return '54' + cleanedNumber.slice(3);
      }

    return cleanedNumber;
  }
}