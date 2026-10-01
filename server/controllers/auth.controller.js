import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { generateToken } from '../config/genToken.js';
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword });
    if(user){
      const otp=math.floor(100000 + Math.random() * 900000).toString();
      const message=`Your OTP for account verification is ${otp}. Please do not share it with anyone.`;
      await sendEmail({
        to: user.email,
        subject: 'Account Verification OTP',
        message: 'welcome to our website'+message,
      });
      res.status(200).json({ message: 'User registered successfully. Please check your email for the OTP.' });
      const token = generateToken(user); // Generate token for the new user
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Protect against CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      res.cookie('token', token, cookieOptions); // Set the token in a cookie
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
       });
    }else{
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });

    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    res.cookie('token', token, cookieOptions);
    res.status(200).json({ message: 'Login successful', user });
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};