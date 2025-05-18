import mongoose from 'mongoose';
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
  PlainProduct,
  ProductVariantModel,
  OrderModel,
  OrderItemModel,
  ReviewModel
} from "@shared/models";

export interface IStorage {
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | null>;

  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;

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

  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;

  getOrders(userId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | null>;

  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  initializeData(): Promise<void>;
}

function toProduct(doc: any): Product {
  return {
    id: doc.id.toString(),
    name: doc.name,
    description: doc.description,
    longDescription: doc.longDescription,
    price: Number(doc.price ?? 0),
    imageUrl: doc.imageUrl,
    categoryId: doc.categoryId?.toString() ?? "",
    inStock: doc.inStock,
    isNew: doc.isNew,
    isFeatured: doc.isFeatured,
    specifications: doc.specifications ?? []
  };
}

function toVariant(doc: any): ProductVariant {
  return {
    id: doc.id.toString(),
    productId: doc.productId.toString(),
    name: doc.name,
    inStock: doc.inStock,
  };
}

export class MongooseStorage implements IStorage {
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

  // async getProducts(filters?: any): Promise<Product[]> {
  //   const query: any = {};

  //   if (filters) {
  //     if (filters.category) {
  //       const category = await CategoryModel.findOne({ slug: filters.category });
  //       if (category) query.categoryId = category._id;
  //     }

  //     if (filters.search) {
  //       query.$or = [
  //         { name: { $regex: filters.search, $options: 'i' } },
  //         { description: { $regex: filters.search, $options: 'i' } }
  //       ];
  //     }

  //     if (filters.minPrice !== undefined) {
  //       query.price = { ...query.price, $gte: filters.minPrice };
  //     }

  //     if (filters.maxPrice !== undefined) {
  //       query.price = { ...query.price, $lte: filters.maxPrice };
  //     }

  //     if (filters.inStock !== undefined) {
  //       query.inStock = filters.inStock;
  //     }

  //     if (filters.featured !== undefined) {
  //       query.isFeatured = filters.featured;
  //     }

  //     if (filters.isNew !== undefined) {
  //       query.isNew = filters.isNew;
  //     }
  //   }

  //   let productsQuery = ProductModel.find(query);

  //   if (filters?.sortBy) {
  //     switch (filters.sortBy) {
  //       case 'price_asc': productsQuery = productsQuery.sort({ price: 1 }); break;
  //       case 'price_desc': productsQuery = productsQuery.sort({ price: -1 }); break;
  //       case 'name_asc': productsQuery = productsQuery.sort({ name: 1 }); break;
  //       case 'name_desc': productsQuery = productsQuery.sort({ name: -1 }); break;
  //     }
  //   }

  //   if (filters?.limit) {
  //     productsQuery = productsQuery.limit(filters.limit);
  //   }

  //   const docs = await productsQuery.exec();
  //   return docs.map(toProduct);
  // }
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
}): Promise<PlainProduct[]> {
  const query: any = {};

  if (filters) {
    if (filters.category) {
      const category = await CategoryModel.findOne({ slug: filters.category });
      if (category) query.categoryId = category._id;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
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

  let productsQuery = ProductModel.find(query).lean();

  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc': productsQuery = productsQuery.sort({ price: 1 }); break;
      case 'price_desc': productsQuery = productsQuery.sort({ price: -1 }); break;
      case 'name_asc': productsQuery = productsQuery.sort({ name: 1 }); break;
      case 'name_desc': productsQuery = productsQuery.sort({ name: -1 }); break;
    }
  }

  if (filters?.limit) {
    productsQuery = productsQuery.limit(filters.limit);
  }

  const docs = await productsQuery.exec();

  // ✅ Map _id to id
  return docs.map(product => ({
    id: product._id.toString(), // <--- important
    name: product.name,
    description: product.description,
    longDescription: product.longDescription ?? null,
    price: product.price,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId?.toString() ?? "",
    inStock: product.inStock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    specifications: product.specifications ?? [],
  }));
}



async getProductById(id: string): Promise<Product | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await ProductModel.findById(new mongoose.Types.ObjectId(id));

}


  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = new ProductModel(product);
    const saved = await newProduct.save();
    return toProduct(saved);
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const docs = await ProductVariantModel.find({ productId });
    return docs.map(toVariant);
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const newVariant = new ProductVariantModel(variant);
    const saved = await newVariant.save();
    return toVariant(saved);
  }

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

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await OrderItemModel.find({ orderId });
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const newItem = new OrderItemModel(item);
    return await newItem.save();
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    return await ReviewModel.find({ productId }).sort({ createdAt: -1 });
  }

  async createReview(review: InsertReview): Promise<Review> {
    const newReview = new ReviewModel(review);
    return await newReview.save();
  }

  async initializeData(): Promise<void> {
    // Skipped for brevity
  }
}

export const storage = new MongooseStorage();
