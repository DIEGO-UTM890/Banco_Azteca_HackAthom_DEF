const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  icono: {
    type: String,
    required: true, // Ej: "piggy_bank_icon.png"
  },
  xpRecompensa: {
    type: Number,
    required: true, // Cuántos puntos da ganar esto
  },
  criterioDesbloqueo: {
    type: String,
    required: true, // Ej: "COMPLETAR_SIMULADOR_AHORRO_BASICO"
  },
});

module.exports = mongoose.model('Badge', badgeSchema);
