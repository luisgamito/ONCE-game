// LEAGUE SETUP
// ============================================================
// Generate a full round-robin (HOME + AWAY = double) calendar of TEAMS_PER_DIV teams
function generateCalendar(ids) {
  const n = ids.length;
  const list = [...ids];
  if (n%2!==0) list.push('bye');
  const halfRounds = [];
  for (let r=0;r<list.length-1;r++) {
    const fixtures = [];
    for (let i=0;i<list.length/2;i++) {
      const h = list[i], a = list[list.length-1-i];
      if (h!=='bye'&&a!=='bye') fixtures.push({home:h,away:a,played:false,scoreH:0,scoreA:0,competition:'league'});
    }
    halfRounds.push(fixtures);
    const last = list.pop();
    list.splice(1,0,last);
  }
  // Second half: reverse home/away
  const secondHalf = halfRounds.map(round =>
    round.map(f=>({home:f.away,away:f.home,played:false,scoreH:0,scoreA:0,competition:'league'}))
  );
  return [...halfRounds, ...secondHalf];
}

// Create a division with N teams (one of which can be the player's team)
function createDivision(divLevel, namesPool, abbrsPool, includePlayer = false, playerData = null) {
  const cfg = DIV_CFG[divLevel];
  const teams = [];
  const namesUsed = [];
  const startIdx = (divLevel-1)*100;

  // Distribución de calidades para 18 equipos:
  // 6 candidatos al título/ascenso (alta calidad)
  // 6 equipos de zona media
  // 6 equipos de zona baja / lucha por no descender
  const qualityTiers = divLevel === 1
    ? [
        // 6 candidatos al título: baseQ +8 a +15
        ...Array(6).fill(null).map(() => cfg.baseQuality + rndI(8, 15)),
        // 6 zona media: baseQ -2 a +7
        ...Array(6).fill(null).map(() => cfg.baseQuality + rndI(-2, 7)),
        // 6 zona baja: baseQ -14 a -3
        ...Array(6).fill(null).map(() => cfg.baseQuality + rndI(-14, -3))
      ]
    : [
        // 6 candidatos al ascenso: baseQ +8 a +15
        ...Array(6).fill(null).map(() => cfg.baseQuality + rndI(8, 15)),
        // 6 zona media: baseQ -2 a +7
        ...Array(6).fill(null).map(() => cfg.baseQuality + rndI(-2, 7)),
        // 6 zona baja: baseQ -14 a -3
        ...Array(6).fill(null).map(() => cfg.baseQuality + rndI(-14, -3))
      ];

  // Mezclar para que no estén ordenados por calidad
  qualityTiers.sort(() => Math.random() - 0.5);

  let tierIdx = 0;
  for (let i = 0; i < TEAMS_PER_DIV; i++) {
    if (includePlayer && i === 0) {
      teams.push(playerData);
      tierIdx++;
      continue;
    }
    let name, abbr;
    let attempts = 0;
    do {
      const idx = rndI(0, namesPool.length - 1);
      name = namesPool[idx];
      abbr = abbrsPool[idx];
      attempts++;
    } while (namesUsed.includes(name) && attempts < 50);
    namesUsed.push(name);

    const q = Math.max(40, Math.min(99, qualityTiers[tierIdx] || cfg.baseQuality));
    tierIdx++;
    const form = pick(Object.keys(FORMATIONS));
    const tac = pick(Object.keys(TACTICS_CFG));
    teams.push({
      id:`d${divLevel}t${i}`, name, abbr, quality: q,
      formation: form, tactic: tac,
      squad: createSquad(q, form, true, `d${divLevel}t${i}_`),
      stats:{ pts:0,pj:0,g:0,e:0,p:0,gf:0,gc:0,dg:0 },
      division: divLevel
    });
  }
  return { id:'div'+divLevel, level:divLevel, name:cfg.name, teams, calendar:generateCalendar(teams.map(t=>t.id)), currentMatchday:0 };
}

// Copa: 36 equipos (18 div1 + 18 div2)
// 36 → 32 en R1: 4 equipos con bye, 32 juegan (16 ties → 16 pasan)
// R16 → 16 equipos → R8 → R4 → R2 → Final
// Simplificado: 36 → 20 juegan prelim (10 pasan) + 16 byes = R16
function createCup(div1Teams, div2Teams) {
  const allTeams = [...div1Teams, ...div2Teams];
  const shuffled = [...allTeams].sort(()=>Math.random()-0.5);
  // 20 teams play preliminary (10 ties, 10 winners), 16 get bye to R16
  const inPrelim = shuffled.slice(0, 20);
  const byes = shuffled.slice(20, 36);

  const prelimTies = [];
  for (let i=0; i<20; i+=2) {
    prelimTies.push({
      home: inPrelim[i].id, away: inPrelim[i+1].id,
      played:false, scoreH:0, scoreA:0, competition:'cup', round:'prelim', winner:null
    });
  }

  return {
    id:'cup',
    name:'Copa Nacional',
    rounds: [
      { name:'Ronda Previa', ties:prelimTies, byes: byes.map(t=>t.id) },
      { name:'Octavos de Final', ties:[] },
      { name:'Cuartos de Final', ties:[] },
      { name:'Semifinales', ties:[] },
      { name:'Final', ties:[] }
    ],
    currentRound: 0,
    completed: false,
    winner: null
  };
}

function createLeague(playerDivision, playerFormation, playerTactic, playerSquad, playerName, playerAbbr, playerColor) {
  const cfg = DIV_CFG[playerDivision];

  const playerTeam = {
    id:'player', name:playerName, abbr:playerAbbr, color:playerColor, quality:cfg.baseQuality,
    formation:playerFormation, tactic:playerTactic, squad:playerSquad,
    stats:{ pts:0,pj:0,g:0,e:0,p:0,gf:0,gc:0,dg:0 },
    division: playerDivision, isPlayer:true
  };

  const div1NamePool = [...TEAM_NAMES_DIV1], div1AbbrPool = [...TEAM_ABBRS_DIV1];
  const div2NamePool = [...TEAM_NAMES_DIV2], div2AbbrPool = [...TEAM_ABBRS_DIV2];

  const div1 = createDivision(1, div1NamePool, div1AbbrPool, playerDivision===1, playerDivision===1?playerTeam:null);
  const div2 = createDivision(2, div2NamePool, div2AbbrPool, playerDivision===2, playerDivision===2?playerTeam:null);

  const cup = createCup(div1.teams, div2.teams);

  return {
    divisions: { 1: div1, 2: div2 },
    cup,
    currentMatchday: 0,
    season: 1,
    myDivision: playerDivision
  };
}

// LEGACY HELPER: for compatibility with existing code that expects flat .teams
function getAllTeams() {
  if (!G||!G.league) return [];
  return [...G.league.divisions[1].teams, ...G.league.divisions[2].teams];
}

function getMyDivision() { return G.league.divisions[G.league.myDivision]; }
function getMyDivisionFixtures(jornada) {
  const div = getMyDivision();
  return div.calendar[jornada] || [];
}

// ============================================================
// NEW GAME
// ============================================================
function startNewGame() { showScreen('screen-setup'); }

function createClub() {
  const name = document.getElementById('setupClubName').value.trim()||'FC Ciudad';
  const abbr = (document.getElementById('setupClubAbbr').value.trim()||'FCC').toUpperCase().slice(0,3);
  const color = document.querySelector('.color-option.selected')?.dataset.color||'#00d4ff';
  const division = parseInt(document.querySelector('.league-option.selected')?.dataset.division || '2');
  const formation = document.getElementById('setupFormation').value;
  const tactic = document.getElementById('setupTactic').value;
  const cfg = DIV_CFG[division];

  const squad = createSquad(cfg.baseQuality, formation, false, 'my_');
  squad.forEach(p=>{ p.inSquad = squad.indexOf(p)<11; });

  // Calcular nómina real de la plantilla generada y fijar wageBudget como 115% de ella
  const actualBill = squad.reduce((s, p) => s + (p.contract?.salary || 0) * 52, 0);
  const wageBudget = Math.round(actualBill * 1.15 / 50000) * 50000;

  const league = createLeague(division, formation, tactic, squad, name, abbr, color);

  G = {
    club:{ name, abbr, color, division, formation, tactic, budget: cfg.startBudget, wageBudget },
    league,
    history:[],
    season: 1,
    cupHistory: []
  };

  saveGame();
  initHub();
  showScreen('screen-hub');
}

function continueGame() {
  if (!G) return;
  initHub();
  showScreen('screen-hub');
}

