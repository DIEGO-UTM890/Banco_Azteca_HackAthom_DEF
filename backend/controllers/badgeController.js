const Badge = require('../models/Badge');

// @desc    Get all badges
// @route   GET /api/badges
// @access  Public
const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new badge
// @route   POST /api/badges
// @access  Public
const createBadge = async (req, res) => {
  try {
    const { nombre, descripcion, icono, xpRecompensa, criterioDesbloqueo } = req.body;
    
    const badge = await Badge.create({
      nombre,
      descripcion,
      icono,
      xpRecompensa,
      criterioDesbloqueo
    });

    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBadges,
  createBadge
};
