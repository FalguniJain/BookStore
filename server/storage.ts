import { books, users, type Book, type InsertBook, type User, type InsertUser } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { db, pool } from "./db";
import { eq, and, or, ilike, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Book operations
  getAllBooks(): Promise<Book[]>;
  getBookById(id: number): Promise<Book | undefined>;
  getBookBySecretId(secretId: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  updateBookBySecretId(secretId: string, book: Partial<Book>): Promise<Book | undefined>;
  deleteBookBySecretId(secretId: string): Promise<boolean>;
  reportBook(id: number): Promise<Book | undefined>;
  searchBooks(query: string): Promise<Book[]>;
  filterBooks(filters: { subject?: string; condition?: string; freeOnly?: boolean }): Promise<Book[]>;
  
  // Session management
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Book methods
  async getAllBooks(): Promise<Book[]> {
    return await db.select().from(books);
  }

  async getBookById(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async getBookBySecretId(secretId: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.secretId, secretId));
    return book || undefined;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    // Clone the insertBook to avoid modifying the original object
    const bookData = { ...insertBook };
    
    // Generate secretId if not provided
    if (!bookData.secretId) {
      bookData.secretId = uuidv4();
    }
    
    // Insert book into database
    try {
      console.log("Inserting book with data:", bookData);
      const [book] = await db
        .insert(books)
        .values(bookData)
        .returning();
      
      console.log("Book inserted successfully:", book);
      return book;
    } catch (error) {
      console.error("Database error creating book:", error);
      throw error;
    }
  }

  async updateBook(id: number, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set(bookUpdate)
      .where(eq(books.id, id))
      .returning();
    
    return book || undefined;
  }

  async updateBookBySecretId(secretId: string, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set(bookUpdate)
      .where(eq(books.secretId, secretId))
      .returning();
    
    return book || undefined;
  }

  async deleteBookBySecretId(secretId: string): Promise<boolean> {
    const result = await db
      .delete(books)
      .where(eq(books.secretId, secretId))
      .returning({ id: books.id });
    
    return result.length > 0;
  }

  async reportBook(id: number): Promise<Book | undefined> {
    const book = await this.getBookById(id);
    if (!book) return undefined;

    const [updatedBook] = await db
      .update(books)
      .set({ reportCount: book.reportCount + 1 })
      .where(eq(books.id, id))
      .returning();

    return updatedBook;
  }

  async searchBooks(query: string): Promise<Book[]> {
    if (!query || query.trim() === '') {
      return this.getAllBooks();
    }

    const lowercaseQuery = `%${query.toLowerCase()}%`;
    
    return await db
      .select()
      .from(books)
      .where(
        or(
          ilike(books.title, lowercaseQuery),
          ilike(books.author, lowercaseQuery)
        )
      );
  }

  async filterBooks(filters: { subject?: string; condition?: string; freeOnly?: boolean }): Promise<Book[]> {
    let conditions = [];

    if (filters.subject && filters.subject !== "All Subjects") {
      conditions.push(eq(books.subject, filters.subject));
    }
    
    if (filters.condition && filters.condition !== "All") {
      conditions.push(eq(books.condition, filters.condition));
    }
    
    if (filters.freeOnly) {
      conditions.push(lte(books.price, 0));
    }

    if (conditions.length === 0) {
      return this.getAllBooks();
    }

    return await db
      .select()
      .from(books)
      .where(and(...conditions));
  }
}

export const storage = new DatabaseStorage();
