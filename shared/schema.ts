import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  subject: text("subject").notNull(),
  condition: text("condition").notNull(),
  price: integer("price").notNull(),
  phone: text("phone").notNull(),
  imageUrl: text("image_url").notNull(),
  sold: boolean("sold").notNull().default(false),
  secretId: text("secret_id").notNull(),
  reportCount: integer("report_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(books).omit({ 
  id: true, 
  reportCount: true, 
  createdAt: true 
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Insert schema with validation
export const validateBookSchema = insertBookSchema.extend({
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  author: z.string().min(2, "Author must be at least 2 characters"),
  subject: z.string().min(2, "Subject is required"),
  condition: z.enum(["New", "Used"], { 
    errorMap: () => ({ message: "Condition must be either New or Used" })
  }),
  price: z.number().min(0, "Price cannot be negative"),
});

// Users schema - kept from original for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
