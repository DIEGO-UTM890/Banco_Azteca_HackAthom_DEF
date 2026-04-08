import React, { useState, useEffect } from 'react';

function App() {
  // Estado general de Navegación 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | ingresos | simulator

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

  // Billetera Local y Deuda Activa (Conectando Simulador con Perfil)
  const [walletMoney, setWalletMoney] = useState(4000);
  const [currentDebt, setCurrentDebt] = useState(0);
  const [minWeeklyPayment, setMinWeeklyPayment] = useState(0);
  const [paymentInput, setPaymentInput] = useState(0);

  // Estado de Depósitos (Nuevo)
  const [depositAmount, setDepositAmount] = useState(3500);

  // Estados del simulador financiero
  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);
  const [showCopilot, setShowCopilot] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Lógica Financiera Dinámica de la Simulación Actual
  const annualInterestRate = 0.60;
  const interestRateForPeriod = annualInterestRate * (weeks / 52);
  const totalInterest = amount * interestRateForPeriod;
  const totalToPay = amount + totalInterest;
  const weeklyPaymentConfirm = totalToPay / weeks;
  const isOverleveraged = weeklyPaymentConfirm > (weeklyIncome * 0.40);

  useEffect(() => {
    if (!isLoggedIn) return;
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
          parametros: { montoSolicitado: amount, plazoSemanas: weeks, tasaInteresAplicada: annualInterestRate, pagoSemanalCalculado: weeklyPaymentConfirm },
          resultadoEducativo: { comprendioCAT: true, decisionFinal: dictamenEducativo }
        })
      });
    } catch (err) { }
  };

  // ----------------------------------------------------
  // REALIZAR UN DEPÓSITO SIMULADO A LA CUENTA (NUEVO)
  // ----------------------------------------------------
  const handleSimulateDeposit = () => {
    const depositNum = Number(depositAmount);
    if (depositNum < 100) {
      alert("El depósito mínimo para la simulación es de $100");
      return;
    }
    setWalletMoney(prev => prev + depositNum);
    // Ganar un poquito de XP por guardar su dinero (educativo)
    syncProgressToDB(xp + 10, score);
    alert(`¡Depósito exitoso! Se han añadido $${depositNum.toLocaleString('es-MX')} a tu Billetera Virtual. (+10 XP)`);
    setActiveTab('dashboard'); // Regresar a ver los millones
  };


  // ----------------------------------------------------
  // INYECCIÓN DE LA SIMULACIÓN DE PRÉSTAMO A LA BILLETERA
  // ----------------------------------------------------
  const injectLoanToProfile = (capitalSolicitado, deudaTotal, pagoSemanalAsignado) => {
    setWalletMoney(prev => prev + capitalSolicitado);
    setCurrentDebt(prev => prev + deudaTotal);

    const newWeeklyPayment = minWeeklyPayment + Math.round(pagoSemanalAsignado);
    setMinWeeklyPayment(newWeeklyPayment);
    setPaymentInput(newWeeklyPayment);

    setActiveTab('dashboard');
  };

  const acceptRescuePlan = () => {
    setWeeks(52);
    setShowCopilot(false);
    setUnderstandRisk(false);

    const adjustedInterest = amount * (annualInterestRate * (52 / 52));
    const adjustedTotal = amount + adjustedInterest;
    const adjustedWeeklyInfo = adjustedTotal / 52;

    syncProgressToDB(xp + 100, score + 15);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RESCATE_ACEPTADO');

    alert("¡Rescate Exitoso e Inteligente! Tu decisión responsable fue recompensada. El préstamo ha sido depositado.");
    injectLoanToProfile(amount, adjustedTotal, adjustedWeeklyInfo);
  };

  const forceBadLoan = () => {
    setShowCopilot(false);
    setUnderstandRisk(false);
    syncProgressToDB(xp, score - 80);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RIESGO_ASUMIDO');
    alert("Préstamo riesgoso registrado y dinero depositado. Tu Score Azteca acaba de colapsar severamente por endeudarte así.");
    injectLoanToProfile(amount, totalToPay, weeklyPaymentConfirm);
  };

  const handleSimulateAction = () => {
    if (isOverleveraged) {
      setShowCopilot(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      syncProgressToDB(xp + 50, score);
      saveSimulationTransaction('CREDITO_PERSONAL', 'PAGO_SANO');
      alert("¡Simulación saludable aprobada! Dinero depositado directo a tu billetera y préstamo activado.");
      injectLoanToProfile(amount, totalToPay, weeklyPaymentConfirm);
    }
  };

  // ----------------------------------------------------
  // PAGAR DEUDA ACTIVA (EN EL DASHBOARD)
  // ----------------------------------------------------
  const simulatePayment = () => {
    const abono = Number(paymentInput);
    if (currentDebt <= 0) {
      alert("¡No tienes ninguna deuda! ¡Disfruta tus finanzas libres! Puedes simular un nuevo crédito.");
      return;
    }
    if (abono < minWeeklyPayment && abono < currentDebt) {
      alert(`El abono mínimo semanal de tu deuda actual es de $${minWeeklyPayment}.`);
      return;
    }
    const realPayment = Math.min(abono, currentDebt);

    if (walletMoney >= realPayment && currentDebt > 0) {
      setWalletMoney(walletMoney - realPayment);
      setCurrentDebt(currentDebt - realPayment);

      const extraPuntos = realPayment > minWeeklyPayment ? 15 : 0;
      syncProgressToDB(xp + 25 + extraPuntos, score + 5 + extraPuntos);

      if (currentDebt - realPayment <= 0) {
        setMinWeeklyPayment(0);
        setPaymentInput(0);
        alert("¡INCREÍBLE! 🎉 Has liquidado tu crédito en su totalidad. Banco Azteca confía plenamente en ti.");
      } else {
        alert(realPayment > minWeeklyPayment
          ? `¡Excelente! Hiciste un abono mayor al mínimo. Ahorraste intereses. (+${5 + extraPuntos} PTS SCORE)`
          : "Pago semanal registrado a tiempo. ¡Avanzas de nivel poco a poco!");
      }
    } else {
      alert("No tienes saldo suficiente en tu Billetera Virtual para este abono.");
    }
  };

  const missPayment = () => {
    if (currentDebt > 0) {
      syncProgressToDB(xp, score - 35);
      alert("⚠️ ALERTA: Has omitido un pago activo de tu crédito. Esto simula caer en mora. Tu Historial Financiero ha bajado fuertemente.");
    } else {
      alert("No tienes crédito qué omitir. ¡Sigue así!");
    }
  };


  // ==========================================
  // PANTALLA DE LOGIN
  // ==========================================
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-green-600 rounded-b-[40%] transform -translate-y-20 shadow-2xl skew-y-2"></div>
        <div className="absolute w-64 h-64 bg-green-500 rounded-full blur-3xl opacity-50 top-10 left-10"></div>

        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="p-8 pb-6 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-tr from-green-700 to-green-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-lg mb-4">A</div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Azteca <span className="text-green-600">Horizon</span></h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Educación Financiera Inteligente</p>
          </div>
          <form className="p-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Celular o Usuario</label>
              <input type="text" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-green-500 focus:border-green-500 block p-4 shadow-inner outline-none transition-colors" placeholder="55 1234 5678" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-green-500 focus:border-green-500 block p-4 shadow-inner outline-none transition-colors" placeholder="••••••" required />
            </div>
            <button type="submit" className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-bold rounded-xl text-lg px-5 py-4 text-center transition-transform active:scale-95 shadow-[0_10px_20px_rgba(22,163,74,0.3)]">Ingresar a mi App</button>
            <p className="text-xs text-center text-gray-400 mt-4">Conexión de prueba (Simulada Hackathon)</p>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA PRINCIPAL 
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-10 overflow-x-hidden">
      <header className="bg-white shadow relative z-10 border-b-4 border-green-600 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">Azteca <span className="text-green-600">Horizon</span></span>
            </div>
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto scroller-hide">
              <button onClick={() => { setActiveTab('dashboard'); setShowCopilot(false); }} className={`px-2 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'}`}>Mi Perfil</button>
              <button onClick={() => { setActiveTab('ingresos'); setShowCopilot(false); }} className={`px-2 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'ingresos' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'}`}>Depósitos</button>
              <button onClick={() => { setActiveTab('simulator') }} className={`px-2 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'simulator' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'}`}>Simulador</button>
            </nav>
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsLoggedIn(false)} className="text-xs font-bold text-gray-400 hover:text-red-500 mr-2 hidden sm:block">Salir</button>
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-900">Sueldo: ${weeklyIncome}/sem</div>
                <div className="text-xs text-green-600 font-medium">{userName}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* -------------------- TAB: DASHBOARD -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Tu Resumen Financiero</h1>
              <p className="text-gray-600 mt-1">Gana créditos para tu billetera usando el Simulador y abona estratégicamente aquí.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-bold mb-1">Mi Billetera Virtual</p>
                  <p className="text-5xl font-black text-green-400">${walletMoney.toLocaleString('es-MX')}</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">Compromisos Bank de México</h3>
                {currentDebt > 0 ? (
                  <div className="flex flex-col md:flex-row justify-between break-words gap-8">
                    <div className="w-full md:w-5/12 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                      <p className="text-sm text-gray-500 mb-1 font-semibold uppercase">Deuda Activa (Crédito Simulado)</p>
                      <p className="text-3xl font-bold text-red-500 mb-3">${currentDebt.toLocaleString('es-MX')}</p>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-200">
                        <span className="text-gray-600">Base Mínima Requerida:</span> <span className="font-bold text-gray-900">${minWeeklyPayment}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 pt-2">
                        <span className="text-gray-600">Semanas faltantes (aprox):</span> <span className="font-bold text-gray-900">{Math.ceil(currentDebt / minWeeklyPayment) || 0}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-7/12 flex flex-col justify-center">
                      <label className="text-sm font-bold text-gray-700 mb-2">Abono Inteligente</label>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold">$</span>
                          <input type="number" min={Math.min(minWeeklyPayment, currentDebt)} max={currentDebt} value={paymentInput} onChange={(e) => setPaymentInput(Number(e.target.value))} className="w-full font-bold text-xl bg-white border border-gray-300 rounded-xl py-3 pl-8 pr-4 focus:ring-green-500 focus:border-green-500 outline-none" />
                        </div>
                        <button onClick={simulatePayment} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95">Pagar Deuda</button>
                      </div>

                      <button onClick={missPayment} className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold py-2 px-4 rounded-lg transition-colors w-full text-sm mt-2 border border-transparent">
                        Derrochar Dinero (Caer en Morosidad / Daño de Score)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-200 text-center">
                    <p className="font-bold text-lg mb-2">¡Todo al día!</p>
                    <p className="text-sm">No tienes créditos activos con nostros en esta simulación. Visita el <button onClick={() => setActiveTab('simulator')} className="underline font-bold">Simulador</button> para solicitar un nuevo crédito y seguir ganando Puntos de Riesgo.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center text-center">
                <p className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-xs">Progreso Educativo</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">Nivel 2: Explorador Financiero</p>
                <div className="w-full max-w-full mx-auto bg-gray-100 rounded-full h-4 mb-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 transition-all duration-1000" style={{ width: `${Math.min((xp / 2000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-lg font-bold text-blue-600">{xp} / 2000 XP</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 font-bold tracking-widest text-sm mb-4 uppercase">Score De Salud Crediticio</p>
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90 transition-all duration-1000">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="351" strokeDashoffset={351 - (351 * (score / 850))} className={score >= 600 ? "text-green-500" : "text-red-500"} />
                  </svg>
                  <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-black transition-colors duration-500 ${score >= 600 ? "text-gray-800" : "text-red-600"}`}>
                    {score}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: INGRESOS (DEPÓSITOS) -------------------- */}
        {activeTab === 'ingresos' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Simulador de Ingresos ("Payday")</h1>
              <p className="text-gray-600 mt-1">Carga dinero a tu billetera para tener fondos y pagar tus deudas simuladas.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-2xl font-black">Depósito de Efectivo / Nómina</h2>
                <p className="text-green-100 mt-2">Mete fondos directamente a la aplicación</p>
              </div>

              <div className="p-8">
                <label className="block text-center text-sm font-bold text-gray-600 uppercase tracking-widest mb-6">Monto a depositar en pesos</label>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="relative w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-green-700 font-black text-2xl">$</span>
                    <input
                      type="number"
                      min="100"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full font-black text-4xl bg-gray-50 border-2 border-green-200 text-gray-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-green-500 focus:border-green-500 outline-none text-center shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <button onClick={() => setDepositAmount(3500)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">+ $3,500 (Nómina)</button>
                  <button onClick={() => setDepositAmount(5000)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">+ $5,000</button>
                  <button onClick={() => setDepositAmount(10000)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">+ $10,000</button>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-blue-800 text-sm flex gap-3 items-center">
                  <span className="text-2xl">💡</span>
                  <p>Inyectar fondos te permite tener flujo libre para liquidar créditos grandes de forma simulada y ganar experiencia de pago puntual.</p>
                </div>

                <button
                  onClick={handleSimulateDeposit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xl py-4 rounded-xl shadow-[0_10px_20px_rgba(22,163,74,0.3)] transition-transform active:scale-95"
                >
                  Confirmar Depósito a Billetera
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: SIMULATOR -------------------- */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Simulador de Crédito Personal</h1>
              <p className="text-gray-600 mt-1">Al confirmar, el monto te será depositado en efectivo a la Billetera para que lo controles.</p>
            </div>

            {showCopilot && (
              <div className="mb-8 animate-in zoom-in duration-300 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl shadow-2xl p-1">
                <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10 border border-slate-700">
                  <div className="flex-shrink-0 animate-pulse bg-blue-500/20 p-4 rounded-full border 2 border-blue-400/50">
                    <div className="text-blue-300 text-sm font-bold text-center">[ALERTA]</div>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center">RIESGO DE ASFIXIA FINANCIERA</h3>
                    <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-4">Has programado un pago de <strong className="text-red-400">${Math.round(weeklyPaymentConfirm)}/sem</strong>. Esto excede tu capacidad basándonos en tu sueldo libre.</p>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input type="checkbox" className="mt-1 w-5 h-5 accent-red-500 cursor-pointer" checked={understandRisk} onChange={(e) => setUnderstandRisk(e.target.checked)} />
                        <span className="text-sm text-slate-300">Comprendo la altísima posibilidad de caer en impago y arruinar mi Score. Lo tomo bajo mi riesgo total.</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-64 flex flex-col space-y-3">
                    <button onClick={acceptRescuePlan} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]">Aceptar Rescate</button>
                    <button onClick={forceBadLoan} disabled={!understandRisk} className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${understandRisk ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>Forzar Aprobación</button>
                    <button onClick={() => { setShowCopilot(false); setUnderstandRisk(false); }} className="w-full text-slate-400 hover:text-white text-sm font-medium py-2 px-4 transition-colors text-center">Volver atrás</button>
                  </div>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${showCopilot ? 'opacity-50 pointer-events-none filter blur-sm transition-all' : 'transition-all'}`}>
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Ajustes del Préstamo</h2>
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-4">
                      <label className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Monto en efectivo a recibir</label>
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-1">
                        <span className="text-gray-500 font-bold mr-1">$</span>
                        <input type="number" min="1000" max="50000" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }} className="font-bold text-xl text-green-600 bg-transparent outline-none w-24 text-right" />
                      </div>
                    </div>
                    <input type="range" min="1000" max="50000" step="100" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); setUnderstandRisk(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
                  </div>
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

              <div className="lg:col-span-5">
                <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden sticky top-20">
                  <div className="px-8 pt-8 pb-6 border-b border-gray-700">
                    <p className="text-center text-gray-500 font-mono text-xs tracking-widest mb-6">TICKET DE SIMULACIÓN</p>
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-gray-400 font-medium">Acuerdo Semanal</span>
                      <div className="text-right">
                        <span className={`text-4xl font-black transition-colors ${isOverleveraged ? 'text-red-500' : 'text-green-400'}`}>${Math.round(weeklyPaymentConfirm)}</span>
                      </div>
                    </div>
                    <div className="space-y-4 font-mono text-sm mb-6">
                      <div className="flex justify-between pb-2 border-b border-gray-800">
                        <span className="text-gray-400">Total a liquidar a Azteca:</span>
                        <span className="font-bold text-white">${Math.round(totalToPay).toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                    <button onClick={handleSimulateAction} className="w-full py-4 rounded-xl font-bold text-lg transition-all bg-green-500 hover:bg-green-400 text-white shadow-lg active:scale-95">Tramitar Préstamo Mismo Día</button>
                  </div>

                  <div className="bg-gray-800">
                    <button onClick={() => setShowDetails(!showDetails)} className="w-full py-4 px-6 flex justify-between items-center text-gray-300 hover:text-white hover:bg-gray-700 transition border-t border-gray-600 bg-gray-900/50 outline-none">
                      <span className="font-bold text-sm tracking-wide">Desglose Técnico y Legal</span>
                      <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {showDetails && (
                      <div className="p-6 bg-slate-800 text-sm border-t border-slate-700 text-slate-300 animate-in slide-in-from-top-2">
                        <ul className="space-y-3 font-mono">
                          <li className="flex justify-between"><span className="text-slate-400">Capital Prestado:</span> <span className="text-white">${amount.toLocaleString('es-MX')}</span></li>
                          <li className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">Intereses Totales Brutos:</span> <span className="text-yellow-400">+${Math.round(totalInterest).toLocaleString('es-MX')}</span></li>
                          <li className="flex justify-between pt-1"><span className="text-slate-400">Tasa de Interés Fija Anual:</span> <span className="text-blue-300">{(annualInterestRate * 100).toFixed(1)}%</span></li>
                          <li className="flex justify-between"><span className="text-slate-400">CAT Promedio (Sin IVA):</span> <span className="text-blue-300 font-bold">~72.4%</span></li>
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
