import { relations } from "drizzle-orm";
import { integer,pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const videoVisibility =  pgEnum("video_visibility",[
    "public",
    "private",
]);

export const reactionType = pgEnum("reaction_type", [
    "like",
    "dislike",
]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    //TODO: add banner fields
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);

export const usersRelations = relations(users, ({many}) => ({
    videos: many(videos),
    videoViews: many(videoViews),
    videoReactions: many(videoReactions),
    subscriptions: many(subscriptions, {
        relationName: "subscriptions_viewer_id_fkey",
    }),
    subscibers: many(subscriptions, {
        relationName: "subscriptions_creator_id_fkey",
    }),
    comments: many(comments),
    commentReactions: many(commentReactions),
}));

export const subscriptions = pgTable("subscriptions", {
    viewerId: uuid("viewer_id").references(() => users.id, { onDelete: "cascade"  }).notNull(),
    creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade"  }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
    viewer: one(users, {
        fields: [subscriptions.viewerId],
        references: [users.id],
        relationName: "subscriptions_viewer_id_fkey",
    }),
    creator: one(users, {
        fields: [subscriptions.creatorId],
        references: [users.id],
        relationName: "subscriptions_creator_id_fkey",
    }),
}));

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) =>[uniqueIndex("name_idx").on(t.name)]);

export const categoryRelations = relations(users, ({many}) => ({
    videos: many(videos),
}));

export const videos = pgTable ("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    muxStatus: text("mux_status"),
    muxAssetId: text("mux_asset_id").unique(),
    muxUploadId: text("mux_upload_id").unique(),
    muxPlaybackId: text("mux_playback_id").unique(),
    muxTrackId: text("mux_track_id").unique(),
    muxTrackStatus: text("mux_track_status"),
    thumbnailUrl: text("thumbnail_url"), 
    thumbnailKey: text("thumbnail_key"),
    previewUrl: text("preview_url"),
    previewKey: text("preview_key"),
    duration: integer("duration").default(0).notNull(),
    visibility: videoVisibility("visibility").default("private").notNull(),
    userId: uuid("user_id").references(() => users.id, {
        onDelete: "cascade",
    }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
        onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videosInsertSchema = createInsertSchema(videos);
export const videosUpdateSchema = createUpdateSchema(videos);
export const videosSelectSchema = createSelectSchema(videos);


export const videosRelations = relations(videos, ({one, many}) => ({
    user: one(users, {
        fields: [videos.userId],
        references: [users.id],
    }), 
    category: one(categories, {
        fields: [videos.categoryId],
        references: [categories.id],
    }),
    views: many(videoViews),
    reactions: many(videoReactions), 
    comments: many(comments),
}));

export const comments= pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references (() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid("video_id").references (() => videos.id, { onDelete: "cascade" }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id]
  }),
  reactions: many(commentReactions)
}));

export const commentInsertSchema = createInsertSchema(comments);
export const commentUpdateSchema = createUpdateSchema(comments);
export const commentSelectSchema = createSelectSchema(comments);

export const commentReactions = pgTable("comment_reactions", {
      userId: uuid("user_id").references (() => users.id, { onDelete: "cascade" }).notNull(),
      commentId: uuid("comment_id").references (() => comments.id, { onDelete: "cascade" }).notNull(),
      type: reactionType("type").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({
    name: "comment_reactions_pk",
    columns: [t.userId, t.commentId]
    }),
]);

export const commentReactionsRelations = relations(commentReactions, ({one}) => ({
    user: one(users, {
        fields: [commentReactions.userId],
        references: [users.id],
    }),
    comment: one(comments, {
        fields: [commentReactions.commentId],
        references: [comments.id],    
    }),
}));


export const videoViews = pgTable("video_views", {
    userId: uuid("user_id").references (() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid("video_id").references (() => videos.id, {onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
} , (t) => [
    primaryKey({
    name: "video_views_pk",
    columns: [t.userId, t.videoId]
    }),
]);

export const videoViewsRelations = relations(videoViews, ({one}) => ({
    user: one(users, {
        fields: [videoViews.userId],
        references: [users.id],
    }),
    video: one(videos, {
        fields: [videoViews.videoId],
        references: [videos.id],    
    }),
}));

export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);



export const videoReactions = pgTable("video_reactions", {
    userId: uuid("user_id").references (() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid("video_id").references (() => videos.id, {onDelete: "cascade" }).notNull(),
    type: reactionType("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
} , (t) => [
    primaryKey({
    name: "video_reactions_pk",
    columns: [t.userId, t.videoId]
    }),
]);

export const videoReactionsRelations = relations(videoReactions, ({one}) => ({
    user: one(users, {
        fields: [videoReactions.userId],
        references: [users.id],
    }),
    video: one(videos, {
        fields: [videoReactions.videoId],
        references: [videos.id],    
    }),
}));

export const videoReactionSelectSchema = createSelectSchema(videoReactions);
export const videoReactionInsertSchema = createInsertSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);