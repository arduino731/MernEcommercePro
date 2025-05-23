import { createServer, type Server } from "http";
import express, { type Express } from "express";
import path from "path";
import session from "express-session";
import passport from "passport";
import { configurePassport, isAuthenticated } from "./auth";
import { storage } from "./mongoose-storage";
import { 
  ProductModel, 
  ProductVariantModel, 
  ReviewModel, 
  UserModel, 
  insertReviewSchema,
  insertUserSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/models";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface User {
      id: string;
      name?: string;
      email: string;
      isAdmin?: boolean;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from Vite's output
  app.use(express.static(path.resolve("client", "build")));

  // Session + Passport
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  //Initialize passport
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // ============ AUTH ROUTES ============
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const userValidation = insertUserSchema.safeParse(req.body);
      
      if (!userValidation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: userValidation.error.errors 
        });
      }
      
      const userData = userValidation.data;
      
      console.log("🔐 Registering user:", userData.email);
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Remove password from response
      // const { password, ...userWithoutPassword } = user;
      
      // res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Login
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        console.log("👤 Logged in:", req.user?.email);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // 🧼 Convert Mongoose document to a plain object
    const { password, ...user } = req.user.toObject?.() ?? req.user;
    res.json(user);
  });

  // Update user profile
  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      // Extract only the fields that are allowed to be updated
      const { name, address, city, state, postalCode, country } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, {
        name,
        address,
        city,
        state,
        postalCode,
        country,
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Change password
  app.put("/api/users/change-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get user with password
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user's password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ CATEGORY ROUTES ============
    
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ PRODUCT ROUTES ============

  app.get("/api/products", async (req, res) => {
    try {
      const {
        category,
        search,
        minPrice,
        maxPrice,
        inStock,
        featured,
        new: isNew,
        limit,
        sortBy,
      } = req.query;

      const filters = {
        category: category as string | undefined,
        search: search as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock === "true" ? true : undefined,
        featured: featured === "true" ? true : undefined,
        isNew: isNew === "true" ? true : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string | undefined,
      };

      const products = await storage.getProducts(filters);

      const productsWithVariants = await Promise.all(
        products.map(async (product) => {
          // const variants = await storage.getProductVariants(product._id); // ✅ use _id
          const variants = await storage.getProductVariants((product as any)._id);

          return { ...product, variants };
        })
      );

      res.json(productsWithVariants);
    } catch (error) {
      console.error("❌ Error getting products:", error);
      res.status(500).json({ message: "Server error" });
    }
  });



  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await ProductModel.findById(productId).lean();
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const variants = await ProductVariantModel.find({ productId }).lean();
      const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean();

      const reviewsWithUserInfo = await Promise.all(
        reviews.map(async (review) => {
          const user = await UserModel.findById(review.userId).lean();
          return {
            ...review,
            author: user?.name || "Anonymous",
            date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown",
          };
        })
      );

      const relatedProducts = await ProductModel.find({
        categoryId: product.categoryId,
        _id: { $ne: product._id },
      })
        .limit(4)
        .lean();

      res.json({
        ...product,
        variants,
        reviews: reviewsWithUserInfo,
        relatedProducts,
      });
    } catch (err) {
      console.error("❌ Error in GET /api/products/:_id:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const productId = req.params.id;
      const { rating, text } = req.body;
      const userId = typeof req.user === 'object' && ('id' in req.user || '_id' in req.user)
      ? (req.user.id || req.user._id).toString()
      : null;

      console.log("Review payload:", {
        rating,
        text,
        productId,
        userId,
      }) 
          
      const parsed = insertReviewSchema.safeParse({
        productId,
        userId,
        rating,
        text,
      });

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid input minimum text is 3 characters",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
    const review = await ReviewModel.create(parsed.data);

    // Optionally populate author's name
    const fullReview = await ReviewModel.findById(review._id).populate("userId", "name");
    // const fullReview = await ReviewModel.findById(review._id);

      res.status(201).json(fullReview);
    } catch (err) {
      console.error("❌ Error submitting review:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ========== SPA FALLBACK ==========
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve("client", "build", "index.html"));
  });

  const server = createServer(app);
  return server;
}
