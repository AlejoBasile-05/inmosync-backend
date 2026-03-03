import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendManualMessageDto } from './dto/sendManualMessage.dto';
import { HttpService } from '@nestjs/axios';
import { WebhookService } from 'src/webhook/webhook.service';
import { SendClientMessageDto } from 'src/webhook/dto/sendClientMessage.dto';

@Injectable()
export class AgentsService {
  constructor (
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly webhookService: WebhookService
  ) {}

  async findForID(id : string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: id },
      select: {
        name: true,
        clients: {
          select: {
            id: true,
            name: true,
            number: true,
            status: true,
            messages: {
              select: {
                text: true,
                origin: true,
                createdAt: true
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
      }
    });
    if (!agent) {
      throw new NotFoundException('Agente no encontrado en la base de datos');
    }
    return agent
  }

  async sendManualMessage(data: SendManualMessageDto, agentId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id: data.clientId, agentId: agentId },
    })

    if (!client) {
      throw new NotFoundException('El cliente no pertenece a este agente')
    }

    const dataToSend: SendClientMessageDto = {
      number: client.number.toString(),
      message: data.text
    }

    await this.webhookService.sendMessageToClient(dataToSend)

    return await this.prisma.message.create({
      data: {
        text: data.text,
        origin: 'agent',
        number: client.number,
        clientId: data.clientId,
      }
    })

  }

}
