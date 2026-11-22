const express = require('express');
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const meRoutes = require('./me');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/me', meRoutes);

module.exports = router;
