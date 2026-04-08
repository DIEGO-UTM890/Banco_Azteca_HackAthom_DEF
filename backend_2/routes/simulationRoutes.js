const express = require('express');
const router = express.Router();
const { getSimulations, createSimulation } = require('../controllers/simulationController');

router.route('/').get(getSimulations).post(createSimulation);

module.exports = router;
