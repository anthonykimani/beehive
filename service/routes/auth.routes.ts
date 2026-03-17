import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.config';
import { ApiError } from '../middleware/error-handler';
import { AppDataSource } from '../configs/orm.config';
import { User } from '../models/user.entity';
import { UserRepository } from '../repositories/user.repo';

export const authRouter = Router();

const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

authRouter.post('/wallet/nonce', async (req, res: Response, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw new Error('Wallet address required') as ApiError;
    }

    const nonce = uuidv4();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    nonceStore.set(walletAddress.toLowerCase(), { nonce, expiresAt });

    const message = `Sign this message to authenticate with SwarmFund.\n\nNonce: ${nonce}\nExpires: ${new Date(expiresAt).toISOString()}`;

    res.json({
      success: true,
      data: {
        message,
        expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/wallet/verify', async (req, res: Response, next) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      res.json({ success: false, error: 'Wallet address and signature required' });
      return;
    }

    const stored = nonceStore.get(walletAddress.toLowerCase());

    if (!stored) {
      res.json({ success: false, error: 'No nonce found - call /nonce first' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      nonceStore.delete(walletAddress.toLowerCase());
      res.json({ success: false, error: 'Nonce expired' });
      return;
    }

    // In production, verify signature properly
    // For now, accept any signature for development
    nonceStore.delete(walletAddress.toLowerCase());

    // Create user without database for now (dev mode)
    const fakeUserId = `user_${Date.now()}`;
    const payload = {
      userId: fakeUserId,
      walletAddress: walletAddress.toLowerCase(),
      role: 'user',
    };

    const token = jwt.sign(payload, env.jwt.secret || 'dev-secret-key', {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: fakeUserId,
          walletAddress: walletAddress.toLowerCase(),
          username: `user_${walletAddress.toLowerCase().slice(0, 8)}`,
          role: 'user',
        },
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.json({ success: false, error: 'Authentication failed' });
  }
});

authRouter.get('/me', async (req, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.jwt.secret || 'dev-secret-key') as any;

    res.json({
      success: true,
      data: {
        id: decoded.userId,
        walletAddress: decoded.walletAddress,
        username: `user_${decoded.walletAddress?.slice(0, 8) || 'unknown'}`,
        role: decoded.role || 'user',
      },
    });
  } catch (error) {
    res.json({ success: false, error: 'Invalid token' });
  }
});

authRouter.post('/refresh', async (req, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided') as ApiError;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.jwt.secret) as any;

    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        walletAddress: decoded.walletAddress,
        role: decoded.role,
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn as any }
    );

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    next(error);
  }
});
