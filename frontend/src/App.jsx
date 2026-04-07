import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('simulator');

  // Estados para el simulador
  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);
  const [simulated, setSimulated] = useState(false);

  // Lógica del motor financiero (Simulación simplificada)
  const annualInterestRate = 0.60; // 60% tasa anual simulada (Típico para microcréditos)
  const interestRateForPeriod = annualInterestRate * (weeks / 52);
  const totalInterest = amount * interestRateForPeriod;
  const totalToPay = amount + totalInterest;
  const weeklyPayment = totalToPay / weeks;

  // Gamificación: Evaluamos la decisión
  const isHealthyDecision = weeks <= 26; // Se considera sano pagar rápido para evitar altos intereses

  const handleSimulateAction = () => {
    setSimulated(true);
    // Aquí después conectaremos al backend para guardar los puntos y la simulación
    alert("¡Simulación completada! Has ganado +50 XP por explorar tus opciones antes de endeudarte. (Esta data volará a nuestra BD pronto)");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="bg-white shadow relative z-10 border-b-4 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                Azteca <span className="text-green-600">Horizon</span>
              </span>
            </div>

            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'simulator'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                Simulador
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">Diego Ortega</div>
                <div className="text-xs text-green-600 font-medium">Nivel 2: Explorador</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-green-500 overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Diego&backgroundColor=b6e3f4"
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 transition-all">
        {activeTab === 'dashboard' ? (
          /* Dashboard View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">¡Hola, Diego! 👋</h1>
              <p className="text-gray-600 mt-1 text-lg">Aquí está el resumen de tu salud financiera simulada.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Experiencia (XP)</p>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">1,250</p>
                  <p className="ml-2 text-sm text-gray-500">/ 2,000 XP</p>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Score Crediticio Simulado</p>
                <p className="mt-2 text-3xl font-semibold text-green-600">680</p>
                <p className="mt-2 text-sm text-gray-600">Estado: <span className="font-medium text-green-700">Bueno 👍</span></p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Insignias Ganadas</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">4</p>
                </div>
                <div className="text-4xl">🎖️</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl shadow-lg p-8 text-white flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Ponte a prueba</h2>
                <p className="text-green-100 max-w-md">Simula un crédito para tu nueva laptop y descubre cómo el pago a tiempo mejora tu calificación. ¡Sin riesgo real!</p>
              </div>
              <button
                onClick={() => setActiveTab('simulator')}
                className="bg-white text-green-700 font-bold py-3 px-6 rounded-lg shadow hover:bg-green-50 transition-colors whitespace-nowrap"
              >
                Abrir Simulador
              </button>
            </div>
          </div>
        ) : (
          /* Simulator View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-green-600 hover:text-green-700 font-medium flex items-center mb-2 transition-colors"
                >
                  ← Volver al Perfil
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Simulador de Crédito Personal</h1>
                <p className="text-gray-600 mt-1">Descubre exactamente cuánto pagarías antes de pedir un préstamo real.</p>
              </div>
              <div className="hidden sm:flex text-4xl">
                💳
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Controles de Entrada */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Personaliza tu simulador</h2>

                {/* Monto Slider */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">¿Cuánto dinero necesitas?</label>
                    <span className="font-bold text-2xl text-green-600">
                      ${amount.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>$1,000</span>
                    <span>$20,000</span>
                  </div>
                </div>

                {/* Plazo Slider */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <label className="font-semibold text-gray-700">¿En cuánto tiempo quieres pagar?</label>
                    <span className="font-bold text-2xl text-green-600">
                      {weeks} semanas
                    </span>
                  </div>
                  <input
                    type="range"
                    min="13"
                    max="104"
                    step="13"
                    value={weeks}
                    onChange={(e) => setWeeks(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                    <span>Tranquilo (13 sem)</span>
                    <span>Largo Plazo (104 sem)</span>
                  </div>
                </div>

                {/* Traductor Ciudadano */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 mb-6">
                  <div className="text-blue-500 mt-1">💡</div>
                  <div>
                    <h4 className="font-bold text-blue-800 text-sm">Traductor Financiero: CAT</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      El "CAT" incluye todo lo que te cuesta el crédito. Entre más tiempo tardes (ej. {weeks} sem), los pagos semanales bajan, pero el CAT hace que termines pagando más dinero prestado al final.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resultados */}
              <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col justify-between overflow-hidden">
                <div className="p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Resumen de tu préstamo</h2>

                  <div className="flex flex-col items-center justify-center surface bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700 h-40">
                    <p className="text-gray-400 font-medium mb-1">Tu pago aproximado sería de</p>
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-green-400">${Math.round(weeklyPayment)}</span>
                      <span className="text-gray-400 mb-1 ml-1"> / semana</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total recibido:</span>
                      <span className="font-semibold text-white">${amount.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Intereses y cargos (Estimado):</span>
                      <span className="font-semibold text-red-400">+ ${Math.round(totalInterest).toLocaleString('es-MX')}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4 flex justify-between">
                      <span className="text-gray-300 font-medium">Total a liquidar:</span>
                      <span className="font-bold text-white text-lg">${Math.round(totalToPay).toLocaleString('es-MX')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-800 border-t border-gray-700">
                  {isHealthyDecision ? (
                    <div className="flex items-center space-x-2 text-green-400 text-sm mb-4">
                      <span>🎯</span>
                      <span className="font-medium">¡Excelente decisión! Un plazo corto te ahorra intereses.</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm mb-4">
                      <span>⚠️</span>
                      <span className="font-medium">Ojo: Un plazo largo aumenta significativamente los intereses.</span>
                    </div>
                  )}

                  <button
                    onClick={handleSimulateAction}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl transition-colors text-lg"
                  >
                    Guardar Simulación (+50 XP)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
