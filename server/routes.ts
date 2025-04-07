import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateBookSchema } from "@shared/schema";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Set up upload directory
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, .png and .gif formats are allowed!"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);
  // Get all books
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  // Search books
  app.get("/api/books/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        const books = await storage.getAllBooks();
        return res.json(books);
      }
      const books = await storage.searchBooks(query);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to search books" });
    }
  });

  // Filter books
  app.get("/api/books/filter", async (req, res) => {
    try {
      const subject = req.query.subject as string;
      const condition = req.query.condition as string;
      const freeOnly = req.query.freeOnly === "true";
      
      const filters = {
        subject: subject || undefined,
        condition: condition || undefined,
        freeOnly: freeOnly || undefined
      };
      
      const books = await storage.filterBooks(filters);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter books" });
    }
  });

  // Get book by ID
  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookById(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // Get book by secret ID
  app.get("/api/books/secret/:secretId", async (req, res) => {
    try {
      const secretId = req.params.secretId;
      const book = await storage.getBookBySecretId(secretId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  // Create book
  app.post("/api/books", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Book image is required" });
      }

      console.log("Processing book creation with data:", req.body);
      
      // Parse price safely
      let price = 0;
      try {
        price = parseInt(req.body.price);
        if (isNaN(price)) price = 0;
      } catch (e) {
        price = 0;
      }

      const bookData = {
        title: req.body.title,
        author: req.body.author,
        subject: req.body.subject,
        condition: req.body.condition,
        price: price,
        phone: req.body.phone,
        imageUrl: `/uploads/${req.file.filename}`,
        sold: false,
        secretId: uuidv4(),
      };

      console.log("Book data prepared:", bookData);

      // Validate the book data
      try {
        validateBookSchema.parse(bookData);
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          console.error("Validation error:", validationError.message);
          return res.status(400).json({ message: validationError.message });
        }
        throw error;
      }

      console.log("Book data validated successfully");
      const book = await storage.createBook(bookData);
      console.log("Book created successfully:", book);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: "Failed to create book", error: errorMessage });
    }
  });

  // Update book by secret ID
  app.put("/api/books/secret/:secretId", upload.single("image"), async (req, res) => {
    try {
      const secretId = req.params.secretId;
      const book = await storage.getBookBySecretId(secretId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const bookUpdate: any = {
        title: req.body.title,
        author: req.body.author,
        subject: req.body.subject,
        condition: req.body.condition,
        price: parseInt(req.body.price),
        phone: req.body.phone,
      };

      if (req.file) {
        bookUpdate.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedBook = await storage.updateBookBySecretId(secretId, bookUpdate);
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  // Mark book as sold by secret ID
  app.put("/api/books/secret/:secretId/sold", async (req, res) => {
    try {
      const secretId = req.params.secretId;
      const book = await storage.getBookBySecretId(secretId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const updatedBook = await storage.updateBookBySecretId(secretId, { sold: true });
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark book as sold" });
    }
  });

  // Delete book by secret ID
  app.delete("/api/books/secret/:secretId", async (req, res) => {
    try {
      const secretId = req.params.secretId;
      const deleted = await storage.deleteBookBySecretId(secretId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Report book
  app.post("/api/books/:id/report", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookById(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const updatedBook = await storage.reportBook(id);
      res.json(updatedBook);
    } catch (error) {
      res.status(500).json({ message: "Failed to report book" });
    }
  });

  // Serve upload files
  app.use("/uploads", express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
