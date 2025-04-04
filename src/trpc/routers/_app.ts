import { categoriesRouters } from '@/modules/categories/server/procedure';
import { createTRPCRouter } from '../init';
import { studioRouter } from '@/modules/studio/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  videos: videosRouter,
  categories: categoriesRouters,
});
// export type definition of API
export type AppRouter = typeof appRouter;