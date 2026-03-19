import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../common/prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/gps',
})
export class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`GPS client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`GPS client disconnected: ${client.id}`);
  }

  @SubscribeMessage('trackCar')
  async handleTrackCar(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { carId: string },
  ) {
    client.join(`car-${data.carId}`);
    const lastLog = await this.prisma.gpsLog.findFirst({
      where: { carId: data.carId },
      orderBy: { recordedAt: 'desc' },
    });
    client.emit('currentPosition', lastLog);
  }

  @SubscribeMessage('untrackCar')
  handleUntrackCar(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { carId: string },
  ) {
    client.leave(`car-${data.carId}`);
  }

  @SubscribeMessage('updatePosition')
  async handleUpdatePosition(
    @MessageBody() data: { carId: string; bookingId?: string; lat: number; lng: number; speed?: number; heading?: number },
  ) {
    const log = await this.prisma.gpsLog.create({
      data: {
        carId: data.carId,
        bookingId: data.bookingId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
      },
    });

    this.server.to(`car-${data.carId}`).emit('positionUpdate', log);
    return log;
  }
}
