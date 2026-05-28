// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { db } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    telegramId: string;
    nickname: string;
    isTrusted: boolean;
  };
}

/**
 * Verify the Bearer JWT and attach the user to the request.
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  let payload: { sub: string };
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
    return;
  }

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, telegramId: true, nickname: true, isTrusted: true },
  });

  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  req.user = user;
  next();
}

/**
 * Convenience: sign a JWT for a given user ID.
 */
export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}
