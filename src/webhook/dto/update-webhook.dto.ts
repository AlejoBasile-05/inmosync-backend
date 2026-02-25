import { PartialType } from '@nestjs/mapped-types';
import { SaveClientMessagesDto } from './saveClientMessages.dto';

export class UpdateWebhookDto extends PartialType(SaveClientMessagesDto) {}
