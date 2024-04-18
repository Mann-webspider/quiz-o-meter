const mongoose = require('mongoose');
const connectDB = async () => {
    try {
      await mongoose.connect("mongodb://mongo2:27017/?replicaSet=dbrs");
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  };
  
  connectDB();
  
  const db = mongoose.connection 
  module.exports = { db };
