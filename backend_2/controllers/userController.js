const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('insigniasObtenidas');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    const { nombre, email } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      nombre,
      email
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user progress and finances
// @route   PUT /api/users/:id
// @access  Public
const updateUserProgress = async (req, res) => {
  try {
    const { xpPuntos, scoreCrediticioSimulado, billetera, deudaActiva, pagoMinimoSemanal } = req.body;

    // Configurar objeto de actualización basándonos en lo que viene en el request
    let updateFields = {};
    if (xpPuntos !== undefined) updateFields['perfilGamificacion.xpPuntos'] = xpPuntos;
    if (scoreCrediticioSimulado !== undefined) updateFields['perfilGamificacion.scoreCrediticioSimulado'] = scoreCrediticioSimulado;

    if (billetera !== undefined) updateFields['finanzasSimuladas.billetera'] = billetera;
    if (deudaActiva !== undefined) updateFields['finanzasSimuladas.deudaActiva'] = deudaActiva;
    if (pagoMinimoSemanal !== undefined) updateFields['finanzasSimuladas.pagoMinimoSemanal'] = pagoMinimoSemanal;

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserProgress
};
