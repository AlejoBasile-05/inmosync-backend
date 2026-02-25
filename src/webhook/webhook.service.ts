import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveClientMessagesDto } from './dto/saveClientMessages.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  verifyMetaToken(mode: string, token: string): boolean {

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

    return mode === 'subscribe' && token === verifyToken;
  }

  async saveClientMessage(data: SaveClientMessagesDto) {
    const nameClient = data.name;
    const numberClient = data.number.toString();
    const textMessage = data.messages;

    await this.prisma.client.upsert({
      where: { number: numberClient },
      update: { messages: {
        create: { text: textMessage, origin: 'FastAPI', number: numberClient}
      } },
      create: { name: nameClient, number: numberClient, score: 0, messages: {
        create: { text: textMessage, origin: 'FastAPI', number: numberClient }
      } },
    });
  }
}