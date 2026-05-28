// src/routes/comments.ts
import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../config/database';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { AppError } from '../middlewares/errorHandler';

const router = Router({ mergeParams: true }); // Gives access to :id from parent

router.use(authenticate);

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: z.string().optional(), // Cursor-based pagination for threads
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(500).trim(),
});

// ─── GET /api/reports/:id/comments ───────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: reportId } = req.params;
    const { limit, cursor } = paginationSchema.parse(req.query);

    const report = await db.hazardReport.findUnique({ where: { id: reportId } });
    if (!report) throw new AppError(404, 'Report not found');

    const comments = await db.comment.findMany({
      where: { reportId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { nickname: true, isTrusted: true } },
      },
    });

    const nextCursor =
      comments.length === limit ? comments[comments.length - 1].id : null;

    res.json({ comments, nextCursor });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/reports/:id/comments ──────────────────────────────────────────

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id: reportId } = req.params;
    const { content } = createCommentSchema.parse(req.body);
    const userId = req.user!.id;

    const report = await db.hazardReport.findUnique({ where: { id: reportId } });
    if (!report || !report.isActive) {
      throw new AppError(404, 'Report not found or inactive');
    }

    const comment = await db.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: { reportId, userId, content },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { nickname: true, isTrusted: true } },
        },
      });
      await tx.hazardReport.update({
        where: { id: reportId },
        data: { commentsCount: { increment: 1 } },
      });
      return newComment;
    });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

export default router;
