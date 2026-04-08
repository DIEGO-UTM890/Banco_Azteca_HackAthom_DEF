require('dotenv').config();
const mongoose = require('mongoose');

// Modelos
const User = require('./models/User');
const Badge = require('./models/Badge');
const Simulation = require('./models/Simulation');

// Datos de prueba
const badgesData = [
  {
    nombre: "Primer Ahorrador",
    descripcion: "Simulaste con éxito un plan de ahorro a 6 meses.",
    icono: "piggy_bank_icon.png",
    xpRecompensa: 200,
    criterioDesbloqueo: "COMPLETAR_SIMULADOR_AHORRO_BASICO"
  },
  {
    nombre: "Inversor Inteligente",
    descripcion: "Mantuviste tu dinero creciendo en una cuenta de inversión por 1 año.",
    icono: "invest_icon.png",
    xpRecompensa: 500,
    criterioDesbloqueo: "MANTENER_INVERSION_1_ANO"
  }
];

const usersData = [
  {
    nombre: "Diego Ortega",
    email: "diego@ejemplo.com",
    perfilGamificacion: {
      nivelActual: 2,
      xpPuntos: 1250,
      scoreCrediticioSimulado: 680
    }
  },
  {
    nombre: "Maria Garcia",
    email: "maria@ejemplo.com",
    perfilGamificacion: {
      nivelActual: 1,
      xpPuntos: 300,
      scoreCrediticioSimulado: 400
    }
  }
];

const importData = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected hook for seeder...');

    // Limpiar base de datos
    await User.deleteMany();
    await Badge.deleteMany();
    await Simulation.deleteMany();
    console.log('Datos anteriores eliminados...');

    // Insertar Insignias
    const createdBadges = await Badge.insertMany(badgesData);
    console.log('Insignias creadas...');

    // Insertar Usuarios asignando la primer insignia a Diego
    const userToCreate = { ...usersData[0], insigniasObtenidas: [createdBadges[0]._id] };
    const createdUsers = await User.insertMany([userToCreate, usersData[1]]);
    console.log('Usuarios creados...');

    // Insertar Simulación para Diego
    const simulationData = {
      userId: createdUsers[0]._id,
      tipoSimulacion: "CREDITO_PERSONAL",
      parametros: {
        montoSolicitado: 15000,
        plazoSemanas: 52,
        tasaInteresAplicada: 45.5,
        pagoSemanalCalculado: 350
      },
      resultadoEducativo: {
        comprendioCAT: true,
        decisionFinal: "ACEPTA"
      }
    };
    await Simulation.create(simulationData);
    console.log('Simulaciones creadas...');

    console.log('¡Datos de prueba importados con éxito!');
    process.exit();
  } catch (error) {
    console.error(`Error al importar: ${error.message}`);
    process.exit(1);
  }
};

importData();
