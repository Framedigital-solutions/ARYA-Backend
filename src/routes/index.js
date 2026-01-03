const express = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const healthRoutes = require('../modules/health/health.routes');
const contactRoutes = require('../modules/contact/contact.routes');
const appointmentRoutes = require('../modules/appointments/appointments.routes');
const contentRoutes = require('../modules/content/content.routes');
const adminUsersRoutes = require('../modules/adminUsers/adminUsers.routes');
const feedbackRoutes = require('../modules/feedback/feedback.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/contact', contactRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/content', contentRoutes);
router.use('/admin-users', adminUsersRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;
