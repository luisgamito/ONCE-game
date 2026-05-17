// TEXTOS EN ESPAÑOL
// ============================================================
const _lang = 'es';

const LANG = {
  es: {
    tagline: 'Football Manager',
    newGame: 'NUEVO JUEGO',
    continue: 'CONTINUAR',
    setupTitle: 'Crea tu Club',
    setupSub: 'Define tu identidad antes de empezar',
    clubName: 'Nombre del Club',
    clubAbbr: 'Abreviatura (3 letras)',
    teamColor: 'Color del equipo',
    startDivision: 'División de inicio',
    div1Name: 'PRIMERA DIVISIÓN',
    div1Desc: 'Calidad media: 78<br>Presupuesto: 8M<br>Élite directa',
    div2Name: 'SEGUNDA DIVISIÓN',
    div2Desc: 'Calidad media: 65<br>Presupuesto: 2M<br>Asciende a Primera',
    formation: 'Formación inicial',
    tactic: 'Táctica base',
    back: '← VOLVER',
    createClub: 'CREAR CLUB →',
    navHome: '🏠 INICIO',
    navSquad: '👥 PLANTILLA',
    navLeague: '🏆 LIGA',
    navCup: '🏅 COPA',
    navTeams: '🔍 EQUIPOS',
    navStats: '📊 ESTADÍSTICAS',
    navMarket: '💰 MERCADO',
    navHelp: '❓ AYUDA',
    abandon: 'ABANDONAR',
    tacTikitaka: 'Tiki-Taka',
    tacPossession: 'Posesión',
    tacPositional: 'Juego de posición',
    tacVertical: 'Vertical',
    tacGegenpressing: 'Gegenpressing',
    tacPressing: 'Presión Alta',
    tacCounter: 'Contraataque',
    tacBlock: 'Bloque Bajo',
    tacParking: 'Bloque Bajo',
    tacDirect: 'Juego Directo',
    tacWing: 'Juego por Bandas',
    tacBalanced: 'Equilibrado',
    budget: 'PRESUPUESTO',
    season: 'Temporada',
    matchday: 'Jornada',
    squad: 'Plantilla',
    starters: 'TITULARES',
    bench: 'SUPLENTES / BANQUILLO',
    injured: 'LESIONADO',
    fresh: 'FRESCO',
    tired: 'CANSADO',
    exhausted: 'AGOTADO',
    starter: '▶ TITULAR',
    sub: 'SUPLENTE',
    noContract: 'Sin contrato',
    fireBtn: '✕ RESCINDIR CONTRATO',
    fireConfirm: (name, amt) => `¿Confirmas la rescisión de ${name} por ${fmt(amt)}?`,
    fireSuccess: (name, amt, budget) => `${name} ha abandonado el club. Compensación pagada: ${fmt(amt)}. Presupuesto: ${fmt(budget)}`,
    fireNoFunds: amt => `No tienes presupuesto suficiente para pagar la compensación (${fmt(amt)}).`,
    fireNeedSub: 'No puedes despedir a un titular si no tienes suficientes jugadores.',
    negotiate: 'NEGOCIAR',
    marketValue: 'Valor de mercado',
    yourOffer: 'Tu oferta',
    sendOffer: 'ENVIAR OFERTA',
    cancel: 'CANCELAR',
    closed: 'CERRADO',
    attemptsLeft: n => `Intentos restantes: ${n}`,
    negPending: 'Ajusta tu oferta y envíala al club vendedor.',
    negAccepted: (name, amt) => `✓ ¡Oferta aceptada! ${name} se une a tu equipo por ${fmt(amt)}.`,
    negCounter: amt => `↔ Contraoferta: ${fmt(amt)}.`,
    negLow: '↔ Oferta demasiado baja.',
    negRejected: name => `✗ Negociaciones cerradas por ${name}.`,
    negTooLow: '✗ Oferta demasiado baja.',
    negNoAttempts: '✗ Sin más intentos.',
    negNoFunds: 'No tienes presupuesto suficiente.',
    signed: (name, amt, budget) => `${name} fichado por ${fmt(amt)}. Presupuesto restante: ${fmt(budget)}`,
    signingDone: '✓ FICHAJE CERRADO',
    marketClosed: 'El mercado de fichajes está cerrado.',
    window: 'VENTANA DE FICHAJES',
    windowClosed: 'VENTANA CERRADA',
    windowPre: 'VENTANA PRE-TEMPORADA',
    windowWinter: 'MERCADO DE INVIERNO',
    windowClosedDesc: jorLeft => `El mercado está cerrado. Próxima ventana en ${jorLeft} jornada${jorLeft !== 1 ? 's' : ''}.`,
    available: n => `${n} jugador${n !== 1 ? 'es' : ''} disponible${n !== 1 ? 's' : ''}`,
    offerReceived: '💰 OFERTA RECIBIDA',
    saleComplete: '✓ VENTA REALIZADA',
    sold: (name, rival, amt, budget) => `${name} vendido a ${rival} por ${fmt(amt)}. Presupuesto: ${fmt(budget)}`,
    contractSection: 'GESTIÓN DE CONTRATO',
    contractText: (name, amt) => `Rescindir el contrato de <strong>${name}</strong> supone una compensación de <strong style="color:var(--yellow)">${fmt(amt)}</strong>.`,
    seasonStats: 'Estadísticas de temporada',
    personality: 'Personalidad',
    nextMatch2: 'Próximo Partido',
    recentResults: 'Últimos Resultados',
    leaguePos: 'Posición en la Liga',
    leagueTable: 'Clasificación',
    topScorers: 'Máximos Goleadores',
    mySquad: 'Mi Plantilla',
    finalResult: 'Resultado Final',
    ratings: 'Valoraciones',
    matchStats: 'Estadísticas del Partido',
    continueBtn: 'CONTINUAR →',
    nextSeason: 'SIGUIENTE TEMPORADA →',
    endOfSeason: 'Fin de temporada',
    playMatch: '▶ JUGAR PARTIDO',
    tacticLabel: 'TÁCTICA',
    formationLabel: 'FORMACIÓN',
    budgetLabel: 'PRESUPUESTO DISPONIBLE',
    availablePlayers: 'Jugadores Disponibles',
    substitution: 'SUSTITUCIÓN',
    subChoose: 'Elige al jugador que entra:',
    injury: (name, type, j) => `🩹 LESIÓN — ${name}: ${type} (${j} jornada${j !== 1 ? 's' : ''})`,
    tacticChanged: name => `📋 Cambio táctico: ${name}`,
    faqTitle: '❓ AYUDA',
    changelogTitle: 'HISTORIAL DE CAMBIOS',
    tacDescTikitaka:      'Posesión total con presión inmediata tras pérdida. Mucha movilidad, pases cortos.',
    tacDescPossession:    'Circulación corta y paciente, dominio del balón, espera abrir huecos.',
    tacDescPositional:    'Ocupación ordenada de zonas. Atrae el press y libera al hombre libre.',
    tacDescVertical:      'Posesión ágil con verticalización rápida. Pocos toques, mucho movimiento al espacio.',
    tacDescGegenpressing: 'Recuperación inmediata tras pérdida con presión asfixiante. Demanda físico extremo.',
    tacDescPressing:      'Línea alta y presión constante en campo rival. Recupera arriba y juega rápido.',
    tacDescCounter:       'Bloque medio-bajo. Defiende ordenado, sale en transición rápida hacia los extremos.',
    tacDescBlock:         'Defensa muy profunda y compacta. Difícil de superar pero ofensivamente limitada.',
    tacDescParking:       'Defensa muy profunda y compacta. Difícil de superar pero ofensivamente limitada.',
    tacDescDirect:        'Balones largos rápidos hacia delanteros físicos. Estilo simple y agresivo.',
    tacDescWing:          'Construcción hacia los extremos, centros constantes al área para los puntas.',
    tacDescBalanced:      'Sin extremos. Juego equilibrado entre defensa, posesión y transición.',
    ctxStarter:          n => `Titular · ${n}`,
    ctxSub:              n => `Suplente · ${n}`,
    ctxToBench:          '↓ Pasar al banquillo',
    ctxToBenchNoSubs:    '↓ Banquillo (sin suplentes)',
    ctxSwapWith:         'Intercambiar con:',
    ctxReplaceWith:      'Reemplazar por:',
    ctxSubstituteFor:    'Sustituir a:',
    ctxAddToSquad:       '↑ Añadir al once inicial',
    ctxViewProfile:      '📋 Ver ficha del jugador',
    ctxListForSale:      '💰 Ofrecer al mercado',
    ctxEditListing:      '💰 En venta — editar precio',
    ctxUnavailable:      'No disponible para el próximo partido',
    ctxInjured:          j => `🩹 Lesionado (${j}) — reemplazar:`,
    ctxSuspended:        j => `🟥 Sancionado (${j}) — reemplazar:`,
    ctxNoSubs:           'Sin suplentes disponibles',
    alertInjuredInXI:    n => `🩹 ${n} lesionado${n>1?'s':''} en el 11`,
    alertSuspendedInXI:  n => `🟥 ${n} sancionado${n>1?'s':''} en el 11`,
    alertExpiringCtrs:   n => `⚠️ ${n} contrato${n>1?'s':''} por expirar`,
    benchEmpty:          'Banquillo vacío.',
    warnInXI:            'no disponibles en el once',
    matchdayLabel:       j => j === 0 ? 'Pretemporada' : `Jornada ${j}`,
    matchdayShort:       j => j === 0 ? 'Pre' : `J${j}`,
    roundLabel:          'Ronda',
    competition:         'Competición',
    nextMatch:           '◀ PRÓXIMA',
    played:              '✓ Jugada',
    marketClosed2:       'El mercado de fichajes está cerrado.',
    wageBill:            w => `${w}/año`,
    wageUsed:            (b,pct) => `Usado: ${b}/año (${pct}%)`,
    wageMassSalary:      '⚠️ Masa salarial',
    listingTitle:        'OFRECER AL MERCADO',
    listingConfirm:      (n,p) => `${n} ofrecido al mercado por ${p}. Puedes recibir ofertas durante la ventana.`,
    listingWithdraw:     n => `${n} ya no está en el mercado.`,
    listingOffered:      '📢 JUGADOR OFRECIDO',
    listingWithdrawn:    'Oferta retirada',
    listingDesc:         'Los equipos rivales pueden hacer ofertas durante la ventana de fichajes.',
    listingMin:          'Precio mínimo',
    listingOffer:        '📢 OFRECER',
    listingRetract:      '✕ RETIRAR',
    listingAlready:      p => `⚠️ Ya está ofrecido a ${p}. Puedes cambiar el precio o retirar la oferta.`,
    recentLevelUp:       (g,j) => `↑ Mejora reciente — media +${g} en la jornada ${j}`,
    contract:            'CONTRATO',
    contractRenew:       '🔄 RENEGOCIAR',
    contractRelease:     '✕ RESCINDIR',
    contractOffer:       '💰 OFRECER',
    contractEditOffer:   '💰 EDITAR OFERTA',
    contractListed:      p => `💰 Ofrecido al mercado — precio mínimo: ${p}`,
    offsideOf:           n => `Fuera de juego de ${n}`,
    unavailableInXI:     n => `No puedes jugar el partido. Debes reemplazar:\n\n${n}\n\nVe a Plantilla → pulsa sobre el jugador para sustituirlo.`,
    notEnoughPlayers:    n => `No tienes suficientes jugadores disponibles (${n}/11). Demasiadas bajas.`,
    wagesPaid:           'Nómina pagada:',
    leaguePrize:         'Premio de liga:',
    transferBudget:      'Presupuesto fichajes:',
    wageBudgetLabel:     'Presupuesto salarial:',
    expiredContracts:    'CONTRATOS EXPIRADOS',
    expiredDesc:         ns => `${ns} han abandonado el club al terminar su contrato.`,
    warned:              'Amonestado',
    duration:            'Duración',
  }
};

function t(key, ...args) {
  const val = LANG.es[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

function divName(name) { return name; }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' && el.type !== 'button') {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  });
  const activePanel = document.querySelector('.hub-panel.active');
  if (activePanel) {
    const id = activePanel.id;
    if (id === 'panel-faq') renderFaq();
    if (id === 'panel-squad') renderSquad();
    if (id === 'panel-transfers') renderTransferList();
    if (id === 'panel-teams') renderTeamsPanel();
  }
}

function syncTacticsLang() {
  const map = {
    tikitaka:'tacTikitaka', possession:'tacPossession', positional:'tacPositional',
    vertical:'tacVertical', gegenpressing:'tacGegenpressing', pressing:'tacPressing',
    counter:'tacCounter', parking:'tacParking', direct:'tacDirect',
    wing:'tacWing', balanced:'tacBalanced'
  };
  const descMap = {
    tikitaka:'tacDescTikitaka', possession:'tacDescPossession', positional:'tacDescPositional',
    vertical:'tacDescVertical', gegenpressing:'tacDescGegenpressing', pressing:'tacDescPressing',
    counter:'tacDescCounter', parking:'tacDescParking', direct:'tacDescDirect',
    wing:'tacDescWing', balanced:'tacDescBalanced'
  };
  Object.keys(map).forEach(k => {
    if (!TACTICS_CFG[k]) return;
    TACTICS_CFG[k].name = t(map[k]);
    TACTICS_CFG[k].desc = t(descMap[k]);
  });
}
