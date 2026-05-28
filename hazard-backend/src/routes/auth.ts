// src/routes/auth.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../config/database';
import { validateTelegramInitData } from '../services/telegramAuth';
import { signToken } from '../middlewares/auth';
import { generateNickname } from '../utils/nickname';

const router = Router();

const authSchema = z.object({
  initData: z.string().min(1),
});

/**
 * POST /api/auth/telegram
 *
 * Validates Telegram Mini App initData, creates or fetches the user,
 * and returns a signed JWT + user object.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {

    if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true' && req.body.devTelegramId) {
  const telegramId = String(req.body.devTelegramId);

  let user = await db.user.findUnique({ where: { telegramId } });
  if (!user) {
    user = await db.user.create({
      data: {
        telegramId,
        nickname: generateNickname(),
      },
    });
  }

  const token = signToken(user.id);
  return res.json({ token, user });
}

    const { initData } = authSchema.parse(req.body);

    // Validate the Telegram payload (throws on failure)
    const { user: tgUser } = validateTelegramInitData(initData);

    const telegramId = String(tgUser.id);

    // Upsert: create on first login, fetch on subsequent logins
    const user = await db.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        nickname: generateNickname(),
      },
      update: {}, // Nothing to update on re-login
      select: {
        id: true,
        nickname: true,
        reportsCount: true,
        peopleHelpedCount: true,
        isTrusted: true,
        createdAt: true,
      },
    });

    const token = signToken(user.id);

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

export default router;
