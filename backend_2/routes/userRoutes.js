const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserProgress } = require('../controllers/userController');

router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUserProgress);

module.exports = router;
