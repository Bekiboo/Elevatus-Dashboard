import { 
  pgTable, 
  serial, 
  integer, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  jsonb 
} from 'drizzle-orm/pg-core';

// System users (admins, authors, etc.)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  title: varchar('title', { length: 150 }), // optionnel : ex. "Nutritionist", "Director"
  role: varchar('role', { length: 20 }).notNull().default('author'), // "admin" | "author" | "viewer"
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invitations for future users
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('author'),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  used: boolean('used').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Posts du blog
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  title: text('title').notNull(),
  caption: text('caption').notNull(),
  excerpt: text('excerpt'),
  thumbnail: text('thumbnail'),
  archived: boolean('archived').notNull().default(false),
  featured: boolean('featured').notNull().default(false),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft/published/archived
  content: jsonb('content').notNull(),
  views: integer('views').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
