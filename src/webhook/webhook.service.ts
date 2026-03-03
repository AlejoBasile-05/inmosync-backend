import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveClientMessagesDto } from './dto/saveClientMessages.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Send } from 'express';
import { SendClientMessageDto } from './dto/sendClientMessage.dto';
import { LeadStatus } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
import { WebhookGateway } from './webhook.gateway';
import { MessageGatewayDto } from './dto/messageGateway.dto';

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
    private readonly webhookGateway: WebhookGateway
  ) {}

  verifyMetaToken(mode: string, token: string): boolean {

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

    return mode === 'subscribe' && token === verifyToken;
  }

  async saveClientMessage(data: SaveClientMessagesDto) {
    const { name, number, messages, businessNumber } = data;
    const numberFormatted = this.numberFormatting(number);

    const company = await this.prisma.company.findFirst({
      where: { 
      metaPhoneNumber: businessNumber
      },
      include: { agents: true }
    });

    if (!company) {
      console.error(`No existe agente configurado para el número: ${businessNumber}`);
      return;
    }

    const nextAgent = await this.prisma.agent.findFirst({
      where: { companyId: company.id },
      orderBy: { lastLeadReceivedAt: 'asc' } 
    });

    if (!nextAgent) {
      console.error(`Error: La empresa ${company.name} no tiene agentes.`);
      return;
    }

    const cliente = await this.prisma.client.upsert({
      where: { number: numberFormatted },
      update: { messages: {
        create: { text: messages, origin: 'whatsapp', number: numberFormatted}
      } },
      create: { name: name,
                number: numberFormatted,
                score: 0,
                agent: { connect: { id: nextAgent.id } },
                messages: {
                  create: { text: messages, origin: 'whatsapp', number: numberFormatted }
      } },
    });

    const incomingMessagePayload : MessageGatewayDto = {
      id: `msg-${Date.now()}`, // id temporal para el mensaje entrante
      clientId: cliente.id.toString(),
      text: messages,
      origin: 'whatsapp',
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    this.webhookGateway.emitNewMessage(cliente.id.toString(), incomingMessagePayload);

    if (cliente.createdAt.getTime() === cliente.updatedAt.getTime()) {
      await this.prisma.agent.update({
        where: { id: nextAgent.id },
        data: { lastLeadReceivedAt: new Date() }
    });
}

    const clienteFormateado: SaveClientMessagesDto = {
      name: cliente.name,
      number: numberFormatted,
      score: cliente.score,
      messages: messages,
      businessNumber: businessNumber
    };
    if (cliente.botActive === true) {
      this.sendToAI(clienteFormateado).then(async (response) => {
        const score = response.score || 0;
        await this.prisma.client.update({
          where: { id: cliente.id },
          data: { score: score, status: response.status, messages: {
            create: { text: response.message, origin: 'FastAPI', number: clienteFormateado.number }
          } }
        }).catch((error) => {
          console.error('Error actualizando el score en la BD:', error);
        });

        const incomingMessagePayload: MessageGatewayDto = {
          id: `msg-${Date.now()}`,
          clientId: cliente.id.toString(),
          text: response.message,
          origin: 'agent',
          time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        };

        this.webhookGateway.emitNewMessage(cliente.id.toString(), incomingMessagePayload);

        const messageCliente: SendClientMessageDto = {
          number: numberFormatted,
          message: response.message,
        };
        this.sendMessageToClient(messageCliente).catch((error) => {
          console.error('Error enviando el mensaje de respuesta al cliente:', error);
        });
        if (response.status === LeadStatus.HOT) {
          const messageToAgent: SendClientMessageDto = {
            number: this.numberFormatting(nextAgent.number),
            message: `🔥 ¡LEAD CALIENTE! El cliente ${clienteFormateado.name} (${clienteFormateado.number}) tiene un score de ${response.score}`

          }
          this.sendMessageToClient(messageToAgent)
        }
      }).catch((error) => {
        console.error('Error enviando el mensaje a la IA:', error);
      });
    }
  }

  async sendToAI(data: SaveClientMessagesDto) {
    /*
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
    */
    return {
      score: 90, 
      message: 'Este es un mensaje generado por la IA basado en el mensaje del cliente.',
      status: LeadStatus.HOT
    }
  }

  async sendMessageToClient(data : SendClientMessageDto) {
    const clientURL = `https://graph.facebook.com/v15.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: (data.number.toString()),
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
      throw new InternalServerErrorException('No se pudo enviar el mensaje a WhatsApp')
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