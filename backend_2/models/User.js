const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  perfilGamificacion: {
    nivelActual: {
      type: Number,
      default: 1, // Ej: 1=Novato, 2=Explorador
    },
    xpPuntos: {
      type: Number,
      default: 0,
    },
    scoreCrediticioSimulado: {
      type: Number,
      default: 300, // Rango de 300 a 850
      min: 300,
      max: 850,
    },
  },
  insigniasObtenidas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
  }],
}, {
  timestamps: { createdAt: 'fechaRegistro', updatedAt: true }
});

module.exports = mongoose.model('User', userSchema);
