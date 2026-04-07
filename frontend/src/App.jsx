import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Perfil del Usuario
  const [xp, setXp] = useState(1250);
  const [score, setScore] = useState(680);
  const weeklyIncome = 3500;

  // Datos financieros del perfil (Deuda activa)
  const currentDebt = 12500;
  const activeWeeklyPayment = 350;
  const remainingPayments = 38;

  // Estados del simulador
  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);

  // Estado para alertas
  const [showCopilot, setShowCopilot] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);

  // Lógica Financiera
  const annualInterestRate = 0.60;
  const interestRateForPeriod = annualInterestRate * (weeks / 52);
  const totalInterest = amount * interestRateForPeriod;
  const totalToPay = amount + totalInterest;
  const weeklyPayment = totalToPay / weeks;

  // Triggers Financieros
  const isOverleveraged = weeklyPayment > (weeklyIncome * 0.40);
  const isTooLong = weeks >= 80;

  // Plan de Rescate
  const acceptRescuePlan = () => {
    setWeeks(52);
    setShowCopilot(false);
    setUnderstandRisk(false);
    setXp(xp + 100);
    setScore(score + 15);
    alert("¡Rescate Exitoso! Copiloto reestructuró tu préstamo. Tu Score ha mejorado por aceptar la ayuda financiera.");
  };

  const forceBadLoan = () => {
    setShowCopilot(false);
    setUnderstandRisk(false);
    setScore(score - 80); // Gran penalización
    alert("Préstamo de alto riesgo confirmado. Tu Score crediticio ha sido gravemente penalizado por endeudamiento excesivo.");
  };

  // Botón Confirmar Tramite
  const handleSimulateAction = () => {
    if (isOverleveraged) {
      setShowCopilot(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setXp(xp + 50);
      alert("¡Simulación responsable guardada en base de datos! Avanzas hacia tu próxima insignia.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
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

            <nav className="flex space-x-2 sm:space-x-4">
              <button
                onClick={() => { setActiveTab('dashboard'); setShowCopilot(false); }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'simulator'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Simulador
              </button>
            </nav>

            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">Ingreso: $3,500/sem</div>
                <div className="text-xs text-green-600 font-medium">Capacidad Sólida</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Tu Perfil Crediticio</h1>
              <p className="text-gray-600 mt-1">Acumula experiencia tomando buenas decisiones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Score Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 font-medium mb-2">Score de Salud Azteca</p>
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351" strokeDashoffset={351 - (351 * (score / 850))} className={score > 600 ? "text-green-500" : "text-yellow-500"} />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-gray-800">
                    {score}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Camino a Tarjeta de Crédito</p>
              </div>

              {/* Deuda Activa Card */}
              {/* Nuevo elemento solicitado por el usuario */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
                <p className="text-gray-500 font-medium mb-2">Estado de Cuenta</p>
                <div className="mb-4">
                  <span className="text-sm text-gray-500 block">Saldo Actual (Deuda)</span>
                  <span className="text-3xl font-bold text-gray-900">${currentDebt.toLocaleString('es-MX')}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600">Pago exigible:</span>
                    <span className="font-bold text-gray-900">${activeWeeklyPayment} / sem</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Pagos restantes:</span>
                    <span className="font-bold text-gray-900">{remainingPayments}</span>
                  </div>
                </div>
              </div>

              {/* XP Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-gray-500 font-medium">Nivel 2: Explorador Financiero</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{xp} XP</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded text-blue-600 flex items-center justify-center font-bold text-xs">[ICON_XP]</div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style={{ width: `${(xp / 2000) * 100}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 text-right">Faltan {2000 - xp} XP para Nivel Oro</p>
              </div>
            </div>
          </div>
        )}

        {/* SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  Simulador de Crédito Personal
                </h1>
                <p className="text-gray-600 mt-1">Prueba decisiones financieras en un entorno de riesgo cero.</p>
              </div>
            </div>

            {/* COPILOTO INTERVENCIÓN */}
            {showCopilot && (
              <div className="mb-8 animate-in zoom-in duration-300 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl shadow-2xl p-1">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  {/* Placeholder Background SVG */}
                  <div className="w-24 h-24 bg-white opacity-20 rounded-full"></div>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10 border border-slate-700">
                  <div className="flex-shrink-0 animate-pulse bg-blue-500/20 p-4 rounded-full border 2 border-blue-400/50">
                    <div className="text-blue-300 text-sm font-bold text-center">[ICON_BOT]</div>
                  </div>

                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center">
                      ALERTA DE ASFIXIA FINANCIERA
                    </h3>
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-4">
                      Detecto que has programado un pago de <strong className="text-red-400">${Math.round(weeklyPayment)}/sem</strong>. Esto equivale a más del 40% de tu sueldo simulado ($3,500). En la vida real, un pago tan alto provocará recargos y arruinará tu historial.
                    </p>

                    {/* Verificación de Riesgo - NUEVA FUNCIONALIDAD */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 accent-red-500 cursor-pointer"
                          checked={understandRisk}
                          onChange={(e) => setUnderstandRisk(e.target.checked)}
                        />
                        <span className="text-sm text-slate-300">
                          Comprendo que este crédito supera mi capacidad de pago. Entiendo que continuar provocará una caída severa en mi Score Crediticio.
                        </span>
                      </label>
                    </div>

                  </div>
                  <div className="flex-shrink-0 w-full md:w-64 flex flex-col space-y-3">
                    <button
                      onClick={acceptRescuePlan}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                      Aceptar Plan Rescate
                    </button>
                    <button
                      onClick={forceBadLoan}
                      disabled={!understandRisk}
                      className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${understandRisk
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                      Continuar Riesgo
                    </button>
                    <button
                      onClick={() => { setShowCopilot(false); setUnderstandRisk(false); }}
                      className="w-full text-slate-400 hover:text-white text-sm font-medium py-2 px-4 transition-colors text-center"
                    >
                      Volver a editar barras
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${showCopilot ? 'opacity-50 pointer-events-none' : ''}`}>

              <div className="lg:col-span-7 space-y-6">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 transition-colors">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Ajustes del Préstamo</h2>

                  {/* Monto con Input Tipo Número */}
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Monto Solicitado</label>
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                        <span className="text-gray-500 font-bold mr-1">$</span>
                        <input
                          type="number"
                          min="1000"
                          max="50000"
                          value={amount}
                          onChange={(e) => {
                            setAmount(Number(e.target.value));
                            setShowCopilot(false);
                            setUnderstandRisk(false);
                          }}
                          className="font-bold text-xl text-green-600 bg-transparent outline-none w-24 text-right"
                        />
                      </div>
                    </div>
                    <input
                      type="range" min="1000" max="50000" step="100"
                      value={amount}
                      onChange={(e) => {
                        setAmount(Number(e.target.value));
                        setShowCopilot(false);
                        setUnderstandRisk(false);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  {/* Plazo con Input Tipo Número */}
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Plazo a pagar</label>
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                        <input
                          type="number"
                          min="1"
                          max="154"
                          value={weeks}
                          onChange={(e) => {
                            setWeeks(Number(e.target.value));
                            setShowCopilot(false);
                            setUnderstandRisk(false);
                          }}
                          className="font-bold text-xl text-gray-800 bg-transparent outline-none w-16 text-right mr-1"
                        />
                        <span className="text-gray-500 font-bold">sem</span>
                      </div>
                    </div>
                    <input
                      type="range" min="13" max="154" step="1"
                      value={weeks}
                      onChange={(e) => {
                        setWeeks(Number(e.target.value));
                        setShowCopilot(false);
                        setUnderstandRisk(false);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                      <span>Corto Plazo</span>
                      <span>Largo Plazo</span>
                    </div>
                  </div>
                </div>

                {!isOverleveraged && isTooLong && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start space-x-4">
                    <div className="bg-yellow-200 w-8 h-8 rounded shrink-0 flex items-center justify-center text-yellow-800 text-xs font-bold">[ICON]</div>
                    <div>
                      <h4 className="font-bold text-yellow-800">Traductor del Asesor: CAT Elevado</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Elegir plazos extremadamente largos hará que des pagos chiquitos, pero nota en tu ticket cómo los "Intereses Pagados" suben muchísimo.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              <div className="lg:col-span-5">
                <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden sticky top-6">
                  <div className="p-6 pb-0 border-b border-gray-800 mx-6 mb-4">
                    <p className="text-center text-gray-500 font-mono text-sm tracking-widest mb-2">TICKET DE SIMULACIÓN</p>
                  </div>

                  <div className="px-8 pb-6">
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-gray-400 font-medium">Pago Semanal</span>
                      <div className="text-right">
                        <span className={`text-5xl font-black ${isOverleveraged ? 'text-red-500' : 'text-green-400'}`}>
                          ${Math.round(weeklyPayment)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 font-mono text-sm mb-8">
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Capital Solicitado:</span>
                        <span className="text-white">${amount.toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-400">Intereses Estimados:</span>
                        <span className="text-yellow-500">+ ${Math.round(totalInterest).toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-base">
                        <span className="text-gray-300 font-bold">Total a liquidar:</span>
                        <span className="font-bold text-white">${Math.round(totalToPay).toLocaleString('es-MX')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateAction}
                      className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-green-500 hover:bg-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    >
                      Confirmar
                    </button>
                  </div>
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
