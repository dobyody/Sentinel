// src/routes/reports.ts
import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { db } from '../config/database';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';
import { broadcastNewReport, broadcastUpvote } from '../services/websocket';
import { uploadToS3 } from '../config/s3';
import { env } from '../config/env';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// Multer: accept images in memory (max 8 MB), we'll push to S3 manually
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

// ─── Validation Schemas ───────────────────────────────────────────────────────

const getReportsSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(50).default(5),
  type: z.enum(['nearby', 'trending']).default('nearby'),
  category: z.enum(['THREAT', 'INFRASTRUCTURE', 'ANIMAL', 'OBSTACLE']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const createReportSchema = z.object({
  category: z.enum(['THREAT', 'INFRASTRUCTURE', 'ANIMAL', 'OBSTACLE']),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  description: z.string().max(1000).optional(),
  photoUrl: z.string().url().optional(), // Pre-signed upload URL result
});

// ─── GET /api/reports ─────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius, type, category, limit, offset } =
      getReportsSchema.parse(req.query);

    // Convert km radius to approximate degree delta (1° ≈ 111.32 km)
    const delta = radius / 111.32;
    const now = new Date();

    const where = {
      isActive: true,
      expiresAt: { gt: now },
      latitude: { gte: lat - delta, lte: lat + delta },
      longitude: { gte: lng - delta, lte: lng + delta },
      ...(category ? { category } : {}),
    };

    const orderBy =
      type === 'trending'
        ? [{ upvotes: 'desc' as const }, { createdAt: 'desc' as const }]
        : [{ createdAt: 'desc' as const }];

    const [reports, total] = await Promise.all([
      db.hazardReport.findMany({
        where,
        orderBy,
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
          user: { select: { nickname: true, isTrusted: true } },
        },
      }),
      db.hazardReport.count({ where }),
    ]);

    res.json({ reports, total, limit, offset });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/reports ────────────────────────────────────────────────────────

router.post(
  '/',
  upload.single('photo'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const body = createReportSchema.parse(req.body);
      const userId = req.user!.id;

      let photoUrl = body.photoUrl ?? null;

      // If a photo file was uploaded, push it to S3
      if (req.file) {
        photoUrl = await uploadToS3(req.file.buffer, req.file.mimetype);
      }

      const expiresAt = new Date(
        Date.now() + env.REPORT_TTL_HOURS * 60 * 60 * 1000
      );

      const report = await db.$transaction(async (tx) => {
        const newReport = await tx.hazardReport.create({
          data: {
            userId,
            category: body.category,
            latitude: body.lat,
            longitude: body.lng,
            description: body.description ?? null,
            photoUrl,
            expiresAt,
          },
          select: {
            id: true,
            category: true,
            latitude: true,
            longitude: true,
            description: true,
            photoUrl: true,
            upvotes: true,
            commentsCount: true,
            createdAt: true,
            expiresAt: true,
          },
        });

        // Increment reporter's count; promote to trusted if threshold reached
        const updated = await tx.user.update({
          where: { id: userId },
          data: {
            reportsCount: { increment: 1 },
          },
          select: { reportsCount: true },
        });

        if (
          updated.reportsCount >= env.TRUSTED_REPORTER_THRESHOLD &&
          !req.user!.isTrusted
        ) {
          await tx.user.update({
            where: { id: userId },
            data: { isTrusted: true },
          });
        }

        return newReport;
      });

      // Broadcast to WebSocket subscribers in the area
      broadcastNewReport({ ...report, category: report.category.toString() });

      res.status(201).json({ report });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/reports/:id/upvote ─────────────────────────────────────────────

router.post(
  '/:id/upvote',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const report = await db.hazardReport.findUnique({ where: { id } });
      if (!report || !report.isActive) {
        throw new AppError(404, 'Report not found or inactive');
      }
      if (report.userId === userId) {
        throw new AppError(400, 'You cannot upvote your own report');
      }

      // Upvote (unique constraint prevents duplicates)
      await db.$transaction(async (tx) => {
        await tx.upvote.create({ data: { reportId: id, userId } });
        await tx.hazardReport.update({
          where: { id },
          data: { upvotes: { increment: 1 } },
        });
        // Increment "people helped" for the report author
        await tx.user.update({
          where: { id: report.userId },
          data: { peopleHelpedCount: { increment: 1 } },
        });
      });

      const updated = await db.hazardReport.findUnique({
        where: { id },
        select: { upvotes: true },
      });

      broadcastUpvote(id, updated!.upvotes);

      res.json({ upvotes: updated!.upvotes });
    } catch (err) {
      // Unique constraint → already upvoted
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as Record<string, unknown>).code === 'P2002'
      ) {
        next(new AppError(409, 'You have already upvoted this report'));
      } else {
        next(err);
      }
    }
  }
);

// ─── GET /api/reports/:id ────────────────────────────────────────────────────

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const report = await db.hazardReport.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { nickname: true, isTrusted: true } },
      },
    });
    if (!report) throw new AppError(404, 'Report not found');
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

export default router;
