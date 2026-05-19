// ============================================================
// CONSTANTS
// ============================================================
const PITCH_W = 1050, PITCH_H = 680;
const FX = 40, FY = 30, FW = 970, FH = 620;

// ============================================================
// FORMATIONS — cada formación es un ARRAY de slots con posiciones por FASE
// (def = sin balón, att = en posesión). Compatible con el resto del código.
// Metadatos extra en FORMATIONS_META.
// ============================================================
const FORMATIONS_META = {
  '4-3-3':   { defenders:4, midfielders:3, forwards:3, defensiveShape:'4-1-4-1', desc:'4-3-3: Wide front with pivot triangle.' },
  '4-4-2':   { defenders:4, midfielders:4, forwards:2, defensiveShape:'4-4-2',   desc:'4-4-2: Classic flat block. Solid and direct.' },
  '4-2-3-1': { defenders:4, midfielders:5, forwards:1, defensiveShape:'4-4-1-1', desc:'4-2-3-1: Double pivot with attacking trio behind striker.' },
  '3-5-2':   { defenders:3, midfielders:5, forwards:2, defensiveShape:'5-3-2',   desc:'3-5-2: Wing-backs provide width. Back three defends.' },
  '5-3-2':   { defenders:5, midfielders:3, forwards:2, defensiveShape:'5-3-2',   desc:'5-3-2: Deep five-man block. Counter-attacks.' },
  '4-1-4-1': { defenders:4, midfielders:5, forwards:1, defensiveShape:'4-5-1',   desc:'4-1-4-1: Isolated anchor. Compact mid block.' }
};

const FORMATIONS = {
  '4-3-3': [
    {pos:'GK', role:'GK',  x:.04, y:.5,  def:{x:.04,y:.5},  att:{x:.07,y:.5}},
    {pos:'LB', role:'FB',  x:.22, y:.12, def:{x:.22,y:.12}, att:{x:.40,y:.08}},
    {pos:'CB', role:'CB',  x:.18, y:.38, def:{x:.18,y:.38}, att:{x:.22,y:.36}},
    {pos:'CB', role:'CB',  x:.18, y:.62, def:{x:.18,y:.62}, att:{x:.22,y:.64}},
    {pos:'RB', role:'FB',  x:.22, y:.88, def:{x:.22,y:.88}, att:{x:.40,y:.92}},
    {pos:'CDM',role:'DLP', x:.36, y:.5,  def:{x:.36,y:.5},  att:{x:.34,y:.5}},
    {pos:'CM', role:'BBM', x:.42, y:.30, def:{x:.42,y:.30}, att:{x:.50,y:.28}},
    {pos:'CM', role:'BBM', x:.42, y:.70, def:{x:.42,y:.70}, att:{x:.50,y:.72}},
    {pos:'LW', role:'IF',  x:.62, y:.14, def:{x:.62,y:.14}, att:{x:.78,y:.18}},
    {pos:'ST', role:'AF',  x:.72, y:.5,  def:{x:.72,y:.5},  att:{x:.85,y:.5}},
    {pos:'RW', role:'IF',  x:.62, y:.86, def:{x:.62,y:.86}, att:{x:.78,y:.82}}
  ],
  '4-4-2': [
    {pos:'GK', role:'GK',  x:.04, y:.5,  def:{x:.04,y:.5},  att:{x:.06,y:.5}},
    {pos:'LB', role:'FB',  x:.22, y:.12, def:{x:.22,y:.12}, att:{x:.35,y:.10}},
    {pos:'CB', role:'CB',  x:.18, y:.38, def:{x:.18,y:.38}, att:{x:.20,y:.38}},
    {pos:'CB', role:'CB',  x:.18, y:.62, def:{x:.18,y:.62}, att:{x:.20,y:.62}},
    {pos:'RB', role:'FB',  x:.22, y:.88, def:{x:.22,y:.88}, att:{x:.35,y:.90}},
    {pos:'LM', role:'WM',  x:.45, y:.12, def:{x:.45,y:.12}, att:{x:.62,y:.10}},
    {pos:'CM', role:'CM',  x:.40, y:.38, def:{x:.40,y:.38}, att:{x:.46,y:.36}},
    {pos:'CM', role:'CM',  x:.40, y:.62, def:{x:.40,y:.62}, att:{x:.46,y:.64}},
    {pos:'RM', role:'WM',  x:.45, y:.88, def:{x:.45,y:.88}, att:{x:.62,y:.90}},
    {pos:'ST', role:'TF',  x:.70, y:.38, def:{x:.70,y:.38}, att:{x:.80,y:.40}},
    {pos:'ST', role:'PF',  x:.70, y:.62, def:{x:.70,y:.62}, att:{x:.82,y:.60}}
  ],
  '4-2-3-1': [
    {pos:'GK', role:'GK',  x:.04, y:.5,  def:{x:.04,y:.5},  att:{x:.06,y:.5}},
    {pos:'LB', role:'FB',  x:.22, y:.12, def:{x:.22,y:.12}, att:{x:.38,y:.10}},
    {pos:'CB', role:'CB',  x:.18, y:.38, def:{x:.18,y:.38}, att:{x:.22,y:.38}},
    {pos:'CB', role:'CB',  x:.18, y:.62, def:{x:.18,y:.62}, att:{x:.22,y:.62}},
    {pos:'RB', role:'FB',  x:.22, y:.88, def:{x:.22,y:.88}, att:{x:.38,y:.90}},
    {pos:'CDM',role:'DM',  x:.34, y:.38, def:{x:.34,y:.38}, att:{x:.32,y:.40}},
    {pos:'CDM',role:'DM',  x:.34, y:.62, def:{x:.34,y:.62}, att:{x:.32,y:.60}},
    {pos:'LW', role:'IW',  x:.55, y:.14, def:{x:.55,y:.14}, att:{x:.72,y:.18}},
    {pos:'CAM',role:'AM',  x:.58, y:.5,  def:{x:.58,y:.5},  att:{x:.66,y:.5}},
    {pos:'RW', role:'IW',  x:.55, y:.86, def:{x:.55,y:.86}, att:{x:.72,y:.82}},
    {pos:'ST', role:'AF',  x:.74, y:.5,  def:{x:.74,y:.5},  att:{x:.85,y:.5}}
  ],
  '3-5-2': [
    {pos:'GK', role:'GK',  x:.04, y:.5,  def:{x:.04,y:.5},  att:{x:.06,y:.5}},
    {pos:'CB', role:'BPD', x:.18, y:.28, def:{x:.18,y:.28}, att:{x:.22,y:.30}},
    {pos:'CB', role:'CB',  x:.16, y:.5,  def:{x:.16,y:.5},  att:{x:.20,y:.5}},
    {pos:'CB', role:'BPD', x:.18, y:.72, def:{x:.18,y:.72}, att:{x:.22,y:.70}},
    {pos:'LB', role:'WB',  x:.30, y:.06, def:{x:.30,y:.06}, att:{x:.65,y:.05}},
    {pos:'CDM',role:'DLP', x:.36, y:.36, def:{x:.36,y:.36}, att:{x:.40,y:.40}},
    {pos:'CM', role:'CM',  x:.40, y:.5,  def:{x:.40,y:.5},  att:{x:.50,y:.5}},
    {pos:'CDM',role:'DM',  x:.36, y:.64, def:{x:.36,y:.64}, att:{x:.40,y:.60}},
    {pos:'RB', role:'WB',  x:.30, y:.94, def:{x:.30,y:.94}, att:{x:.65,y:.95}},
    {pos:'ST', role:'CF',  x:.70, y:.40, def:{x:.70,y:.40}, att:{x:.80,y:.40}},
    {pos:'ST', role:'TF',  x:.70, y:.60, def:{x:.70,y:.60}, att:{x:.80,y:.60}}
  ],
  '5-3-2': [
    {pos:'GK', role:'GK',  x:.04, y:.5,  def:{x:.04,y:.5},  att:{x:.06,y:.5}},
    {pos:'LB', role:'FB',  x:.20, y:.08, def:{x:.20,y:.08}, att:{x:.28,y:.08}},
    {pos:'CB', role:'CB',  x:.16, y:.28, def:{x:.16,y:.28}, att:{x:.18,y:.30}},
    {pos:'CB', role:'CB',  x:.14, y:.5,  def:{x:.14,y:.5},  att:{x:.16,y:.5}},
    {pos:'CB', role:'CB',  x:.16, y:.72, def:{x:.16,y:.72}, att:{x:.18,y:.70}},
    {pos:'RB', role:'FB',  x:.20, y:.92, def:{x:.20,y:.92}, att:{x:.28,y:.92}},
    {pos:'CM', role:'CM',  x:.40, y:.30, def:{x:.40,y:.30}, att:{x:.45,y:.32}},
    {pos:'CDM',role:'DLP', x:.36, y:.5,  def:{x:.36,y:.5},  att:{x:.38,y:.5}},
    {pos:'CM', role:'CM',  x:.40, y:.70, def:{x:.40,y:.70}, att:{x:.45,y:.68}},
    {pos:'ST', role:'TF',  x:.65, y:.40, def:{x:.65,y:.40}, att:{x:.75,y:.42}},
    {pos:'ST', role:'PF',  x:.65, y:.60, def:{x:.65,y:.60}, att:{x:.78,y:.58}}
  ],
  '4-1-4-1': [
    {pos:'GK', role:'GK',  x:.04, y:.5,  def:{x:.04,y:.5},  att:{x:.06,y:.5}},
    {pos:'LB', role:'FB',  x:.22, y:.12, def:{x:.22,y:.12}, att:{x:.36,y:.10}},
    {pos:'CB', role:'CB',  x:.18, y:.38, def:{x:.18,y:.38}, att:{x:.20,y:.38}},
    {pos:'CB', role:'CB',  x:.18, y:.62, def:{x:.18,y:.62}, att:{x:.20,y:.62}},
    {pos:'RB', role:'FB',  x:.22, y:.88, def:{x:.22,y:.88}, att:{x:.36,y:.90}},
    {pos:'CDM',role:'AC',  x:.34, y:.5,  def:{x:.34,y:.5},  att:{x:.34,y:.5}},
    {pos:'LM', role:'WM',  x:.50, y:.14, def:{x:.50,y:.14}, att:{x:.66,y:.14}},
    {pos:'CM', role:'CM',  x:.50, y:.40, def:{x:.50,y:.40}, att:{x:.55,y:.38}},
    {pos:'CM', role:'CM',  x:.50, y:.60, def:{x:.50,y:.60}, att:{x:.55,y:.62}},
    {pos:'RM', role:'WM',  x:.50, y:.86, def:{x:.50,y:.86}, att:{x:.66,y:.86}},
    {pos:'ST', role:'CF',  x:.72, y:.5,  def:{x:.72,y:.5},  att:{x:.82,y:.5}}
  ]
};

// ============================================================
// PLAYER ROLES (rol específico dentro de la posición)
// ============================================================
const ROLES = {
  GK:   { name:'Portero',                 group:'GK',  prefer:['reflexes','positioning','physical'] },
  CB:   { name:'Central',                 group:'DEF', prefer:['defense','physical','positioning'],   stayBack:1.0 },
  BPD:  { name:'Central con salida',      group:'DEF', prefer:['defense','technique','vision'],       stayBack:.85, buildupRole:1 },
  FB:   { name:'Lateral',                 group:'DEF', prefer:['defense','speed','stamina'],          overlap:.5,  widthBoost:.3 },
  WB:   { name:'Carrilero',               group:'DEF', prefer:['speed','stamina','technique'],        overlap:1.0, widthBoost:1.0 },
  DM:   { name:'Mediocentro defensivo',   group:'MID', prefer:['defense','positioning','physical'],   stayBack:.85 },
  AC:   { name:'Pivote (anchor)',         group:'MID', prefer:['defense','positioning','physical'],   stayBack:1.0 },
  DLP:  { name:'Mediocentro organizador', group:'MID', prefer:['vision','technique','passing'],       stayBack:.7,  buildupRole:1 },
  CM:   { name:'Mediocentro',             group:'MID', prefer:['stamina','technique','vision'],       stayBack:.5 },
  BBM:  { name:'Box-to-box',              group:'MID', prefer:['stamina','physical','technique'],     stayBack:.4,  attack:.4 },
  AM:   { name:'Mediapunta',              group:'MID', prefer:['vision','technique','shooting'],      stayBack:.2,  attack:.7 },
  WM:   { name:'Volante de banda',        group:'MID', prefer:['speed','stamina','technique'],        widthBoost:.7,attack:.5 },
  IW:   { name:'Extremo invertido',       group:'FWD', prefer:['shooting','technique','speed'],       widthBoost:.4, attack:.85, cutInside:1 },
  IF:   { name:'Interior',                group:'FWD', prefer:['shooting','technique','speed'],       widthBoost:.3, attack:.9,  cutInside:1 },
  AF:   { name:'Delantero avanzado',      group:'FWD', prefer:['speed','shooting','positioning'],     attack:1.0 },
  CF:   { name:'Delantero completo',      group:'FWD', prefer:['shooting','technique','physical'],    attack:.9 },
  TF:   { name:'Delantero referencia',    group:'FWD', prefer:['physical','shooting','positioning'],  attack:.8, hold:1 },
  PF:   { name:'Delantero de área',       group:'FWD', prefer:['speed','shooting','positioning'],     attack:1.0, poach:1 }
};

// ============================================================
// MENTALIDADES
// ============================================================
const MENTALITIES = {
  defensive: { name:'Defensiva',   level:-2, lineMod:-.18, pressMod:-.20, tempoMod:-.15, riskMod:-.20, widthMod:-.15 },
  cautious:  { name:'Cauta',       level:-1, lineMod:-.08, pressMod:-.10, tempoMod:-.07, riskMod:-.10, widthMod:-.08 },
  balanced:  { name:'Equilibrada', level: 0, lineMod: 0,   pressMod: 0,   tempoMod: 0,   riskMod: 0,   widthMod: 0   },
  positive:  { name:'Ofensiva',    level: 1, lineMod:+.08, pressMod:+.10, tempoMod:+.07, riskMod:+.10, widthMod:+.08 },
  attacking: { name:'Atacante',    level: 2, lineMod:+.18, pressMod:+.20, tempoMod:+.15, riskMod:+.20, widthMod:+.15 }
};

// ============================================================
// TÁCTICAS PREDEFINIDAS
// ============================================================
const TACTICS_CFG = {
  tikitaka: {
    name:'Tiki-Taka', icon:'🔵', mentality:'positive',
    desc:'Posesión total con presión inmediata tras pérdida. Mucha movilidad, pases cortos.',
    defLine:.70, lineEngage:.75, pressIntensity:.85, counterPress:.95, compactness:.78,
    widthDef:.55, widthAtt:.55, tempo:.75, directness:.20, passLength:.10,
    gkDistribution:.15, shootBias:.40, dribbleBias:.55, crossingBias:.20, throughBalls:.55,
    overlap:.55, patience:.85, offsideTrap:.50, resultMod:.01
  },
  possession: {
    name:'Posesión', icon:'⚙️', mentality:'balanced',
    desc:'Circulación corta y paciente, dominio del balón, espera abrir huecos.',
    defLine:.50, lineEngage:.55, pressIntensity:.45, counterPress:.55, compactness:.65,
    widthDef:.55, widthAtt:.50, tempo:.55, directness:.25, passLength:.20,
    gkDistribution:.20, shootBias:.40, dribbleBias:.50, crossingBias:.25, throughBalls:.50,
    overlap:.55, patience:.85, offsideTrap:.40, resultMod:0
  },
  gegenpressing: {
    name:'Gegenpressing', icon:'🔥', mentality:'attacking',
    desc:'Recuperación inmediata tras pérdida con presión asfixiante. Demanda físico extremo.',
    defLine:.78, lineEngage:.85, pressIntensity:.95, counterPress:1.0, compactness:.55,
    widthDef:.45, widthAtt:.55, tempo:.85, directness:.55, passLength:.30,
    gkDistribution:.30, shootBias:.55, dribbleBias:.60, crossingBias:.35, throughBalls:.65,
    overlap:.55, patience:.40, offsideTrap:.65, resultMod:.01
  },
  pressing: {
    name:'Presión alta', icon:'🟠', mentality:'positive',
    desc:'Línea alta y presión constante en campo rival. Recupera arriba y juega rápido.',
    defLine:.65, lineEngage:.75, pressIntensity:.80, counterPress:.65, compactness:.55,
    widthDef:.50, widthAtt:.50, tempo:.70, directness:.55, passLength:.35,
    gkDistribution:.30, shootBias:.55, dribbleBias:.50, crossingBias:.30, throughBalls:.55,
    overlap:.55, patience:.45, offsideTrap:.65, resultMod:.005
  },
  counter: {
    name:'Contraataque', icon:'⚡', mentality:'cautious',
    desc:'Bloque medio-bajo. Defiende ordenado, sale en transición rápida hacia los extremos.',
    defLine:.30, lineEngage:.30, pressIntensity:.35, counterPress:.20, compactness:.75,
    widthDef:.40, widthAtt:.65, tempo:.85, directness:.85, passLength:.65,
    gkDistribution:.55, shootBias:.65, dribbleBias:.50, crossingBias:.45, throughBalls:.75,
    overlap:.45, patience:.20, offsideTrap:.20, resultMod:0
  },
  parking: {
    name:'Bloque bajo', icon:'🧱', mentality:'defensive',
    desc:'Defensa muy profunda y compacta. Difícil de superar pero ofensivamente limitada.',
    defLine:.10, lineEngage:.15, pressIntensity:.20, counterPress:.10, compactness:.95,
    widthDef:.30, widthAtt:.40, tempo:.40, directness:.65, passLength:.55,
    gkDistribution:.65, shootBias:.30, dribbleBias:.20, crossingBias:.30, throughBalls:.30,
    overlap:.20, patience:.30, offsideTrap:.10, resultMod:-.005
  },
  direct: {
    name:'Juego directo', icon:'🎯', mentality:'balanced',
    desc:'Balones largos rápidos hacia delanteros físicos. Estilo simple y agresivo.',
    defLine:.40, lineEngage:.45, pressIntensity:.55, counterPress:.40, compactness:.55,
    widthDef:.50, widthAtt:.45, tempo:.60, directness:.90, passLength:.85,
    gkDistribution:.85, shootBias:.55, dribbleBias:.20, crossingBias:.40, throughBalls:.45,
    overlap:.40, patience:.20, offsideTrap:.30, resultMod:0
  },
  wing: {
    name:'Juego por bandas', icon:'↔️', mentality:'balanced',
    desc:'Construcción hacia los extremos, centros constantes al área para los puntas.',
    defLine:.45, lineEngage:.50, pressIntensity:.50, counterPress:.45, compactness:.55,
    widthDef:.65, widthAtt:.85, tempo:.55, directness:.50, passLength:.50,
    gkDistribution:.40, shootBias:.40, dribbleBias:.55, crossingBias:.85, throughBalls:.30,
    overlap:.85, patience:.50, offsideTrap:.35, resultMod:0
  },
  positional: {
    name:'Juego de posición', icon:'♟️', mentality:'positive',
    desc:'Ocupación ordenada de zonas. Atrae el press y libera al hombre libre.',
    defLine:.60, lineEngage:.60, pressIntensity:.55, counterPress:.65, compactness:.70,
    widthDef:.55, widthAtt:.70, tempo:.55, directness:.40, passLength:.30,
    gkDistribution:.25, shootBias:.45, dribbleBias:.45, crossingBias:.30, throughBalls:.55,
    overlap:.65, patience:.75, offsideTrap:.45, resultMod:.005
  },
  vertical: {
    name:'Vertical', icon:'⬆️', mentality:'positive',
    desc:'Posesión ágil con verticalización rápida. Pocos toques, mucho movimiento al espacio.',
    defLine:.55, lineEngage:.60, pressIntensity:.65, counterPress:.65, compactness:.65,
    widthDef:.50, widthAtt:.60, tempo:.80, directness:.65, passLength:.45,
    gkDistribution:.35, shootBias:.55, dribbleBias:.45, crossingBias:.30, throughBalls:.75,
    overlap:.55, patience:.40, offsideTrap:.50, resultMod:.005
  },
  balanced: {
    name:'Equilibrado', icon:'⚖️', mentality:'balanced',
    desc:'Sin extremos. Juego equilibrado entre defensa, posesión y transición.',
    defLine:.50, lineEngage:.50, pressIntensity:.55, counterPress:.50, compactness:.65,
    widthDef:.50, widthAtt:.55, tempo:.55, directness:.45, passLength:.40,
    gkDistribution:.35, shootBias:.45, dribbleBias:.45, crossingBias:.40, throughBalls:.45,
    overlap:.50, patience:.55, offsideTrap:.40, resultMod:0
  }
};

// Aplicar el modificador de mentalidad sobre la táctica
function effectiveTactic(tacticKey, isMyTeam) {
  // Migración de claves antiguas
  if (tacticKey === 'block') tacticKey = 'parking';
  const tac = TACTICS_CFG[tacticKey] || TACTICS_CFG.balanced;
  const m = MENTALITIES[tac.mentality] || MENTALITIES.balanced;
  const c = (v) => Math.max(0, Math.min(1, v));

  // Bonus de entrenamiento táctico (solo al equipo del jugador)
  let tacBonus = 0;
  if (isMyTeam && G && G.club && G.club.trainingBonus && G.club.trainingBonus.tactical
      && G.club.trainingBonus.tacticUsed === tacticKey) {
    tacBonus = 0.05;
  }

  return {
    ...tac,
    defLine:        c(tac.defLine        + m.lineMod),
    lineEngage:     c(tac.lineEngage     + m.lineMod),
    pressIntensity: c(tac.pressIntensity + m.pressMod + tacBonus),
    counterPress:   c(tac.counterPress   + m.pressMod * .8),
    tempo:          c(tac.tempo          + m.tempoMod),
    directness:     c(tac.directness     + m.tempoMod * .5),
    widthAtt:       c(tac.widthAtt       + m.widthMod),
    shootBias:      c(tac.shootBias      + m.riskMod * .5),
    throughBalls:   c(tac.throughBalls   + m.riskMod * .5),
    passBonus:      tacBonus   // pases más precisos con cohesión táctica
  };
}

// Helper para obtener nombre/descripción de táctica con migración automática
function tacticKey(key) {
  if (key === 'block') return 'parking';
  return TACTICS_CFG[key] ? key : 'balanced';
}
function tacticName(key) { return TACTICS_CFG[tacticKey(key)].name; }
function tacticDesc(key) { return TACTICS_CFG[tacticKey(key)].desc; }
function tacticIcon(key) { return TACTICS_CFG[tacticKey(key)].icon || '⚙️'; }

// Lista de todas las tácticas disponibles (para selectores y simulación)
const TACTIC_KEYS = ['tikitaka','possession','gegenpressing','pressing','counter','parking','direct','wing','positional','vertical','balanced'];


// ============================================================
// MATCHUP — relación entre tácticas
// ============================================================
const TACTIC_MATCHUPS = {
  parking:       { tikitaka:.04, possession:.03, positional:.02, gegenpressing:.03, direct:-.04, counter:-.03, wing:-.02 },
  counter:       { tikitaka:.05, gegenpressing:.04, pressing:.04, positional:.02, parking:-.04, direct:-.01, balanced:.01 },
  tikitaka:      { counter:-.04, parking:-.03, pressing:-.02, gegenpressing:-.01, balanced:.02, direct:.03 },
  possession:    { counter:-.03, parking:-.02, gegenpressing:-.02, direct:.02, wing:.01 },
  gegenpressing: { possession:.04, tikitaka:.03, positional:.02, direct:-.04, counter:-.03, parking:-.02 },
  pressing:      { possession:.03, tikitaka:.02, direct:-.03, counter:-.02 },
  direct:        { gegenpressing:.04, pressing:.03, tikitaka:.02, parking:-.02, counter:-.01 },
  wing:          { counter:.02, balanced:.01, parking:-.02, gegenpressing:-.01 },
  positional:    { possession:.01, balanced:.01, counter:-.03, direct:-.01 },
  vertical:      { parking:.02, balanced:.01, gegenpressing:-.03, pressing:-.02 },
  balanced:      {}
};
function getMatchupMod(myTactic, oppTactic) {
  if (myTactic === 'block') myTactic = 'parking';
  if (oppTactic === 'block') oppTactic = 'parking';
  return (TACTIC_MATCHUPS[myTactic] && TACTIC_MATCHUPS[myTactic][oppTactic]) || 0;
}

// ============================================================
// NOMBRES Y EQUIPOS
// ============================================================
const FIRST_NAMES = [
  'Carlos','Luis','Pedro','Miguel','Javier','Andrés','Diego','Sergio','Raúl','Marco',
  'Iván','Bruno','Pablo','Álex','Rubén','Óscar','Jorge','Mario','Hugo','Adrián',
  'Nico','Fernando','Roberto','Álvaro','Héctor','Tomás','Gonzalo','César','Víctor','Dani',
  'Borja','Santi','Jesús','Ismael','Fran','Mateo','Rodrigo','Nicolás','Felipe','Enrique',
  'Manuel','Esteban','Ramón','Julián','Germán','Ernesto','Arturo','Salvador','Cristóbal','Eduardo',
  'Gabriel','Rafael','Lucas','Thiago','Matheus','Anderson','Leandro','Vinicius','Renan','Murilo',
  'Evandro','Fabio','Edson','Wendell','Kaio','Cleber','Yago','Renato','Marcelo','Alexandre',
  'Antoine','Théo','Rayan','Axel','Loïc','Florian','Adrien','Jonathan','Mathieu','Pierre',
  'Nicolas','Laurent','Julien','Thomas','Baptiste','Quentin','Maxime','Romain','Sébastien','Damien',
  'Moussa','Ousmane','Cheick','Hamza','Yusuf','Ayoub','Sofiane','Seko','Wilfried','Maxwell',
  'Franck','Ibrahim','Mamadou','Abdou','Lassana','Seydou','Issiaka','Boubacar','Tidiane','Modibo',
  'Leon','Kai','Florian','Timo','Niklas','Jonas','Erling','Martin','Rasmus','Viktor',
  'Emil','Tobias','Lars','Sander','Mikkel','Lukas','Felix','Simon','Erik','Kristian',
  'James','Jack','Harry','Oliver','Thomas','Ryan','Nathan','Aaron','Scott','Adam',
  'Lorenzo','Matteo','Federico','Giacomo','Andrea','Davide','Simone','Nicolo','Ciro','Luca',
];
const LAST_NAMES = [
  'García','López','Martín','Sánchez','Romero','Torres','Díaz','Ruiz','Hernández','Moreno',
  'Costa','Pérez','Navarro','Iglesias','Ortega','Reyes','Blanco','Serrano','Jiménez','Molina',
  'Vega','Castro','Guerrero','Ramos','Delgado','Campos','Medina','Aguilar','Fuentes','Crespo',
  'Muñoz','Ibáñez','Soler','Ferrer','Gómez','Suárez','Benítez','Calvo','Cabrera','Flores',
  'Herrera','Nieto','Pascual','Rubio','Ureña','Zamorano','Moya','Sala','Gil','Prieto',
  'Ferreira','Santos','Gomes','Silva','Cruz','Nunes','Carvalho','Pereira','Rodrigues','Sousa',
  'Teixeira','Barbosa','Mendes','Pinto','Lopes','Ribeiro','Vieira','Andrade','Oliveira','Nascimento',
  'Moreira','Cardoso','Correia','Azevedo','Batista','Fonseca','Monteiro','Cunha','Almeida','Tavares',
  'Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau',
  'Simon','Laurent','Lefebvre','Michel','Garcia','David','Bertrand','Roux','Vincent','Fournier',
  'Diallo','Traoré','Konaté','Coulibaly','Touré','Bakayoko','Sarr','Camara','Diop','Sylla',
  'Koné','Bamba','Diarra','Cissé','Keita','Doumbia','Sanogo','Dembélé','Sissoko','Ndiaye',
  'Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schulz',
  'Hansen','Andersen','Eriksen','Larsson','Lindqvist','Berg','Johansson','Karlsson','Nilsson','Svensson',
  'Smith','Jones','Williams','Brown','Taylor','Davies','Evans','Wilson','Thomas','Roberts',
  'Rossi','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno',
];
// ============================================================
// GENERADOR DE NOMBRES DE EQUIPOS — combinatorio masivo
// Inspirado en fútbol italiano, inglés, francés, alemán, argentino y brasileño
// ============================================================

const _CITIES = [
  // Grandes ciudades
  'Madrid','Barcelona','Valencia','Sevilla','Zaragoza','Málaga','Murcia','Bilbao','Alicante','Córdoba',
  'Valladolid','Vigo','Gijón','Granada','Elche','Oviedo','Badalona','Terrassa','Hospitalet','Cartagena',
  'Santander','Pamplona','Almería','Burgos','Albacete','Getafe','Salamanca','Huelva','Logroño','San Sebastián',
  'Badajoz','Tarragona','Lleida','Jaén','Ourense','Mataró','Fuenlabrada','Algeciras','Cádiz','Castellón',
  'Leganés','Móstoles','Alcalá','Alcorcón','Torrejón','Parla','Alcobendas','Reus','Sabadell','Girona',
  // Capitales de provincia y ciudades medianas
  'Ávila','Cuenca','Segovia','Soria','Teruel','Zamora','Palencia','Huesca','Cáceres','Mérida',
  'Toledo','Ciudad Real','Guadalajara','Pontevedra','Lugo','León','Vitoria','Pamplona','Ferrol','Avilés',
  'Manresa','Vic','Igualada','Blanes','Granollers','Vilafranca','Berga','Ripoll','Figueres','Olot',
  'Gandía','Sagunto','Dénia','Benidorm','Orihuela','Torrevieja','Petrer','Novelda','Ibi','Alcoy',
  'Linares','Úbeda','Baeza','Andújar','Motril','Antequera','Ronda','Marbella','Estepona','Vélez',
  'Jerez','Sanlúcar','Chiclana','El Puerto','Arcos','Medina','Barbate','Tarifa','La Línea','Algeciras',
  'Écija','Osuna','Marchena','Carmona','Morón','Utrera','Dos Hermanas','Alcalá de Guadaíra',
  'Mérida','Coria','Plasencia','Navalmoral','Trujillo','Montijo','Don Benito','Villanueva',
  'Talavera','Ocaña','Consuegra','Madridejos','Quintanar','Tomelloso','Daimiel','Puertollano',
  'Cuenca','Tarancón','Motilla','Cañete','Huete','Priego','Brihuega','Sigüenza','Molina',
  'Tudela','Estella','Tafalla','Olite','Sangüesa','Puente la Reina','Peralta','Miranda',
  'Durango','Eibar','Arrasate','Tolosa','Zarautz','Hondarribia','Bergara','Azpeitia','Ordizia',
  'Barakaldo','Sestao','Getxo','Leioa','Basauri','Santurtzi','Erandio','Amorebieta',
  'Torrelavega','Castro','Laredo','Santoña','Reinosa','Los Corrales','Guarnizo','Astillero',
  'Ponferrada','Astorga','La Bañeza','Sahagún','Benavente','Bembibre','Villafranca','Fabero',
  'Aranda','Lerma','Miranda de Ebro','Medina de Pomar','Briviesca','Villarcayo',
  'Soria','El Burgo','Almazán','Ólvega','Ágreda',
  'Guadalajara','Azuqueca','El Casar','Alovera','Marchamalo','Cabanillas',
  'Cuellar','Arévalo','Aranda','Peñafiel','Medina del Campo','Tordesillas','Simancas',
  // Pueblos con historia futbolística o carácter
  'Calahorra','Arnedo','Alfaro','Haro','Nájera','Santo Domingo','Ezcaray',
  'Tarazona','Ejea','Borja','Calatayud','Daroca','Cariñena','Belchite','Fraga',
  'Barbastro','Monzón','Sabiñánigo','Jaca','Aínsa','Graus','Benabarre',
  'Alcañiz','Alcorisa','Calanda','Híjar','Andorra','Utrillas','Calamocha',
  'Requena','Utiel','Chelva','Chiva','Liria','Sagunt','Gandia','Oliva','Pego',
  'Yecla','Jumilla','Cieza','Mula','Lorca','Águilas','Mazarrón','Puerto Lumbreras',
  'Baza','Guadix','Loja','Íllora','Montefrío','Alhama','Almuñécar','Salobreña',
  'Úbeda','Quesada','Cazorla','Segura','Beas','Villacarrillo','Torredonjimeno',
  'Peñarroya','Pozoblanco','Montoro','Palma del Río','Aguilar','Cabra','Lucena','Priego',
  'Villamartín','Olvera','Grazalema','Puerto Serrano','El Bosque','Algodonales',
  'Aracena','Valverde','Nerva','Minas','Zalamea','Calañas','Ayamonte','Isla Cristina',
  'Montánchez','Zafra','Almendralejo','Azuaga','Llerena','Fuente de Cantos','Jerez de los Caballeros',
  'Reinosa','Potes','Cabezón','Santoña','Castro Urdiales','Ramales','Ampuero','Colindres',
  'Cangas','Lalín','A Estrada','Ribeira','Noia','Muros','Corcubión','Fisterra',
  'Viveiro','Mondoñedo','Ribadeo','Vilalba','Sarria','Monforte','O Barco','Xinzo',
  'O Porriño','Ponteareas','Tui','Baiona','Redondela','Marín','Cangas','Moaña',
  'Llanes','Cangas de Onís','Arriondas','Infiesto','Pola de Laviana','Mieres','Langreo',
  'El Entrego','Laviana','Pola de Siero','Noreña','Castrillón','Gozón','Valdés','Tineo',
  'Villaviciosa','Colunga','Ribadesella','Navia','Coaña','Castropol',
  'Puigcerdà','Berga','Solsona','Seu d\'Urgell','Tremp','Balaguer','Cervera','Tàrrega','Mollerussa',
  'Amposta','Tortosa','Móra','Gandesa','Falset','Cambrils','Salou','Calafell','Sitges',
  'Vilafranca','Sant Sadurní','Martorell','Esparreguera','Abrera','Olesa',
  'Alcúdia','Manacor','Inca','Llucmajor','Felanitx','Campos','Santanyí','Pollença',
  'Mahón','Ciutadella','Alaior','Ferreries','Es Mercadal',
  'Arrecife','Puerto del Rosario','San Bartolomé','Tías','Arucas','Guía','Gáldar','Moya',
  'Icod','Güímar','Granadilla','Los Llanos','Tazacorte','Breña Alta','Valverde',
];


const _SUFFIXES = [
  // Ingleses
  'United','City','Town','Rovers','Wanderers','Athletic','FC','AFC','County','Rangers',
  'Vale','Wednesday','Thursday','Friday','Hotspur','Palace','Albion','North','South','East','West',
  // Italianos
  'Calcio','FC','AC','SS','AS','SSD','CF','SR','SC',
  // Franceses
  'FC','SC','AS','OC','Sporting','Olympique','Union',
  // Alemanes
  'FC','SC','VfB','VfL','TSV','Borussia','Dynamo','Eintracht','Fortuna','Hansa',
  // Latinos
  'CF','CD','AC','Atlético','Deportivo','Racing','Unión','Sporting','River','Boca',
  'Central','Juniors','Independiente','Nacional','Libertad','Olimpia','Victoria',
];

const _PREFIXES = [
  'Real','Atlético','Sporting','Racing','Club','Olympique','Olympia','Olimpia',
  'FC','SC','AC','CF','CD','AS','SV','FK','VfB','VfL','TSV',
  'Rapid','Dynamo','Fortuna','Borussia','Hansa','Eintracht',
  'Deportivo','Unión','Nacional','Central','Independiente',
];

const _ADJECTIVES = [
  'United','Rojo','Azul','Verde','Negro','Blanco','Dorado','Plateado',
  'Norte','Sur','Este','Oeste','Central','Real','Grande','Nuevo',
  'Royal','Red','Blue','Black','White','Green','Golden','Silver',
  'Rouge','Bleu','Noir','Blanc','Vert','Nord','Sud',
  'Rot','Blau','Schwarz','Weiß','Grün','Nord','Süd',
  'Rojo y Negro','Azul y Blanco','Verde y Blanco','Rojo y Blanco',
];

const _NOUNS = [
  // Animales / emblemas
  'Eagles','Lions','Tigers','Bears','Wolves','Hawks','Falcons','Ravens','Sharks',
  'Dragons','Phoenix','Condors','Jaguars','Panthers','Cobras','Vipers',
  'Águilas','Leones','Tigres','Lobos','Halcones','Dragones','Cóndores',
  'Aioli','Orquídea','Estrella','Diamante','Rayo','Trueno','Tormenta',
  // Lugares / elementos
  'United','City','Town','Park','Vale','Wood','Field','Moor','Hill','Brook',
  'Marina','Costa','Sierra','Bahía','Pampas','Selva','Llanos',
  // Conceptos
  'Athletic','Sporting','Racing','Wanderers','Rovers','Rangers',
  'Warriors','Knights','Crusaders','Spartans','Titans','Gladiators',
  'Olimpia','Victoria','Gloria','Libertad','Imperio','Corona',
];

const _TEAM_COLORS = [
  '#e63946','#457b9d','#2a9d8f','#e9c46a','#f4a261','#264653','#6d6875',
  '#b5838d','#7b2d8b','#1d3557','#2d6a4f','#52b788','#d62828','#023e8a',
  '#fb8500','#8ecae6','#219ebc','#126782','#ffb703','#06d6a0','#118ab2',
  '#073b4c','#ef476f','#ffd166','#7209b7','#3a0ca3','#4361ee','#4cc9f0',
  '#f72585','#b5179e','#560bad','#480ca8','#3f37c9','#c77dff','#9d4edd',
  '#e07a5f','#3d405b','#81b29a','#f2cc8f','#118ab2','#06d6a0','#ffd166',
  '#ef476f','#0077b6','#00b4d8','#90e0ef','#caf0f8','#d00000','#e85d04',
  '#f48c06','#ffba08','#370617','#6a040f','#9d0208','#dc2f02','#f35b04',
];

// Selector aleatorio local (data.js se carga antes de utils.js)
const _pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Patrones de construcción de nombre
const _PATTERNS = [
  () => `${_pick(_PREFIXES)} ${_pick(_CITIES)}`,
  () => `${_pick(_CITIES)} ${_pick(_SUFFIXES)}`,
  () => `${_pick(['Real','Atlético','Sporting','Racing','Deportivo','Unión','Nacional','Rapid','Dynamo','Fortuna'])} ${_pick(_CITIES)}`,
  () => `${_pick(_CITIES)} ${_pick(['Central','Norte','Sur','Este','Oeste','United','Athletic','Sporting','Racing','FC','CF','SC'])}`,
  () => `${_pick(['FC','SC','AC','AS','CD','CF','FK','VfL','VfB','TSV','SS'])} ${_pick(_CITIES)}`,
  () => `${_pick(['Olympique','Borussia','Eintracht','Hansa','Fortuna','Olympia','Esperanza','Progreso'])} ${_pick(_CITIES)}`,
  () => `${_pick(_CITIES)} ${_pick(['Wanderers','Rovers','Rangers','Athletic','United','City','Town','County','Hotspur','Albion'])}`,
  () => `${_pick(_CITIES)} FC`,
  () => `${_pick(_CITIES)} SC`,
  () => `${_pick(_CITIES)} CF`,
];

function _genTeamName(used = new Set()) {
  let name, tries = 0;
  do {
    name = _pick(_PATTERNS)();
    tries++;
  } while (used.has(name) && tries < 100);
  used.add(name);
  return name;
}

function _genAbbr(name) {
  const stop = new Set(['de','del','la','le','les','des','van','von','fc','sc','ac','as','cf','cd','ss','vfb','vfl','tsv','fk']);
  const words = name.split(/\s+/).filter(w => !stop.has(w.toLowerCase()));
  if (words.length >= 3) return (words[0][0]+words[1][0]+words[2][0]).toUpperCase();
  if (words.length === 2) return (words[0].slice(0,2)+words[1][0]).toUpperCase();
  return name.slice(0,3).toUpperCase();
}

function _genColor(used = new Set()) {
  const available = _TEAM_COLORS.filter(c => !used.has(c));
  const pool = available.length > 0 ? available : _TEAM_COLORS;
  const c = _pick(pool);
  used.add(c);
  return c;
}

function generateTeamPool(n) {
  const usedNames = new Set();
  const usedColors = new Set();
  return Array.from({length: n}, () => {
    const name = _genTeamName(usedNames);
    return { name, abbr: _genAbbr(name), color: _genColor(usedColors) };
  });
}

// Los equipos se generan dinámicamente en createLeague via generateTeamPool()

const POS_ROLE = {GK:'GK',CB:'DEF',LB:'DEF',RB:'DEF',CDM:'MID',CM:'MID',LM:'MID',RM:'MID',CAM:'MID',LW:'FWD',RW:'FWD',ST:'FWD'};

// ============================================================
// DIVISION CONFIG
// ============================================================
const TEAMS_PER_DIV = 18;
const ROUNDS_PER_SEASON = 34;

const DIV_CFG = {
  1: { name:'Primera División',  baseQuality:78, qualitySpread:8, startBudget:8000000 },
  2: { name:'Segunda División',  baseQuality:65, qualitySpread:8, startBudget:2000000 }
};

const LEAGUE_PRIZES = {
  1: [5000000,3000000,2000000,1500000,1200000,1000000,900000,800000,700000,600000,500000,400000,350000,300000,250000,200000,150000,100000],
  2: [1500000,1000000,700000,500000,400000,300000,250000,220000,180000,150000,120000,100000,90000,80000,70000,60000,50000,40000]
};

const PROMOTION_BONUS = 3000000;
const CUP_PRIZES = { winner:3000000, finalist:1500000, semi:700000, quarter:300000, r16:120000 };

const CUP_PARTICIPANTS = 24;
const CUP_DIV1_SEEDS = 12;
const CUP_DIV2_FROM_QUALIFIER = 12;

const PLAYER_AGE_MIN = 16, PLAYER_AGE_MAX = 38;
const PLAYER_PEAK_MIN = 26, PLAYER_PEAK_MAX = 30;
const POTENTIAL_GROWTH_MAX = 14;
const VETERAN_DECLINE_MAX = 18;

// ============================================================
// CALENDARIO DE FECHAS
// ============================================================
// La season arranca en agosto del año actual y termina en mayo/junio del siguiente.
// Matchday 0 = preseason/mercado (julio-agosto)
// J1 = 1ª semana de agosto → J34 = última semana de mayo del año siguiente

const MONTH_NAMES_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Devuelve la fecha estimada de una jornada en formato "15 Ago 2025"
function jornadaToDate(jornada, season) {
  // Season 1 arranca en 2025 (año base). Cada season +1 año.
  const startYear = 2024 + (season || 1);
  // J0 (preseason) = julio
  // J1 = 1ª semana agosto, J4 ≈ fin agosto (cierre mercado verano)
  // J17-18 = enero (mercado invierno)
  // J34 = mayo/junio
  const schedule = [
    { j:  0, month: 6, day: 15 }, // 15 julio — preseason / mercado verano abre
    { j:  1, month: 7, day:  4 }, // 4 agosto
    { j:  2, month: 7, day: 11 },
    { j:  3, month: 7, day: 18 },
    { j:  4, month: 7, day: 25 }, // ≈ cierre mercado verano (31 ago)
    { j:  5, month: 8, day:  8 },
    { j:  6, month: 8, day: 15 },
    { j:  7, month: 8, day: 22 },
    { j:  8, month: 8, day: 29 },
    { j:  9, month: 9, day:  6 },
    { j: 10, month: 9, day: 13 },
    { j: 11, month: 9, day: 20 },
    { j: 12, month: 9, day: 27 },
    { j: 13, month:10, day:  4 },
    { j: 14, month:10, day: 18 },
    { j: 15, month:10, day: 25 },
    { j: 16, month:11, day:  1 },
    { j: 17, month:11, day:  8 }, // nov/dic — mercado invierno
    { j: 18, month:11, day: 22 },
    { j: 19, month:11, day: 29 },
    { j: 20, month:12, day:  6 },  // enero año siguiente
    { j: 21, month: 0, day:  5, nextYear: true },
    { j: 22, month: 0, day: 12, nextYear: true },
    { j: 23, month: 0, day: 19, nextYear: true },
    { j: 24, month: 0, day: 26, nextYear: true },
    { j: 25, month: 1, day:  2, nextYear: true },
    { j: 26, month: 1, day:  9, nextYear: true },
    { j: 27, month: 1, day: 16, nextYear: true },
    { j: 28, month: 1, day: 23, nextYear: true },
    { j: 29, month: 2, day:  2, nextYear: true },
    { j: 30, month: 2, day: 16, nextYear: true },
    { j: 31, month: 2, day: 23, nextYear: true },
    { j: 32, month: 3, day:  6, nextYear: true },
    { j: 33, month: 3, day: 20, nextYear: true },
    { j: 34, month: 4, day:  4, nextYear: true }, // mayo — fin de season
  ];
  const entry = schedule.find(s => s.j === jornada) || schedule[Math.min(jornada, schedule.length-1)];
  const year = entry.nextYear ? startYear + 1 : startYear;
  return { day: entry.day, month: entry.month, year };
}

function jornadaDateStr(jornada, season, lang) {
  const d = jornadaToDate(jornada, season);
  const names = (lang || 'es') === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  return `${d.day} ${names[d.month]} ${d.year}`;
}

// Ventana de fichajes basada en calendario real
// Mercado de verano: J0 hasta J4 (julio-agosto)
// Mercado de invierno: J17-J18 (enero)
// Mercado de final de season: tras J34 (julio)
function getTransferWindowInfo(jornada) {
  if (jornada <= 4) return { open: true, window: 'summer' };
  if (jornada >= 17 && jornada <= 18) return { open: true, window: 'winter' };
  if (jornada >= 34) return { open: true, window: 'endseason' };
  return { open: false };
}

const LEVEL_CFG = { amateur:{quality:58,budget:500000,opp:54}, semipro:{quality:70,budget:2000000,opp:66}, pro:{quality:82,budget:10000000,opp:79} };
