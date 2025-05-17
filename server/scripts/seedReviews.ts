import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ReviewModel } from '@shared/models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://arduino731:2xc6wxf0WuXJJGte@mernEcommercePro.vm4lldi.mongodb.net/test?retryWrites=true&w=majority&appName=mernEcommercePro';

const reviews = [
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"), // Replace with actual product _id from your DB
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),   // Replace with actual user _id from your DB
    rating: 5,
    text: "Amazing product, sound quality is top notch!",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 4,
    text: "Very good, but could be more comfortable after long use.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 5,
    text: "Amazing product, sound quality is top notch!",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 4,
    text: "Very good, but could be more comfortable after long use.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 5,
    text: "Exceeded my expectations. Highly recommend!",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 3,
    text: "Average product. Not bad, not great.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 2,
    text: "Battery life could be better.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 5,
    text: "Crystal clear audio and super lightweight!",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 4,
    text: "Good value for the price.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 1,
    text: "Stopped working after a week.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 5,
    text: "Top-tier quality. Definitely buying again.",
  },
  {
    productId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be59"),
    userId: new mongoose.Types.ObjectId("6826aab4e0bfde6a4007be50"),
    rating: 3,
    text: "Okay for casual listening, but not professional use.",
  },
];

  // Add 8 more if you like, or start with just these 2

async function seedReviews() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await ReviewModel.insertMany(reviews);
    console.log("✅ Successfully seeded reviews");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Failed to seed reviews:", err);
    process.exit(1);
  }
}

seedReviews();
