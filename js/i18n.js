// INTERNACIONALIZACIÓN (i18n)
// ============================================================
let _lang = 'es';

const LANG = {
  es: {
    // Intro
    tagline: 'Football Manager',
    newGame: 'NUEVO JUEGO',
    continue: 'CONTINUAR',
    // Setup
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
    // Nav
    navHome: '🏠 INICIO',
    navSquad: '👥 PLANTILLA',
    navLeague: '🏆 LIGA',
    navCup: '🏅 COPA',
    navTeams: '🔍 EQUIPOS',
    navStats: '📊 ESTADÍSTICAS',
    navMarket: '💰 MERCADO',
    navHelp: '❓ AYUDA',
    // Match
    abandon: 'ABANDONAR',
    // Tactics
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
    // Dynamic strings used in JS
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
    fireNeedSub: 'No puedes despedir a un titular si no tienes suficientes jugadores para cubrir su puesto. Ficha antes un sustituto.',
    negotiate: 'NEGOCIAR',
    marketValue: 'Valor de mercado',
    yourOffer: 'Tu oferta',
    sendOffer: 'ENVIAR OFERTA',
    cancel: 'CANCELAR',
    closed: 'CERRADO',
    attemptsLeft: n => `Intentos restantes: ${n}`,
    negPending: 'Ajusta tu oferta y envíala al club vendedor.',
    negAccepted: (name, amt) => `✓ ¡Oferta aceptada! ${name} se une a tu equipo por ${fmt(amt)}.`,
    negCounter: amt => `↔ El club considera tu oferta insuficiente. Hacen una contraoferta de ${fmt(amt)}.`,
    negLow: '↔ Oferta demasiado baja. El club no está convencido, pero sigue abierto a negociar.',
    negRejected: name => `✗ Oferta rechazada. El club ha cerrado las negociaciones por ${name}.`,
    negTooLow: '✗ Oferta demasiado baja. El club está molesto, pero aún puedes intentarlo.',
    negNoAttempts: '✗ Sin más intentos. El club ha cancelado las negociaciones.',
    negNoFunds: 'No tienes presupuesto suficiente para esa oferta.',
    signed: (name, amt, budget) => `${name} fichado por ${fmt(amt)}. Presupuesto restante: ${fmt(budget)}`,
    signingDone: '✓ FICHAJE CERRADO',
    marketClosed: 'El mercado de fichajes está cerrado.',
    window: 'VENTANA DE FICHAJES',
    windowClosed: 'VENTANA CERRADA',
    windowPre: 'VENTANA PRE-TEMPORADA',
    windowWinter: 'MERCADO DE INVIERNO',
    windowPreDesc: 'La ventana de fichajes de pretemporada está abierta.',
    windowWinterDesc: 'El mercado de invierno está abierto (jornadas 16-17).',
    windowClosedDesc: jorLeft => `El mercado está cerrado. Próxima ventana en ${jorLeft} jornada${jorLeft !== 1 ? 's' : ''}.`,
    available: n => `${n} jugador${n !== 1 ? 'es' : ''} disponible${n !== 1 ? 's' : ''}`,
    offerReceived: '💰 OFERTA RECIBIDA',
    saleComplete: '✓ VENTA REALIZADA',
    sold: (name, rival, amt, budget) => `${name} vendido a ${rival} por ${fmt(amt)}. Presupuesto: ${fmt(budget)}`,
    contractSection: 'GESTIÓN DE CONTRATO',
    contractText: (name, amt) => `Rescindir el contrato de <strong style="color:var(--text)">${name}</strong> supone una compensación de <strong style="color:var(--yellow)">${fmt(amt)}</strong> (25% de su valor de mercado).`,
    lineupSection: 'GESTIÓN DE ALINEACIÓN',
    lineupInjured: '🩹 Jugador lesionado — no disponible para alinear.',
    lineupBench: '↓ PASAR AL BANQUILLO',
    lineupFull: name => `El 11 está completo. Elige qué titular sale para dar entrada a <strong style="color:var(--text)">${name}</strong>:`,
    lineupChoose: name => `Elige la posición donde alinear a <strong style="color:var(--text)">${name}</strong>:`,
    lineupAligned: (pos, n) => `Alineado como <strong style="color:var(--green)">${pos}</strong> en el puesto ${n}.`,
    benchNoSubs: 'No hay suplentes disponibles para cubrir la plaza.',
    seasonStats: 'Estadísticas de temporada',
    personality: 'Personalidad',
    nextMatch: 'Próximo Partido',
    recentResults: 'Últimos Resultados',
    leaguePos: 'Posición en la Liga',
    mySquad: 'Mi Plantilla',
    qualityEst: 'calidad general',
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
    // Tactic descriptions
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
    // Squad/lineup context menu
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
    ctxInjured:          j => `🩹 Lesionado (${j}j) — reemplazar:`,
    ctxSuspended:        j => `🟥 Sancionado (${j}j) — reemplazar:`,
    ctxNoSubs:           'Sin suplentes disponibles',
    // Alerts squad
    alertInjuredInXI:    n => `🩹 ${n} lesionado${n>1?'s':''} en el 11`,
    alertSuspendedInXI:  n => `🟥 ${n} sancionado${n>1?'s':''} en el 11`,
    alertExpiringCtrs:   n => `⚠️ ${n} contrato${n>1?'s':''} por expirar`,
    benchEmpty:          'Banquillo vacío.',
    // Squad rows
    warnInXI:            'no disponibles en el once',
    // Calendar
    matchdayLabel:       j => j === 0 ? 'Pretemporada' : `Jornada ${j}`,
    matchdayShort:       j => j === 0 ? 'Pre' : `J${j}`,
    roundLabel:          'Ronda',
    competition:         'Competición',
    nextMatch:           '◀ PRÓXIMA',
    played:              '✓ Jugada',
    // Market
    marketClosed2:       'El mercado de fichajes está cerrado.',
    wageBill:            w => `${w}/año`,
    wageUsed:            (b,pct) => `Usado: ${b}/año (${pct}%)`,
    wageMassSalary:      '⚠️ Masa salarial',
    // Listing
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
    // Player modal
    recentLevelUp:       (g,j) => `↑ Recent improvement — overall +${g} in matchday ${j}`,
    contract:            'CONTRATO',
    contractRenew:       '🔄 RENOVAR',
    contractRelease:     '✕ RESCINDIR',
    contractOffer:       '💰 OFRECER',
    contractEditOffer:   '💰 EDITAR OFERTA',
    contractListed:      p => `💰 Ofrecido al mercado — precio mínimo: ${p}`,
    // Match engine strings
    offsideOf:           n => `Fuera de juego de ${n}`,
    tacticChange:        n => `📋 Cambio táctico: ${n}`,
    // Warnings
    unavailableInXI:     n => `No puedes jugar el partido. Debes reemplazar:\n\n${n}\n\nVe a Plantilla → pulsa sobre el jugador para sustituirlo.`,
    notEnoughPlayers:    n => `No tienes suficientes jugadores disponibles (${n}/11). Demasiadas bajas.`,
    // Post-match
    wagesPaid:           'Nómina pagada:',
    leaguePrize:         'Premio de liga:',
    transferBudget:      'Presupuesto fichajes:',
    wageBudgetLabel:     'Presupuesto salarial:',
    expiredContracts:    'CONTRATOS EXPIRADOS',
    expiredDesc:         ns => `${ns} han abandonado el club al terminar su contrato.`,
    // HTML static
    nextMatch2:      'Próximo Partido',
    recentResults:   'Últimos Resultados',
    leaguePos:       'Posición en la Liga',
    leagueTable:     'Clasificación',
    topScorers:      'Máximos Goleadores',
    tacticLabel:     'TÁCTICA',
    seasonStats:     'Estadísticas de temporada',
    matchStats:      'Estadísticas del Partido',
    warned:          'Amonestado',
    duration:        'Duración',
  },

  en: {
    // Intro
    tagline: 'Football Manager',
    newGame: 'NEW GAME',
    continue: 'CONTINUE',
    // Setup
    setupTitle: 'Create your Club',
    setupSub: 'Define your identity before you start',
    clubName: 'Club Name',
    clubAbbr: 'Abbreviation (3 letters)',
    teamColor: 'Team colour',
    startDivision: 'Starting division',
    div1Name: 'FIRST DIVISION',
    div1Desc: 'Avg quality: 78<br>Budget: 8M<br>Top-flight straight away',
    div2Name: 'SECOND DIVISION',
    div2Desc: 'Avg quality: 65<br>Budget: 2M<br>Earn promotion to First',
    formation: 'Starting formation',
    tactic: 'Base tactic',
    back: '← BACK',
    createClub: 'CREATE CLUB →',
    // Nav
    navHome: '🏠 HOME',
    navSquad: '👥 SQUAD',
    navLeague: '🏆 LEAGUE',
    navCup: '🏅 CUP',
    navTeams: '🔍 TEAMS',
    navStats: '📊 STATS',
    navMarket: '💰 MARKET',
    navHelp: '❓ HELP',
    // Match
    abandon: 'ABANDON',
    // Tactics
    tacTikitaka: 'Tiki-Taka',
    tacPossession: 'Possession',
    tacPositional: 'Positional Play',
    tacVertical: 'Vertical',
    tacGegenpressing: 'Gegenpressing',
    tacPressing: 'High Press',
    tacCounter: 'Counter-attack',
    tacBlock: 'Low Block',
    tacParking: 'Low Block',
    tacDirect: 'Direct Play',
    tacWing: 'Wing Play',
    tacBalanced: 'Balanced',
    // Dynamic strings
    budget: 'BUDGET',
    season: 'Season',
    matchday: 'Matchday',
    squad: 'Squad',
    starters: 'STARTERS',
    bench: 'SUBSTITUTES / BENCH',
    injured: 'INJURED',
    fresh: 'FRESH',
    tired: 'TIRED',
    exhausted: 'EXHAUSTED',
    starter: '▶ STARTER',
    sub: 'SUBSTITUTE',
    noContract: 'No contract',
    fireBtn: '✕ TERMINATE CONTRACT',
    fireConfirm: (name, amt) => `Confirm termination of ${name}'s contract for ${fmt(amt)}?`,
    fireSuccess: (name, amt, budget) => `${name} has left the club. Compensation paid: ${fmt(amt)}. Budget: ${fmt(budget)}`,
    fireNoFunds: amt => `Not enough budget to pay the compensation (${fmt(amt)}).`,
    fireNeedSub: 'Cannot release a starter without enough players to fill their spot. Sign a replacement first.',
    negotiate: 'NEGOTIATE',
    marketValue: 'Market value',
    yourOffer: 'Your offer',
    sendOffer: 'SEND OFFER',
    cancel: 'CANCEL',
    closed: 'CLOSED',
    attemptsLeft: n => `Attempts left: ${n}`,
    negPending: 'Adjust your offer and send it to the selling club.',
    negAccepted: (name, amt) => `✓ Offer accepted! ${name} joins your club for ${fmt(amt)}.`,
    negCounter: amt => `↔ The club finds your offer too low. They counter with ${fmt(amt)}.`,
    negLow: '↔ Offer too low. The club is unconvinced but still open to negotiation.',
    negRejected: name => `✗ Offer rejected. The club has closed negotiations for ${name}.`,
    negTooLow: '✗ Offer too low. The club is annoyed, but you can still try.',
    negNoAttempts: '✗ No more attempts. The club has ended negotiations.',
    negNoFunds: 'Not enough budget for that offer.',
    signed: (name, amt, budget) => `${name} signed for ${fmt(amt)}. Remaining budget: ${fmt(budget)}`,
    signingDone: '✓ SIGNING COMPLETE',
    marketClosed: 'The transfer window is closed.',
    window: 'TRANSFER WINDOW',
    windowClosed: 'WINDOW CLOSED',
    windowPre: 'PRE-SEASON WINDOW',
    windowWinter: 'WINTER MARKET',
    windowPreDesc: 'The pre-season transfer window is open.',
    windowWinterDesc: 'The winter market is open (matchdays 16-17).',
    windowClosedDesc: jorLeft => `Market is closed. Next window in ${jorLeft} matchday${jorLeft !== 1 ? 's' : ''}.`,
    available: n => `${n} player${n !== 1 ? 's' : ''} available`,
    offerReceived: '💰 BID RECEIVED',
    saleComplete: '✓ SALE COMPLETE',
    sold: (name, rival, amt, budget) => `${name} sold to ${rival} for ${fmt(amt)}. Budget: ${fmt(budget)}`,
    contractSection: 'CONTRACT MANAGEMENT',
    contractText: (name, amt) => `Terminating <strong style="color:var(--text)">${name}</strong>'s contract requires a compensation of <strong style="color:var(--yellow)">${fmt(amt)}</strong> (25% of market value).`,
    lineupSection: 'LINEUP MANAGEMENT',
    lineupInjured: '🩹 Player injured — unavailable for selection.',
    lineupBench: '↓ MOVE TO BENCH',
    lineupFull: name => `Starting XI is full. Choose who comes off for <strong style="color:var(--text)">${name}</strong>:`,
    lineupChoose: name => `Choose the position for <strong style="color:var(--text)">${name}</strong>:`,
    lineupAligned: (pos, n) => `Starting as <strong style="color:var(--green)">${pos}</strong> in slot ${n}.`,
    benchNoSubs: 'No available substitutes to cover this spot.',
    seasonStats: 'Season statistics',
    personality: 'Personality',
    nextMatch: 'Next Match',
    recentResults: 'Recent Results',
    leaguePos: 'League Position',
    mySquad: 'My Squad',
    qualityEst: 'overall quality',
    finalResult: 'Final Result',
    ratings: 'Ratings',
    matchStats: 'Match Statistics',
    continueBtn: 'CONTINUE →',
    nextSeason: 'NEXT SEASON →',
    endOfSeason: 'End of season',
    playMatch: '▶ PLAY MATCH',
    tacticLabel: 'TACTIC',
    formationLabel: 'FORMATION',
    budgetLabel: 'AVAILABLE BUDGET',
    availablePlayers: 'Available Players',
    substitution: 'SUBSTITUTION',
    subChoose: 'Choose the player coming on:',
    injury: (name, type, j) => `🩹 INJURY — ${name}: ${type} (${j} matchday${j !== 1 ? 's' : ''})`,
    tacticChanged: name => `📋 Tactic change: ${name}`,
    faqTitle: '❓ HELP',
    changelogTitle: 'CHANGELOG',
    // Tactic descriptions
    tacDescTikitaka:      'Total possession with immediate counter-press. Constant movement, short passes.',
    tacDescPossession:    'Patient short passing, ball domination, waiting for openings.',
    tacDescPositional:    'Disciplined zonal occupation. Lures the press and frees the spare man.',
    tacDescVertical:      'Quick vertical possession. Few touches, runs into space.',
    tacDescGegenpressing: 'Suffocating immediate press after losing the ball. Physically demanding.',
    tacDescPressing:      'High line and constant pressing in opponent half. Wins the ball high and plays fast.',
    tacDescCounter:       'Mid-low block. Defends in shape, transitions quickly to the wings.',
    tacDescBlock:         'Very deep, compact defence. Hard to break down but limited going forward.',
    tacDescParking:       'Very deep, compact defence. Hard to break down but limited going forward.',
    tacDescDirect:        'Long balls to physical forwards. Simple and aggressive.',
    tacDescWing:          'Wide build-up with constant crosses into the box.',
    tacDescBalanced:      'No extremes. Balanced approach between defence, possession and transition.',
    // Squad/lineup context menu
    ctxStarter:          n => `Starter · ${n}`,
    ctxSub:              n => `Sub · ${n}`,
    ctxToBench:          '↓ Move to bench',
    ctxToBenchNoSubs:    '↓ Bench (no available subs)',
    ctxSwapWith:         'Swap with:',
    ctxReplaceWith:      'Replace with:',
    ctxSubstituteFor:    'Substitute for:',
    ctxAddToSquad:       '↑ Add to starting XI',
    ctxViewProfile:      '📋 View player profile',
    ctxListForSale:      '💰 List for transfer',
    ctxEditListing:      '💰 Listed — edit price',
    ctxUnavailable:      'Unavailable for next match',
    ctxInjured:          j => `🩹 Injured (${j}) — replace with:`,
    ctxSuspended:        j => `🟥 Suspended (${j}) — replace with:`,
    ctxNoSubs:           'No available substitutes',
    // Alerts squad
    alertInjuredInXI:    n => `🩹 ${n} injured player${n>1?'s':''} in XI`,
    alertSuspendedInXI:  n => `🟥 ${n} suspended player${n>1?'s':''} in XI`,
    alertExpiringCtrs:   n => `⚠️ ${n} contract${n>1?'s':''} expiring`,
    benchEmpty:          'Empty bench.',
    // Squad rows
    warnInXI:            'unavailable in XI',
    // Calendar
    matchdayLabel:       j => j === 0 ? 'Pre-season' : `Matchday ${j}`,
    matchdayShort:       j => j === 0 ? 'Pre' : `MD${j}`,
    roundLabel:          'Round',
    competition:         'Competition',
    nextMatch:           '◀ NEXT',
    played:              '✓ Played',
    // Market
    marketClosed2:       'The transfer window is closed.',
    wageBill:            w => `${w}/yr`,
    wageUsed:            (b,pct) => `Used: ${b}/yr (${pct}%)`,
    wageMassSalary:      '⚠️ Wage limit',
    // Listing
    listingTitle:        'LIST FOR TRANSFER',
    listingConfirm:      (n,p) => `${n} listed for transfer at ${p}. You may receive bids during the window.`,
    listingWithdraw:     n => `${n} has been removed from the transfer list.`,
    listingOffered:      '📢 PLAYER LISTED',
    listingWithdrawn:    'Listing removed',
    listingDesc:         'Rival clubs may submit bids during the transfer window.',
    listingMin:          'Asking price',
    listingOffer:        '📢 LIST',
    listingRetract:      '✕ REMOVE',
    listingAlready:      p => `⚠️ Already listed at ${p}. You can change the price or remove the listing.`,
    // Player modal
    recentLevelUp:       (g,j) => `↑ Recent improvement — overall +${g} in matchday ${j}`,
    contract:            'CONTRACT',
    contractRenew:       '🔄 RENEW',
    contractRelease:     '✕ RELEASE',
    contractOffer:       '💰 LIST',
    contractEditOffer:   '💰 EDIT LISTING',
    contractListed:      p => `💰 Listed for transfer — asking price: ${p}`,
    // Match engine strings
    offsideOf:           n => `Offside — ${n}`,
    tacticChange:        n => `📋 Tactic change: ${n}`,
    // Warnings
    unavailableInXI:     n => `Cannot start match. Replace the following players from your XI:\n\n${n}\n\nGo to Squad → tap player to substitute.`,
    notEnoughPlayers:    n => `Not enough available players (${n}/11). Too many injuries.`,
    // Post-match
    wagesPaid:           'Wages paid:',
    leaguePrize:         'League prize:',
    transferBudget:      'Transfer budget:',
    wageBudgetLabel:     'Wage budget:',
    expiredContracts:    'EXPIRED CONTRACTS',
    expiredDesc:         ns => `${ns} have left the club at the end of their contracts.`,
    // HTML static
    nextMatch2:      'Next Match',
    recentResults:   'Recent Results',
    leaguePos:       'League Position',
    leagueTable:     'Standings',
    topScorers:      'Top Scorers',
    tacticLabel:     'TACTIC',
    seasonStats:     'Season statistics',
    matchStats:      'Match Statistics',
    warned:          'Booked',
    duration:        'Duration',
  }
};

function t(key, ...args) {
  const val = LANG[_lang]?.[key] ?? LANG['es']?.[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

function applyLang() {
  // Actualizar todos los nodos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' && el.type !== 'button') {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  });

  // Actualizar indicadores de idioma
  const label = _lang === 'es' ? 'EN' : 'ES';
  ['langBtn','langBtnIntro','langBtnMatch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });

  // Regenerar paneles dinámicos abiertos
  const activePanel = document.querySelector('.hub-panel.active');
  if (activePanel) {
    const id = activePanel.id;
    if (id === 'panel-faq') renderFaq();
    if (id === 'panel-squad') renderSquad();
    if (id === 'panel-transfers') renderTransferList();
    if (id === 'panel-teams') renderTeamsPanel();
  }
}

function toggleLang() {
  _lang = _lang === 'es' ? 'en' : 'es';
  localStorage.setItem('once_lang', _lang);
  // Sincronizar nombres y descripciones de TACTICS_CFG con el idioma activo
  syncTacticsLang();
  applyLang();
}

function syncTacticsLang() {
  const map = {
    tikitaka:      ['tacTikitaka',     'tacDescTikitaka'],
    possession:    ['tacPossession',   'tacDescPossession'],
    positional:    ['tacPositional',   'tacDescPositional'],
    vertical:      ['tacVertical',     'tacDescVertical'],
    gegenpressing: ['tacGegenpressing','tacDescGegenpressing'],
    pressing:      ['tacPressing',     'tacDescPressing'],
    counter:       ['tacCounter',      'tacDescCounter'],
    parking:       ['tacParking',      'tacDescParking'],
    direct:        ['tacDirect',       'tacDescDirect'],
    wing:          ['tacWing',         'tacDescWing'],
    balanced:      ['tacBalanced',     'tacDescBalanced']
  };
  Object.keys(map).forEach(k => {
    if (!TACTICS_CFG[k]) return;
    const [nameKey, descKey] = map[k];
    TACTICS_CFG[k].name = t(nameKey);
    TACTICS_CFG[k].desc = t(descKey);
  });
}

