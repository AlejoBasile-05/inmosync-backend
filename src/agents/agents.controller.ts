import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/GetUser';
import { AgentsService } from './agents.service';
import { SendManualMessageDto } from './dto/sendManualMessage.dto';

@Controller('agents')
@UseGuards(AuthGuard('jwt'))
export class AgentsController {
  constructor (private readonly agentsService: AgentsService) {}
  
  @Get('perfil/clientes')
  async getClients(@GetUser('id') agentId: string) {

    return await this.agentsService.findForID(agentId)
  
  }

  @Post('mensajes')
  async enviarMensajeManual(
    @GetUser('id') agentId: string, 
    @Body() body: SendManualMessageDto
  ) {
    return await this.agentsService.sendManualMessage(body, agentId);
  }
}