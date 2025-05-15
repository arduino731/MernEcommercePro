import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { configurePassport, hashPassword, isAuthenticated, isAdmin } from "./auth";
import { createLinkToken, exchangePublicToken, createPayment, getPaymentStatus } from "./plaid";
import passport from "passport";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema, insertOrderSchema, insertOrderItemSchema, insertReviewSchema } from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    })
  );

  // Initialize passport
  const passportInstance = configurePassport();
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
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
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
    res.json(req.user);
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
  
  // Get products with filtering
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
        category: category as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock === "true" ? true : undefined,
        featured: featured === "true" ? true : undefined,
        isNew: isNew === "true" ? true : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
      };
      
      const products = await storage.getProducts(filters);
      
      // For each product, get the variants
      const productsWithVariants = await Promise.all(
        products.map(async (product) => {
          const variants = await storage.getProductVariants(product.id);
          return {
            ...product,
            variants,
          };
        })
      );
      
      res.json(productsWithVariants);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get product variants
      const variants = await storage.getProductVariants(productId);
      
      // Get product reviews
      const reviews = await storage.getProductReviews(productId);
      
      // Get user info for each review
      const reviewsWithUserInfo = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            author: user ? user.name : "Anonymous",
            date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Unknown",
          };
        })
      );
      
      // Get related products (products in the same category, excluding the current product)
      const relatedProducts = await storage.getProducts({
        category: product.categoryId?.toString(),
        limit: 4,
      });
      
      const filteredRelatedProducts = relatedProducts.filter(
        (p) => p.id !== productId
      );
      
      res.json({
        ...product,
        variants,
        reviews: reviewsWithUserInfo,
        relatedProducts: filteredRelatedProducts,
      });
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add product review
  app.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Validate request body
      const reviewSchema = insertReviewSchema.safeParse({
        ...req.body,
        productId,
        userId: req.user.id,
      });
      
      if (!reviewSchema.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: reviewSchema.error.errors 
        });
      }
      
      const review = await storage.createReview(reviewSchema.data);
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ ORDER ROUTES ============
  
  // Get user's orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            items,
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the authenticated user
      if (order.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(orderId);
      
      res.json({
        ...order,
        items,
      });
    } catch (error) {
      console.error("Error getting order:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create an order
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const orderValidation = insertOrderSchema.safeParse({
        ...req.body,
        userId: req.user.id,
      });
      
      if (!orderValidation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: orderValidation.error.errors 
        });
      }
      
      const orderData = orderValidation.data;
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const itemValidation = insertOrderItemSchema.safeParse({
            ...item,
            orderId: order.id,
          });
          
          if (itemValidation.success) {
            await storage.createOrderItem(itemValidation.data);
          }
        }
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      res.status(201).json({
        ...order,
        items,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ PLAID ROUTES ============
  
  // Create link token
  app.post("/api/plaid/create-link-token", isAuthenticated, async (req, res) => {
    try {
      const linkToken = await createLinkToken(req.user.id.toString());
      res.json(linkToken);
    } catch (error) {
      console.error("Error creating link token:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Exchange public token
  app.post("/api/plaid/exchange-token", isAuthenticated, async (req, res) => {
    try {
      const { publicToken } = req.body;
      
      if (!publicToken) {
        return res.status(400).json({ message: "Public token is required" });
      }
      
      const exchangeResponse = await exchangePublicToken(publicToken);
      
      // In a real app, you would store the access token in your database
      // associated with the user's account
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error exchanging token:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Process payment
  app.post("/api/plaid/payment", isAuthenticated, async (req, res) => {
    try {
      const { amount, accessToken, accountId, orderId } = req.body;
      
      if (!amount || !accessToken || !accountId || !orderId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Generate a reference for the payment
      const reference = `ORDER-${orderId}-${crypto.randomBytes(4).toString('hex')}`;
      
      const payment = await createPayment(
        accessToken,
        amount,
        accountId,
        req.user.name || "Customer",
        reference
      );
      
      // Update order with payment information
      await storage.updateOrderStatus(parseInt(orderId), "processing");
      
      res.json(payment);
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get payment status
  app.get("/api/plaid/payment/:paymentId", isAuthenticated, async (req, res) => {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        return res.status(400).json({ message: "Payment ID is required" });
      }
      
      const paymentStatus = await getPaymentStatus(paymentId);
      
      res.json(paymentStatus);
    } catch (error) {
      console.error("Error getting payment status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ MISC ROUTES ============
  
  // Newsletter subscription endpoint
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email is required" });
      }
      
      // In a real app, you would store the email in your database
      // or send it to a newsletter service like Mailchimp
      
      res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
