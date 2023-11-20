import { Request } from 'express';
import { getCookie } from './cookie';
import { Socket } from 'socket.io';
const extractToken = (token?: string) => {
    if (!token) {
        return null;
    }
    const data = token.split(' ');
    if (data[0] === 'Bearer') {
        return data[1];
    }
    return null;
};

export const extractJwt = (req: Request | Socket) => {
    if (req instanceof Socket) {
        return extractToken(req.handshake.headers.authorization);
    }
    let token = null;
    const authorization = req.headers.authorization;
    token = extractToken(authorization);

    if (token) {
        return token;
    }
    const cookie = getCookie(req.headers.cookie, 'auth-token');
    token = extractToken(cookie);
    if (token) {
        return token;
    }
    return token;
};
