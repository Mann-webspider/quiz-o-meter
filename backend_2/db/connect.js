const mongoose = require("mongoose")
mongoose.connect("mongodb://root:password@localhost:27017/",{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


