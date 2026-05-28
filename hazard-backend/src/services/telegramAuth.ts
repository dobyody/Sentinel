// src/services/telegramAuth.ts
import crypto from 'crypto';
import { env } from '../config/env';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ParsedInitData {
  user: TelegramUser;
  chat_instance?: string;
  chat_type?: string;
  auth_date: number;
  hash: string;
}

/**
 * Validate Telegram Mini App initData according to the official spec:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Returns the parsed payload if valid, throws if invalid or expired.
 */
export function validateTelegramInitData(initDataRaw: string): ParsedInitData {
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');

  if (!hash) {
    throw new Error('Missing hash in initData');
  }

  // Build the data-check string: all fields except hash, sorted alphabetically, joined by \n
  params.delete('hash');
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  // Derive the secret key: HMAC-SHA256("WebAppData", botToken)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(env.TELEGRAM_BOT_TOKEN)
    .digest();

  // Compute the expected hash
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (expectedHash !== hash) {
    throw new Error('initData signature mismatch – possible forgery');
  }

  // Reject stale tokens (older than 24 hours)
  const authDate = Number(params.get('auth_date'));
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > 86_400) {
    throw new Error('initData has expired (older than 24 hours)');
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    throw new Error('No user object in initData');
  }

  const user: TelegramUser = JSON.parse(decodeURIComponent(userRaw));

  return {
    user,
    chat_instance: params.get('chat_instance') ?? undefined,
    chat_type: params.get('chat_type') ?? undefined,
    auth_date: authDate,
    hash,
  };
}
