import React, { useState, useEffect } from 'react';

function App() {
  // Estado general de Navegación 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Login States Simulados
  const [loginUser, setLoginUser] = useState('7712345678');
  const [loginPass, setLoginPass] = useState('123456');

  // Usuario y Perfil
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Cargando...');
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(680);

  const weeklyIncome = 3500;
  const monthlyIncome = weeklyIncome * 4;

  // Billetera Local y Deuda
  const [walletMoney, setWalletMoney] = useState(6000);
  const [currentDebt, setCurrentDebt] = useState(12500);
  const minWeeklyPayment = 350;

  // Nuevo Estado: Abono variable
  const [paymentInput, setPaymentInput] = useState(minWeeklyPayment);

  // Estados del simulador financiero
  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);
  const [showCopilot, setShowCopilot] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Lógica Financiera
  const annualInterestRate = 0.60;
  const interestRateForPeriod = annualInterestRate * (weeks / 52);
  const totalInterest = amount * interestRateForPeriod;
  const totalToPay = amount + totalInterest;
  const weeklyPayment = totalToPay / weeks;
  const isOverleveraged = weeklyPayment > (weeklyIncome * 0.40);

  // EFFECT DE INIT
  useEffect(() => {
    if (!isLoggedIn) return; // Solo cargar si ya inció sesión
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
        setUserName('Invitado Local');
      }
    };
    loadUserData();
  }, [isLoggedIn]);

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
    } catch (err) { }
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
    alert("¡Rescate Exitoso! Tu decisión responsable se guardó en la base de datos.");
  };

  const forceBadLoan = () => {
    setShowCopilot(false);
    setUnderstandRisk(false);
    syncProgressToDB(xp, score - 80);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RIESGO_ASUMIDO');
    alert("Préstamo riesgoso registrado. Tu Score Azteca acaba de colapsar en la BD.");
  };

  const handleSimulateAction = () => {
    if (isOverleveraged) {
      setShowCopilot(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      syncProgressToDB(xp + 50, score);
      saveSimulationTransaction('CREDITO_PERSONAL', 'PAGO_SANO');
      alert("¡Simulación saludable! Avanzas hacia tu próxima insignia.");
    }
  };

  // ----- PAGAR DEUDA CON ABONO LIBRE -----
  const simulatePayment = () => {
    const abono = Number(paymentInput);
    if (abono < minWeeklyPayment) {
      alert(`El abono mínimo semanal es de $${minWeeklyPayment}. No puedes pagar menos si no quieres caer en morosidad.`);
      return;
    }
    if (abono > currentDebt) {
      alert("No puedes abonar más dinero del que debes.");
      return;
    }
    if (walletMoney >= abono && currentDebt > 0) {
      setWalletMoney(walletMoney - abono);
      setCurrentDebt(currentDebt - abono);

      // Recompensa matemática inteligente: Si paga MÁS del mínimo, gana más XP y Score
      const extraPuntos = abono > minWeeklyPayment ? 15 : 0;
      syncProgressToDB(xp + 25 + extraPuntos, score + 5 + extraPuntos);

      alert(abono > minWeeklyPayment
        ? `¡Excelente! Hiciste un abono a capital mayor al mínimo. Ahorraste intereses futuros. (+${5 + extraPuntos} PTS SCORE)`
        : "Pago semanal mínimo registrado a tiempo. ¡Responsabilidad confirmada!");

      setPaymentInput(minWeeklyPayment); // reset
    } else if (currentDebt <= 0) {
      alert("¡Ya liquidaste esta deuda!");
    } else {
      alert("No tienes saldo suficiente en tu billetera actual para este abono.");
    }
  };

  // ----- CASTIGO POR IMPAGO -----
  const missPayment = () => {
    if (currentDebt > 0) {
      syncProgressToDB(xp, score - 35); // Castigo de -35 al score
      alert("⚠️ ALERTA: Has omitido un pago. Banco Azteca registra esto como 'Morosidad de 1ra etapa'. Tu Score de Salud Financiera bajó.");
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };


  // ==========================================
  // PANTALLA DE LOGIN (AUTENTICACIÓN SIMULADA)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Adornos de fondo */}
        <div className="absolute top-0 left-0 w-full h-96 bg-green-600 rounded-b-[40%] transform -translate-y-20 shadow-2xl skew-y-2"></div>
        <div className="absolute w-64 h-64 bg-green-500 rounded-full blur-3xl opacity-50 top-10 left-10"></div>

        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="p-8 pb-6 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-tr from-green-700 to-green-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-lg mb-4">
              A
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Azteca <span className="text-green-600">Horizon</span></h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Educación Financiera Inteligente</p>
          </div>

          <form className="p-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Celular o Usuario</label>
              <input
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-green-500 focus:border-green-500 block p-4 shadow-inner outline-none transition-colors"
                placeholder="55 1234 5678"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-green-500 focus:border-green-500 block p-4 shadow-inner outline-none transition-colors"
                placeholder="••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-bold rounded-xl text-lg px-5 py-4 text-center transition-transform active:scale-95 shadow-[0_10px_20px_rgba(22,163,74,0.3)]"
            >
              Ingresar a mi App
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">Conexión de prueba (Simulada Hackathon 2026)</p>
          </form>
        </div>
      </div>
    );
  }


  // ==========================================
  // PANTALLA PRINCIPAL (DASHBOARD APP)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-10">
      <header className="bg-white shadow relative z-10 border-b-4 border-green-600 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
                Azteca <span className="text-green-600">Horizon</span>
              </span>
            </div>

            <nav className="flex space-x-2 sm:space-x-4">
              <button
                onClick={() => { setActiveTab('dashboard'); setShowCopilot(false); }}
                className={`px-3 py-2 rounded-md font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-2 rounded-md font-bold transition-colors ${activeTab === 'simulator' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                Simulador
              </button>
            </nav>

            <div className="flex items-center space-x-3">
              <button onClick={() => setIsLoggedIn(false)} className="text-xs font-bold text-gray-400 hover:text-red-500 mr-2">Cerrar Sesión</button>
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-900">Ingreso: ${weeklyIncome}/sem</div>
                <div className="text-xs text-green-600 font-medium">{userName}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* -------------------- DASHBOARD TAB -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">

            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Tu Resumen Financiero</h1>
              <p className="text-gray-600 mt-1">Si abonas más del mínimo a tu deuda, ganarás recompensas de Score.</p>
            </div>

            {/* 1. DINERO ACTUAL Y DEUDA ABONO FLEXIBLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Mi Billetera Virtual</p>
                  <p className="text-5xl font-black text-green-400">${walletMoney.toLocaleString('es-MX')}</p>
                </div>
                <div className="text-right w-full md:w-auto">
                  <p className="text-slate-400 text-xs uppercase font-bold mb-1">Ingresos Fijos (Sueldo)</p>
                  <p className="text-xl font-bold text-white">${monthlyIncome.toLocaleString('es-MX')} / mes</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">Estado de Cuenta de tu Préstamo</h3>
                <div className="flex flex-col md:flex-row justify-between break-words gap-8">
                  {/* Deuda Info */}
                  <div className="w-full md:w-5/12 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1 font-semibold uppercase">Saldo Restante a Deber</p>
                    <p className="text-3xl font-bold text-red-500 mb-3">${currentDebt.toLocaleString('es-MX')}</p>
                    <div className="flex justify-between text-sm py-1 border-b border-gray-200">
                      <span className="text-gray-600">Cuota Semanal Mínima:</span> <span className="font-bold text-gray-900">${minWeeklyPayment}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1 pt-2">
                      <span className="text-gray-600">Semanas faltantes (aprox):</span> <span className="font-bold text-gray-900">{Math.ceil(currentDebt / minWeeklyPayment)}</span>
                    </div>
                  </div>

                  {/* ACCIONES DE IMPACTO CREDITICIO (Abono Flexible) */}
                  <div className="w-full md:w-7/12 flex flex-col justify-center">
                    <label className="text-sm font-bold text-gray-700 mb-2">¿Cuánto deseas pagar esta semana?</label>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          min={minWeeklyPayment}
                          value={paymentInput}
                          onChange={(e) => setPaymentInput(e.target.value)}
                          className="w-full font-bold text-xl bg-white border border-gray-300 rounded-xl py-3 pl-8 pr-4 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={simulatePayment}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95"
                      >
                        Pagar
                      </button>
                    </div>

                    <button
                      onClick={missPayment}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold py-2 px-4 rounded-lg transition-colors w-full text-sm mt-2 border border-transparent"
                    >
                      Saltar Pago e Ignorar Deuda (Daño al Score)
                    </button>
                    <p className="text-xs text-gray-400 mt-3 text-center">💡 Tip: Abonar más del mínimo te hará ganar puntos de Score extra porque acortas tus intereses a Banco Azteca.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. NIVEL Y 3. SCORE VERTICALES */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center text-center">
              <p className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-xs">Progreso Educativo</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">Nivel 2: Explorador Financiero</p>
              <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 transition-all duration-1000" style={{ width: `${Math.min((xp / 2000) * 100, 100)}%` }}></div>
              </div>
              <p className="text-lg font-bold text-blue-600">{xp} / 2000 XP</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 font-bold tracking-widest text-sm mb-4 uppercase">Tu Historial Bancario Constante</p>
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90 transition-all duration-1000">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * (score / 850))} className={score >= 600 ? "text-green-500" : "text-red-500"} />
                </svg>
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black transition-colors duration-500 ${score >= 600 ? "text-gray-800" : "text-red-600"}`}>
                  {score}
                </span>
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 max-w-sm">Si tu Score cae bajo 600 (amarillo/rojo) por no pagar a tiempo, los créditos futuros te los cobrarán más caros.</p>
            </div>

          </div>
        )}

        {/* -------------------- SIMULATOR TAB -------------------- */}
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
                      Has programado un pago de <strong className="text-red-400">${Math.round(weeklyPayment)}/sem</strong>. Esto excede tu capacidad basándonos en tu sueldo libre simulado.
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
                          Comprendo que este crédito supera mi capacidad de pago mes con mes. Asumo la enorme penalización sobre mi Score Crediticio.
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-64 flex flex-col space-y-3">
                    <button onClick={acceptRescuePlan} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">Aceptar Plan Rescate</button>
                    <button onClick={forceBadLoan} disabled={!understandRisk} className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${understandRisk ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>Continuar Riesgo</button>
                    <button onClick={() => { setShowCopilot(false); setUnderstandRisk(false); }} className="w-full text-slate-400 hover:text-white text-sm font-medium py-2 px-4 transition-colors text-center">Volver a editar barras</button>
                  </div>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${showCopilot ? 'opacity-50 pointer-events-none filter blur-sm transition-all' : 'transition-all'}`}>

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
                        <input type="number" min="1000" max="50000" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }} className="font-bold text-xl text-green-600 bg-transparent outline-none w-24 text-right" />
                      </div>
                    </div>
                    <input type="range" min="1000" max="50000" step="100" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
                  </div>

                  {/* Plazo */}
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Plazo a pagar</label>
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                        <input type="number" min="1" max="154" value={weeks} onChange={(e) => { setWeeks(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }} className="font-bold text-xl text-gray-800 bg-transparent outline-none w-16 text-right mr-1" />
                        <span className="text-gray-500 font-bold">sem</span>
                      </div>
                    </div>
                    <input type="range" min="13" max="154" step="1" value={weeks} onChange={(e) => { setWeeks(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
                  </div>
                </div>
              </div>

              {/* Resultados Y Desglose Retráctil (Derecha) */}
              <div className="lg:col-span-5">
                <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden sticky top-20">
                  <div className="px-8 pt-8 pb-6 border-b border-gray-700">
                    <p className="text-center text-gray-500 font-mono text-xs tracking-widest mb-6">TICKET DE SIMULACIÓN</p>
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-gray-400 font-medium">Cuota Semanal</span>
                      <div className="text-right">
                        <span className={`text-4xl font-black transition-colors ${isOverleveraged ? 'text-red-500' : 'text-green-400'}`}>
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
                    <button onClick={handleSimulateAction} className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-green-500 hover:bg-green-400 text-white shadow-lg active:scale-95">Confirmar Préstamo</button>
                  </div>

                  {/* PESTAÑA RETRÁCTIL DE DESGLOSE */}
                  <div className="bg-gray-800">
                    <button onClick={() => setShowDetails(!showDetails)} className="w-full py-4 px-6 flex justify-between items-center text-gray-300 hover:text-white hover:bg-gray-700 transition border-t border-gray-600 bg-gray-900/50 outline-none">
                      <span className="font-bold text-sm tracking-wide">Desglose Técnico y Legal</span>
                      <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {showDetails && (
                      <div className="p-6 bg-slate-800 text-sm border-t border-slate-700 text-slate-300 animate-in slide-in-from-top-2">
                        <ul className="space-y-3 font-mono">
                          <li className="flex justify-between"><span className="text-slate-400">Capital:</span> <span className="text-white">${amount.toLocaleString('es-MX')}</span></li>
                          <li className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">Intereses Totales Brutos:</span> <span className="text-yellow-400">+${Math.round(totalInterest).toLocaleString('es-MX')}</span></li>
                          <li className="flex justify-between pt-1"><span className="text-slate-400">Tasa de Interés Fija Anual:</span> <span className="text-blue-300">{(annualInterestRate * 100).toFixed(1)}%</span></li>
                          <li className="flex justify-between"><span className="text-slate-400">CAT Promedio (Sin IVA):</span> <span className="text-blue-300 font-bold">~72.4%</span></li>
                          <li className="flex justify-between"><span className="text-slate-400">Comisión de Apertura:</span> <span className="text-white">$0.00</span></li>
                          <li className="flex justify-between pt-3 mt-3 border-t border-slate-700"><span className="text-slate-400">Total Mensual Equivalente:</span> <span className="text-white font-bold">${Math.round(weeklyPayment * 4).toLocaleString('es-MX')}</span></li>
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
