const express = require('express');
const router = express.Router();
const { getBadges, createBadge } = require('../controllers/badgeController');

router.route('/').get(getBadges).post(createBadge);

module.exports = router;
