const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tipoSimulacion: {
    type: String,
    required: true, // Ej: 'CREDITO_PERSONAL', 'AHORRO', 'MOTO_ITALIKA'
  },
  parametros: {
    montoSolicitado: { type: Number, required: true },
    plazoSemanas: { type: Number, required: true },
    tasaInteresAplicada: { type: Number, required: true },
    pagoSemanalCalculado: { type: Number, required: true },
  },
  resultadoEducativo: {
    comprendioCAT: { 
      type: Boolean, 
      default: false 
    },
    decisionFinal: { 
      type: String, // Ej: 'ACEPTA', 'CANCELA'
    },
  },
}, {
  timestamps: { createdAt: 'fechaSimulacion', updatedAt: true }
});

module.exports = mongoose.model('Simulation', simulationSchema);
