import {
  User, InsertUser,
  Category, InsertCategory,
  Product, InsertProduct,
  ProductVariant, InsertProductVariant,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Review, InsertReview,
  UserModel,
  CategoryModel,
  ProductModel,
  ProductVariantModel,
  OrderModel,
  OrderItemModel,
  ReviewModel
} from "@shared/models";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | null>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    isNew?: boolean;
    limit?: number;
    sortBy?: string;
  }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Product Variants operations
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  
  // Order operations
  getOrders(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | null>;
  
  // Order Item operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Initialize data (for testing)
  initializeData(): Promise<void>;
}

export class MongooseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    return await UserModel.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({ email });
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel(user);
    return await newUser.save();
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(id, userData, { new: true });
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await CategoryModel.find();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await CategoryModel.findOne({ slug });
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = new CategoryModel(category);
    return await newCategory.save();
  }
  
  // Product operations
  async getProducts(filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    isNew?: boolean;
    limit?: number;
    sortBy?: string;
  }): Promise<Product[]> {
    const query: any = {};
    
    if (filters) {
      if (filters.category) {
        const category = await CategoryModel.findOne({ slug: filters.category });
        if (category) {
          query.categoryId = category._id;
        }
      }
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      if (filters.minPrice !== undefined) {
        query.price = { ...query.price, $gte: filters.minPrice };
      }
      
      if (filters.maxPrice !== undefined) {
        query.price = { ...query.price, $lte: filters.maxPrice };
      }
      
      if (filters.inStock !== undefined) {
        query.inStock = filters.inStock;
      }
      
      if (filters.featured !== undefined) {
        query.isFeatured = filters.featured;
      }
      
      if (filters.isNew !== undefined) {
        query.isNew = filters.isNew;
      }
    }
    
    let productsQuery = ProductModel.find(query);
    
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          productsQuery = productsQuery.sort({ price: 1 });
          break;
        case 'price_desc':
          productsQuery = productsQuery.sort({ price: -1 });
          break;
        case 'name_asc':
          productsQuery = productsQuery.sort({ name: 1 });
          break;
        case 'name_desc':
          productsQuery = productsQuery.sort({ name: -1 });
          break;
        default:
          // No sorting
          break;
      }
    }
    
    if (filters?.limit) {
      productsQuery = productsQuery.limit(filters.limit);
    }
    
    return await productsQuery.exec();
  }

  async getProductById(id: string): Promise<Product | null> {
    return await ProductModel.findById(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = new ProductModel(product);
    return await newProduct.save();
  }
  
  // Product Variants operations
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await ProductVariantModel.find({ productId });
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const newVariant = new ProductVariantModel(variant);
    return await newVariant.save();
  }
  
  // Order operations
  async getOrders(userId: string): Promise<Order[]> {
    return await OrderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getOrderById(id: string): Promise<Order | null> {
    return await OrderModel.findById(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder = new OrderModel(order);
    return await newOrder.save();
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    return await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
  }
  
  // Order Item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await OrderItemModel.find({ orderId });
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const newItem = new OrderItemModel(item);
    return await newItem.save();
  }
  
  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    return await ReviewModel.find({ productId }).sort({ createdAt: -1 });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const newReview = new ReviewModel(review);
    return await newReview.save();
  }
  
  // Initialize data for testing
  async initializeData(): Promise<void> {
    // Check if we already have data
    const categoriesCount = await CategoryModel.countDocuments();
    
    if (categoriesCount > 0) {
      return; // Skip initialization if data already exists
    }
    
    // Add sample categories
    const categories: InsertCategory[] = [
      {
        name: "Smartphones",
        description: "Latest models from top brands",
        slug: "smartphones",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
      },
      {
        name: "Audio",
        description: "Headphones, earbuds, and speakers",
        slug: "audio",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
      },
      {
        name: "Wearables",
        description: "Smart watches and fitness trackers",
        slug: "wearables",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250"
      }
    ];
    
    const categoryDocs = await Promise.all(
      categories.map(async (category) => {
        const newCategory = new CategoryModel(category);
        return await newCategory.save();
      })
    );
    
    // Map category IDs
    const categoryMap: Record<string, mongoose.Types.ObjectId> = {
      "smartphones": categoryDocs[0]._id,
      "audio": categoryDocs[1]._id,
      "wearables": categoryDocs[2]._id
    };
    
    // Add sample products
    const products: InsertProduct[] = [
      {
        name: "Premium Headphones",
        description: "Wireless over-ear headphones with noise cancellation",
        longDescription: "Experience premium sound quality with these wireless over-ear headphones featuring advanced noise cancellation technology. Perfect for music lovers and professionals alike, these headphones deliver crystal-clear audio and exceptional comfort for extended listening sessions.\n\nFeatures:\n- Active noise cancellation\n- 30-hour battery life\n- Premium memory foam ear cushions\n- Built-in microphone for calls\n- Bluetooth 5.0 connectivity",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: categoryMap.audio.toString(),
        inStock: true,
        isFeatured: true,
        specifications: [
          { label: "Type", value: "Over-ear" },
          { label: "Connectivity", value: "Bluetooth 5.0" },
          { label: "Battery Life", value: "30 hours" },
          { label: "Noise Cancellation", value: "Active" },
          { label: "Warranty", value: "2 years" }
        ]
      },
      {
        name: "Smartphone Pro",
        description: "Latest model with advanced camera system",
        longDescription: "Meet the Smartphone Pro, our most advanced smartphone yet. Featuring a revolutionary camera system, lightning-fast processor, and stunning display, this device sets a new standard for mobile technology.\n\nThe triple-lens camera system allows you to take professional-quality photos in any lighting condition, while the A15 processor delivers incredible performance for gaming, augmented reality, and multitasking.",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: categoryMap.smartphones.toString(),
        inStock: true,
        isFeatured: true,
        specifications: [
          { label: "Display", value: "6.1-inch OLED" },
          { label: "Processor", value: "A15 Bionic" },
          { label: "Storage", value: "128GB/256GB/512GB" },
          { label: "Camera", value: "Triple 12MP system" },
          { label: "Battery", value: "All-day battery life" },
          { label: "Operating System", value: "iOS 15" }
        ]
      },
      {
        name: "Portable Power Bank",
        description: "20,000mAh capacity with fast charging",
        longDescription: "Never run out of battery again with this high-capacity portable power bank. With 20,000mAh capacity, it can charge your smartphone multiple times and even provide power for tablets and small laptops.\n\nThe power bank features fast charging technology, allowing you to quickly charge your devices on the go. Compact and lightweight design makes it perfect for travel, commuting, or emergency situations.",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: categoryMap.smartphones.toString(),
        inStock: true,
        isFeatured: true,
        specifications: [
          { label: "Capacity", value: "20,000mAh" },
          { label: "Input", value: "USB-C, Micro USB" },
          { label: "Output", value: "USB-A x2, USB-C" },
          { label: "Fast Charging", value: "Yes, 18W" },
          { label: "Size", value: "5.9 x 2.9 x 0.8 inches" },
          { label: "Weight", value: "12 oz" }
        ]
      },
      {
        name: "Smart Watch",
        description: "Fitness tracking with heart rate monitor",
        longDescription: "This advanced smartwatch combines fitness tracking with smartwatch functionality to help you stay connected and monitor your health. Track your workouts, heart rate, sleep patterns, and more with precision sensors and intuitive software.\n\nThe watch connects seamlessly with your smartphone to display notifications, control music, and even take calls. Water-resistant design means you can wear it during swimming and intense workouts without worry.",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: categoryMap.wearables.toString(),
        inStock: true,
        isFeatured: true,
        specifications: [
          { label: "Display", value: "1.4-inch AMOLED" },
          { label: "Water Resistance", value: "50 meters" },
          { label: "Battery Life", value: "Up to 7 days" },
          { label: "Sensors", value: "Heart rate, GPS, Accelerometer, Gyroscope" },
          { label: "Connectivity", value: "Bluetooth 5.0, Wi-Fi" },
          { label: "Compatibility", value: "iOS 12+, Android 7.0+" }
        ]
      },
      {
        name: "Wireless Earbuds",
        description: "True wireless with noise cancellation",
        longDescription: "Experience true wireless freedom with these premium earbuds featuring active noise cancellation. Perfect for commuting, working out, or just enjoying your favorite music without distractions.\n\nThe earbuds deliver rich, balanced sound with deep bass and crystal-clear highs. The compact charging case provides multiple charges on the go, while quick-charge technology gives you hours of playback from just a few minutes of charging.",
        price: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: categoryMap.audio.toString(),
        inStock: true,
        isNew: true,
        specifications: [
          { label: "Type", value: "True Wireless" },
          { label: "Noise Cancellation", value: "Active" },
          { label: "Battery Life", value: "6 hours (24 with case)" },
          { label: "Water Resistance", value: "IPX4" },
          { label: "Connectivity", value: "Bluetooth 5.0" },
          { label: "Charging", value: "USB-C, Wireless" }
        ]
      }
    ];
    
    const productDocs = await Promise.all(
      products.map(async (product) => {
        const newProduct = new ProductModel(product);
        return await newProduct.save();
      })
    );
    
    // Add product variants
    const variants: InsertProductVariant[] = [
      { productId: productDocs[0]._id.toString(), name: "Black", inStock: true },
      { productId: productDocs[0]._id.toString(), name: "White", inStock: true },
      { productId: productDocs[0]._id.toString(), name: "Blue", inStock: false },
      { productId: productDocs[1]._id.toString(), name: "128GB", inStock: true },
      { productId: productDocs[1]._id.toString(), name: "256GB", inStock: true },
      { productId: productDocs[1]._id.toString(), name: "512GB", inStock: false },
      { productId: productDocs[3]._id.toString(), name: "Black", inStock: true },
      { productId: productDocs[3]._id.toString(), name: "Silver", inStock: true },
      { productId: productDocs[4]._id.toString(), name: "Black", inStock: true },
      { productId: productDocs[4]._id.toString(), name: "White", inStock: true },
    ];
    
    await Promise.all(
      variants.map(async (variant) => {
        const newVariant = new ProductVariantModel(variant);
        return await newVariant.save();
      })
    );
    
    // Add a sample user (with hashed password "password")
    await this.createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "$2b$10$8KV65KFZdnUGHDuWMDbKOO0AnL.Z/MNqBBX7vQvgPm1zRiYdChXy.",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA"
    });
  }
}

export const storage = new MongooseStorage();