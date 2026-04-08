import React, { useState, useEffect } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [loginUser, setLoginUser] = useState('7712345678');
  const [loginPass, setLoginPass] = useState('123456');

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Cargando...');
  const [xp, setXp] = useState(0);
  const [score, setScore] = useState(680);

  const weeklyIncome = 3500;
  const monthlyIncome = weeklyIncome * 4;

  const [walletMoney, setWalletMoney] = useState(4000);
  const [currentDebt, setCurrentDebt] = useState(0);
  const [minWeeklyPayment, setMinWeeklyPayment] = useState(0);
  const [paymentInput, setPaymentInput] = useState(0);

  const [depositAmount, setDepositAmount] = useState(3500);

  const [amount, setAmount] = useState(5000);
  const [weeks, setWeeks] = useState(52);
  const [showCopilot, setShowCopilot] = useState(false);
  const [understandRisk, setUnderstandRisk] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
          if (mainUser.finanzasSimuladas) {
            setWalletMoney(mainUser.finanzasSimuladas.billetera || 4000);
            setCurrentDebt(mainUser.finanzasSimuladas.deudaActiva || 0);
            setMinWeeklyPayment(mainUser.finanzasSimuladas.pagoMinimoSemanal || 0);
            setPaymentInput(mainUser.finanzasSimuladas.pagoMinimoSemanal || 0);
          }
        }
      } catch (error) {
        setUserName('Invitado Local');
      }
    };
    loadUserData();
  }, [isLoggedIn]);

  // AHORA SINCRONIZAMOS TANTO EL PROGRESO COMO LAS FINANZAS
  const syncDataToDB = async (newXp, newScore, newWallet, newDebt, newMinWeekly) => {
    setXp(newXp);
    setScore(newScore);
    setWalletMoney(newWallet);
    setCurrentDebt(newDebt);
    setMinWeeklyPayment(newMinWeekly);

    if (!userId) return;
    try {
      await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xpPuntos: newXp,
          scoreCrediticioSimulado: newScore,
          billetera: newWallet,
          deudaActiva: newDebt,
          pagoMinimoSemanal: newMinWeekly
        })
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

  const handleSimulateDeposit = () => {
    const depositNum = Number(depositAmount);
    if (depositNum < 100) {
      alert("El depósito mínimo para la simulación es de $100");
      return;
    }
    const newWallet = walletMoney + depositNum;
    const newXp = xp + 10;

    syncDataToDB(newXp, score, newWallet, currentDebt, minWeeklyPayment);
    alert(`¡Depósito exitoso guardado en Base de Datos! Se han añadido $${depositNum.toLocaleString('es-MX')} a tu Billetera Virtual. (+10 XP)`);
    setActiveTab('dashboard');
  };

  const injectLoanToProfile = (capitalSolicitado, deudaTotal, pagoSemanalAsignado) => {
    const newWallet = walletMoney + capitalSolicitado;
    const newDebt = currentDebt + deudaTotal;
    const newWeeklyPayment = minWeeklyPayment + Math.round(pagoSemanalAsignado);

    // Al pedir prestado no incrementaremos la XP aquí directamente, 
    // lo hacemos al confirmar en las funciones handleSimulateAction. 
    // Solo sincronizamos el dinero.
    return { newWallet, newDebt, newWeeklyPayment };
  };

  const acceptRescuePlan = () => {
    setWeeks(52);
    setShowCopilot(false);
    setUnderstandRisk(false);

    const adjustedInterest = amount * (annualInterestRate * (52 / 52));
    const adjustedTotal = amount + adjustedInterest;
    const adjustedWeeklyInfo = adjustedTotal / 52;

    const { newWallet, newDebt, newWeeklyPayment } = injectLoanToProfile(amount, adjustedTotal, adjustedWeeklyInfo);

    syncDataToDB(xp + 100, score + 15, newWallet, newDebt, newWeeklyPayment);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RESCATE_ACEPTADO');

    alert("¡Rescate Exitoso guardado en la nube! Tu decisión responsable fue recompensada.");
    setActiveTab('dashboard');
  };

  const forceBadLoan = () => {
    setShowCopilot(false);
    setUnderstandRisk(false);

    const { newWallet, newDebt, newWeeklyPayment } = injectLoanToProfile(amount, totalToPay, weeklyPaymentConfirm);

    syncDataToDB(xp, score - 80, newWallet, newDebt, newWeeklyPayment);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RIESGO_ASUMIDO');

    alert("Préstamo registrado. Tu Score Azteca acaba de colapsar severamente por endeudarte así.");
    setActiveTab('dashboard');
  };

  const handleSimulateAction = () => {
    if (isOverleveraged) {
      setShowCopilot(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const { newWallet, newDebt, newWeeklyPayment } = injectLoanToProfile(amount, totalToPay, weeklyPaymentConfirm);

      syncDataToDB(xp + 50, score, newWallet, newDebt, newWeeklyPayment);
      saveSimulationTransaction('CREDITO_PERSONAL', 'PAGO_SANO');

      alert("¡Simulación saludable guardada en Base de Datos! Préstamo activado.");
      setActiveTab('dashboard');
    }
  };

  const simulatePayment = () => {
    const abono = Number(paymentInput);
    if (currentDebt <= 0) {
      alert("¡No tienes ninguna deuda! ¡Disfruta tus finanzas libres!");
      return;
    }
    if (abono < minWeeklyPayment && abono < currentDebt) {
      alert(`El abono mínimo semanal de tu deuda actual es de $${minWeeklyPayment}.`);
      return;
    }
    const realPayment = Math.min(abono, currentDebt);

    if (walletMoney >= realPayment && currentDebt > 0) {
      const newWallet = walletMoney - realPayment;
      const newDebt = currentDebt - realPayment;

      const extraPuntos = realPayment > minWeeklyPayment ? 15 : 0;
      const newXp = xp + 25 + extraPuntos;
      const newScore = score + 5 + extraPuntos;

      let newMinWeekly = minWeeklyPayment;
      if (newDebt <= 0) {
        newMinWeekly = 0;
        setPaymentInput(0);
        alert("¡INCREÍBLE! 🎉 Has liquidado tu crédito en su totalidad. Se actualizó en MongoDB.");
      } else {
        alert(realPayment > minWeeklyPayment
          ? `¡Excelente! Abono sincronizado a la base de datos. (+${5 + extraPuntos} PTS SCORE)`
          : "Pago guardado en la nube. ¡Avanzas de nivel poco a poco!");
      }

      syncDataToDB(newXp, newScore, newWallet, newDebt, newMinWeekly);

    } else {
      alert("No tienes saldo suficiente en tu Billetera Virtual para este abono.");
    }
  };

  const missPayment = () => {
    if (currentDebt > 0) {
      syncDataToDB(xp, score - 35, walletMoney, currentDebt, minWeeklyPayment);
      alert("⚠️ ALERTA: Has omitido un pago activo de tu crédito. Esto fue registrado en la Base de Datos. Puntuación disminuida.");
    } else {
      alert("No tienes crédito qué omitir. ¡Sigue así!");
    }
  };

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
            <p className="text-xs text-center text-gray-400 mt-4">Todo lo que hagas aquí se guarda en MongoDB Atlas</p>
          </form>
        </div>
      </div>
    );
  }

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

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Tu Resumen Financiero</h1>
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

        {/* -------------------- TAB: INGRESOS -------------------- */}
        {activeTab === 'ingresos' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Simulador de Ingresos ("Payday")</h1>
              <p className="text-gray-600 mt-1">Carga dinero a tu billetera para pagar tus deudas y actualizar tu saldo en la Nube.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"><span className="text-3xl">💰</span></div>
                <h2 className="text-2xl font-black">Depósito de Efectivo / Nómina</h2>
              </div>

              <div className="p-8">
                <label className="block text-center text-sm font-bold text-gray-600 uppercase tracking-widest mb-6">Monto a depositar</label>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="relative w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-green-700 font-black text-2xl">$</span>
                    <input type="number" min="100" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} className="w-full font-black text-4xl bg-gray-50 border-2 border-green-200 text-gray-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-green-500 focus:border-green-500 outline-none text-center shadow-inner" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <button onClick={() => setDepositAmount(3500)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">+ $3,500 (Nómina)</button>
                  <button onClick={() => setDepositAmount(5000)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">+ $5,000</button>
                  <button onClick={() => setDepositAmount(10000)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition">+ $10,000</button>
                </div>

                <button onClick={handleSimulateDeposit} className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xl py-4 rounded-xl shadow-[0_10px_20px_rgba(22,163,74,0.3)] transition-transform active:scale-95">Confirmar Depósito a Billetera</button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: SIMULATOR -------------------- */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Simulador de Crédito Personal</h1>
            </div>

            {showCopilot && (
              <div className="mb-8 animate-in zoom-in duration-300 relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center">RIESGO DE ASFIXIA FINANCIERA</h3>
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-4">Has programado un pago de <strong className="text-red-400">${Math.round(weeklyPaymentConfirm)}/sem</strong>. Superas el riesgo bancario.</p>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 accent-red-500 cursor-pointer" checked={understandRisk} onChange={(e) => setUnderstandRisk(e.target.checked)} />
                      <span className="text-sm text-slate-300">Asumo el riesgo y penalización en BD.</span>
                    </label>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-64 flex flex-col space-y-3">
                  <button onClick={acceptRescuePlan} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl">Aceptar Rescate</button>
                  <button onClick={forceBadLoan} disabled={!understandRisk} className={`w-full py-3 px-4 rounded-xl font-bold ${understandRisk ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-700 text-slate-500'}`}>Forzar Aprobación</button>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${showCopilot ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <div className="mb-8">
                    <label className="font-semibold text-gray-600 text-sm uppercase">Monto a solicitar en efectivo</label>
                    <input type="range" min="1000" max="50000" step="100" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 mt-4" />
                    <p className="font-bold text-2xl text-green-600 text-center mt-2">${amount}</p>
                  </div>
                  <div className="mb-4">
                    <label className="font-semibold text-gray-600 text-sm uppercase">Plazo a pagar</label>
                    <input type="range" min="13" max="154" step="1" value={weeks} onChange={(e) => { setWeeks(Number(e.target.value)); setShowCopilot(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 mt-4" />
                    <p className="font-bold text-2xl text-gray-800 text-center mt-2">{weeks} semanas</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden sticky top-20">
                  <div className="px-8 pt-8 pb-6 border-b border-gray-700">
                    <p className="text-center text-gray-500 font-mono text-xs tracking-widest mb-6">TICKET DE SIMULACIÓN</p>
                    <div className="flex justify-between items-baseline mb-6">
                      <span className="text-gray-400 font-medium">Acuerdo Semanal</span>
                      <span className={`text-4xl font-black ${isOverleveraged ? 'text-red-500' : 'text-green-400'}`}>${Math.round(weeklyPaymentConfirm)}</span>
                    </div>
                    <button onClick={handleSimulateAction} className="w-full py-4 rounded-xl font-bold text-lg bg-green-500 hover:bg-green-400 text-white">Solicitar Depósito</button>
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
