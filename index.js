const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();
const userRoutes = require('./routes/users');

const app = express();

app.set('view engine', 'ejs');
app.use(methodOverride('_method')); // 讓伺服器檢查網址是否有 ?_method=DELETE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/users', userRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});