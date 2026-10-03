import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };
    const secret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use a secure secret in production
    const options = {
        expiresIn: '7d' // Token expiration time
    };
    return jwt.sign(payload, secret, options);
}