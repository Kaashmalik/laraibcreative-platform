/**
 * Main tRPC App Router
 * Combines all sub-routers
 */

import { router } from '../trpc';
import { authRouter } from './auth';
import { productRouter } from './product';
import { orderRouter } from './order';
import { measurementProfileRouter } from './measurementProfile';
import { priceCalculatorRouter } from './priceCalculator';
import { productionQueueRouter } from './productionQueue';
import { referralRouter } from './referral';
import { loyaltyRouter } from './loyalty';
import { analyticsRouter } from './analytics';
import { alertsRouter } from './alerts';

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  order: orderRouter,
  measurementProfile: measurementProfileRouter,
  priceCalculator: priceCalculatorRouter,
  productionQueue: productionQueueRouter,
  referral: referralRouter,
  loyalty: loyaltyRouter,
  analytics: analyticsRouter,
  alerts: alertsRouter,
});

export type AppRouter = typeof appRouter;

