import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) 
export class WebhookGateway {
  
  @WebSocketServer()
  server: Server;

  emitNewMessage(clientId: string, message: any) {
    this.server.emit(`newMessage-${clientId}`, message);
  }
}