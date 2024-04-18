const mongoose = require("mongoose")
mongoose.connect("mongodb://mongo1:27017/test?replicaSet=dbrs&directConnection=true")
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


 