// src/routes/profile.ts
import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../config/database';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';

const router = Router();
router.use(authenticate);

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const savedLocationSchema = z.object({
  label: z.string().min(1).max(50),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

// ─── GET /api/profile/me ──────────────────────────────────────────────────────

router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nickname: true,
        reportsCount: true,
        peopleHelpedCount: true,
        isTrusted: true,
        createdAt: true,
        _count: { select: { savedLocations: true } },
      },
    });
    if (!user) throw new AppError(404, 'User not found');

    // Compute badge list based on stats
    const badges: string[] = [];
    if (user.isTrusted) badges.push('Trusted Reporter');
    if (user.reportsCount >= 50) badges.push('City Sentinel');
    if (user.peopleHelpedCount >= 100) badges.push('Community Hero');

    res.json({ user: { ...user, badges } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/profile/me/reports ─────────────────────────────────────────────

router.get(
  '/me/reports',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = paginationSchema.parse(req.query);
      const userId = req.user!.id;

      const [reports, total] = await Promise.all([
        db.hazardReport.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            category: true,
            latitude: true,
            longitude: true,
            description: true,
            photoUrl: true,
            upvotes: true,
            commentsCount: true,
            isActive: true,
            createdAt: true,
            expiresAt: true,
          },
        }),
        db.hazardReport.count({ where: { userId } }),
      ]);

      res.json({ reports, total, limit, offset });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/profile/me/saved-locations ─────────────────────────────────────

router.get(
  '/me/saved-locations',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const locations = await db.savedLocation.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ locations });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/profile/me/saved-locations ────────────────────────────────────

router.post(
  '/me/saved-locations',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { label, lat, lng } = savedLocationSchema.parse(req.body);
      const location = await db.savedLocation.create({
        data: { userId: req.user!.id, label, latitude: lat, longitude: lng },
      });
      res.status(201).json({ location });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/profile/me/saved-locations/:locationId ──────────────────────

router.delete(
  '/me/saved-locations/:locationId',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { locationId } = req.params;
      const userId = req.user!.id;

      const existing = await db.savedLocation.findFirst({
        where: { id: locationId, userId },
      });
      if (!existing) throw new AppError(404, 'Saved location not found');

      await db.savedLocation.delete({ where: { id: locationId } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/profile/me/presigned-upload ────────────────────────────────────
// Returns a pre-signed S3 URL so the client can upload photos directly.

import { createPresignedUploadUrl } from '../config/s3';

const presignSchema = z.object({
  mimetype: z.string().regex(/^image\/(jpeg|png|webp|gif)$/),
});

router.get(
  '/me/presigned-upload',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { mimetype } = presignSchema.parse(req.query);
      const urls = await createPresignedUploadUrl(mimetype);
      res.json(urls);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
