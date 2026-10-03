import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/dashboard', protect, admin, getDashboardAnalytics);
analyticsRouter.get('/', protect, admin, getDashboardAnalytics);

export default analyticsRouter;
