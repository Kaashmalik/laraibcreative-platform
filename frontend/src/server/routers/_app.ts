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

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  order: orderRouter,
  measurementProfile: measurementProfileRouter,
  priceCalculator: priceCalculatorRouter,
});

export type AppRouter = typeof appRouter;

