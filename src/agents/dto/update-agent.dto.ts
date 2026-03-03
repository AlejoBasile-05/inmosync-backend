import { PartialType } from '@nestjs/mapped-types';
import { SendManualMessageDto } from './sendManualMessage.dto';

export class UpdateAgentDto extends PartialType(SendManualMessageDto) {}
