import React, { useState, useEffect } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Usuario y Perfil
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Cargando...');
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(680);

  // Ingresos del usuario
  const weeklyIncome = 3500;
  const monthlyIncome = weeklyIncome * 4;

  // Billetera Local y Deuda (Nuevo)
  const [walletMoney, setWalletMoney] = useState(4000);
  const [currentDebt, setCurrentDebt] = useState(12500);
  const activeWeeklyPayment = 350;
  const [remainingPayments, setRemainingPayments] = useState(38);

  // Estados del simulador
  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);
  const [showCopilot, setShowCopilot] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);

  // Detalle Retractil (Desglose)
  const [showDetails, setShowDetails] = useState(false);

  // Lógica Financiera
  const annualInterestRate = 0.60;
  const interestRateForPeriod = annualInterestRate * (weeks / 52);
  const totalInterest = amount * interestRateForPeriod;
  const totalToPay = amount + totalInterest;
  const weeklyPayment = totalToPay / weeks;

  const isOverleveraged = weeklyPayment > (weeklyIncome * 0.40);

  // FETCH INICIAL AL BACKEND
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users');
        const data = await res.json();
        if (data && data.length > 0) {
          const mainUser = data[0];
          setUserId(mainUser._id);
          setUserName(mainUser.nombre);
          if (mainUser.perfilGamificacion) {
            setXp(mainUser.perfilGamificacion.xpPuntos || 0);
            setScore(mainUser.perfilGamificacion.scoreCrediticioSimulado || 680);
          }
        }
      } catch (error) {
        console.error("Error conectando al backend (asegúrate de encenderlo):", error);
        setUserName('Invitado Local');
      }
    };
    loadUserData();
  }, []);

  const syncProgressToDB = async (newXp, newScore) => {
    setXp(newXp);
    setScore(newScore);
    if (!userId) return;
    try {
      await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpPuntos: newXp, scoreCrediticioSimulado: newScore })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const saveSimulationTransaction = async (tipo, dictamenEducativo) => {
    if (!userId) return;
    try {
      await fetch('http://localhost:5000/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          tipoSimulacion: 'CREDITO_PERSONAL',
          parametros: { montoSolicitado: amount, plazoSemanas: weeks, tasaInteresAplicada: annualInterestRate, pagoSemanalCalculado: weeklyPayment },
          resultadoEducativo: { comprendioCAT: true, decisionFinal: dictamenEducativo }
        })
      });
    } catch (err) { }
  };

  const acceptRescuePlan = () => {
    setWeeks(52);
    setShowCopilot(false);
    setUnderstandRisk(false);
    syncProgressToDB(xp + 100, score + 15);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RESCATE_ACEPTADO');
    alert("¡Rescate Exitoso! Tu decisión responsable y el aumento de tu XP se acaban de guardar en la base de datos.");
  };

  const forceBadLoan = () => {
    setShowCopilot(false);
    setUnderstandRisk(false);
    syncProgressToDB(xp, score - 80);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RIESGO_ASUMIDO');
    alert("Préstamo riesgoso registrado. Tu caída de Score crediticio ya se reflejó en la Base de Datos Azteca.");
  };

  const handleSimulateAction = () => {
    if (isOverleveraged) {
      setShowCopilot(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      syncProgressToDB(xp + 50, score);
      saveSimulationTransaction('CREDITO_PERSONAL', 'PAGO_SANO');
      alert("¡Simulación saludable! El historial y tu nueva Experiencia se guardaron exitosamente en la nube.");
    }
  };

  // Acciones de Gamificación Diaria (Impacto de Pagos)
  const simulatePayment = () => {
    if (walletMoney >= activeWeeklyPayment && remainingPayments > 0) {
      setWalletMoney(walletMoney - activeWeeklyPayment);
      setCurrentDebt(currentDebt - activeWeeklyPayment);
      setRemainingPayments(remainingPayments - 1);
      syncProgressToDB(xp + 25, score + 5);
      alert("¡Excelente! Has pagado a tiempo. Banco Azteca nota tu responsabilidad. (+5 Puntos Score)");
    } else if (remainingPayments <= 0) {
      alert("¡Ya liquidaste esta deuda!");
    } else {
      alert("No tienes saldo suficiente en tu billetera actual para pagar.");
    }
  };

  const missPayment = () => {
    if (remainingPayments > 0) {
      syncProgressToDB(xp, score - 40); // Fuerte penalización por impago
      alert("⚠️ ALERTA DE IMPAGO. Te gastaste el dinero en otra cosa y omitiste tu abono semanal. Tu Score ha sido severamente castigado.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-10">
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
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'simulator' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Simulador
              </button>
            </nav>

            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">Ingreso: ${weeklyIncome}/sem</div>
                <div className="text-xs text-green-600 font-medium">{userName}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* DASHBOARD TAB (Reorganizado Verticalmente según instrucciones) */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">

            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Tu Resumen Financiero</h1>
              <p className="text-gray-600 mt-1">Acumula experiencia tomando buenas decisiones.</p>
            </div>

            {/* 1. DINERO ACTUAL Y DEUDA (Top) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Mi Billetera (Dinero Disponible)</p>
                  <p className="text-5xl font-bold text-green-400">${walletMoney.toLocaleString('es-MX')}</p>
                </div>
                <div className="text-right w-full md:w-auto">
                  <p className="text-slate-400 text-xs uppercase font-bold mb-1">Ingresos Fijos Reportados</p>
                  <p className="text-xl font-bold text-white">${monthlyIncome.toLocaleString('es-MX')} / mes</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Deuda y Compromisos Activos</h3>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="w-full md:w-1/2">
                    <p className="text-sm text-gray-500 mb-1">Saldo a Deber</p>
                    <p className="text-3xl font-bold text-red-500">${currentDebt.toLocaleString('es-MX')}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Cuota Semanal:</span> <span className="font-bold text-gray-900">${activeWeeklyPayment}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Pagos Restantes:</span> <span className="font-bold text-gray-900">{remainingPayments}</span>
                    </div>
                  </div>

                  {/* ACCIONES DE IMPACTO CREDITICIO */}
                  <div className="w-full md:w-1/2 flex flex-col gap-3">
                    <button
                      onClick={simulatePayment}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors w-full text-sm"
                    >
                      Pagar Cuota Semanal (-${activeWeeklyPayment})
                    </button>
                    <button
                      onClick={missPayment}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3 px-4 rounded-xl transition-colors w-full text-sm"
                    >
                      Saltar Pago (Gastar dinero en otra cosa)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. NIVEL EN MEDIO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center text-center">
              <p className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-xs">Progreso Educativo</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">Nivel 2: Explorador Financiero</p>
              <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-4" style={{ width: `${Math.min((xp / 2000) * 100, 100)}%` }}></div>
              </div>
              <p className="text-lg font-bold text-blue-600">{xp} / 2000 XP</p>
            </div>

            {/* 3. SCORE AZTECA ABAJO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 font-bold tracking-widest text-sm mb-4 uppercase">Score de Salud Azteca</p>
              <div className="relative">
                {/* SVG Dial Chart */}
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * (score / 850))} className={score > 600 ? "text-green-500" : "text-red-500"} />
                </svg>
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-gray-800">
                  {score}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">Un score alto (Cercano a 850) garantiza mejores préstamos reales.</p>
            </div>

          </div>
        )}

        {/* SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Simulador de Crédito Personal</h1>
              <p className="text-gray-600 mt-1">Descubre tu cuota ideal antes de comprometerte.</p>
            </div>

            {showCopilot && (
              <div className="mb-8 animate-in zoom-in duration-300 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl shadow-2xl p-1">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10 border border-slate-700">
                  <div className="flex-shrink-0 animate-pulse bg-blue-500/20 p-4 rounded-full border 2 border-blue-400/50">
                    <div className="text-blue-300 text-sm font-bold text-center">[ALERTA]</div>
                  </div>

                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center">
                      ASFIXIA FINANCIERA DETECTADA
                    </h3>
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-4">
                      Has programado un pago de <strong className="text-red-400">${Math.round(weeklyPayment)}/sem</strong>. Esto equivale a más del 40% de tu sueldo simulado ($3,500).
                    </p>

                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 accent-red-500 cursor-pointer"
                          checked={understandRisk}
                          onChange={(e) => setUnderstandRisk(e.target.checked)}
                        />
                        <span className="text-sm text-slate-300">
                          Comprendo que este crédito supera mi capacidad de pago. Asumo la enorme penalización sobre mi Score en la Base de Datos.
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
                      className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${understandRisk ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
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

              {/* Controles (Izquierda) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Ajustes del Préstamo</h2>

                  {/* Monto */}
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Monto Solicitado</label>
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                        <span className="text-gray-500 font-bold mr-1">$</span>
                        <input
                          type="number" min="1000" max="50000"
                          value={amount}
                          onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }}
                          className="font-bold text-xl text-green-600 bg-transparent outline-none w-24 text-right"
                        />
                      </div>
                    </div>
                    <input
                      type="range" min="1000" max="50000" step="100"
                      value={amount}
                      onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>

                  {/* Plazo */}
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Plazo a pagar</label>
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                        <input
                          type="number" min="1" max="154"
                          value={weeks}
                          onChange={(e) => { setWeeks(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }}
                          className="font-bold text-xl text-gray-800 bg-transparent outline-none w-16 text-right mr-1"
                        />
                        <span className="text-gray-500 font-bold">sem</span>
                      </div>
                    </div>
                    <input
                      type="range" min="13" max="154" step="1"
                      value={weeks}
                      onChange={(e) => { setWeeks(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Resultados Y Desglose Retráctil (Derecha) */}
              <div className="lg:col-span-5">
                <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden sticky top-6">

                  {/* Recibo Principal */}
                  <div className="px-8 pt-8 pb-6 border-b border-gray-700">
                    <p className="text-center text-gray-500 font-mono text-xs tracking-widest mb-6">TICKET DE SIMULACIÓN</p>
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-gray-400 font-medium">Cuota Semanal</span>
                      <div className="text-right">
                        <span className={`text-4xl font-black ${isOverleveraged ? 'text-red-500' : 'text-green-400'}`}>
                          ${Math.round(weeklyPayment)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 font-mono text-sm mb-6">
                      <div className="flex justify-between pb-2 border-b border-gray-800">
                        <span className="text-gray-400">Total a liquidar:</span>
                        <span className="font-bold text-white">${Math.round(totalToPay).toLocaleString('es-MX')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateAction}
                      className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-green-500 hover:bg-green-400 text-white"
                    >
                      Confirmar Préstamo
                    </button>
                  </div>

                  {/* PESTAÑA RETRÁCTIL DE DESGLOSE */}
                  <div className="bg-gray-800">
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full py-4 px-6 flex justify-between items-center text-gray-300 hover:text-white hover:bg-gray-700 transition border-t border-gray-600 bg-gray-900/50"
                    >
                      <span className="font-bold text-sm tracking-wide">Desglose Técnico y Legal</span>
                      <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {showDetails && (
                      <div className="p-6 bg-slate-800 text-sm border-t border-slate-700 text-slate-300 animate-in slide-in-from-top-2">
                        <ul className="space-y-3 font-mono">
                          <li className="flex justify-between">
                            <span className="text-slate-400">Capital Solicitado:</span>
                            <span className="text-white">${amount.toLocaleString('es-MX')}</span>
                          </li>
                          <li className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Intereses Totales Brutos:</span>
                            <span className="text-yellow-400">+${Math.round(totalInterest).toLocaleString('es-MX')}</span>
                          </li>
                          <li className="flex justify-between pt-1">
                            <span className="text-slate-400">Tasa de Interés Fija Anual:</span>
                            <span className="text-blue-300">{(annualInterestRate * 100).toFixed(1)}%</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-400">CAT Promedio Simulado:</span>
                            <span className="text-blue-300 font-bold">~72.4% sin IVA</span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-400">Comisión por Apertura:</span>
                            <span className="text-white">$0.00</span>
                          </li>
                          <li className="flex justify-between pt-3 mt-3 border-t border-slate-700">
                            <span className="text-slate-400">Coste Mensual Equivalente:</span>
                            <span className="text-white font-bold">${Math.round(weeklyPayment * 4).toLocaleString('es-MX')}</span>
                          </li>
                        </ul>
                      </div>
                    )}
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
