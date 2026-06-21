import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract JWT from handshake auth or authorization header
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without auth token — disconnecting`);
        client.disconnect(true);
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload || !payload.sub) {
        this.logger.warn(`Client ${client.id} has invalid JWT — disconnecting`);
        client.disconnect(true);
        return;
      }

      const shopId = client.handshake.query.shopId as string;
      if (!shopId) {
        this.logger.warn(`Client ${client.id} connected without shopId — disconnecting`);
        client.disconnect(true);
        return;
      }

      // Verify user belongs to requested shop
      if (payload.shopId && payload.shopId !== shopId) {
        this.logger.warn(`Client ${client.id} shopId mismatch (token: ${payload.shopId}, requested: ${shopId}) — disconnecting`);
        client.disconnect(true);
        return;
      }

      client.join(`shop:${shopId}`);
      (client as any).userId = payload.sub;
      (client as any).shopId = shopId;
      this.logger.debug(`Client ${client.id} (user: ${payload.sub}) joined shop:${shopId}`);
    } catch (error: any) {
      this.logger.warn(`Client ${client.id} JWT verification failed — disconnecting: ${error?.message || error}`);
      client.disconnect(true);
    }
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
