import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL }, namespace: '/inventory' })
@Injectable()
export class InventoryGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    const shopId = client.handshake.query.shopId as string;
    if (shopId) client.join(`shop:${shopId}`);
  }

  handleDisconnect(client: Socket) {
    // cleanup
  }

  broadcastStockUpdate(shopId: string, updates: Array<{productId: string, newStock: number}>) {
    this.server.to(`shop:${shopId}`).emit('stockUpdated', {
      updates,
      timestamp: new Date().toISOString()
    });
  }

  broadcastLowStockAlert(shopId: string, alert: {productId: string, productName: string, currentStock: number}) {
    this.server.to(`shop:${shopId}`).emit('lowStockAlert', alert);
  }
}
