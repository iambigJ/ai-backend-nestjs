import { UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

import { JwtAuthGuard } from 'src/auth/guard/auth-jwt.guard';
import { extractJwt } from 'src/utils/extract-jwt';
import { AuthService } from 'src/auth/auth.service';
import { Document } from './entity/document.entity';
import { OcrStatus } from './types/socket';
import { DocumentService } from './document.service';
import { OnEvent } from '@nestjs/event-emitter';

export interface DocumentSocket extends Socket {
    user: { id: string };
}

@WebSocketGateway(3001, { cors: '*' })
export class DocumentGateway implements OnGatewayConnection {
    constructor(
        private authService: AuthService,
        private documentService: DocumentService,
    ) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(client: DocumentSocket, ...args: any[]) {
        const verified = await this.authService.verifyToken(extractJwt(client));
        if (!verified) {
            client.disconnect();
        }
    }

    @UseGuards(JwtAuthGuard)
    @SubscribeMessage('join-ocr-status')
    async handle(
        @ConnectedSocket() client: DocumentSocket,
        @MessageBody() data: OcrStatus,
    ) {
        const doc = await this.documentService.findOneDocument(
            data.documentId,
            client.user.id,
        );
        if (!doc) {
            return;
        }
        client.join(doc.id);
    }

    @OnEvent('ocr.progress')
    sendOcrStatus(payload: Document) {
        this.server.to(payload.id).emit('ocr-status', payload);
    }
}
