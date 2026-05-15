// PLAYER GENERATION
// ============================================================
function genAttrs(quality, pos) {
  const sp = 14; // spread un poco más pequeño para más consistencia
  const a = {};
  ['speed','technique','physical','vision','positioning','mentality','shooting','defense','reflexes'].forEach(k=>{
    a[k] = clamp(Math.round(quality + rnd(-sp/2, sp/2)), 30, 99);
  });
  // Bonuses por posición — más marcados para que los roles sean distintos
  if (pos==='GK') {
    a.reflexes   = clamp(a.reflexes   + 15, 50, 99);
    a.positioning= clamp(a.positioning+ 10, 50, 99);
    a.shooting   = Math.max(20, a.shooting - 30);
    a.defense    = clamp(a.defense + 5, 30, 99);
  }
  if (['ST','LW','RW','CAM'].includes(pos)) {
    a.shooting   = clamp(a.shooting   + 12, 40, 99);
    a.technique  = clamp(a.technique  +  8, 40, 99);
    a.speed      = clamp(a.speed      +  6, 40, 99);
    a.defense    = Math.max(25, a.defense - 8);
  }
  if (['CB','CDM'].includes(pos)) {
    a.defense    = clamp(a.defense    + 12, 40, 99);
    a.physical   = clamp(a.physical   +  8, 40, 99);
    a.shooting   = Math.max(25, a.shooting - 10);
  }
  if (['LB','RB'].includes(pos)) {
    a.defense    = clamp(a.defense    +  8, 40, 99);
    a.speed      = clamp(a.speed      +  6, 40, 99);
  }
  if (['CM','LM','RM'].includes(pos)) {
    a.technique  = clamp(a.technique  +  6, 40, 99);
    a.vision     = clamp(a.vision     +  6, 40, 99);
  }
  return a;
}

// Calculate effective overall taking age/potential into account
function calcOverall(player) {
  const a = player.attr;
  const base = (a.speed + a.technique + a.physical + a.vision + a.mentality + a.shooting + a.defense + a.positioning) / 8;
  return Math.round(base);
}

// Compute current overall based on age curve from baseQuality + potential
function applyAgeCurve(p) {
  // Player has baseRating (their level at age 22-26) and potential (max they can reach)
  const peak = p.peakAge;
  const age = p.age;
  let factor; // 0 = baseline at 16, 1.0 = full potential at peak
  if (age < peak) {
    // Growth phase: 16→peak goes from 0.55 to 1.0
    factor = 0.55 + 0.45 * (age - 16) / (peak - 16);
    factor = clamp(factor, 0.55, 1.0);
  } else if (age <= peak + 2) {
    factor = 1.0; // peak years
  } else {
    // Decline: from peak+2 to 38 goes from 1.0 to 0.55
    factor = 1.0 - 0.45 * (age - peak - 2) / (38 - peak - 2);
    factor = clamp(factor, 0.50, 1.0);
  }
  return factor;
}

function createPlayer(quality, pos, id, isOpp=false, ageOverride=null) {
  // Generate age — bias toward 22-30 but allow young/old
  let age;
  if (ageOverride !== null) age = ageOverride;
  else {
    const r = Math.random();
    if (r < 0.15) age = rndI(16, 20);       // youngsters
    else if (r < 0.65) age = rndI(21, 28);  // prime
    else if (r < 0.90) age = rndI(29, 33);  // mature
    else age = rndI(34, 37);                 // veterans
  }

  // Peak age varies per player
  const peakAge = rndI(PLAYER_PEAK_MIN, PLAYER_PEAK_MAX);

  // Potential: how good can this player become at peak
  // Quality given is the "current" overall — derive base from age
  const tempPlayer = { age, peakAge };
  const ageFactor = applyAgeCurve(tempPlayer);

  // For young players, potential adds extra ceiling
  let potentialBonus = 0;
  if (age < peakAge) {
    potentialBonus = rndI(0, POTENTIAL_GROWTH_MAX); // some grow more than others
  }

  // baseRating: what they'd be at peak — derived from current quality + potential growth
  const peakRating = quality + (age < peakAge ? potentialBonus : 0);

  // Build current attrs based on peakRating × ageFactor
  const currentRating = peakRating * ageFactor;
  const attrs = genAttrs(currentRating, pos);

  // Save peakRating attributes (theoretical max) for growth tracking
  const peakAttrs = genAttrs(peakRating, pos);

  return {
    id, name: randName(), pos, role: POS_ROLE[pos]||'MID',
    age, peakAge,
    attr: attrs,
    peakAttr: peakAttrs, // theoretical max attributes
    potential: peakRating, // numeric overall at peak
    xp: 0, // experience points toward next attribute upgrade
    personality: genPersonality(pos),
    fatigue: 100, currentSpeed: 0,
    driftX:0, driftY:0, driftRefreshTick:0,
    x:0, y:0, baseX:0, baseY:0,
    cards:{yellow:0,red:false}, onField:true,
    injury: null, // {jornadasLeft, severity}
    season: { goals:0, assists:0, shots:0, shotsOnTarget:0, passes:0, passSuccess:0, tackles:0, fouls:0, gamesPlayed:0, ratingSum:0, yellows:0 },
    career: { goals:0, assists:0, gamesPlayed:0, seasonsPlayed:0 },
    match: { goals:0, assists:0, shots:0, shotsOnTarget:0, passes:0, passSuccess:0, tackles:0, fouls:0, rating:6.0 },
    isOpp, inSquad: true,
    value: calcPlayerValue(currentRating, age, peakRating),
    contract: genContract(Math.round(currentRating), age)
  };
}

// Calculate market value based on rating, age, and potential
function calcPlayerValue(currentRating, age, peakRating) {
  let base = Math.pow(currentRating, 2.4) * 8; // exponential value with rating
  // Young + high potential = much more valuable
  if (age < 23 && peakRating > currentRating + 5) {
    base *= 1.5 + (peakRating - currentRating) * 0.1;
  }
  // Veterans worth less
  if (age > 32) base *= 0.55;
  if (age > 35) base *= 0.40;
  // Add some randomness
  base *= rnd(0.85, 1.20);
  return Math.round(base / 1000) * 1000; // round to thousands
}

// ============================================================
// PROGRESSION SYSTEM (per-match XP)
// ============================================================

// XP required to gain 1 attribute point — scales with current overall
function xpNeededForLevel(p) {
  const overall = calcOverall(p);
  // Higher rated = more XP needed (logarithmic curve)
  // Rating 50 → 80 XP, Rating 70 → 140 XP, Rating 85 → 220 XP, Rating 92 → 320 XP
  return Math.round(40 + Math.pow(overall - 30, 1.55));
}

// Award XP to a player based on match performance
// Called at end of match for each player who played
function awardMatchXP(p) {
  if (!p.match || !p.season) return;
  p.xp = p.xp || 0;

  // Base XP per match: 10
  let xpGain = 10;

  // Performance bonus based on match rating
  // Rating 6.0 = no bonus, Rating 7.0 = +5, Rating 8.0 = +12, Rating 9.0 = +20
  const rating = p.match.rating || 6.0;
  if (rating > 6.0) xpGain += Math.pow(rating - 6.0, 1.6) * 6;

  // Goal/assist bonus
  xpGain += (p.match.goals || 0) * 4;
  xpGain += (p.match.assists || 0) * 2;

  // Age modifier
  // Young players (16-22): 1.5x XP — they grow fast
  // Prime (23-29): 1.0x — normal
  // Older (30+): 0.4x — much slower growth, mostly decline
  let ageMod;
  if (p.age <= 21) ageMod = 1.6;
  else if (p.age <= 24) ageMod = 1.3;
  else if (p.age <= 29) ageMod = 1.0;
  else if (p.age <= 32) ageMod = 0.5;
  else ageMod = 0.2;
  xpGain *= ageMod;

  // CRACK BONUS: players with high potential gap get massive XP boost
  const overall = calcOverall(p);
  const gap = p.potential - overall;
  if (p.age < 25 && gap > 10) {
    // Future cracks grow much faster
    xpGain *= 1.6 + (gap - 10) * 0.06;
  } else if (p.age < 25 && gap > 5) {
    xpGain *= 1.25;
  }

  // If player is at or above potential, very small XP
  if (overall >= p.potential) xpGain *= 0.15;

  p.xp += xpGain;

  // Check for level up
  while (p.xp >= xpNeededForLevel(p) && calcOverall(p) < p.potential) {
    p.xp -= xpNeededForLevel(p);
    levelUpAttribute(p);
  }

  // Cap excess XP if they hit potential
  if (calcOverall(p) >= p.potential) {
    p.xp = Math.min(p.xp, xpNeededForLevel(p) * 0.3);
  }
}

// Apply -XP for veterans (gradual decline per match)
function awardMatchDecline(p) {
  if (p.age < 31) return;
  // Veterans lose attribute points slowly
  // 31-32: 5% chance per match to lose 1 in random attribute
  // 33-34: 12% chance
  // 35+: 25% chance
  let declineChance;
  if (p.age <= 32) declineChance = 0.05;
  else if (p.age <= 34) declineChance = 0.12;
  else declineChance = 0.25;

  if (Math.random() < declineChance) {
    declineAttribute(p);
  }
}

function levelUpAttribute(p) {
  // Pick an attribute to boost — biased by position
  const positionWeights = {
    GK: { reflexes:3, positioning:3, mentality:2, vision:1, physical:1 },
    CB: { defense:4, physical:3, positioning:2, mentality:2, speed:1, vision:1 },
    LB: { defense:3, speed:3, physical:2, technique:2, vision:1 },
    RB: { defense:3, speed:3, physical:2, technique:2, vision:1 },
    CDM: { defense:3, vision:3, physical:2, mentality:2, technique:2, positioning:1 },
    CM:  { vision:3, technique:3, physical:2, mentality:2, defense:1, speed:1 },
    LM:  { speed:3, technique:3, vision:2, mentality:1, shooting:1 },
    RM:  { speed:3, technique:3, vision:2, mentality:1, shooting:1 },
    CAM: { vision:4, technique:3, shooting:2, mentality:2, speed:1 },
    LW:  { speed:4, technique:3, shooting:2, mentality:1, vision:1 },
    RW:  { speed:4, technique:3, shooting:2, mentality:1, vision:1 },
    ST:  { shooting:4, speed:2, technique:2, physical:2, mentality:2, positioning:2 }
  };
  const weights = positionWeights[p.pos] || { speed:2, technique:2, physical:2, vision:2, shooting:2, defense:2, mentality:2, positioning:2, reflexes:1 };

  // Build weighted pool, but only include attributes below their peak
  const pool = [];
  Object.entries(weights).forEach(([attr, w]) => {
    if (p.attr[attr] < p.peakAttr[attr]) {
      for (let i=0; i<w; i++) pool.push(attr);
    }
  });

  if (pool.length === 0) return; // all attributes at max

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  p.attr[chosen] = Math.min(99, p.attr[chosen] + 1);

  // Update value
  p.value = calcPlayerValue(calcOverall(p), p.age, p.potential);
}

function declineAttribute(p) {
  // Veterans lose in physical attributes first (speed, physical)
  // Then defense, technique
  // Last to decline: vision, mentality, positioning (experience)
  const declineWeights = {
    speed: 4, physical: 3, defense: 2, technique: 2, shooting: 2, reflexes: 2,
    vision: 1, mentality: 1, positioning: 1
  };

  const pool = [];
  Object.entries(declineWeights).forEach(([attr, w]) => {
    if (p.attr[attr] > 35) {
      for (let i=0; i<w; i++) pool.push(attr);
    }
  });
  if (pool.length === 0) return;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  p.attr[chosen] = Math.max(35, p.attr[chosen] - 1);
  p.value = calcPlayerValue(calcOverall(p), p.age, p.potential);
}

function genPersonality(pos) {
  const pers = {};
  const archetypes = {
    GK:  [.4,.6,.9,1.1,.3,.6,.85,1,.3,.5,.7,1],
    CB:  [.7,1,.9,1.2,.7,1.2,.75,.95,.3,.5,.7,1.1],
    LB:  [1,1.4,1,1.3,.6,1,.5,.75,.5,.9,.9,1.3],
    RB:  [1,1.4,1,1.3,.6,1,.5,.75,.5,.9,.9,1.3],
    CDM: [.9,1.3,1,1.3,.8,1.3,.7,.95,.4,.7,.8,1.2],
    CM:  [1,1.5,1,1.3,.6,1.1,.55,.85,.6,1.1,.9,1.3],
    LM:  [.8,1.2,.9,1.2,.5,.9,.5,.8,.6,1,.9,1.3],
    RM:  [.8,1.2,.9,1.2,.5,.9,.5,.8,.6,1,.9,1.3],
    CAM: [.7,1.1,.8,1.1,.4,.8,.4,.65,.9,1.4,1,1.4],
    LW:  [.8,1.3,.85,1.15,.5,1,.5,.75,.9,1.5,1,1.4],
    RW:  [.8,1.3,.85,1.15,.5,1,.5,.75,.9,1.5,1,1.4],
    ST:  [.6,1.1,.8,1.1,.6,1.1,.45,.7,.8,1.4,1,1.5]
  };
  const arc = archetypes[pos] || [.7,1.1,.9,1.1,.5,.9,.55,.8,.6,1,.9,1.2];
  pers.workRate    = rnd(arc[0],arc[1]);
  pers.stamina     = rnd(arc[2],arc[3]);
  pers.aggressiveness = rnd(arc[4],arc[5]);
  pers.posDiscipline = rnd(arc[6],arc[7]);
  pers.flair       = rnd(arc[8],arc[9]);
  pers.urgency     = rnd(arc[10],arc[11]);
  return pers;
}

function createSquad(quality, formation, isOpp=false, prefix='') {
  const pos = FORMATIONS[formation]||FORMATIONS['4-4-2'];
  const starters = pos.map((fp,i)=> {
    const p = createPlayer(quality, fp.pos, prefix+'s'+i, isOpp);
    return p;
  });
  // 9 suplentes con posiciones variadas y equilibradas
  const subPos = ['GK','CB','CB','LB','RB','CDM','CM','LW','ST'];
  const subs = subPos.map((sp,i)=>{
    const p = createPlayer(quality - rnd(4, 10), sp, prefix+'b'+i, isOpp);
    p.inSquad = false;
    return p;
  });
  return [...starters, ...subs];
}

// ============================================================
// SALARIOS Y CONTRATOS
// ============================================================

// Salario semanal basado en media y edad. Escala de ~500 a ~50.000/semana
function calcWeeklySalary(overall, age) {
  // Escala: media 50 → ~800/sem, media 65 → ~2500/sem, media 80 → ~8000/sem
  const base = Math.pow(Math.max(overall - 45, 1) / 55, 2.0) * 12000;
  const ageMod = age < 24 ? 0.75 : age < 28 ? 1.0 : age < 32 ? 0.90 : 0.75;
  return Math.max(300, Math.round(base * ageMod / 100) * 100);
}

// Coste anual de un jugador
function annualWage(p) {
  return (p.contract?.salary || 0) * 52;
}

// Salario total actual del equipo (por año)
function totalWageBill() {
  const myTeam = getMyTeam();
  if (!myTeam) return 0;
  return myTeam.squad.reduce((s, p) => s + annualWage(p), 0);
}

// Generar contrato aleatorio al crear jugador
function genContract(overall, age) {
  const salary = calcWeeklySalary(overall, age);
  // Jugadores jóvenes: contratos cortos. Estrellas: más largos.
  const minYears = age < 22 ? 1 : age > 32 ? 1 : 2;
  const maxYears = age > 34 ? 2 : age > 30 ? 3 : 5;
  const years = rndI(minYears, maxYears);
  return { salary, years, yearsLeft: years };
}

// Coste de rescisión basado en salarios restantes
function rescissionCost(p) {
  if (!p.contract) return Math.round(p.value * 0.25 / 1000) * 1000;
  const yearsLeft = p.contract.yearsLeft || 0;
  // Pagar entre 6 y 18 meses de salario según años restantes
  const months = Math.min(18, Math.max(6, yearsLeft * 7));
  return Math.round((p.contract.salary * 4 * months) / 1000) * 1000;
}

// Texto descriptivo del contrato
function contractLabel(p) {
  if (!p.contract) return 'Sin contrato';
  const y = p.contract.yearsLeft || 0;
  return `${fmt(p.contract.salary)}/sem · ${y} año${y!==1?'s':''} restante${y!==1?'s':''}`;
}
function createMatchTeam(squad, formation, tactic, name, side) {
  const pos = FORMATIONS[formation]||FORMATIONS['4-4-2'];
  // Lesionados Y suspendidos no pueden jugar
  const available = squad.filter(p => {
    const injured = p.injury && p.injury.jornadasLeft > 0;
    const suspended = p.suspension && p.suspension > 0;
    return !injured && !suspended;
  });
  const starters = available.filter(p=>p.inSquad).slice(0,11);
  // Place them en posición base (defensiva por defecto al kickoff)
  starters.forEach((p,i)=>{
    const fp = pos[i]||pos[0];
    const px = side==='B' ? 1 - fp.x : fp.x;
    const py = side==='B' ? 1 - fp.y : fp.y;
    p.baseX = px; p.baseY = py;
    p.x = px; p.y = py;
    // Posiciones por fase (espejadas si lado B)
    if (fp.def) {
      p.defX = side==='B' ? 1 - fp.def.x : fp.def.x;
      p.defY = side==='B' ? 1 - fp.def.y : fp.def.y;
    } else { p.defX = px; p.defY = py; }
    if (fp.att) {
      p.attX = side==='B' ? 1 - fp.att.x : fp.att.x;
      p.attY = side==='B' ? 1 - fp.att.y : fp.att.y;
    } else { p.attX = px; p.attY = py; }
    // Rol específico para el motor (ROLES)
    p.matchRole = fp.role || p.role || 'CM';
    p.currentSpeed = 0;
    p.onField = true;
    p.driftX = 0; p.driftY = 0; p.driftRefreshTick = 0;
    p.match = {goals:0,assists:0,shots:0,shotsOnTarget:0,passes:0,passSuccess:0,tackles:0,fouls:0,rating:6.0};
    p.cards = {yellow:0,red:false};
    p.fatigue = 100;
  });
  const bench = squad.filter(p=>!p.inSquad);
  return {
    name, formation, tactic, side, starters, bench, squad,
    score:0, possession:0, shots:0, shotsOnTarget:0, passes:0,
    fouls:0, corners:0, yellows:0, reds:0, offsides:0,
    lastLossTick: 0, lastWinTick: 0
  };
}

