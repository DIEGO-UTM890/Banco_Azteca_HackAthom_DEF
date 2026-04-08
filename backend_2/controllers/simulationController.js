const Simulation = require('../models/Simulation');

// @desc    Get all simulations
// @route   GET /api/simulations
// @access  Public
const getSimulations = async (req, res) => {
  try {
    const simulations = await Simulation.find().populate('userId', 'nombre email');
    res.status(200).json(simulations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new simulation
// @route   POST /api/simulations
// @access  Public
const createSimulation = async (req, res) => {
  try {
    const { userId, tipoSimulacion, parametros, resultadoEducativo } = req.body;
    
    const simulation = await Simulation.create({
      userId,
      tipoSimulacion,
      parametros,
      resultadoEducativo
    });

    res.status(201).json(simulation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSimulations,
  createSimulation
};
