// src/routes/routing.ts
import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { calculateRoutes } from '../services/routing';

const router = Router();
router.use(authenticate);

const routeSchema = z.object({
  startLat: z.coerce.number().min(-90).max(90),
  startLng: z.coerce.number().min(-180).max(180),
  endLat: z.coerce.number().min(-90).max(90),
  endLng: z.coerce.number().min(-180).max(180),
});

/**
 * GET /api/routing/safe
 *
 * Returns two GeoJSON LineString routes:
 *   - safeRoute:    adjusted to avoid active hazard zones
 *   - fastestRoute: raw OSRM route with hazard warnings attached
 */
router.get('/safe', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startLat, startLng, endLat, endLng } = routeSchema.parse(req.query);

    const result = await calculateRoutes(
      { lat: startLat, lng: startLng },
      { lat: endLat, lng: endLng }
    );

    res.json({
      safeRoute: result.safeRoute
        ? {
            type: 'Feature',
            geometry: result.safeRoute,
            properties: {
              distance: result.safeDistance,
              duration: result.safeDuration,
              hazards: result.hazardsOnSafe,
            },
          }
        : null,
      fastestRoute: result.fastestRoute
        ? {
            type: 'Feature',
            geometry: result.fastestRoute,
            properties: {
              distance: result.fastestDistance,
              duration: result.fastestDuration,
              hazards: result.hazardsOnFastest,
            },
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
