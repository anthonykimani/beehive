import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.config';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  userId?: string;
  walletAddress?: string;
  role?: string;
}

export interface JwtPayload {
  userId: string;
  walletAddress: string;
  role: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.userId = decoded.userId;
    req.walletAddress = decoded.walletAddress;
    req.role = decoded.role;
    next();
  } catch (error) {
    logger.warn({ message: 'Invalid token', token: token.substring(0, 10) + '...' });
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
    });
  }
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;
    req.userId = decoded.userId;
    req.walletAddress = decoded.walletAddress;
    req.role = decoded.role;
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }

  next();
}
