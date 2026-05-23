import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: '/inventory',
})
@Injectable()
export class InventoryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(InventoryGateway.name);

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const shopId = client.handshake.query.shopId as string;
    if (shopId) {
      client.join(`shop:${shopId}`);
      this.logger.debug(`Client ${client.id} joined shop:${shopId}`);
    } else {
      // Reject connections without a shopId — they can't receive meaningful events
      this.logger.warn(`Client ${client.id} connected without shopId — disconnecting`);
      client.disconnect(true);
    }
    // TODO: Add JWT verification for WebSocket connections.
    // Extract the token from client.handshake.auth.token or client.handshake.headers.authorization,
    // verify with JwtService, and validate that the user belongs to the requested shopId.
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  broadcastStockUpdate(
    shopId: string,
    updates: Array<{ productId: string; newStock: number }>,
  ) {
    this.server.to(`shop:${shopId}`).emit('stockUpdated', {
      updates,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastLowStockAlert(
    shopId: string,
    alert: { productId: string; productName: string; currentStock: number },
  ) {
    this.server.to(`shop:${shopId}`).emit('lowStockAlert', alert);
  }
}
