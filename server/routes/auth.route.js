import express from 'express';
import { registerUser, loginUser ,getUsers} from '../controllers/auth.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import sendEmail from '../utils/sendmail.js';
const authRouter = express.Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/users',protect,admin, getUsers);
authRouter.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        user.otp = generatedOtp;
        await user.save();
        sendEmail(user.email, 'OTP Verification', `Your OTP is ${generatedOtp}`);
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        user.verified = true;
        user.otp = null; // Clear the OTP after successful verification
        await user.save();
        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
export default authRouter;