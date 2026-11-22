const express = require('express');
const requestController = require('../controllers/requestController');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../lib/errors');

const router = express.Router();

router.get('/requests', requireAuth, asyncHandler(requestController.listMine));

module.exports = router;
