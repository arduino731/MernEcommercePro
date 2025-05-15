import mongoose from 'mongoose';
import { log } from './vite';

// MongoDB connection string
// Using memory server for development by default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopmern';

// Connect to MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    log('Connected to MongoDB', 'database');
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'database');
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    log('Disconnected from MongoDB', 'database');
  } catch (error) {
    log(`MongoDB disconnection error: ${error}`, 'database');
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  log('MongoDB connected', 'database');
});

mongoose.connection.on('error', (err) => {
  log(`MongoDB connection error: ${err}`, 'database');
});

mongoose.connection.on('disconnected', () => {
  log('MongoDB disconnected', 'database');
});

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});