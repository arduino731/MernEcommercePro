import { 
  users, User, InsertUser,
  categories, Category, InsertCategory,
  products, Product, InsertProduct,
  productVariants, ProductVariant, InsertProductVariant,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  reviews, Review, InsertReview
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
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
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Product Variants operations
  getProductVariants(productId: number): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  
  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private productVariants: Map<number, ProductVariant>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private variantIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.productVariants = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.variantIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    this.reviewIdCounter = 1;
    
    // Initialize with some test data
    this.initializeData();
  }

  private initializeData() {
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
    
    categories.forEach(category => {
      this.createCategory(category);
    });
    
    // Add sample products
    const products: InsertProduct[] = [
      {
        name: "Premium Headphones",
        description: "Wireless over-ear headphones with noise cancellation",
        longDescription: "Experience premium sound quality with these wireless over-ear headphones featuring advanced noise cancellation technology. Perfect for music lovers and professionals alike, these headphones deliver crystal-clear audio and exceptional comfort for extended listening sessions.\n\nFeatures:\n- Active noise cancellation\n- 30-hour battery life\n- Premium memory foam ear cushions\n- Built-in microphone for calls\n- Bluetooth 5.0 connectivity",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: 2,
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
        categoryId: 1,
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
        categoryId: 1,
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
        categoryId: 3,
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
        categoryId: 2,
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
      },
      {
        name: "Tablet Pro",
        description: "10.5\" display with stylus support",
        longDescription: "The Tablet Pro combines portability with power, featuring a stunning 10.5-inch display and support for the precision stylus (sold separately). Perfect for creative professionals, students, and anyone who needs computing power on the go.\n\nThe high-resolution display makes everything from photos to documents look incredibly sharp, while the powerful processor handles demanding apps with ease. With all-day battery life and lightweight design, it's the perfect companion for productivity and entertainment.",
        price: 499.99,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: 1,
        inStock: true,
        isNew: true,
        specifications: [
          { label: "Display", value: "10.5-inch Retina" },
          { label: "Processor", value: "A14 Bionic" },
          { label: "Storage", value: "128GB/256GB" },
          { label: "Battery Life", value: "Up to 10 hours" },
          { label: "Cameras", value: "12MP rear, 7MP front" },
          { label: "Connectivity", value: "Wi-Fi 6, Bluetooth 5.0" }
        ]
      },
      {
        name: "Ultrabook Laptop",
        description: "13\" ultralight with 16GB RAM",
        longDescription: "Experience exceptional performance in an incredibly thin and light package with the Ultrabook Laptop. Featuring a 13-inch high-resolution display, powerful processor, and 16GB of RAM, this laptop handles everything from everyday tasks to demanding creative applications.\n\nThe all-day battery life and quick-charge technology keep you productive on the go, while the premium aluminum chassis offers durability without adding weight. With a backlit keyboard and precision trackpad, you can work comfortably in any environment.",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: 1,
        inStock: true,
        isNew: true,
        specifications: [
          { label: "Display", value: "13-inch Retina" },
          { label: "Processor", value: "11th Gen Intel Core i7" },
          { label: "Memory", value: "16GB RAM" },
          { label: "Storage", value: "512GB SSD" },
          { label: "Graphics", value: "Intel Iris Xe" },
          { label: "Battery Life", value: "Up to 12 hours" },
          { label: "Weight", value: "2.8 lbs" }
        ]
      },
      {
        name: "Digital Camera",
        description: "24MP with 4K video recording",
        longDescription: "Capture stunning photos and videos with this professional-grade digital camera. Featuring a 24-megapixel sensor and 4K video recording capabilities, it's perfect for photographers and content creators who demand exceptional image quality.\n\nThe camera includes advanced autofocus technology, image stabilization, and low-light performance. With intuitive controls and customizable settings, both beginners and professionals can achieve remarkable results in any shooting situation.",
        price: 799.99,
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        categoryId: 1,
        inStock: true,
        isNew: true,
        specifications: [
          { label: "Sensor", value: "24MP CMOS" },
          { label: "Video", value: "4K/30fps, 1080p/120fps" },
          { label: "ISO Range", value: "100-25600" },
          { label: "Autofocus", value: "Phase Detection, 425 points" },
          { label: "Stabilization", value: "5-axis in-body" },
          { label: "Storage", value: "Dual SD card slots" },
          { label: "Battery Life", value: "Approx. 700 shots" }
        ]
      }
    ];
    
    products.forEach(product => {
      this.createProduct(product);
    });
    
    // Add product variants
    const variants: InsertProductVariant[] = [
      { productId: 1, name: "Black", inStock: true },
      { productId: 1, name: "White", inStock: true },
      { productId: 1, name: "Blue", inStock: false },
      { productId: 2, name: "128GB", inStock: true },
      { productId: 2, name: "256GB", inStock: true },
      { productId: 2, name: "512GB", inStock: false },
      { productId: 4, name: "Black", inStock: true },
      { productId: 4, name: "Silver", inStock: true },
      { productId: 5, name: "Black", inStock: true },
      { productId: 5, name: "White", inStock: true },
    ];
    
    variants.forEach(variant => {
      this.createProductVariant(variant);
    });
    
    // Add a sample user
    this.createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "$2b$10$8KV65KFZdnUGHDuWMDbKOO0AnL.Z/MNqBBX7vQvgPm1zRiYdChXy.",  // "password"
      address: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
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
    let filteredProducts = Array.from(this.products.values());
    
    if (filters) {
      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        const category = await this.getCategoryBySlug(filters.category);
        if (category) {
          filteredProducts = filteredProducts.filter(product => product.categoryId === category.id);
        }
      }
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(searchLower) || 
          product.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply price range filter
      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.price <= filters.maxPrice!);
      }
      
      // Apply stock filter
      if (filters.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.inStock === filters.inStock);
      }
      
      // Apply featured filter
      if (filters.featured !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.isFeatured === filters.featured);
      }
      
      // Apply new filter
      if (filters.isNew !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.isNew === filters.isNew);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            // In a real DB this would sort by creation date
            // Here we'll just sort by id in descending order
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
          case 'popular':
            // In a real DB this might sort by number of sales or views
            // Here we'll just use a random sort
            filteredProducts.sort(() => Math.random() - 0.5);
            break;
        }
      }
      
      // Apply limit
      if (filters.limit !== undefined) {
        filteredProducts = filteredProducts.slice(0, filters.limit);
      }
    }
    
    return filteredProducts;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Product Variants operations
  async getProductVariants(productId: number): Promise<ProductVariant[]> {
    return Array.from(this.productVariants.values())
      .filter(variant => variant.productId === productId);
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const id = this.variantIdCounter++;
    const newVariant: ProductVariant = { ...variant, id };
    this.productVariants.set(id, newVariant);
    return newVariant;
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const newOrder: Order = { ...order, id, createdAt };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const newReview: Review = { ...review, id, createdAt };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();
