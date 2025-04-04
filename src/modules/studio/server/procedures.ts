import { z } from "zod";


import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, or, lt, desc } from "drizzle-orm";

export const studioRouter = createTRPCRouter({
    getMany: protectedProcedure
    .input(
        z.object({
            cursor: z.object({
                id: z.string().uuid(),
                updateAt: z.date(),
            })
            .nullish(),
            limit: z.number().min(1).max(100),
        })
    )
    .query(async ({ ctx, input }) => {
        const { cursor, limit }= input;
        const { id: userID } = ctx.user;
        

        const data = await db
        .select()
        .from(videos)
        .where(and
            (eq(videos.userId, userID),
            cursor
                ? or(
                    lt(videos.updatedAt, cursor.updateAt),
                    and(
                        eq(videos.updatedAt, cursor.updateAt),
                        lt(videos.id, cursor.id)
                        )
                    ): undefined,
            )).orderBy(desc(videos.updatedAt), desc(videos.id))
            //Add 1 to the limit to check if there is more data
            .limit(limit + 1)
         
            const hasMore = data.length > limit;
            //Remove the last item if there is more data
            const items = hasMore ? data.slice(0, -1) : data;
            // Set the next cursor to the last item if there is more data
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore?
            { 
                id: lastItem.id,
                updateAt: lastItem.updatedAt,
            }
            : null


    return {
        items,
        nextCursor,
    };    
    })
});
 