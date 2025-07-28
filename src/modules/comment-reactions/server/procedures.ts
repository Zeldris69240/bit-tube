import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const commentReactionsRouter = createTRPCRouter({
    like: protectedProcedure
    .input(z.object({ commentId: z.string() .uuid() }))
    .mutation(async ({ input, ctx }) => {
        const { commentId } = input;
        const { id: userId } = ctx.user;
        
        const [existingCommentReactionLike] = await db
        .select()
        .from(commentReactions)
        .where(
            and(
                eq(commentReactions.commentId, commentId),
                eq(commentReactions.userId, userId),
                eq(commentReactions.type, "like"),
            )
        );
        if (existingCommentReactionLike) {
            const [deletedViewerReaction] = await db
            .delete(commentReactions)
            .where(
                and(
                    eq(commentReactions.userId, userId),
                    eq(commentReactions.commentId, commentId),
                )
            )
            .returning();

            return deletedViewerReaction;
        }

        const [createdcommentReaction] = await db
            .insert(commentReactions)
            .values({ userId, commentId, type: "like" })
            .onConflictDoUpdate({
                target: [commentReactions.userId, commentReactions.commentId],
                set: {
                    type: "like",
                },
            })
            .returning();

        return createdcommentReaction;  
    }), 

    dislike: protectedProcedure
    .input(z.object({ commentId: z.string() .uuid() }))
    .mutation(async ({ input, ctx }) => {
        const { commentId } = input;
        const { id: userId } = ctx.user;
        
        const [existingcommentReactionDislike] = await db
        .select()
        .from(commentReactions)
        .where(
            and(
                eq(commentReactions.commentId, commentId),
                eq(commentReactions.userId, userId),
                eq(commentReactions.type, "dislike"),
            )
        );
        if (existingcommentReactionDislike) {
            const [deletedViewerReaction] = await db
            .delete(commentReactions)
            .where(
                and(
                    eq(commentReactions.userId, userId),
                    eq(commentReactions.commentId, commentId),
                )
            )
            .returning();

            return deletedViewerReaction;
        }

        const [createdcommentReaction] = await db
            .insert(commentReactions)
            .values({ userId, commentId, type: "dislike" })
            .onConflictDoUpdate({
                target: [commentReactions.userId, commentReactions.commentId],
                set: {
                    type: "dislike",
                },
            })
            .returning();

        return createdcommentReaction;  
    }),
});