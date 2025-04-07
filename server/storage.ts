import { books, type Book, type InsertBook } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private books: Map<number, Book>;
  userCurrentId: number;
  bookCurrentId: number;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.userCurrentId = 1;
    this.bookCurrentId = 1;
  }

  // User methods - kept from original
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Book methods
  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBookById(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookBySecretId(secretId: string): Promise<Book | undefined> {
    return Array.from(this.books.values()).find(
      (book) => book.secretId === secretId
    );
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookCurrentId++;
    const secretId = uuidv4();
    const book: Book = { 
      ...insertBook, 
      id, 
      secretId,
      reportCount: 0,
      createdAt: new Date(),
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;

    const updatedBook = { ...book, ...bookUpdate };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async updateBookBySecretId(secretId: string, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    const book = await this.getBookBySecretId(secretId);
    if (!book) return undefined;

    return this.updateBook(book.id, bookUpdate);
  }

  async deleteBookBySecretId(secretId: string): Promise<boolean> {
    const book = await this.getBookBySecretId(secretId);
    if (!book) return false;

    return this.books.delete(book.id);
  }

  async reportBook(id: number): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;

    const updatedBook = { 
      ...book, 
      reportCount: book.reportCount + 1 
    };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) || 
      book.author.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterBooks(filters: { subject?: string; condition?: string; freeOnly?: boolean }): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => {
      let match = true;
      
      if (filters.subject && filters.subject !== "All Subjects") {
        match = match && book.subject === filters.subject;
      }
      
      if (filters.condition && filters.condition !== "All") {
        match = match && book.condition === filters.condition;
      }
      
      if (filters.freeOnly) {
        match = match && book.price === 0;
      }
      
      return match;
    });
  }
}

export const storage = new MemStorage();
