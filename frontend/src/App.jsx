import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('simulator');

  // Perfil del Usuario
  const [xp, setXp] = useState(1250);
  const [score, setScore] = useState(680);
  const weeklyIncome = 3500; // Salario semanal simulado (Ej: recién egresado/joven)

  // Estados del simulador
  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);
  const [crisisActive, setCrisisActive] = useState(false);

  // Lógica Financiera (Tasa simplificada Banco Azteca Hackathon ~60% anual)
  const annualInterestRate = 0.60;
  const interestRateForPeriod = annualInterestRate * (weeks / 52);
  const totalInterest = amount * interestRateForPeriod;
  const totalToPay = amount + totalInterest;
  const weeklyPayment = totalToPay / weeks;

  // Triggers de Inteligencia Artificial (Copiloto)
  // ¿El pago supera el 40% de su sueldo? Riesgo de asfixia (impago)
  const isOverleveraged = weeklyPayment > (weeklyIncome * 0.40);
  // ¿El plazo es excesivo? CAT altísimo.
  const isTooLong = weeks >= 80;

  // Handler para Evento de Crisis (Bola de nieve)
  const triggerCrisisEvent = () => {
    setCrisisActive(true);
    setAmount(20000); // Gasto fuerte
    setWeeks(13); // Intenta pagarlo rápido pero es imposible con su sueldo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Plan de Rescate (Acción del Copiloto)
  const acceptRescuePlan = () => {
    // Calculamos el plazo ideal para que el pago quede en ~30% de sus ingresos ($1050)
    // Para 20k, 52 semanas da aprox $615 (sano).
    setWeeks(52);
    setCrisisActive(false);
    setXp(xp + 100);
    setScore(score + 15);
    alert("¡Rescate Exitoso! Copiloto reestructuró tu préstamo. Tu Score ha mejorado por aceptar la ayuda financiera. (+100 XP)");
  };

  const handleSimulateAction = () => {
    if (isOverleveraged) {
      setScore(score - 50);
      alert("Simulación guardada, pero tu decisión fue riesgosa. Tomar una deuda que no puedes pagar bajó tu Score Crediticio.");
    } else {
      setXp(xp + 50);
      alert("¡Simulación responsable guardada! Avanzas hacia tu próxima insignia. (+50 XP)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar Minimalista */}
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
                onClick={() => setActiveTab('dashboard')}
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
                Simulador IA
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
              <p className="text-gray-600 mt-1">Acumula XP tomando buenas decisiones en el simulador.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <p className="mt-4 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">Camino a Tarjeta de Crédito 💳</p>
              </div>

              {/* XP Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-gray-500 font-medium">Nivel 2: Explorador Financiero</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{xp} XP</p>
                  </div>
                  <div className="text-4xl">🚀</div>
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
            {/* Header Simulator */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  Simulador <span className="ml-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md uppercase font-bold tracking-wider">Impulsado por IA</span>
                </h1>
                <p className="text-gray-600 mt-1">Prueba decisiones financieras en un entorno de riesgo cero.</p>
              </div>
              <button
                onClick={triggerCrisisEvent}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 py-2 px-4 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center shadow-red-100"
              >
                <span className="mr-2">🔥</span> Botón de Crisis Inesperada
              </button>
            </div>

            {/* COPILOTO INTERVENCIÓN ACTIVA (ALERTA ROJA) */}
            {isOverleveraged && (
              <div className="mb-8 animate-in slide-in-from-top-4 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl shadow-2xl p-1">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10 border border-slate-700">
                  <div className="flex-shrink-0 animate-pulse bg-blue-500/20 p-4 rounded-full border 2 border-blue-400/50">
                    <span className="text-5xl">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center">
                      COPILOTO AZTECA: ALERTA DE ASFIXIA FINANCIERA
                    </h3>
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                      Detecto que has programado un pago de <strong className="text-red-400">${Math.round(weeklyPayment)}/sem</strong>. Esto equivale a más del 40% de tu sueldo simulado ($3,500). En la vida real, un pago tan alto provocará que no te alcance para la renta o comida, cayendo en impago y arruinando tu historial.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <button
                      onClick={acceptRescuePlan}
                      className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Aceptar Plan de Rescate <span className="ml-2">✨</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Controles (Izquierda) */}
              <div className="lg:col-span-7 space-y-6">

                {/* Panel principal de barras */}
                <div className={`bg-white rounded-2xl shadow-sm border p-6 sm:p-8 transition-colors ${crisisActive ? 'border-red-300 ring-4 ring-red-50' : 'border-gray-200'}`}>
                  {crisisActive && (
                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg font-bold mb-6 animate-pulse border border-red-200">
                      🚨 CRISIS: "Tu refrigerador se quemó y necesitas una computadora nueva urgente. El sistema ajustó tu deuda a $20,000. Resuélvelo."
                    </div>
                  )}

                  <h2 className="text-lg font-bold text-gray-800 mb-6">Ajustes del Préstamo</h2>

                  {/* Monto */}
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Monto</label>
                      <span className="font-bold text-2xl text-green-600">
                        ${amount.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <input
                      type="range" min="1000" max="20000" step="500"
                      value={amount}
                      onChange={(e) => { setAmount(Number(e.target.value)); setCrisisActive(false); }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  {/* Plazo */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Plazo a pagar</label>
                      <span className="font-bold text-xl text-gray-800">
                        {weeks} semanas
                      </span>
                    </div>
                    <input
                      type="range" min="13" max="104" step="13"
                      value={weeks}
                      onChange={(e) => { setWeeks(Number(e.target.value)); setCrisisActive(false); }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                      <span>Corto (Pagos altos)</span>
                      <span>Largo (Pago bajito, más intereses)</span>
                    </div>
                  </div>
                </div>

                {/* Traductor Ciudadano Normal (Aparece si el plazo es muy largo y NO hay asfixia) */}
                {!isOverleveraged && isTooLong && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start space-x-4">
                    <div className="text-2xl mt-1">🧐</div>
                    <div>
                      <h4 className="font-bold text-yellow-800">Traductor del Asesor: CAT Elevado</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Elegir 104 semanas hará que des pagos chiquitos de solo ${Math.round(weeklyPayment)}, suena genial... pero nota cómo los "Intereses Pagados" suben muchísimo. El banco gana más mientras más tardes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Ingresos simulados info box */}
                <div className="bg-gray-100 rounded-xl p-4 flex justify-between items-center text-sm text-gray-600 border border-gray-200">
                  <span className="font-medium">Tu Salario Simulado:</span>
                  <span className="font-bold text-gray-800">$3,500 MXN / Semana</span>
                </div>

              </div>

              {/* Resultados (Ticket - Derecha) */}
              <div className="lg:col-span-5">
                <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden sticky top-6">
                  {/* Recibo Header */}
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
                        <span className="text-gray-400">Intereses Totales (CAT):</span>
                        <span className="text-yellow-500">+ ${Math.round(totalInterest).toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-base">
                        <span className="text-gray-300 font-bold">Total a liquidar:</span>
                        <span className="font-bold text-white">${Math.round(totalToPay).toLocaleString('es-MX')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateAction}
                      disabled={isOverleveraged}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${isOverleveraged
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                          : 'bg-green-500 hover:bg-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                        }`}
                    >
                      {isOverleveraged ? 'Acepta Rescate para Continuar' : 'Confimar y Ganar XP'}
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
