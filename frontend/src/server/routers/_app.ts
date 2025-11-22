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

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  order: orderRouter,
  measurementProfile: measurementProfileRouter,
  priceCalculator: priceCalculatorRouter,
  productionQueue: productionQueueRouter,
});

export type AppRouter = typeof appRouter;

