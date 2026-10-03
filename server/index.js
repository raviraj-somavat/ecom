import express from 'express';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import productRouter from './routes/product.route.js';
// import orderRouter from './routes/order.route.js';
// import paymentRouter from './routes/payment.route.js';
// import analyticsRouter from './routes/analytics.route.js';
dotenv.config();
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/products',productRouter);
// app.use('/api/orders', orderRouter);
// app.use('/api/payments',paymentRouter);
// app.use('/api/analytics', analyticsRouter);
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});