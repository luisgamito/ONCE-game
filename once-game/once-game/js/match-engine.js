// MATCH SETUP
// ============================================================
let match = null;
let simInterval = null;
let simSpeed = 120;
let isPlaying = false;
let currentLogFilter = 'all';
let autoScroll = true;
let subsRemaining = 5;
let pendingSubs = []; // [{out, in}]
let subPendingOut = null;

function startMatch() {
  const event = getNextEvent();
  if (!event) { alert('No hay más partidos en esta temporada'); return; }

  let oppId, myIsHome, competition, eventLabel;
  if (event.type === 'league') {
    oppId = event.fixture.home==='player' ? event.fixture.away : event.fixture.home;
    myIsHome = event.fixture.home==='player';
    competition = 'league';
    const myDiv = getMyDivision();
    eventLabel = `Jornada ${myDiv.currentJornada+1} · ${myDiv.name}`;
  } else {
    oppId = event.tie.home==='player' ? event.tie.away : event.tie.home;
    myIsHome = event.tie.home==='player';
    competition = 'cup';
    eventLabel = `Copa Nacional · ${event.round.name}`;
  }

  const myTeam = getMyTeam();
  const oppTeam = getTeamById(oppId);
  if (!oppTeam) { alert('Error: rival no encontrado'); return; }

  // Comprobar si hay jugadores no disponibles en el 11 inicial
  const unavailableInSquad = myTeam.squad.filter(p =>
    p.inSquad && ((p.injury && p.injury.jornadasLeft > 0) || (p.suspension && p.suspension > 0))
  );

  if (unavailableInSquad.length > 0) {
    const names = unavailableInSquad.map(p => {
      const reason = (p.injury && p.injury.jornadasLeft > 0)
        ? `🩹 ${p.name} (lesión, ${p.injury.jornadasLeft}j)`
        : `🟥 ${p.name} (sancionado, ${p.suspension}j)`;
      return reason;
    }).join('\n');
    alert(`No puedes jugar el partido. Debes reemplazar a los siguientes jugadores del once inicial:\n\n${names}\n\nVe a Plantilla → pulsa sobre el jugador para sustituirlo.`);
    // Redirigir al panel de plantilla
    showScreen('screen-hub');
    switchHubPanel('panel-squad');
    return;
  }

  // Filtrar para el partido solo jugadores disponibles
  const availableStarters = myTeam.squad.filter(p =>
    p.inSquad &&
    !(p.injury && p.injury.jornadasLeft > 0) &&
    !(p.suspension && p.suspension > 0)
  );
  if (availableStarters.length < 11) {
    const benchAvailable = myTeam.squad.filter(p =>
      !p.inSquad &&
      !(p.injury && p.injury.jornadasLeft > 0) &&
      !(p.suspension && p.suspension > 0)
    );
    const needed = 11 - availableStarters.length;
    for (let i = 0; i < needed && i < benchAvailable.length; i++) {
      benchAvailable[i]._tempStarter = true;
    }
  }
  const matchStarters = [
    ...availableStarters.slice(0, 11),
    ...myTeam.squad.filter(p => p._tempStarter && !(p.injury?.jornadasLeft > 0) && !(p.suspension > 0))
  ].slice(0, 11);

  if (matchStarters.length < 11) {
    alert(`No tienes suficientes jugadores disponibles (${matchStarters.length}/11). Demasiadas bajas.`);
    showScreen('screen-hub');
    switchHubPanel('panel-squad');
    return;
  }

  const myMatchTeam = createMatchTeam(matchStarters, G.club.formation, G.club.tactic, G.club.name, myIsHome?'A':'B');
  myMatchTeam.bench = myTeam.squad.filter(p =>
    !matchStarters.includes(p) &&
    !(p.injury && p.injury.jornadasLeft > 0) &&
    !(p.suspension && p.suspension > 0)
  );
  myMatchTeam.squad = myTeam.squad;
  myMatchTeam.color = G.club.color;

  const oppStarters = oppTeam.squad.filter(p=>p.inSquad).slice(0,11);
  const oppMatchTeam = createMatchTeam(oppStarters, oppTeam.formation, oppTeam.tactic, oppTeam.name, myIsHome?'B':'A');

  const teamA = myIsHome ? myMatchTeam : oppMatchTeam;
  const teamB = myIsHome ? oppMatchTeam : myMatchTeam;

  // Reset _tempStarter flag
  myTeam.squad.forEach(p => delete p._tempStarter);

  const kicker = teamA.starters.find(p=>p.pos==='CAM')||teamA.starters.find(p=>p.pos==='CM')||teamA.starters[5];
  kicker.x=.5; kicker.y=.5;

  match = {
    teamA, teamB,
    myTeamSide: myIsHome?'A':'B',
    myIsHome,
    oppId,
    competition,
    tick:0, totalTicks:180, period:'first', state:'playing',
    ballX:.5, ballY:.5, ballHolder:kicker, possession:'A',
    phase:'kickoff', extraTicks:0, addedTimeTicks:0, log:[]
  };

  subsRemaining = 5;
  pendingSubs = [];
  subPendingOut = null;
  // Kill any leftover interval from previous match
  clearInterval(simInterval);
  simInterval = null;
  isPlaying = false;
  autoScroll = true;
  currentLogFilter = 'all';

  document.getElementById('mhTeamOwn').textContent = G.club.name;
  document.getElementById('mhTeamOpp').textContent = oppTeam.name;
  document.getElementById('mhScoreOwn').textContent = '0';
  document.getElementById('mhScoreOpp').textContent = '0';
  document.getElementById('matchLog').innerHTML = '';
  const btnPlay = document.getElementById('btnPlay');
  btnPlay.textContent = '▶ PLAY';
  btnPlay.disabled = false;  // Always re-enable for new match
  document.getElementById('liveIndicator').className = 'live-indicator';
  document.getElementById('liveIndicator').innerHTML = '<div class="live-dot"></div>EN VIVO';
  setLogFilter('all');
  switchMatchTab('log');
  updateSubsUI();
  updateTacticLiveUI();
  showScreen('screen-match');
  initPitch();
  const compIcon = competition === 'cup' ? '🏅' : '🏟';
  addLog(`${compIcon} ${teamA.name} vs ${teamB.name} — ${eventLabel}`, 'event-whistle');
  addLog(`${myMatchTeam.name}: ${G.club.formation} | ${tacticName(G.club.tactic)}`, 'normal');
  renderMatchSquad();
}

// ============================================================
// SIMULATION ENGINE (adapted from simulator)
// ============================================================
const effectiveAttr = (p,k) => {
  const f=p.fatigue;
  const fm=f>70?1:f>50?.92:f>30?.80:.65;
  return p.attr[k]*fm;
};
const advance = p => p.side==='A'?p.x:1-p.x;
const getTeam  = s => s==='A'?match.teamA:match.teamB;
const getOpp   = s => s==='A'?match.teamB:match.teamA;
const fieldP   = t => t.starters.filter(p=>p.onField);
const findGK   = t => t.starters.find(p=>p.pos==='GK'&&p.onField);

function moveToward(p,tx,ty,sp) {
  const dx=tx-p.x,dy=ty-p.y,d=Math.sqrt(dx*dx+dy*dy);
  if(d<.005)return;
  const s=Math.min(sp,d);
  p.x+=dx/d*s; p.y+=dy/d*s;
}

function findNearestOpp(p,oppTeam) {
  let nearest=null,minD=Infinity;
  fieldP(oppTeam).forEach(op=>{const d=distP(p,op);if(d<minD){minD=d;nearest=op;}});
  return {player:nearest,dist:minD};
}

function updatePositions() {
  const bx = match.ballX, by = match.ballY;
  [match.teamA, match.teamB].forEach(team => {
    const cfg = effectiveTactic(team.tactic);
    const oppCfg = effectiveTactic(getOpp(team.side).tactic);
    const hasBall = match.possession === team.side;
    const recentlyLostBall = team.lastLossTick && (match.tick - team.lastLossTick < 8);
    const recentlyWonBall  = team.lastWinTick  && (match.tick - team.lastWinTick  < 8);

    // Avance del balón en el campo (0 = portería propia, 1 = portería rival)
    const ballAdv = team.side === 'A' ? bx : 1 - bx;

    fieldP(team).forEach(p => {
      // El portador del balón empuja hacia adelante con cuidado
      if (p === match.ballHolder) {
        const ax = team.side === 'A' ? 1 : 0;
        moveToward(p, p.x*.85 + ax*.15, p.y, .015);
        return;
      }

      const pers = p.personality;
      const role = ROLES[p.matchRole] || ROLES[p.role] || ROLES.CM;

      // Drift natural — pequeñas desviaciones para no parecer un cuadro estático
      if (match.tick - p.driftRefreshTick > 10 + Math.floor(rnd(0,8))) {
        p.driftX = rnd(-.025, .025) * pers.flair;
        p.driftY = rnd(-.035, .035) * pers.flair;
        p.driftRefreshTick = match.tick;
      }

      // ===========================================
      // POSICIÓN BASE: depende de fase (def/att) e instrucciones tácticas
      // ===========================================
      let baseX, baseY;
      if (hasBall) {
        // En posesión: usa la posición ofensiva del slot
        baseX = (p.attX != null ? p.attX : p.baseX);
        baseY = (p.attY != null ? p.attY : p.baseY);
        // Modificador por instrucciones:
        // tempo + directness empujan más arriba
        const pushFwd = (cfg.tempo - .5) * .04 + (cfg.directness - .5) * .04;
        if (team.side === 'A') baseX += pushFwd;
        else baseX -= pushFwd;
        // overlap: laterales/carrileros suben más
        if (role.overlap && role.overlap > 0) {
          const overlapPush = role.overlap * cfg.overlap * .12;
          if (team.side === 'A') baseX += overlapPush;
          else baseX -= overlapPush;
        }
        // widthAtt: jugadores de banda se abren o cierran
        const sideY = baseY < .5 ? -1 : 1;  // hacia qué banda (arriba=−1, abajo=+1)
        if (role.widthBoost) {
          const widening = (cfg.widthAtt - .5) * role.widthBoost * .12;
          baseY += widening * sideY;
        }
        // cutInside (extremos invertidos): se meten al interior
        if (role.cutInside && ballAdv > .55) {
          baseY -= sideY * .08 * cfg.directness;
        }
      } else {
        // Sin balón: usa la posición defensiva del slot
        baseX = (p.defX != null ? p.defX : p.baseX);
        baseY = (p.defY != null ? p.defY : p.baseY);
        // defLine global: mueve toda la defensa adelante o atrás
        const lineShift = (cfg.defLine - .5) * .22;
        if (team.side === 'A') baseX += lineShift;
        else baseX -= lineShift;
        // compactness: comprime el bloque hacia el centro de masa
        const teamCenter = .5; // simplificado
        const yCompress = (cfg.compactness - .5) * .25;
        baseY = baseY + (teamCenter - baseY) * yCompress;
        // widthDef: amplía o estrecha el bloque defensivo
        const sideY = baseY < .5 ? -1 : 1;
        const widthShift = (cfg.widthDef - .5) * .10 * Math.abs(.5 - baseY) * 2;
        baseY += widthShift * sideY;
      }

      // ===========================================
      // BALL FOLLOW: el bloque se desplaza hacia el balón
      // ===========================================
      const ballSideY = by;
      const followY = hasBall ? .15 : .35;  // sin balón se sigue más al lado del balón
      let tx = baseX;
      let ty = baseY * (1 - followY) + ballSideY * followY;

      // Desorden por baja disciplina posicional
      const yDrift = (1 - pers.posDiscipline) * .25;
      ty += p.driftY * (1 + yDrift);
      tx += p.driftX;

      // ===========================================
      // PRESSING: si están sin balón y cerca del portador, presionan
      // ===========================================
      if (!hasBall) {
        const dBall = distP(p, {x:bx, y:by});
        // Counter-press inmediato tras pérdida
        const isCounterPressing = recentlyLostBall && cfg.counterPress > .6;
        // Press normal: depende de lineEngage (cuánto avanza la línea de presión)
        const oppHalf = team.side === 'A' ? bx > .5 : bx < .5;
        const inEngagementZone = team.side === 'A' ? bx > (1 - cfg.lineEngage * .85) : bx < (cfg.lineEngage * .85);

        let shouldPress = false;
        let pressDist = .15;
        if (isCounterPressing) {
          shouldPress = dBall < .25;
          pressDist = .25;
        } else if (cfg.pressIntensity > .3 && (inEngagementZone || dBall < .20)) {
          // Solo los jugadores cercanos presionan
          if (dBall < .18 + cfg.pressIntensity * .10) shouldPress = true;
        }
        if (shouldPress) {
          // Mover hacia el balón
          tx = bx * .65 + tx * .35;
          ty = by * .65 + ty * .35;
        }
      } else {
        // Con balón: empuje hacia delante según tempo
        const tempoRush = (cfg.tempo - .5) * .06;
        if (team.side === 'A') tx += Math.max(0, tempoRush);
        else tx -= Math.max(0, tempoRush);
      }

      tx = clamp(tx, .02, .98);
      ty = clamp(ty, .03, .97);

      // ===========================================
      // VELOCIDAD: intensidad según situación
      // ===========================================
      const dTgt = distP(p, {x:tx, y:ty});
      const dBall = distP(p, {x:bx, y:by});
      let intensity = clamp(dTgt * 4, 0, 1);
      if (dBall < .20) intensity = Math.max(intensity, .55);
      if (dBall < .10) intensity = Math.max(intensity, .85);
      if (!hasBall && dBall < .25) intensity = Math.max(intensity, cfg.pressIntensity * .9);
      if (recentlyLostBall && cfg.counterPress > .6) intensity = Math.max(intensity, cfg.counterPress * .9);
      if (recentlyWonBall  && cfg.directness > .6 && dBall > .15) intensity = Math.max(intensity, cfg.directness * .7);
      // Atacantes en zona ofensiva con balón
      const myAdv = team.side === 'A' ? p.x : 1 - p.x;
      if (hasBall && (role.attack && role.attack > .5) && ballAdv > .55 && myAdv > .55) {
        intensity = Math.max(intensity, .65);
      }
      intensity *= pers.urgency;
      intensity = clamp(intensity, 0, 1);
      const delta = intensity - p.currentSpeed;
      p.currentSpeed += clamp(delta, -.25, .35);
      p.currentSpeed = clamp(p.currentSpeed, 0, 1);

      const attrSp = effectiveAttr(p, 'speed');
      const baseSpd = .025 + (attrSp/100) * .055;
      const fatF = p.fatigue > 60 ? 1 : p.fatigue > 30 ? .85 : .65;
      const intScale = .35 + p.currentSpeed * .65;
      moveToward(p, tx, ty, baseSpd * intScale * fatF);

      // Fatiga: el press y el counter-press desgastan más
      if (p.currentSpeed > .7) {
        let drain = .18 * (p.currentSpeed - .7) / pers.stamina;
        if (cfg.pressIntensity > .7) drain *= 1.20;
        if (recentlyLostBall && cfg.counterPress > .7) drain *= 1.30;
        p.fatigue = clamp(p.fatigue - drain, 0, 100);
      }
    });
  });
}

function processTick() {
  if(!match||match.state!=='playing')return;
  match.tick++;
  const team=getTeam(match.possession);
  const opp=getOpp(match.possession);
  team.possession++;
  [match.teamA,match.teamB].forEach(t=>fieldP(t).forEach(p=>{
    // Drain base por tick: con 360 ticks llegan a ~30-40 de fatiga
    const drain = 0.20 + (p.currentSpeed || 0) * 0.08;
    p.fatigue = clamp(p.fatigue - drain, 0, 100);
  }));
  updatePositions();

  applyPendingSubs();

  const holder=match.ballHolder;
  match.ballX=holder.x; match.ballY=holder.y;
  const oppCfg=effectiveTactic(opp.tactic);
  const ourCfg=effectiveTactic(team.tactic);
  const adv=advance(holder);
  const nearestOpp=findNearestOpp(holder,opp);
  // Distancia para considerar "presionado": depende de la pressIntensity rival
  const beingPressed=nearestOpp.dist<.08+oppCfg.pressIntensity*.07;
  const isAtk=['ST','LW','RW','CAM','LM','RM'].includes(holder.pos);
  const isMid=['CM','CDM'].includes(holder.pos);
  const isGK=holder.pos==='GK';
  const isFB=['LB','RB'].includes(holder.pos);
  const role=ROLES[holder.matchRole]||ROLES[holder.role]||ROLES.CM;

  // Acabamos de ganar el balón → transición ofensiva
  const justWonBall = team.lastWinTick && (match.tick - team.lastWinTick < 6);

  let phase;
  if(adv<.30)phase='buildup';
  else if(adv<.60)phase='progression';
  else if(adv<.82)phase='attack';
  else phase='danger';

  if(match.phase==='kickoff'){match.phase='buildup';return executeKickoffPass(holder,team);}
  if(isGK)return executeGKDistribution(holder,team,opp);

  // ===========================================
  // BUILDUP (zona propia)
  // ===========================================
  if(phase==='buildup'){
    if(beingPressed&&chance(.35)){
      if(chance(.18*oppCfg.pressIntensity))return executeInterception(holder,team,opp,nearestOpp.player);
      if(chance(.06))return executeFoul(holder,team,opp,nearestOpp.player);
    }
    // En transición ofensiva con táctica directa, lanzar balón largo en lugar de pase seguro
    if(justWonBall && ourCfg.directness>.7 && chance(ourCfg.directness*.5)){
      return executePass(holder,team,opp,'attacking');
    }
    // Centrales con salida (BPD) y DLP intentan pases progresivos
    if(role.buildupRole && chance(.4 + ourCfg.tempo*.3)){
      return executePass(holder,team,opp,'progressive');
    }
    return executePass(holder,team,opp,'safe');
  }

  // ===========================================
  // PROGRESSION (medio campo)
  // ===========================================
  if(phase==='progression'){
    if(beingPressed){
      if(chance(.15*oppCfg.pressIntensity+.05))return executeInterception(holder,team,opp,nearestOpp.player);
      if(chance(.08*oppCfg.pressIntensity+.03))return executeFoul(holder,team,opp,nearestOpp.player);
      if((isAtk||isMid)&&chance(.20+ourCfg.dribbleBias*.3))return executeDribble(holder,team,opp,nearestOpp.player);
    }
    // Tiro de larga distancia (rare)
    if(!beingPressed&&adv>.50&&(isMid||isAtk)&&chance(.06+ourCfg.shootBias*.20)){
      return executeShot(holder,team,opp,'long');
    }
    // Carrileros y laterales que llevan el balón cuando hay overlap activo
    if(!beingPressed && (isFB||role.overlap>0) && ourCfg.overlap>.6 && chance(.45)){
      return executeCarry(holder,team);
    }
    // Tempo alto = decisión rápida de progresar; tempo bajo = paciencia
    if(!beingPressed&&(isAtk||isMid)&&chance(.30+ourCfg.tempo*.30)){
      return executeCarry(holder,team);
    }
    // Pase progresivo / vertical
    return executePass(holder,team,opp,'progressive');
  }

  // ===========================================
  // ATTACK (último tercio)
  // ===========================================
  if(phase==='attack'){
    if(beingPressed){
      if(chance(.13*oppCfg.pressIntensity+.05))return executeInterception(holder,team,opp,nearestOpp.player);
      if(chance(.10*oppCfg.pressIntensity+.04))return executeFoul(holder,team,opp,nearestOpp.player);
    }
    if((isAtk||isMid)&&beingPressed&&chance(.30+ourCfg.dribbleBias*.4))return executeDribble(holder,team,opp,nearestOpp.player);
    // Tiro
    if(isAtk){
      let sp=(adv-.60)/.22*.45+.12+ourCfg.shootBias*.35;
      if(beingPressed)sp*=.6;
      sp*=clamp(1-Math.abs(holder.y-.5)*1.5,.3,1);
      if(chance(sp))return executeShot(holder,team,opp,'normal');
    }
    // Si táctica de bandas y estamos en banda, centrar
    if(ourCfg.crossingBias>.7 && (isFB||['LM','RM','LW','RW'].includes(holder.pos))){
      const onWing = holder.y < .25 || holder.y > .75;
      if(onWing && chance(ourCfg.crossingBias*.5)){
        return executePass(holder,team,opp,'final');
      }
    }
    if(!beingPressed&&chance(.35+ourCfg.tempo*.25))return executeCarry(holder,team);
    return executePass(holder,team,opp,'attacking');
  }

  // ===========================================
  // DANGER (área rival)
  // ===========================================
  if(phase==='danger'){
    if(beingPressed){
      if(chance(.12*oppCfg.pressIntensity+.04))return executeInterception(holder,team,opp,nearestOpp.player);
      if(chance(.14))return executeFoul(holder,team,opp,nearestOpp.player);
    }
    if((isAtk||isMid)&&beingPressed&&chance(.45))return executeDribble(holder,team,opp,nearestOpp.player);
    if(isAtk||isMid){
      let sp=(adv-.80)/.18*.60+.40+ourCfg.shootBias*.25;
      if(beingPressed)sp*=.75;
      sp*=clamp(1-Math.abs(holder.y-.5)*1.4,.4,1);
      // Goleadores natos disparan más
      if(role.poach) sp*=1.25;
      sp=clamp(sp,.30,.90);
      if(chance(sp))return executeShot(holder,team,opp,'normal');
    }
    return executePass(holder,team,opp,'final');
  }
  return executePass(holder,team,opp,'safe');
}

function executeKickoffPass(holder,team){
  team.passes++;holder.match.passes++;
  const teammates=fieldP(team).filter(p=>p!==holder);
  const cands=teammates.map(t=>({p:t,d:distP(holder,t)})).filter(c=>c.d<.25).sort((a,b)=>a.d-b.d);
  const tgt=cands[0]?.p||teammates[0];
  if(!tgt)return finishTick(`${holder.name} saca... y pierde el balón`,'normal');
  holder.match.passSuccess++;
  match.ballHolder=tgt; match.ballX=tgt.x; match.ballY=tgt.y;
  return finishTick(`${holder.name} pone el balón en juego → ${tgt.name}`,'event-whistle');
}

function executeGKDistribution(holder,team,opp){
  team.passes++;holder.match.passes++;
  const cfg=effectiveTactic(team.tactic);
  const tm=fieldP(team).filter(p=>p!==holder);
  let tgt;
  if(chance(cfg.gkDistribution)){
    const adv=tm.filter(p=>['ST','LW','RW','CAM'].includes(p.pos));
    tgt=adv[Math.floor(Math.random()*adv.length)]||tm[tm.length-1];
  }else{
    const safe=tm.filter(p=>['CB','LB','RB','CDM'].includes(p.pos));
    tgt=safe.sort((a,b)=>distP(holder,a)-distP(holder,b))[0]||tm[0];
  }
  if(!tgt)return finishTick(`${holder.name} despeja`,'normal');
  const pd=distP(holder,tgt);
  const sk=(effectiveAttr(holder,'technique')*.4+effectiveAttr(holder,'vision')*.6)/100;
  let ps=clamp(.55+sk*.45-pd*.35+rnd(-.10,.10),.25,.95);
  if(chance(ps)){
    holder.match.passSuccess++;
    match.ballHolder=tgt; match.ballX=tgt.x; match.ballY=tgt.y;
    return finishTick(pd>.4?`${holder.name} envía largo → ${tgt.name}`:`${holder.name} → ${tgt.name}`,'normal');
  }
  const intc=findNearestOpp(tgt,opp).player;
  if(intc){match.possession=opp.side;match.ballHolder=intc;match.ballX=intc.x;match.ballY=intc.y;return finishTick(`Pase errado de ${holder.name} — ${intc.name} controla`,'normal');}
  return finishTick(`${holder.name} despeja el balón`,'normal');
}

function executePass(holder,team,opp,passType='normal'){
  team.passes++;holder.match.passes++;
  const cfg=effectiveTactic(team.tactic);
  const tm=fieldP(team).filter(p=>p!==holder);
  if(!tm.length)return finishTick(`${holder.name} pierde el balón`,'normal');
  const myAdv=team.side==='A'?holder.x:1-holder.x;

  let cands=tm.map(t=>{
    const od=findNearestOpp(t,opp).dist;
    const free=clamp(od*5,.2,1.5);
    const ta=team.side==='A'?t.x:1-t.x;
    const fwd=ta-myAdv;
    const pd=distP(holder,t);
    const isWide=['LB','LM','LW','RB','RM','RW','WB'].includes(t.pos) || (t.y < .22 || t.y > .78);
    const isFwd=['ST','LW','RW','CAM'].includes(t.pos);
    const onWingNow = t.y < .22 || t.y > .78;
    const inBox = team.side==='A' ? t.x>.82 : t.x<.18;

    // Bonus por tipo de pase y por instrucciones tácticas
    const widthBonus = isWide ? cfg.widthAtt*.5 : 0;
    const longBonus = pd>.35 ? cfg.passLength*.7 : 0;
    const directBonus = fwd>.10 ? cfg.directness*.6 : 0;
    const throughBonus = (fwd>.20 && cfg.throughBalls>.5) ? cfg.throughBalls*.5 : 0;
    const crossBonus = (cfg.crossingBias>.6 && onWingNow && fwd>.05) ? cfg.crossingBias*.4 : 0;

    let sc;
    if(passType==='safe') {
      // Paciencia → pases laterales/atrás. Tempo alto → progresar
      sc = -pd*2 + free*1 + (fwd<.10?.5*cfg.patience:-.4) + (cfg.tempo-.5)*.6 + longBonus*.2;
    } else if(passType==='progressive') {
      sc = fwd*2 + free*.6 - clamp(pd-.30,0,1)*1.2 + widthBonus + longBonus + directBonus + throughBonus;
    } else if(passType==='attacking') {
      const fwdBonus = isFwd ? .5 : 0;
      sc = fwd*2.5 + ta*1.5 + free*.5 + fwdBonus + widthBonus + throughBonus + directBonus*.5;
    } else if(passType==='final') {
      sc = (inBox?.8:0) + free*1.2 + ta + fwd*.5 + widthBonus*.5 + crossBonus;
    } else {
      sc = fwd*1.5 + ta + free*.4 + rnd(-.2,.2) + widthBonus + longBonus*.5;
    }
    return {p:t, sc, od, pd, isWide, isFwd};
  });
  cands.sort((a,b)=>b.sc-a.sc);
  if(!cands.length)return finishTick(`${holder.name} pierde el balón`,'normal');

  // Tactica con vision baja → escoge entre top opciones (más errático)
  let td = chance(.15) && cands.length>3 ? cands[Math.floor(rnd(1,Math.min(4,cands.length)))] : cands[0];
  if(!td||!td.p)return finishTick(`${holder.name} pierde el balón`,'normal');

  const tgt = td.p;
  const sk = (effectiveAttr(holder,'technique')*.5 + effectiveAttr(holder,'vision')*.5)/100;
  const pr = findNearestOpp(holder,opp);

  // Probabilidad de éxito: técnica vs distancia, presión, marca del receptor
  let ps = clamp(
    .55 + sk*.45
    - clamp(td.pd*.45, 0, .45)            // distancia del pase
    - clamp((1-pr.dist*4)*.20, 0, .20)    // presión sobre el pasador
    - clamp((1-td.od*4)*.15, 0, .15)      // marca sobre el receptor
    + rnd(-.10, .10),
    .20, .97
  );

  // Pases largos son más arriesgados pero con buena técnica son posibles
  if(td.pd > .35) ps -= (td.pd - .35) * .25 * (1 - sk * .5);

  // Trampa de fuera de juego del rival
  const ta = team.side==='A' ? tgt.x : 1-tgt.x;
  const fwd = ta - myAdv;
  if(fwd>.10 && ta>.55){
    const oppCfg = effectiveTactic(opp.tactic);
    if(isOffsideFn(tgt,opp) && chance(.30 + oppCfg.offsideTrap*.4)){
      team.offsides++;
      const gk2 = findGK(opp);
      if(gk2){match.possession=opp.side; match.ballHolder=gk2; match.ballX=gk2.x; match.ballY=gk2.y;}
      else {const def=fieldP(opp)[0]; if(def){match.possession=opp.side; match.ballHolder=def; match.ballX=def.x; match.ballY=def.y;}}
      return finishTick(`Fuera de juego de ${tgt.name}`,'normal');
    }
  }

  if(chance(ps)){
    holder.match.passSuccess++;
    match.ballHolder=tgt; match.ballX=tgt.x; match.ballY=tgt.y;
    let msg;
    if(passType==='final' && ta>.82) msg = `${holder.name} pone el último pase → ${tgt.name}`;
    else if(td.pd > .40) msg = `Pase largo de ${holder.name} → ${tgt.name}`;
    else if(fwd>.05) msg = `${holder.name} progresa → ${tgt.name}`;
    else if(fwd<-.05) msg = `${holder.name} la atrasa a ${tgt.name}`;
    else msg = `${holder.name} → ${tgt.name}`;
    return finishTick(msg,'normal');
  }

  // Pase fallido: alta probabilidad de interceptación, registramos transición
  if(chance(.65)){
    const intc = findNearestOpp(tgt,opp).player;
    if(intc){
      registerTransition(team, opp);
      match.possession=opp.side; match.ballHolder=intc; match.ballX=intc.x; match.ballY=intc.y;
      intc.match.tackles++;
      return finishTick(`Pase fallido de ${holder.name} — ${intc.name} (${opp.name}) recupera`,'normal');
    }
  }
  match.ballHolder=tgt; match.ballX=tgt.x; match.ballY=tgt.y;
  return finishTick(`${holder.name} entrega el balón con dificultad a ${tgt.name}`,'normal');
}

// Registrar transición — el equipo que pierde el balón activa counter-press,
// el que lo gana puede activar transición rápida.
function registerTransition(loser, winner) {
  loser.lastLossTick = match.tick;
  winner.lastWinTick = match.tick;
}

function executeShot(holder,team,opp,shotType='normal'){
  let gk=findGK(opp);
  if(!gk)gk=fieldP(opp).find(p=>['CB','LB','RB'].includes(p.pos))||fieldP(opp)[0];
  if(!gk){
    holder.match.shots++;team.shots++;holder.match.shotsOnTarget++;team.shotsOnTarget++;
    holder.match.goals++;holder.match.rating=clamp(holder.match.rating+1.4,0,10);team.score++;
    updateMatchScore();showGoalOverlay();resetKickoff(opp.side);
    return finishTick(`⚽ ¡GOL DE ${holder.name.toUpperCase()}! Portería vacía (${match.teamA.score}–${match.teamB.score})`,'event-goal');
  }

  const adv  = advance(holder);
  const dF   = clamp((adv - .45) / .55, .05, 1);  // bonus por cercanía al gol
  const aF   = clamp(1 - Math.abs(holder.y - .5) * 1.6, .15, 1); // bonus por ángulo central
  const sk   = (effectiveAttr(holder,'shooting')*.60 + effectiveAttr(holder,'technique')*.25 + effectiveAttr(holder,'mentality')*.15) / 100;

  // Calidad del disparo: combinación de habilidad y factor aleatorio (talento vs momento)
  const er   = Math.random();
  let eq;
  if (er < .20) eq = rnd(0, .30);       // disparo malo
  else if (er < .65) eq = rnd(.35, .70); // disparo normal
  else eq = rnd(.65, 1);                 // disparo excelente

  const sq  = sk * .60 + eq * .40;
  let ss = sq * (.30 + dF * .45 + aF * .25);
  if (shotType === 'long') ss *= .65;

  // Umbral para ir a puerta: más bajo → más tiros a puerta
  const otThr = .14 + (1 - sk) * .12 + (1 - eq) * .16 + (shotType === 'long' ? .08 : 0);
  const onTarget = ss > otThr;
  holder.match.shots++; team.shots++;

  if (!onTarget) {
    const msg = shotType === 'long'
      ? `${holder.name} prueba desde lejos — fuera`
      : ss < .12
        ? `${holder.name} dispara muy desviado`
        : chance(.5) ? `Disparo de ${holder.name} — al lateral de la red` : `Disparo de ${holder.name} — fuera`;
    match.possession = opp.side; match.ballHolder = gk; match.ballX = gk.x; match.ballY = gk.y;
    return finishTick(msg, 'event-shot');
  }

  holder.match.shotsOnTarget++; team.shotsOnTarget++;

  // Parada del portero
  const gkSk = (effectiveAttr(gk,'reflexes')*.55 + effectiveAttr(gk,'positioning')*.30 + effectiveAttr(gk,'mentality')*.15) / 100;
  let gkEx = rnd(.25, 1);
  if (chance(.07)) gkEx = rnd(0, .25); // error del portero
  const gkP = gkSk * .55 + gkEx * .45;

  // Probabilidad de gol: ss vs portero. +0.35 para elevar la tasa base
  let gp = clamp(ss - gkP * .55 + rnd(-.05, .08) + .35, 0, 1);
  if (shotType === 'long') gp *= .75;

  if (gp > .50) {
    holder.match.goals++;
    holder.match.rating = clamp(holder.match.rating + 1.5, 0, 10);
    gk.match.rating = clamp(gk.match.rating - .25, 0, 10);
    team.score++;
    updateMatchScore(); showGoalOverlay(); addedTime(2);
    const msg = shotType === 'long'
      ? `⚽ ¡GOLAZO DE ${holder.name.toUpperCase()}! Desde fuera del área (${match.teamA.score}–${match.teamB.score})`
      : adv > .92 && chance(.3)
        ? `⚽ ¡GOL! ${holder.name.toUpperCase()} a placer (${match.teamA.score}–${match.teamB.score})`
        : `⚽ ¡GOL DE ${holder.name.toUpperCase()}! ${gk.name} no llega (${match.teamA.score}–${match.teamB.score})`;
    resetKickoff(opp.side);
    return finishTick(msg, 'event-goal');
  }
  if(chance(.55)){
    gk.match.rating=clamp(gk.match.rating+.15,0,10);
    match.possession=opp.side;match.ballHolder=gk;match.ballX=gk.x;match.ballY=gk.y;
    return finishTick(`¡PARADA de ${gk.name}! Disparo de ${holder.name} atajado`,'event-save');
  }
  team.corners++;addedTime(1);
  const cx=team.side==='A'?rnd(.85,.93):rnd(.07,.15);
  const cy=holder.y<.5?rnd(.15,.30):rnd(.70,.85);
  const tkr=fieldP(team).find(p=>['LW','RW','CAM','CM'].includes(p.pos))||fieldP(team).find(p=>p!==holder);
  if(tkr){tkr.x=cx;tkr.y=cy;match.ballHolder=tkr;match.ballX=cx;match.ballY=cy;}
  return finishTick(`¡Gran disparo de ${holder.name}! ${gk.name} la manda a córner`,'event-shot');
}

function executeDribble(holder,team,opp,defender){
  if(!defender)return executePass(holder,team,opp);
  const ak=(effectiveAttr(holder,'technique')*.5+effectiveAttr(holder,'speed')*.3+effectiveAttr(holder,'physical')*.2)/100;
  const dk=(effectiveAttr(defender,'defense')*.55+effectiveAttr(defender,'speed')*.30+effectiveAttr(defender,'physical')*.15)/100;
  const s=ak-dk*.85+rnd(-.15,.15)+.20;
  if(s>.30){
    const step=rnd(.06,.10);
    if(team.side==='A')holder.x=clamp(holder.x+step,.05,.96);
    else holder.x=clamp(holder.x-step,.04,.95);
    match.ballX=holder.x;match.ballY=holder.y;
    holder.match.rating=clamp(holder.match.rating+.08,0,10);
    return finishTick(`Gran regate de ${holder.name} sobre ${defender.name}`,'normal');
  }
  if(chance(.55)){
    registerTransition(team, opp);
    match.possession=opp.side;match.ballHolder=defender;match.ballX=defender.x;match.ballY=defender.y;
    defender.match.tackles++;defender.match.rating=clamp(defender.match.rating+.10,0,10);
    return finishTick(`${defender.name} le quita el balón a ${holder.name}`,'normal');
  }
  return finishTick(`${holder.name} pierde el control momentáneamente`,'normal');
}

function executeInterception(holder,team,opp,interceptor){
  if(!interceptor)return executePass(holder,team,opp);
  registerTransition(team, opp);
  match.possession=opp.side;match.ballHolder=interceptor;match.ballX=interceptor.x;match.ballY=interceptor.y;
  interceptor.match.tackles++;interceptor.match.rating=clamp(interceptor.match.rating+.10,0,10);
  return finishTick(`${interceptor.name} (${opp.name}) corta el avance de ${holder.name}`,'normal');
}

function executeFoul(holder,team,opp,fouler){
  if(!fouler||fouler.cards.red)return executePass(holder,team,opp);
  opp.fouls++;fouler.match.fouls++;fouler.match.rating=clamp(fouler.match.rating-.10,0,10);
  addedTime(1);
  const cr=Math.random();
  let cardMsg='',logType='event-foul';
  if(fouler.cards.yellow>=1&&cr<.30){
    fouler.cards.yellow++;fouler.cards.red=true;fouler.onField=false;
    opp.yellows++;opp.reds++;cardMsg=` 🟥 ¡SEGUNDA AMARILLA! ${fouler.name} EXPULSADO`;logType='event-card-red';addedTime(2);
  }else if(cr<.05){
    fouler.cards.red=true;fouler.onField=false;opp.reds++;
    cardMsg=` 🟥 ¡ROJA DIRECTA! ${fouler.name} EXPULSADO`;logType='event-card-red';addedTime(2);
  }else if(cr<.30){
    fouler.cards.yellow++;opp.yellows++;cardMsg=` 🟨 Tarjeta amarilla a ${fouler.name}`;logType='event-card-yellow';
  }
  const adv_=advance(holder);
  if(['ST','LW','RW','CAM','LM','RM'].includes(holder.pos)&&adv_>.78&&chance(.25)){
    addLog(`Falta de ${fouler.name} sobre ${holder.name}${cardMsg} — Tiro libre directo`,logType);
    return executeShot(holder,team,opp,'normal');
  }
  return finishTick(`Falta de ${fouler.name} sobre ${holder.name}${cardMsg}`,logType);
}

function executeCarry(holder,team){
  const step=rnd(.07,.13);
  if(team.side==='A')holder.x=clamp(holder.x+step,.05,.96);
  else holder.x=clamp(holder.x-step,.04,.95);
  holder.y=clamp(holder.y+rnd(-.04,.04),.05,.95);
  match.ballX=holder.x;match.ballY=holder.y;
  return finishTick(`${holder.name} avanza con el balón`,'normal');
}

function isOffsideFn(tgt,defTeam){
  const as=getTeam(match.possession).side;
  const defs=fieldP(defTeam).filter(p=>p.pos!=='GK').sort((a,b)=>as==='A'?b.x-a.x:a.x-b.x);
  if(defs.length<2)return false;
  const ld=defs[1];
  const ta=as==='A'?tgt.x:1-tgt.x;
  const da=as==='A'?ld.x:1-ld.x;
  return ta>da+.02;
}

function finishTick(msg,type){
  addLog(msg,type);
  checkPeriodEnd();
  renderMatchFrame();
}

function addedTime(t){match.addedTimeTicks+=t;match.extraTicks+=t;}

function resetKickoff(kickSide){
  match.possession=kickSide;match.phase='kickoff';
  const kt=getTeam(kickSide);
  [match.teamA,match.teamB].forEach(t=>fieldP(t).forEach(p=>{p.x=p.baseX;p.y=p.baseY;}));
  const k=fieldP(kt).find(p=>p.pos==='CAM')||fieldP(kt).find(p=>p.pos==='CM')||fieldP(kt)[5];
  if(k){k.x=.5;k.y=.5;match.ballHolder=k;match.ballX=.5;match.ballY=.5;}
}

function updateMatchScore(){
  const myScore = match.myTeamSide==='A'?match.teamA.score:match.teamB.score;
  const oppScore = match.myTeamSide==='A'?match.teamB.score:match.teamA.score;
  document.getElementById('mhScoreOwn').textContent=myScore;
  document.getElementById('mhScoreOpp').textContent=oppScore;
}

function checkPeriodEnd(){
  if(match.tick>=match.totalTicks+match.addedTimeTicks){
    if(match.period==='first'){
      match.period='second';match.tick=0;match.totalTicks=180;match.addedTimeTicks=0;match.extraTicks=0;
      [match.teamA,match.teamB].forEach(t=>{
        fieldP(t).forEach(p=>{
          // Invertir posición actual
          p.baseX=1-p.baseX; p.baseY=1-p.baseY;
          p.x=p.baseX; p.y=p.baseY;
          // Invertir posiciones de fase táctica
          if(p.defX!=null){p.defX=1-p.defX; p.defY=1-p.defY;}
          if(p.attX!=null){p.attX=1-p.attX; p.attY=1-p.attY;}
        });
      });
      [match.teamA,match.teamB].forEach(t=>fieldP(t).forEach(p=>{p.fatigue=clamp(p.fatigue+6,0,100);}));
      // Apply half-time subs
      applyPendingSubsHalfTime();
      resetKickoff(match.teamB.side);
      addLog('⏱ DESCANSO — Reanuda el partido','event-whistle');
    }else{
      endMatch();
    }
  }
}

function endMatch(){
  match.state='finished';
  isPlaying=false;
  clearInterval(simInterval);
  document.getElementById('btnPlay').textContent='▶ PLAY';
  document.getElementById('btnPlay').disabled=true;
  document.getElementById('liveIndicator').className='live-indicator done';
  document.getElementById('liveIndicator').innerHTML='<div class="live-dot"></div>FINALIZADO';
  addLog(`⚑ FIN DEL PARTIDO — ${match.teamA.name} ${match.teamA.score}–${match.teamB.score} ${match.teamB.name}`,'event-whistle');
  addEndBanner();
  try {
    saveMatchResult();
  } catch(e) {
    console.error('Error en saveMatchResult:', e);
    // Garantizamos que el post-match aparezca aunque falle el guardado
  }
  setTimeout(()=>showPostMatch(), 800);
}

function saveMatchResult(){
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const oppT=match.myTeamSide==='A'?match.teamB:match.teamA;
  const myScore=myT.score, oppScore=oppT.score;
  const competition = match.competition || 'league';

  if (competition === 'league') {
    saveLeagueMatchResult(myScore, oppScore);
  } else {
    saveCupMatchResult(myScore, oppScore);
  }

  // Update player season stats
  myT.starters.forEach(p=>{
    p.season.goals+=p.match.goals;
    p.season.assists+=p.match.assists;
    p.season.shots+=p.match.shots;
    p.season.shotsOnTarget+=p.match.shotsOnTarget;
    p.season.passes+=p.match.passes;
    p.season.passSuccess+=p.match.passSuccess;
    p.season.tackles+=p.match.tackles;
    p.season.fouls+=p.match.fouls;
    p.season.gamesPlayed++;
    p.season.ratingSum+=p.match.rating;
    // Career
    p.career = p.career || {goals:0,assists:0,gamesPlayed:0,seasonsPlayed:0};
    p.career.goals += p.match.goals;
    p.career.assists += p.match.assists;
    p.career.gamesPlayed++;
    p.fatigue = clamp(p.fatigue + 8, 0, 100);

    // === TARJETAS Y SUSPENSIONES ===
    if (!p.season.yellows) p.season.yellows = 0;
    if (!p.suspension) p.suspension = 0;
    // Amarillas recibidas en este partido
    const yellowsThisMatch = p.match.fouls > 0 ? p.cards.yellow : 0;
    if (yellowsThisMatch > 0) {
      p.season.yellows += yellowsThisMatch;
      // Cada 5 amarillas acumuladas = 1 partido de suspensión
      if (p.season.yellows % 5 === 0) {
        p.suspension = (p.suspension || 0) + 1;
      }
    }
    // Roja directa o segunda amarilla = suspensión
    if (p.cards.red) {
      // Segunda amarilla: 1 partido; roja directa: 2-3 partidos
      const wasDoubleYellow = yellowsThisMatch >= 2;
      p.suspension = (p.suspension || 0) + (wasDoubleYellow ? 1 : rndI(2, 3));
      p.season.yellows = Math.max(p.season.yellows - yellowsThisMatch, 0); // reset acumulado
    }

    // === PROGRESSION SYSTEM ===
    const prevOverall = calcOverall(p);
    awardMatchXP(p);
    awardMatchDecline(p);
    const newOverall = calcOverall(p);
    // Guardar mejora para mostrar en la UI
    if (newOverall > prevOverall) {
      p.lastLevelUp = { season: G.season, jornada: getMyDivision().currentJornada, gain: newOverall - prevOverall };
    }
  });

  // Jugadores que NO jugaron (suplentes y lesionados) recuperan fatiga
  const myTeam = getMyTeam();
  myTeam.squad.forEach(p => {
    const playedInMatch = match.myTeamSide === 'A'
      ? [...match.teamA.starters, ...(match.teamA.subs || [])].some(mp => mp.id === p.id)
      : [...match.teamB.starters, ...(match.teamB.subs || [])].some(mp => mp.id === p.id);
    if (!playedInMatch) {
      // Descanso completo: recuperan entre 35 y 50 puntos de energía
      p.fatigue = clamp((p.fatigue ?? 100) + rndI(35, 50), 0, 100);
    }
  });

  // Injury check after match
  checkInjuries();

  // Decrement injury counters of all players
  decrementInjuries();

  saveGame();
}

function saveLeagueMatchResult(myScore, oppScore){
  const myTeam = getMyTeam();
  const myDiv = getMyDivision();
  const j = myDiv.currentJornada;

  const round = myDiv.calendar[j];
  const fix = round.find(x=>x.home==='player'||x.away==='player');
  if(fix){
    fix.played = true;
    fix.scoreH = match.myIsHome ? myScore : oppScore;
    fix.scoreA = match.myIsHome ? oppScore : myScore;
  }

  // Update standings - my team
  const myStats = myTeam.stats;
  myStats.pj++; myStats.gf += myScore; myStats.gc += oppScore; myStats.dg += myScore - oppScore;
  if (myScore > oppScore) { myStats.g++; myStats.pts += 3; }
  else if (myScore === oppScore) { myStats.e++; myStats.pts += 1; }
  else myStats.p++;

  // Simulate other fixtures in this jornada
  round.forEach(fx => {
    if (fx.played) return;
    simulateAIFixture(fx);
  });

  // Simulate the OTHER division's jornada too (synchronously)
  const otherDivLevel = G.league.myDivision === 1 ? 2 : 1;
  const otherDiv = G.league.divisions[otherDivLevel];
  if (otherDiv.currentJornada < otherDiv.calendar.length) {
    const otherRound = otherDiv.calendar[otherDiv.currentJornada];
    otherRound.forEach(fx => {
      if (!fx.played) simulateAIFixture(fx);
    });
    otherDiv.currentJornada++;
  }

  // Record to history
  G.history.push({
    jornada: j+1, season: G.season, competition: 'league',
    home: match.myIsHome ? 'player' : match.oppId,
    away: match.myIsHome ? match.oppId : 'player',
    myId: 'player',
    scoreH: match.myIsHome ? myScore : oppScore,
    scoreA: match.myIsHome ? oppScore : myScore,
    myScore, oppScore
  });

  // Advance my jornada
  myDiv.currentJornada++;

  // Maybe play cup tie now (after every 2-3 league rounds)
  maybeAdvanceCup();

  // Season end check
  if (myDiv.currentJornada >= myDiv.calendar.length) {
    handleSeasonEnd();
  }
}

function saveCupMatchResult(myScore, oppScore){
  const myTeam = getMyTeam();
  const cup = G.league.cup;
  const round = cup.rounds[cup.currentRound];
  const tie = round.ties.find(t => t.home==='player'||t.away==='player');
  if (tie) {
    tie.played = true;
    tie.scoreH = match.myIsHome ? myScore : oppScore;
    tie.scoreA = match.myIsHome ? oppScore : myScore;
    // Determine winner (in cup, ties replay by penalties, but we'll just use random for ties)
    let winnerId;
    if (myScore > oppScore) winnerId = 'player';
    else if (myScore < oppScore) winnerId = match.oppId;
    else winnerId = chance(0.5) ? 'player' : match.oppId; // simulated penalties
    tie.winner = winnerId;
  }

  // Record to history
  G.history.push({
    jornada: cup.currentRound+1, season: G.season, competition: 'cup',
    home: match.myIsHome ? 'player' : match.oppId,
    away: match.myIsHome ? match.oppId : 'player',
    myId: 'player', cupRoundName: round.name,
    scoreH: match.myIsHome ? myScore : oppScore,
    scoreA: match.myIsHome ? oppScore : myScore,
    myScore, oppScore,
    winner: tie?.winner
  });

  // Simulate other cup ties in this round
  round.ties.forEach(t => {
    if (!t.played) {
      const h = getTeamById(t.home), a = getTeamById(t.away);
      if (!h || !a) return;
      const result = simulateCupAITie(h, a);
      t.played = true;
      t.scoreH = result.scoreH; t.scoreA = result.scoreA;
      t.winner = result.winner;
    }
  });

  // Check if my team is eliminated
  const myEliminated = tie && tie.winner !== 'player';

  // If everyone played, advance to next round
  if (round.ties.every(t => t.played)) {
    advanceCupRound();
  }

  if (myEliminated) {
    // Mark cup ended for my team but tournament continues for AI
    cup.myEliminated = true;
  }
}

function simulateCupAITie(h, a) {
  const hq = h.quality + rndI(-5,5);
  const aq = a.quality + rndI(-5,5);
  const diff = (hq - aq) / 15;
  const hExp = clamp(0.5 + diff*0.2, 0.1, 0.9);
  const hG = Math.round(Math.random() < hExp ? rnd(0, 3.5) : rnd(0, 1.5));
  const aG = Math.round(Math.random() < 1-hExp ? rnd(0, 3.5) : rnd(0, 1.5));
  let winner;
  if (hG > aG) winner = h.id;
  else if (hG < aG) winner = a.id;
  else winner = chance(0.5) ? h.id : a.id;
  return { scoreH:Math.round(hG), scoreA:Math.round(aG), winner };
}

function advanceCupRound() {
  const cup = G.league.cup;
  const currentRound = cup.rounds[cup.currentRound];
  const winners = currentRound.ties.map(t => t.winner).filter(Boolean);

  // Final round?
  if (cup.currentRound === cup.rounds.length - 1) {
    cup.completed = true;
    cup.winner = winners[0];
    if (cup.winner === 'player') {
      G.club.budget += CUP_PRIZES.winner;
      G.cupHistory = G.cupHistory || [];
      G.cupHistory.push({season: G.season, achievement: 'Campeón'});
    }
    return;
  }

  // Build next round ties from winners
  cup.currentRound++;
  const nextRound = cup.rounds[cup.currentRound];

  // For round 1 (R16 / Octavos), include byes from prelim
  let participants = [...winners];
  if (cup.currentRound === 1 && currentRound.byes) {
    participants = [...participants, ...currentRound.byes];
  }
  // Shuffle and pair
  participants.sort(() => Math.random() - 0.5);
  for (let i = 0; i < participants.length; i += 2) {
    if (participants[i+1]) {
      nextRound.ties.push({
        home: participants[i], away: participants[i+1],
        played: false, scoreH: 0, scoreA: 0, competition: 'cup',
        round: nextRound.name, winner: null
      });
    }
  }
}

function maybeAdvanceCup() {
  // Called after a league match. Auto-simulate any pending cup rounds where player isn't involved.
  const cup = G.league.cup;
  if (cup.completed) return;
  const myDiv = getMyDivision();
  const j = myDiv.currentJornada;

  // For each cup round whose trigger jornada has passed, and player isn't in it, auto-sim
  for (let r = cup.currentRound; r < cup.rounds.length; r++) {
    const triggerJ = CUP_SCHEDULE[r];
    if (j > triggerJ) {
      // We've passed this round's trigger — should be done
      const round = cup.rounds[r];
      if (round.ties.length === 0) {
        if (r > cup.currentRound) advanceCupRound();
        continue;
      }
      const myTie = round.ties.find(t => t.home==='player'||t.away==='player');
      if (!myTie) {
        // Auto-simulate
        round.ties.forEach(t => {
          if (t.played) return;
          const h = getTeamById(t.home), a = getTeamById(t.away);
          if (!h || !a) return;
          const result = simulateCupAITie(h, a);
          t.played = true; t.scoreH = result.scoreH; t.scoreA = result.scoreA; t.winner = result.winner;
        });
        if (round.ties.every(t=>t.played) && cup.currentRound === r) advanceCupRound();
      }
    }
  }
}

function autoSimulateCupRoundIfNoPlayer() {
  const cup = G.league.cup;
  if (cup.completed) return;
  const round = cup.rounds[cup.currentRound];
  if (!round || !round.ties.length) return;
  const playerInRound = round.ties.some(t => t.home==='player' || t.away==='player');
  if (playerInRound) return; // wait for player

  // Simulate all ties in the round
  round.ties.forEach(t => {
    if (t.played) return;
    const h = getTeamById(t.home), a = getTeamById(t.away);
    if (!h || !a) return;
    const result = simulateCupAITie(h, a);
    t.played = true;
    t.scoreH = result.scoreH; t.scoreA = result.scoreA;
    t.winner = result.winner;
  });
  // Advance
  advanceCupRound();
}

function handleSeasonEnd() {
  const myDiv = getMyDivision();
  const sortedMy = getSortedTable(G.league.myDivision);
  const myPos = sortedMy.findIndex(t => t.id === 'player') + 1;

  // Award league prize money
  const prizes = LEAGUE_PRIZES[G.league.myDivision];
  const prize = prizes[myPos - 1] || 0;
  G.club.budget += prize;

  // Award cup achievement (if any)
  if (G.league.cup && !G.league.cup.completed) {
    autoSimulateCupRoundIfNoPlayer();
  }

  // Promotion/relegation (top 3 / bottom 3 with 18 teams)
  let promoted = false, relegated = false;
  const newDivision = G.league.myDivision;
  if (G.league.myDivision === 2) {
    if (myPos <= 3) {
      promoted = true;
      G.club.budget += PROMOTION_BONUS;
    }
  } else if (G.league.myDivision === 1) {
    if (myPos >= TEAMS_PER_DIV - 2) { // positions 16,17,18
      relegated = true;
    }
  }

  // Build season summary
  const summary = {
    season: G.season,
    finalPos: myPos,
    division: G.league.myDivision,
    leaguePrize: prize,
    promoted, relegated,
    cupResult: G.cupHistory ? G.cupHistory[G.cupHistory.length-1] : null
  };
  // Pagar masa salarial anual (sale del wageBudget, si no alcanza del fichajes)
  const myTeam = getMyTeam();
  const bill = myTeam.squad.reduce((s, p) => s + annualWage(p), 0);
  if (G.club.wageBudget >= bill) {
    G.club.wageBudget -= bill;
  } else {
    const deficit = bill - G.club.wageBudget;
    G.club.wageBudget = 0;
    G.club.budget = Math.max(0, G.club.budget - deficit);
  }
  // Reponer presupuesto salarial para la siguiente temporada (basado en nómina actual + margen)
  const newBill = myTeam.squad.reduce((s, p) => s + annualWage(p), 0);
  const wageRefill = Math.round(newBill * 1.12 / 50000) * 50000;
  G.club.wageBudget = Math.max(G.club.wageBudget + wageRefill * 0.3, wageRefill);

  // Decrementar años de contrato de todos los jugadores propios
  myTeam.squad.forEach(p => {
    if (p.contract) {
      p.contract.yearsLeft = Math.max(0, (p.contract.yearsLeft || 1) - 1);
      if (p.contract.yearsLeft === 0) {
        // Contrato expirado — el jugador puede irse como agente libre (sale de la plantilla)
        // Por simplicidad: los jugadores sin contrato se van al pool de mercado
        p.contract.expired = true;
      }
    }
    // Actualizar salario según nueva media (puede haber subido)
    if (p.contract && !p.contract.expired) {
      const ov = calcOverall(p);
      const newSalary = calcWeeklySalary(ov, p.age);
      // Solo sube automáticamente si es jugador propio y mejoró bastante
      if (newSalary > p.contract.salary * 1.15) {
        p.contract.salary = Math.round(newSalary * 0.9 / 500) * 500; // negocia a la baja
      }
    }
  });

  // Expulsar jugadores con contrato expirado (solo de mi equipo)
  const expired = myTeam.squad.filter(p => p.contract && p.contract.expired);
  expired.forEach(p => {
    myTeam.squad = myTeam.squad.filter(pl => pl.id !== p.id);
  });

  summary.wagesPaid = bill;
  summary.expiredContracts = expired.map(p => p.name);

  G.lastSeasonSummary = summary;

  // Apply promotion/relegation movement (3 up / 3 down)
  if (promoted) {
    moveTeamBetweenDivisions(2, 1, 'player');
    const div1Sorted = getSortedTable(1);
    const div1Bot = div1Sorted.slice(-3).filter(t => t.id !== 'player');
    div1Bot.forEach(t => moveTeamBetweenDivisions(1, 2, t.id));
    G.league.myDivision = 1;
  } else if (relegated) {
    moveTeamBetweenDivisions(1, 2, 'player');
    const div2Sorted = getSortedTable(2);
    const div2Top = div2Sorted.slice(0, 3).filter(t => t.id !== 'player');
    div2Top.forEach(t => moveTeamBetweenDivisions(2, 1, t.id));
    G.league.myDivision = 2;
  } else {
    const div2Sorted = getSortedTable(2);
    const div1Sorted = getSortedTable(1);
    const promoteIds = div2Sorted.slice(0, 3).map(t=>t.id).filter(id => id !== 'player');
    const relegateIds = div1Sorted.slice(-3).map(t=>t.id).filter(id => id !== 'player');
    promoteIds.forEach(id => moveTeamBetweenDivisions(2, 1, id));
    relegateIds.forEach(id => moveTeamBetweenDivisions(1, 2, id));
  }

  // Age all players +1, apply growth/decline, regenerate squads stats
  ageAllPlayers();

  // Reset stats and start new season
  G.season++;
  startNewSeason();
}

function moveTeamBetweenDivisions(fromLevel, toLevel, teamId) {
  const fromDiv = G.league.divisions[fromLevel];
  const toDiv = G.league.divisions[toLevel];
  const idx = fromDiv.teams.findIndex(t => t.id === teamId);
  if (idx < 0) return;
  const team = fromDiv.teams.splice(idx, 1)[0];
  team.division = toLevel;
  toDiv.teams.push(team);
}

function ageAllPlayers() {
  getAllTeams().forEach(team => {
    team.squad.forEach(p => {
      p.age++;
      p.career = p.career || {goals:0,assists:0,gamesPlayed:0,seasonsPlayed:0};
      if (p.season && p.season.gamesPlayed > 0) p.career.seasonsPlayed++;

      // Recalculate value based on new age
      p.value = calcPlayerValue(calcOverall(p), p.age, p.potential);
    });
    // Retire very old players (38+)
    team.squad = team.squad.filter(p => p.age <= 38);
    // Ensure at least 11 starters
    while (team.squad.filter(t=>t.inSquad).length < 11) {
      const sub = team.squad.find(p => !p.inSquad);
      if (sub) sub.inSquad = true;
      else break;
    }
    // Refill bench if too small (with young promising prospects)
    while (team.squad.length < 18) {
      const teamQ = team.quality || DIV_CFG[team.division].baseQuality;
      const newP = createPlayer(
        teamQ + rndI(-12, 0),
        pick(['CB','CM','CAM','LW','ST','GK','LB','RB','CDM','RW']),
        'rgen'+team.id+Date.now()+rndI(0,9999),
        team.id !== 'player',
        rndI(17, 22)
      );
      newP.inSquad = false;
      team.squad.push(newP);
    }
  });
}

function startNewSeason() {
  // Reset stats
  [1,2].forEach(lvl => {
    const div = G.league.divisions[lvl];
    div.teams.forEach(t => { t.stats = {pts:0,pj:0,g:0,e:0,p:0,gf:0,gc:0,dg:0}; });
    div.calendar = generateCalendar(div.teams.map(t=>t.id));
    div.currentJornada = 0;
  });
  // Reset player season stats
  getAllTeams().forEach(team => {
    team.squad.forEach(p => {
      p.season = { goals:0,assists:0,shots:0,shotsOnTarget:0,passes:0,passSuccess:0,tackles:0,fouls:0,gamesPlayed:0,ratingSum:0,yellows:0 };
      p.fatigue = 100;
      p.cards = {yellow:0, red:false};
      p.suspension = 0;
      p.injury = null;
    });
  });
  // New cup
  G.league.cup = createCup(G.league.divisions[1].teams, G.league.divisions[2].teams);
  // Show season summary
  setTimeout(() => showSeasonSummary(), 400);
}

const INJURY_TYPES = [
  { name: 'Sobrecarga muscular',  minJ: 1, maxJ: 2,  severity: 'leve'   },
  { name: 'Esguince de tobillo',  minJ: 2, maxJ: 4,  severity: 'leve'   },
  { name: 'Contractura',          minJ: 1, maxJ: 3,  severity: 'leve'   },
  { name: 'Rotura fibrilar',      minJ: 3, maxJ: 6,  severity: 'moderada'},
  { name: 'Lesión de rodilla',    minJ: 4, maxJ: 8,  severity: 'moderada'},
  { name: 'Esguince grave',       minJ: 4, maxJ: 7,  severity: 'moderada'},
  { name: 'Rotura ligamentos',    minJ: 8, maxJ: 14, severity: 'grave'  },
  { name: 'Fractura',             minJ: 8, maxJ: 16, severity: 'grave'  },
  { name: 'Desgarro muscular',    minJ: 5, maxJ: 10, severity: 'grave'  },
];

function checkInjuries() {
  const myT = match.myTeamSide === 'A' ? match.teamA : match.teamB;
  const newInjuries = [];

  myT.starters.forEach(p => {
    if (p.injury && p.injury.jornadasLeft > 0) return;
    const baseRisk   = 0.018;
    const fatigueRisk = p.fatigue < 30 ? 0.035 : p.fatigue < 50 ? 0.015 : 0;
    const physProt   = (p.attr.physical / 100) * 0.012;
    const ageRisk    = p.age > 31 ? 0.01 : 0;
    const totalRisk  = clamp(baseRisk + fatigueRisk + ageRisk - physProt, 0.005, 0.15);

    if (Math.random() < totalRisk) {
      // Seleccionar tipo según gravedad ponderada
      const roll = Math.random();
      let pool;
      if (roll < 0.55)      pool = INJURY_TYPES.filter(t => t.severity === 'leve');
      else if (roll < 0.85) pool = INJURY_TYPES.filter(t => t.severity === 'moderada');
      else                  pool = INJURY_TYPES.filter(t => t.severity === 'grave');
      const type = pick(pool);
      const jornadas = rndI(type.minJ, type.maxJ);
      p.injury = { jornadasLeft: jornadas, type: type.name, severity: type.severity };
      newInjuries.push({ player: p, injury: p.injury });
    }
  });

  // Avisar de nuevas lesiones en el log del partido
  newInjuries.forEach(({ player, injury }) => {
    const sevColor = injury.severity === 'grave' ? 'var(--red)' : injury.severity === 'moderada' ? 'var(--yellow)' : 'var(--text-dim)';
    addLog(t('injury', player.name, injury.type, injury.jornadasLeft), 'injury');
  });

  return newInjuries;
}

function decrementInjuries() {
  getAllTeams().forEach(team => {
    team.squad.forEach(p => {
      if (p.injury && p.injury.jornadasLeft > 0) {
        p.injury.jornadasLeft--;
        if (p.injury.jornadasLeft <= 0) p.injury = null;
      }
      // Decrementar suspensión
      if (p.suspension && p.suspension > 0) {
        p.suspension--;
      }
    });
  });
}

function simulateAIFixture(fx){
  const h=getTeamById(fx.home),a=getTeamById(fx.away);
  if(!h||!a)return;
  // Calidad base ± varianza
  let hq = h.quality + rndI(-5,5);
  let aq = a.quality + rndI(-5,5);

  // Ventaja de campo
  hq += 3;

  // Modificador táctico individual de cada equipo (basado en su preset)
  const hCfg = TACTICS_CFG[h.tactic] || TACTICS_CFG.balanced;
  const aCfg = TACTICS_CFG[a.tactic] || TACTICS_CFG.balanced;
  hq += (hCfg.resultMod || 0) * 100;
  aq += (aCfg.resultMod || 0) * 100;

  // MATCHUP: la táctica de uno contra la del otro
  const hVsA = getMatchupMod(h.tactic, a.tactic);
  const aVsH = getMatchupMod(a.tactic, h.tactic);
  hq += hVsA * 100;
  aq += aVsH * 100;

  // Ventaja por mediocampo numérico
  const hMid = (FORMATIONS_META[h.formation]||{midfielders:3}).midfielders;
  const aMid = (FORMATIONS_META[a.formation]||{midfielders:3}).midfielders;
  hq += (hMid - aMid) * 1.2;
  aq += (aMid - hMid) * 1.2;

  // Convertir diferencia de calidad en goles esperados
  const diff = (aq - hq) / 15;
  const hExp = clamp(.5 - diff*.2, .1, .9);
  const aExp = 1 - hExp;
  const hG = Math.round(Math.random() < hExp ? rnd(0, 3.5) : rnd(0, 1.5));
  const aG = Math.round(Math.random() < aExp ? rnd(0, 3.5) : rnd(0, 1.5));
  fx.played = true; fx.scoreH = Math.round(hG); fx.scoreA = Math.round(aG);

  const updateStats = (t, gf, gc) => {
    t.stats.pj++; t.stats.gf += gf; t.stats.gc += gc; t.stats.dg += gf - gc;
    if (gf > gc) { t.stats.g++; t.stats.pts += 3; }
    else if (gf === gc) { t.stats.e++; t.stats.pts += 1; }
    else t.stats.p++;
  };
  updateStats(h, fx.scoreH, fx.scoreA);
  updateStats(a, fx.scoreA, fx.scoreH);

  // AI teams: simulated XP / progression for their players
  // Give XP to starters with simulated match ratings
  [h,a].forEach((team, idx) => {
    const goals = idx === 0 ? fx.scoreH : fx.scoreA;
    const conceded = idx === 0 ? fx.scoreA : fx.scoreH;
    const won = goals > conceded;
    const starters = team.squad.filter(p => p.inSquad).slice(0, 11);
    starters.forEach(p => {
      // Fake match rating
      const baseRating = 6.0 + (won ? 0.3 : -0.2);
      p.match = p.match || {};
      p.match.rating = clamp(baseRating + rnd(-0.8, 1.5), 4, 10);
      p.match.goals = 0; p.match.assists = 0;
      // Goal scorers (simplified)
      if (p.role === 'FWD' && goals > 0 && Math.random() < 0.25) p.match.goals = 1;
      if (p.role === 'MID' && goals > 0 && Math.random() < 0.10) p.match.goals = 1;
      // Update season stats
      p.season = p.season || {goals:0,assists:0,shots:0,shotsOnTarget:0,passes:0,passSuccess:0,tackles:0,fouls:0,gamesPlayed:0,ratingSum:0};
      p.season.goals += p.match.goals;
      p.season.gamesPlayed++;
      p.season.ratingSum += p.match.rating;
      // XP and decline
      awardMatchXP(p);
      awardMatchDecline(p);
    });
    // Recalculate team quality based on average squad rating
    const avgQ = starters.reduce((s,p)=>s+calcOverall(p), 0) / Math.max(starters.length, 1);
    team.quality = Math.round(avgQ);
  });
}

