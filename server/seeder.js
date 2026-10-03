import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/user.model.js';
import Product from './models/product.model.js';
import Order from './models/order.model.js';
import Cart from './models/cart.model.js';
import users from './data/users.js';
import products from './data/products.js';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Hashing passwords and seeding users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const customer1 = createdUsers.find((u) => u.email === 'rahul@example.com');
    const customer2 = createdUsers.find((u) => u.email === 'priya@example.com');

    console.log('Seeding products with customer reviews...');
    const sampleProducts = products.map((product, index) => {
      // Add authentic sample reviews to the first few products
      const reviews = [];
      if (index === 0 && customer1 && customer2) {
        reviews.push(
          {
            user: customer1._id,
            name: customer1.name,
            rating: 5,
            comment: 'Absolutely spectacular performance and camera clarity! The titanium frame feels so light.',
          },
          {
            user: customer2._id,
            name: customer2.name,
            rating: 5,
            comment: 'Best phone ever owned. Battery easily lasts more than a day of heavy use.',
          }
        );
      } else if (index === 1 && customer1) {
        reviews.push({
          user: customer1._id,
          name: customer1.name,
          rating: 5,
          comment: 'Noise cancellation is unreal, cuts out airplane and traffic rumble completely.',
        });
      }

      return {
        ...product,
        reviews,
        numReviews: reviews.length > 0 ? reviews.length : product.numReviews,
      };
    });

    const createdProducts = await Product.insertMany(sampleProducts);

    console.log('Seeding realistic sample orders...');
    if (customer1 && createdProducts.length >= 2) {
      const p1 = createdProducts[0];
      const p2 = createdProducts[1];
      const p3 = createdProducts[6]; // shoes

      // Order 1: Delivered & Paid
      await Order.create({
        user: customer1._id,
        orderItems: [
          {
            product: p1._id,
            name: p1.name,
            qty: 1,
            image: p1.imageUrl,
            price: p1.price,
          },
          {
            product: p2._id,
            name: p2.name,
            qty: 1,
            image: p2.imageUrl,
            price: p2.price,
          },
        ],
        shippingAddress: {
          address: '42 MG Road, Indiranagar',
          city: 'Bengaluru',
          postalCode: '560038',
          country: 'India',
          phone: customer1.phone,
        },
        paymentMethod: 'Razorpay',
        paymentResult: {
          id: 'pay_sample_12345678',
          status: 'completed',
          update_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          email_address: customer1.email,
          razorpay_payment_id: 'pay_sample_12345678',
          razorpay_order_id: 'order_sample_87654321',
        },
        itemsPrice: p1.price + p2.price,
        shippingPrice: 0,
        taxPrice: Math.round((p1.price + p2.price) * 0.18 * 100) / 100,
        totalPrice: Math.round((p1.price + p2.price) * 1.18 * 100) / 100,
        isPaid: true,
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        orderStatus: 'Delivered',
      });

      // Order 2: Processing & Paid
      await Order.create({
        user: customer2._id,
        orderItems: [
          {
            product: p3._id,
            name: p3.name,
            qty: 2,
            image: p3.imageUrl,
            price: p3.price,
          },
        ],
        shippingAddress: {
          address: '15 Marine Drive',
          city: 'Mumbai',
          postalCode: '400021',
          country: 'India',
          phone: customer2.phone,
        },
        paymentMethod: 'Razorpay',
        paymentResult: {
          id: 'pay_sample_98765432',
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: customer2.email,
        },
        itemsPrice: p3.price * 2,
        shippingPrice: 0,
        taxPrice: Math.round(p3.price * 2 * 0.18 * 100) / 100,
        totalPrice: Math.round(p3.price * 2 * 1.18 * 100) / 100,
        isPaid: true,
        paidAt: new Date(),
        isDelivered: false,
        orderStatus: 'Processing',
      });

      // Order 3: Pending & COD
      await Order.create({
        user: customer1._id,
        orderItems: [
          {
            product: createdProducts[3]._id,
            name: createdProducts[3].name,
            qty: 1,
            image: createdProducts[3].imageUrl,
            price: createdProducts[3].price,
          },
        ],
        shippingAddress: {
          address: '42 MG Road, Indiranagar',
          city: 'Bengaluru',
          postalCode: '560038',
          country: 'India',
          phone: customer1.phone,
        },
        paymentMethod: 'COD',
        itemsPrice: createdProducts[3].price,
        shippingPrice: 50,
        taxPrice: Math.round(createdProducts[3].price * 0.18 * 100) / 100,
        totalPrice: Math.round((createdProducts[3].price + 50 + createdProducts[3].price * 0.18) * 100) / 100,
        isPaid: false,
        isDelivered: false,
        orderStatus: 'Pending',
      });

      // Seed cart for customer1
      await Cart.create({
        user: customer1._id,
        items: [
          {
            product: createdProducts[4]._id,
            quantity: 1,
            price: createdProducts[4].price,
          },
        ],
      });
    }

    console.log('✅ Seed data imported successfully!');
    console.log('-----------------------------------------');
    console.log('Admin Account:    admin@example.com / adminpassword123');
    console.log('Customer Account: rahul@example.com / userpassword123');
    console.log('Customer Account: priya@example.com / userpassword123');
    console.log('-----------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error importing seed data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    console.log('Destroying all data...');
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️ All data successfully destroyed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
