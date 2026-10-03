import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/genToken.js';
import sendEmail from '../utils/sendmail.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @desc    Register a new user & send verification OTP
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    let { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser) {
      if (!existingUser.verified) {
        existingUser.otp = generatedOtp;
        existingUser.otpExpiresAt = otpExpiresAt;
        if (password) {
          const salt = await bcrypt.genSalt(10);
          existingUser.password = await bcrypt.hash(password, salt);
        }
        await existingUser.save();

        await sendEmail(
          existingUser.email,
          'Verify Your Email - OTP',
          `Your OTP for account verification is: ${generatedOtp}. It is valid for 10 minutes.`,
          `<h2>Welcome to our Store</h2><p>Your OTP for account verification is: <b>${generatedOtp}</b></p><p>It will expire in 10 minutes.</p>`
        );

        return res.status(200).json({
          success: true,
          message: 'Account already exists but is unverified. A new OTP has been sent to your email.',
          email: existingUser.email,
        });
      }
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      phone: phone || '',
      otp: generatedOtp,
      otpExpiresAt,
      role: role === 'admin' ? 'admin' : 'user',
      verified: false,
    });

    await sendEmail(
      user.email,
      'Welcome! Verify Your Email - OTP',
      `Welcome ${user.name}! Your OTP for verification is ${generatedOtp}. It is valid for 10 minutes.`,
      `<h2>Welcome ${user.name}!</h2><p>Your OTP for account verification is: <b>${generatedOtp}</b></p><p>This OTP will expire in 10 minutes.</p>`
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for the verification OTP.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP and log in user
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verified) {
      const token = generateToken(user);
      res.cookie('token', token, COOKIE_OPTIONS);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
        },
      });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = generatedOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      user.email,
      'Your New Verification OTP',
      `Your new OTP is: ${generatedOtp}. It is valid for 10 minutes.`,
      `<h2>Verification OTP</h2><p>Your new OTP is: <b>${generatedOtp}</b></p><p>Valid for 10 minutes.</p>`
    );

    return res.status(200).json({ success: true, message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  email = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        verified: false,
        email: user.email,
      });
    }

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
export const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot Password - Send Reset OTP
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendEmail(
      user.email,
      'Password Reset OTP',
      `Your password reset OTP is ${resetOtp}. This OTP is valid for 15 minutes. If you did not request this, please ignore.`,
      `<h2>Password Reset Request</h2><p>Your password reset OTP is: <b>${resetOtp}</b></p><p>This OTP expires in 15 minutes.</p>`
    );

    return res.status(200).json({ success: true, message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect reset OTP' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset OTP has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, avatar, addresses, password } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (addresses !== undefined) user.addresses = addresses;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        addresses: updatedUser.addresses,
        verified: updatedUser.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/auth/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    return res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/auth/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: populatedUser.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/auth/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: populatedUser.wishlist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
export const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { email: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const count = await User.countDocuments(keyword);
    const users = await User.find(keyword)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      users,
      page,
      pages: Math.ceil(count / limit),
      totalUsers: count,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID (Admin)
// @route   GET /api/auth/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update user role or status (Admin)
// @route   PUT /api/auth/users/:id
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.role) {
      user.role = req.body.role;
    }
    if (req.body.verified !== undefined) {
      user.verified = req.body.verified;
    }

    const updatedUser = await user.save();
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        verified: updatedUser.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};