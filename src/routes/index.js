const express = require('express');

const authRoutes = require('../modules/auth/auth.routes');
const healthRoutes = require('../modules/health/health.routes');
const contactRoutes = require('../modules/contact/contact.routes');
const appointmentRoutes = require('../modules/appointments/appointments.routes');
const contentRoutes = require('../modules/content/content.routes');
const adminUsersRoutes = require('../modules/adminUsers/adminUsers.routes');
const feedbackRoutes = require('../modules/feedback/feedback.routes');
const notificationsRoutes = require('../modules/notifications/notifications.routes');
const settingsRoutes = require('../modules/settings/settings.routes');
const uploadsRoutes = require('../modules/uploads/uploads.routes');
const careProgramsRoutes = require('../modules/carePrograms/carePrograms.routes');
const doctorsTimelineRoutes = require('../modules/doctorsTimeline/doctorsTimeline.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/contact', contactRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/content', contentRoutes);
router.use('/admin-users', adminUsersRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/settings', settingsRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/care-programs', careProgramsRoutes);
router.use('/doctors-timeline', doctorsTimelineRoutes);

module.exports = router;
