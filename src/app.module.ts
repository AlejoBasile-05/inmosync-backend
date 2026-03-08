import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook/webhook.module';
import {ConfigModule} from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [WebhookModule, ConfigModule.forRoot({ isGlobal: true }), AuthModule, AgentsModule, PropertiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
