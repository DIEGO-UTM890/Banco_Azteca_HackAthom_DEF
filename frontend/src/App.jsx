import React, { useState, useEffect } from 'react';

function App() {
  // Estado general de Navegación 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showStoryMode, setShowStoryMode] = useState(true); // <--- NUEVO ESTADO PARA EL VERTICAL SLICE
  const [storyStep, setStoryStep] = useState(1); // 1: Hook, 2: Trampa, 3: Victoria

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  // ==========================================
  // FLUJO DE DEMO: VERTICAL SLICE (EL MODO HISTORIA)
  // ==========================================
  if (isLoggedIn && showStoryMode) {
    return (
      <div className="min-h-screen font-sans flex flex-col justify-center items-center overflow-hidden transition-all duration-700">

        {/* PASO 1: EL GANCHO (MISIÓN) */}
        {storyStep === 1 && (
          <div className="bg-gray-50 min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-gray-100">
              <div className="bg-green-600 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">💻</div>
                <h2 className="text-sm font-black text-green-200 tracking-widest uppercase mb-2">Misión Inaugural</h2>
                <h1 className="text-3xl font-black text-white leading-tight">Configura tu Setup para la Universidad</h1>
              </div>
              <div className="p-8">
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">Necesitas urgentemente una nueva Laptop cotizada en <strong className="text-black">$10,000 MXN</strong>. Tienes tu crédito Azteca disponible. ¿Cómo vas a financiar esta compra?</p>

                <div className="space-y-4">
                  {/* BOTÓN TRAMPA */}
                  <button
                    onClick={() => setStoryStep(2)}
                    className="w-full relative group bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-emerald-500 hover:bg-emerald-100 p-6 rounded-2xl text-left transition-all active:scale-95 shadow-md flex items-center justify-between"
                  >
                    <div>
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">✨ OPCIÓN CÓMODA</span>
                      <h3 className="text-xl font-black text-gray-900">Un pago chiquito y relajado</h3>
                      <p className="text-sm text-gray-600 mt-1">Solo paga <strong className="text-emerald-700">$150 pesitos</strong> a la semana (a larguísimas 120 semanas).</p>
                    </div>
                  </button>

                  {/* BOTÓN CORRECTO */}
                  <button
                    onClick={() => setStoryStep(3)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-400 p-6 rounded-2xl text-left transition-all active:scale-95 flex items-center justify-between group"
                  >
                    <div>
                      <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-md mb-2 inline-block">OPCIÓN EXIGENTE</span>
                      <h3 className="text-xl font-bold text-gray-800">Compromiso Financiero</h3>
                      <p className="text-sm text-gray-500 mt-1">Paga cuotas de <strong className="text-gray-800">$850 a la semana</strong> para terminar en solo 13 semanas.</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: LA CONSECUENCIA DE LA MALA DECISIÓN */}
        {storyStep === 2 && (
          <div className="bg-red-950 min-h-screen w-full flex flex-col items-center justify-center p-4 relative">
            {/* Patrón de peligro */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }}></div>

            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl shadow-red-900/50 p-8 text-center animate-in zoom-in-95 duration-300 relative z-10 border-4 border-red-600">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-5xl mx-auto mb-6">⚠️</div>
              <h2 className="text-3xl font-black text-red-600 mb-2">¡Asfixia Financiera Crítica!</h2>
              <p className="text-lg text-gray-700 mb-6 font-medium">Buscando pagar lo "mínimo posible", los intereses compuestos te han devorado.</p>

              <div className="bg-red-50 p-4 rounded-xl text-left mb-8 border border-red-100">
                <p className="text-red-800 mb-2">Por tu Laptop de $10,000 terminarías pagando <strong>$18,000</strong> en total.</p>
                <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 w-full h-full"></div>
                </div>
                <p className="text-xs text-red-600 mt-2 font-bold text-center">¡Esa es una pésima decisión crediticia a largo plazo!</p>
              </div>

              <button
                onClick={() => setStoryStep(1)}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Analizar la Lección y Volver a Intentar
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: LA RECOMPENSA (DECISIÓN CORRECTA) */}
        {storyStep === 3 && (
          <div className="bg-emerald-900 min-h-screen w-full flex flex-col items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-100 duration-700 border-4 border-emerald-500 relative overflow-hidden">

              {/* Confeti estético */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-100 to-transparent"></div>

              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-5xl mx-auto mb-6 relative z-10">💎</div>
              <h2 className="text-3xl font-black text-emerald-600 mb-2 relative z-10">¡Decisión Financiera Maestra!</h2>
              <p className="text-gray-700 mb-6 font-medium relative z-10">Un pago exigente te acaba de ahorrar muchísima deuda y meses de trabajo extra. Ese es el poder de liquidar a corto plazo.</p>

              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-2xl text-left text-white mb-8 relative z-10 shadow-xl transform hover:scale-105 transition-transform cursor-default border border-blue-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl animate-pulse">🏅</div>
                  <div>
                    <h4 className="font-black text-lg text-yellow-400">Premio: Cliente de Primer Nivel</h4>
                    <p className="text-blue-200 text-xs">+500 PX  |  +80 Score Azteca</p>
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  Traductor Bancario Real: Comportarte así frente a un banco garantiza que tu primera Tarjeta Física tenga un <strong className="text-yellow-400">límite crediticio 20% más alto</strong> y tasas preferenciales.
                </p>
              </div>

              <button
                onClick={() => {
                  // Entregar recompensa e inyectar el juego!
                  const bonoXp = 500;
                  const bonoScore = 80;
                  const nuevaDeuda = 11050; // Capital + poquito interes por pagar rapido
                  const nuevoPago = 850;

                  // Guardamos en la base de datos la decisión
                  syncDataToDB(xp + bonoXp, score + bonoScore, walletMoney, currentDebt + nuevaDeuda, minWeeklyPayment + nuevoPago);

                  // Rompemos el modo historia
                  setShowStoryMode(false);
                  setActiveTab('dashboard');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-5 px-6 rounded-xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.4)] active:scale-95 relative z-10"
              >
                Asumir Misión y Entrar a mi Banco
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // PANTALLA DE LOGIN
  // ==========================================
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

  // ==========================================
  // PANTALLA PRINCIPAL (Lo que se programó originalmente)
  // ==========================================

  // LOGICA DEL SIMULADOR LIBRE U OTRAS HERRAMIENTAS
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
    if (depositNum < 100) { alert("Mínimo $100"); return; }
    syncDataToDB(xp + 10, score, walletMoney + depositNum, currentDebt, minWeeklyPayment);
    alert(`¡Depósito exitoso! Añadidos $${depositNum.toLocaleString('es-MX')} (+10 XP)`);
    setActiveTab('dashboard');
  };

  const injectLoanToProfile = (capitalSolicitado, deudaTotal, pagoSemanalAsignado) => {
    return {
      newWallet: walletMoney + capitalSolicitado,
      newDebt: currentDebt + deudaTotal,
      newWeeklyPayment: minWeeklyPayment + Math.round(pagoSemanalAsignado)
    };
  };

  // Botones del Simulador Sandbox (Tab 3)
  const acceptRescuePlan = () => {
    setWeeks(52); setShowCopilot(false); setUnderstandRisk(false);
    const adjustedTotal = amount + (amount * (annualInterestRate * (52 / 52)));
    const adjustedWeeklyInfo = adjustedTotal / 52;
    const { newWallet, newDebt, newWeeklyPayment } = injectLoanToProfile(amount, adjustedTotal, adjustedWeeklyInfo);
    syncDataToDB(xp + 100, score + 15, newWallet, newDebt, newWeeklyPayment);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RESCATE_ACEPTADO');
    alert("¡Rescate Exitoso guardado en la nube! Tu decisión fue recompensada.");
    setActiveTab('dashboard');
  };

  const forceBadLoan = () => {
    setShowCopilot(false); setUnderstandRisk(false);
    const { newWallet, newDebt, newWeeklyPayment } = injectLoanToProfile(amount, totalToPay, weeklyPaymentConfirm);
    syncDataToDB(xp, score - 80, newWallet, newDebt, newWeeklyPayment);
    saveSimulationTransaction('CREDITO_PERSONAL', 'RIESGO_ASUMIDO');
    alert("Préstamo riesgoso registrado y dinero depositado en billetera.");
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
      alert("¡Simulación saludable! Capital depositado en tu billetera.");
      setActiveTab('dashboard');
    }
  };

  // Abonos de Facturas
  const simulatePayment = () => {
    const abono = Number(paymentInput);
    if (currentDebt <= 0) return alert("¡No tienes ninguna deuda!");
    if (abono < minWeeklyPayment && abono < currentDebt) return alert(`Abono mínimo: $${minWeeklyPayment}`);

    const realPayment = Math.min(abono, currentDebt);

    if (walletMoney >= realPayment && currentDebt > 0) {
      const newWallet = walletMoney - realPayment;
      const newDebt = currentDebt - realPayment;
      const extraPuntos = realPayment > minWeeklyPayment ? 15 : 0;

      let newMinWeekly = minWeeklyPayment;
      if (newDebt <= 0) {
        newMinWeekly = 0; setPaymentInput(0);
        alert("¡LIQUIDASTE TU DEUDA POR COMPLETO! Excelente historial Azteca.");
      } else {
        alert(realPayment > minWeeklyPayment ? `¡Abono adelantado genial! Ahorras intereses. (+${5 + extraPuntos} PTS SCORE)` : "Pago registrado a tiempo.");
      }
      syncDataToDB(xp + 25 + extraPuntos, score + 5 + extraPuntos, newWallet, newDebt, newMinWeekly);
    } else {
      alert("No tienes saldo suficiente en tu Billetera.");
    }
  };

  const missPayment = () => {
    if (currentDebt > 0) {
      syncDataToDB(xp, score - 35, walletMoney, currentDebt, minWeeklyPayment);
      alert("⚠️ ALERTA: Has omitido un pago activo. Se reporta como Morosidad de Primer Nivel.");
    } else {
      alert("No tienes deudas.");
    }
  };

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
              <button onClick={() => { setActiveTab('simulator') }} className={`px-2 py-2 rounded-md font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'simulator' ? 'bg-green-100 text-green-800' : 'text-gray-500 hover:bg-gray-100'}`}>Simulador Sandbox</button>
            </nav>
            <div className="flex items-center space-x-3">
              <button onClick={() => setIsLoggedIn(false)} className="text-xs font-bold text-gray-400 hover:text-red-500 mr-2 hidden sm:block">Salir</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* DASHBOARD TAB */}
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
                      <p className="text-sm text-gray-500 mb-1 font-semibold uppercase">Deuda Activa (Crédito)</p>
                      <p className="text-3xl font-bold text-red-500 mb-3">${currentDebt.toLocaleString('es-MX')}</p>
                      <div className="flex justify-between text-sm py-1 border-b border-gray-200">
                        <span className="text-gray-600">Base Semanal Requerida:</span> <span className="font-bold text-gray-900">${minWeeklyPayment}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 pt-2">
                        <span className="text-gray-600">Semanas faltantes (aprox):</span> <span className="font-bold text-gray-900">{Math.ceil(currentDebt / minWeeklyPayment) || 0}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-7/12 flex flex-col justify-center">
                      <label className="text-sm font-bold text-gray-700 mb-2">Abono Inteligente a Capital</label>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-bold">$</span>
                          <input type="number" min={Math.min(minWeeklyPayment, currentDebt)} max={currentDebt} value={paymentInput} onChange={(e) => setPaymentInput(Number(e.target.value))} className="w-full font-bold text-xl bg-white border border-gray-300 rounded-xl py-3 pl-8 pr-4 focus:ring-green-500 focus:border-green-500 outline-none" />
                        </div>
                        <button onClick={simulatePayment} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95">Pagar Deuda</button>
                      </div>

                      <button onClick={missPayment} className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold py-2 px-4 rounded-lg transition-colors w-full text-sm mt-2 border border-transparent">
                        Saltar Pago e Ignorar Deuda (Daño de Score)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-200 text-center">
                    <p className="font-bold text-lg mb-2">¡Todo al día!</p>
                    <p className="text-sm">Explora el <button onClick={() => setActiveTab('simulator')} className="underline font-bold">Simulador Abierto</button> para probar escenarios salvajes bajo tu propia responsabilidad.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-center text-center">
                <p className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-xs">Prestigio de la Cuenta Algorítmica</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">Nivel Universitario</p>
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

        {/* INGRESOS TAB */}
        {activeTab === 'ingresos' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden max-w-2xl mx-auto mt-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"><span className="text-3xl">💵</span></div>
                <h2 className="text-2xl font-black">Cobro de Nómina / Depósito</h2>
              </div>
              <div className="p-8">
                <label className="block text-center text-sm font-bold text-gray-600 uppercase tracking-widest mb-6">Monto a depositar en BD</label>
                <div className="flex justify-center gap-2 mb-8">
                  <div className="relative w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-green-700 font-black text-2xl">$</span>
                    <input type="number" min="100" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} className="w-full font-black text-4xl bg-gray-50 border-2 border-green-200 text-gray-800 rounded-2xl py-4 pl-12 pr-4 text-center" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <button onClick={() => setDepositAmount(3500)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">+ Nómina</button>
                  <button onClick={() => setDepositAmount(5000)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">+ $5,000</button>
                  <button onClick={() => setDepositAmount(10000)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">+ $10,000</button>
                </div>
                <button onClick={handleSimulateDeposit} className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xl py-4 rounded-xl shadow-lg">Confirmar Depósito a Billetera</button>
              </div>
            </div>
          </div>
        )}

        {/* SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Modo Sandbox Abierto</h1>
            </div>

            {showCopilot && (
              <div className="mb-8 p-6 bg-slate-900 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-6 border border-slate-700 animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-blue-400">🚨 INTERVENCIÓND DE RIESGO 🚨</h3>
                <p className="text-slate-200">El pago de <strong className="text-red-400">${Math.round(weeklyPaymentConfirm)}/sem</strong> excede el límite del 40% de ingresos sugerido.</p>
                <div className="bg-slate-800 p-4 rounded-lg w-full max-w-sm">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 accent-red-500" checked={understandRisk} onChange={(e) => setUnderstandRisk(e.target.checked)} />
                    <span className="text-xs text-slate-300 text-left">Comprendo el riesgo altísimo al que me comprometo. Asumo daños.</span>
                  </label>
                </div>
                <div className="flex gap-4 w-full">
                  <button onClick={acceptRescuePlan} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">Recibir Rescate (Sano)</button>
                  <button onClick={forceBadLoan} disabled={!understandRisk} className={`flex-1 font-bold py-3 rounded-xl ${understandRisk ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-500'}`}>Asumir Deuda Impagable</button>
                </div>
              </div>
            )}

            <div className={`space-y-6 ${showCopilot ? 'opacity-50 blur-sm pointer-events-none' : ''}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <label className="font-semibold text-gray-600 text-sm">Monto</label>
                <input type="range" min="1000" max="50000" step="100" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setShowCopilot(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 mt-2" />
                <p className="font-black text-2xl text-green-600 mt-2">${amount}</p>

                <label className="font-semibold text-gray-600 text-sm mt-6 block">Semanas a Estirar</label>
                <input type="range" min="13" max="154" step="1" value={weeks} onChange={(e) => { setWeeks(Number(e.target.value)); setShowCopilot(false); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 mt-2" />
                <p className="font-black text-2xl text-gray-800 mt-2">{weeks} semanas</p>
              </div>

              <div className="bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-gray-400 font-medium">Ticket de Abono Estimado</span>
                    <span className={`text-4xl font-black ${isOverleveraged ? 'text-red-500' : 'text-green-400'}`}>${Math.round(weeklyPaymentConfirm)}</span>
                  </div>
                  <button onClick={handleSimulateAction} className="w-full py-4 rounded-xl font-bold bg-green-500 text-white active:scale-95">Solicitar e inyectar a mi Billetera</button>
                </div>
                <div className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between text-xs text-slate-400">
                  <span>Int. Anual: {(annualInterestRate * 100).toFixed(0)}%</span>
                  <span>Pagando Total: ${Math.round(totalToPay).toLocaleString()}</span>
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
