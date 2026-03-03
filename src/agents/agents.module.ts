import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from 'src/webhook/webhook.service';
import { WebhookGateway } from 'src/webhook/webhook.gateway';

@Module({
  imports: [AuthModule, PrismaModule, HttpModule],
  controllers: [AgentsController],
  providers: [AgentsService, PrismaService, WebhookService, WebhookGateway],
})
export class AgentsModule {}