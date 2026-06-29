import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codingninja';
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('[DATABASE SUCCESS] Connected to MongoDB successfully.');
    return true;
  } catch (error) {
    console.error('[DATABASE ERROR] MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
