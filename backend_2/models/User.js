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
      default: 680, // Empezar en un score neutral
      min: 200,
      max: 850,
    },
  },
  finanzasSimuladas: {
    billetera: {
      type: Number,
      default: 4000,
    },
    deudaActiva: {
      type: Number,
      default: 0,
    },
    pagoMinimoSemanal: {
      type: Number,
      default: 0,
    }
  },
  insigniasObtenidas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
  }],
}, {
  timestamps: { createdAt: 'fechaRegistro', updatedAt: true }
});

module.exports = mongoose.model('User', userSchema);
