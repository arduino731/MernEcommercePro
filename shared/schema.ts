import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// ===================== Mongoose Schemas =====================

export const UserSchema = new Schema({
  name: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  postalCode: { type: String, default: null },
  country: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
});

export const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String },
});

export const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  inStock: { type: Boolean, default: true },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  specifications: [{ label: String, value: String }],
});

export const ProductVariantSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  inStock: { type: Boolean, default: true },
});

export const OrderSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  shippingAddress: { type: String },
  shippingCity: { type: String },
  shippingState: { type: String },
  shippingPostalCode: { type: String },
  shippingCountry: { type: String },
  paymentMethod: { type: String },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const OrderItemSchema = new Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  variant: { type: String },
});

export const ReviewSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ===================== Zod Schemas =====================

export const insertUserSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string(),
  imageUrl: z.string().nullable().optional(),
});

export const insertProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  longDescription: z.string().nullable().optional(),
  price: z.number().positive(),
  imageUrl: z.string(),
  categoryId: z.string().optional(),
  inStock: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  specifications: z.array(z.any()).optional(),
});

export const insertProductVariantSchema = z.object({
  productId: z.string(),
  name: z.string(),
  inStock: z.boolean().optional(),
});

export const insertOrderSchema = z.object({
  userId: z.string(),
  total: z.number().positive(),
  status: z.string().optional(),
  shippingAddress: z.string().nullable().optional(),
  shippingCity: z.string().nullable().optional(),
  shippingState: z.string().nullable().optional(),
  shippingPostalCode: z.string().nullable().optional(),
  shippingCountry: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  paymentId: z.string().nullable().optional(),
});

export const insertOrderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  variant: z.string().nullable().optional(),
});

export const insertReviewSchema = z.object({
  productId: z.string(),
  userId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
