import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { log } from './vite';

let mongoServer: MongoMemoryServer;

// Connect to MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    // Check for MongoDB connection string, prioritize dedicated MONGODB_URI
    const connectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (connectionString) {
      // Connect to MongoDB Atlas or external MongoDB
      log(`Connecting to MongoDB database...`, 'database');
      try {
        await mongoose.connect(connectionString, {
          serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        log(`Connected to MongoDB database`, 'database');
        return;
      } catch (err) {
        log(`Failed to connect to MongoDB database: ${err}. Falling back to in-memory database.`, 'database');
        // Fall through to in-memory database
      }
    } 
    
    // For development or when connection failed, use in-memory MongoDB
    log(`Using in-memory MongoDB for development`, 'database');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    log(`Connected to MongoDB Memory Server: ${mongoUri}`, 'database');
    
    log('MongoDB connection established', 'database');
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'database');
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    
    // If we're using MongoDB Memory Server, stop it
    if (mongoServer) {
      await mongoServer.stop();
      log('MongoDB Memory Server stopped', 'database');
    }
    
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