const mongoose = require("mongoose")
mongoose.connect("mongodb://root:password@mongo:27017/")
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


