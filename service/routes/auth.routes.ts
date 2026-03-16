import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env.config';
import { ApiError } from '../middleware/error-handler';

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
      throw new Error('Wallet address and signature required') as ApiError;
    }

    const stored = nonceStore.get(walletAddress.toLowerCase());

    if (!stored) {
      throw new Error('No nonce found for this wallet') as ApiError;
    }

    if (Date.now() > stored.expiresAt) {
      nonceStore.delete(walletAddress.toLowerCase());
      throw new Error('Nonce expired') as ApiError;
    }

    // In production, verify signature properly
    // For now, accept any signature for development
    nonceStore.delete(walletAddress.toLowerCase());

    const userId = uuidv4();
    const payload = {
      userId,
      walletAddress: walletAddress.toLowerCase(),
      role: 'user',
    };

    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn as any,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          walletAddress: walletAddress.toLowerCase(),
          role: 'user',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', async (req, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided') as ApiError;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.jwt.secret) as any;

    res.json({
      success: true,
      data: {
        id: decoded.userId,
        walletAddress: decoded.walletAddress,
        role: decoded.role,
      },
    });
  } catch (error) {
    next(error);
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
