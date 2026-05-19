// ============================================================
function initHub() {
  const myTeam = getMyTeam();
  const myDiv = getMyDivision();

  // Garantizar siempre 11 slots de titular
  ensureElevenSlots();
  document.getElementById('hubBadge').style.background = G.club.color;
  document.getElementById('hubBadge').textContent = G.club.abbr;
  document.getElementById('hubBadge').style.color = isDark(G.club.color)?'#fff':'#000';
  document.getElementById('hubTeamName').textContent = G.club.name;
  document.getElementById('hubSeason').textContent = `${t('matchdayShort', myDiv.currentJornada+1)} · ${divName(myDiv.name)} · T${G.season}`;
  document.getElementById('hubFormationSelect').value = G.club.formation;
  updateTacticChips('hubTacticRow', G.club.tactic);

  // Actualizar widget de presupuesto
  updateBudgetSidebar();

  renderFormationPitch();
  renderNextMatch();
  renderRecentResults();
  renderLeaguePos();
  renderLigaTable();
  renderCalendario();
  renderSquad();
  renderStats();
  renderTransferList();
  renderCupBracket();
}

function updateBudgetSidebar() {
  const sidebarBudget = document.getElementById('sidebarBudget');
  const sidebarWage   = document.getElementById('sidebarWage');
  const sidebarFill   = document.getElementById('sidebarWageFill');
  if (sidebarBudget) {
    sidebarBudget.textContent = fmt(G.club.budget);
    const bill = totalWageBill();
    const cap  = G.club.wageBudget || 1;
    const pct  = Math.min(100, Math.round(bill / cap * 100));
    sidebarWage.textContent = `${fmt(bill)} / ${fmt(cap)}`;
    const col = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yellow)' : 'var(--green)';
    sidebarWage.style.color = col;
    if (sidebarFill) { sidebarFill.style.width = pct + '%'; sidebarFill.style.background = col; }
  }

  // Fecha actual
  const myDiv2 = getMyDivision();
  const dateEl = document.getElementById('sidebarDateLine');
  if (dateEl && myDiv2) {
    const j = myDiv2.currentJornada;
    const dateStr = jornadaDateStr(j, G.season, _lang);
    const jLabel = j === 0 ? 'Pretemporada' : `Jornada ${j}`;
    dateEl.innerHTML = `<span style="color:var(--text-dim)">${jLabel}</span> <span style="color:var(--text-muted)">·</span> <span style="color:var(--text-muted)">${dateStr}</span>`;
  }
  const myTeam = getMyTeam();
  if (!myTeam) return;
  const unavailable = myTeam.squad.filter(p =>
    p.inSquad && ((p.injury && p.injury.jornadasLeft > 0) || (p.suspension && p.suspension > 0))
  );
  const warnEl = document.getElementById('playMatchWarning');
  const btnEl  = document.getElementById('playMatchBtn');
  if (warnEl && btnEl) {
    if (unavailable.length > 0) {
      warnEl.style.display = 'block';
      warnEl.textContent = `⚠️ ${unavailable.length} player${unavailable.length > 1 ? 's' : ''} unavailable in XI`;
      btnEl.style.opacity = '0.6';
    } else {
      warnEl.style.display = 'none';
      btnEl.style.opacity = '1';
    }
  }
}

function isDark(hex) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return (r*0.299+g*0.587+b*0.114)<140;
}

function switchHubPanel(id) {
  document.querySelectorAll('.hub-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.hub-nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector(`[data-panel="${id}"]`).classList.add('active');
}

function getMyTeam() {
  const div = G.league.divisions[G.league.myDivision];
  return div.teams.find(t=>t.id==='player');
}

function getNextFixture() {
  const div = getMyDivision();
  const j = div.currentJornada;
  if (j>=div.calendar.length) return null;
  const round = div.calendar[j];
  return round.find(f=> f.home==='player'||f.away==='player');
}

function getTeamById(id) {
  return getAllTeams().find(t=>t.id===id);
}

// Cup schedule: round X plays after these jornadas
// Round 0 (prelim): play after J2
// Round 1 (R16): play after J6
// Round 2 (Quarters): play after J10
// Round 3 (Semis): play after J14
// Round 4 (Final): play after J18
const CUP_SCHEDULE = [2, 6, 10, 14, 18];

function shouldPlayCupNext() {
  const cup = G.league.cup;
  if (!cup || cup.completed) return false;
  const myDiv = getMyDivision();
  const j = myDiv.currentJornada;

  // For each cup round not yet started, check if we've reached its trigger jornada
  for (let r = cup.currentRound; r < cup.rounds.length; r++) {
    const round = cup.rounds[r];
    const triggerJ = CUP_SCHEDULE[r];
    if (j >= triggerJ) {
      // Cup round should play
      // Check if my team has a tie pending
      if (round.ties.length === 0) {
        // Round hasn't been built yet → build it
        if (r > cup.currentRound) {
          // Auto-advance previous rounds first
          while (cup.currentRound < r) {
            // Make sure prev round is finished
            const prev = cup.rounds[cup.currentRound];
            if (!prev.ties.every(t=>t.played)) {
              autoSimulateCupRoundIfNoPlayer();
              if (!cup.rounds[cup.currentRound].ties.every(t=>t.played)) return false;
            }
            advanceCupRound();
          }
        }
      }
      // Now check if my team is in this round
      const myTie = round.ties.find(t => t.home==='player'||t.away==='player');
      if (myTie && !myTie.played) return true;
      // I'm not in this round (eliminated or had bye in prelim) — auto-sim it
      if (round.ties.length > 0 && !round.ties.every(t=>t.played)) {
        autoSimulateCupRoundIfNoPlayer();
      }
    }
  }
  return false;
}

// Get all upcoming events (league + cup) sorted chronologically
function getNextEvent() {
  const cup = G.league.cup;

  // First check if cup tie should play before next league round
  if (shouldPlayCupNext()) {
    const round = cup.rounds[cup.currentRound];
    const cupTie = round.ties.find(t => !t.played && (t.home==='player'||t.away==='player'));
    if (cupTie) return {type:'cup', tie:cupTie, round};
  }

  const leagueFix = getNextFixture();
  if (leagueFix) return {type:'league', fixture:leagueFix};

  return null;
}

function renderNextMatch() {
  const event = getNextEvent();
  const myDiv = getMyDivision();
  document.getElementById('homeJornada').textContent = `${t('matchdayLabel', myDiv.currentJornada+1)} · ${divName(myDiv.name)}`;
  if (!event) {
    document.getElementById('nextMatchTeams').innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Temporada completada</div>';
    document.getElementById('nextMatchMeta').innerHTML = '';
    return;
  }
  let homeT, awayT, isHome, label, badge='LIGA';
  if (event.type==='league') {
    const f = event.fixture;
    homeT = getTeamById(f.home); awayT = getTeamById(f.away);
    isHome = f.home==='player';
    label = `Matchday ${myDiv.currentJornada+1}`;
  } else {
    const t = event.tie;
    homeT = getTeamById(t.home); awayT = getTeamById(t.away);
    isHome = t.home==='player';
    label = event.round.name;
    badge = 'COPA';
  }
  const myColor = G.club.color;

  const oppT = homeT.id === 'player' ? awayT : homeT;
  const makeTeamHtml = (team) => {
    const isPlayer = team.id === 'player';
    const clickable = !isPlayer;
    return `<div class="nm-team" ${clickable ? `style="cursor:pointer" onclick="switchHubPanel('panel-teams');selectTeam('${team.id}')" title="Ver plantilla y táctica"` : ''}>
      <div class="nm-team-badge" style="background:${isPlayer?myColor:(team.color||'#1c2530')};color:${isPlayer?(isDark(myColor)?'#fff':'#000'):(isDark(team.color||'#1c2530')?'#fff':'#000')}">${team.abbr||team.name.slice(0,3).toUpperCase()}</div>
      <div class="nm-team-name" ${clickable?'style="color:var(--accent);text-decoration:underline dotted;text-underline-offset:3px"':''}>${team.name}</div>
      <div class="nm-team-rating">Media ${team.quality||'?'}</div>
      ${clickable ? '<div style="font-size:9px;color:var(--text-muted);margin-top:2px">🔍 ver equipo</div>' : ''}
    </div>`;
  };

  document.getElementById('nextMatchTeams').innerHTML = `
    ${makeTeamHtml(homeT)}
    <div class="nm-sep">VS</div>
    ${makeTeamHtml(awayT)}`;

  document.getElementById('nextMatchMeta').innerHTML = `
    <div class="nm-meta-item"><div class="nm-meta-label">${t('competition')}</div><div class="nm-meta-val" style="color:${event.type==='cup'?'var(--gold)':'var(--accent)'}">${badge}</div></div>
    <div class="nm-meta-item"><div class="nm-meta-label">${event.type==='league'?t('matchdayLabel', event.jornada||1):t('roundLabel')}</div><div class="nm-meta-val">${label}</div></div>
    <div class="nm-meta-item"><div class="nm-meta-label">Campo</div><div class="nm-meta-val">${isHome?'LOCAL':'VISITANTE'}</div></div>
    <div class="nm-meta-item"><div class="nm-meta-label">Temporada</div><div class="nm-meta-val">${G.season}</div></div>`;
}

function renderRecentResults() {
  const hist = [...G.history].reverse().slice(0,5);
  document.getElementById('recentResults').innerHTML = hist.length===0
    ? '<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:8px">No matches played yet</div>'
    : hist.map(h=>{
      const myScore = h.myId===h.home ? h.scoreH : h.scoreA;
      const oppScore = h.myId===h.home ? h.scoreA : h.scoreH;
      const opp = getTeamById(h.myId===h.home?h.away:h.home);
      const res = myScore>oppScore?'win':myScore===oppScore?'draw':'loss';
      return `<div class="history-item" style="margin-bottom:4px">
        <span class="hi-date">${fmtDate(h.jornada,h.season)}</span>
        <span class="hi-match">vs ${opp?.name||'?'}</span>
        <span class="hi-result ${res}">${myScore}–${oppScore}</span>
      </div>`;
    }).join('');
}

function renderLeaguePos() {
  const sorted = getSortedTable();
  const myPos = sorted.findIndex(t=>t.id==='player')+1;
  const myT = getMyTeam();
  document.getElementById('homeLeaguePos').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;padding:8px">
      <div style="font-family:var(--font-display);font-size:48px;font-weight:700;color:${G.club.color}">${myPos}${ord(myPos)}</div>
      <div>
        <div style="font-size:12px;color:var(--text-muted)">de ${sorted.length} equipos</div>
        <div style="font-family:var(--font-mono);font-size:13px;margin-top:4px">${myT.stats.pts} PTS &nbsp; ${myT.stats.gf}GF &nbsp; ${myT.stats.gc}GC</div>
      </div>
    </div>`;
}

function getSortedTable(divLevel) {
  const division = G.league.divisions[divLevel || G.league.myDivision];
  return [...division.teams].sort((a,b)=>{
    if (b.stats.pts!==a.stats.pts) return b.stats.pts-a.stats.pts;
    if (b.stats.dg!==a.stats.dg) return b.stats.dg-a.stats.dg;
    return b.stats.gf-a.stats.gf;
  });
}

function renderLigaTable() {
  // Render both divisions
  const myLevel = G.league.myDivision;
  let html = '';
  [1, 2].forEach(lvl => {
    const div = G.league.divisions[lvl];
    const sorted = getSortedTable(lvl);
    const n = sorted.length;
    const isMyDiv = lvl === myLevel;
    const promoBoundary = lvl === 2 ? 3 : null; // top 3 promote
    const releBoundary = lvl === 1 ? n - 3 : null; // bottom 3 relegate

    html += `<div style="margin-bottom:24px">
      <div class="section-title" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        ${div.name}
        ${isMyDiv ? '<span style="font-size:9px;color:var(--accent);letter-spacing:1px;background:rgba(0,212,255,0.1);padding:1px 6px">TU LIGA</span>' : ''}
      </div>
      <div class="card">
        <table class="table-liga">
          <thead><tr>
            <th style="text-align:left;padding-left:16px">#</th>
            <th style="text-align:left">Equipo</th>
            <th>PJ</th><th>G</th><th>E</th><th>P</th>
            <th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
          </tr></thead>
          <tbody>${sorted.map((t,i)=>{
            const cls = t.id==='player'?'my-team':'';
            let posClass = '';
            if (lvl === 2 && i < 3) posClass = 'top';
            else if (lvl === 1 && i >= n-3) posClass = 'bot';
            return `<tr class="${cls}">
              <td style="padding-left:16px"><span class="pos-num ${posClass}">${i+1}</span></td>
              <td>${t.name}</td>
              <td>${t.stats.pj}</td><td>${t.stats.g}</td><td>${t.stats.e}</td><td>${t.stats.p}</td>
              <td>${t.stats.gf}</td><td>${t.stats.gc}</td>
              <td>${t.stats.dg>0?'+':''}${t.stats.dg}</td>
              <td style="font-weight:600;color:${t.id==='player'?'var(--accent)':'var(--text)'}">${t.stats.pts}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
    </div>`;
  });
  document.getElementById('ligaTable').outerHTML = `<div id="ligaTable">${html}</div>`;
}

function renderCupBracket() {
  const cup = G.league.cup;
  if (!cup) return;
  const el = document.getElementById('cupBracket');
  if (!el) return;
  let html = `<div class="section-title" style="display:flex;align-items:center;gap:8px">${cup.name}
    ${cup.completed ? `<span style="color:var(--gold);font-size:11px">✓ Winner: ${getTeamById(cup.winner)?.name||'?'}</span>` : ''}
  </div>`;
  cup.rounds.forEach((round, idx) => {
    if (round.ties.length === 0) return;
    const isCurrent = idx === cup.currentRound && !cup.completed;
    html += `<div class="card" style="margin-bottom:12px">
      <div class="card-header">
        <span class="card-title">${round.name}</span>
        ${isCurrent ? '<span style="font-size:10px;color:var(--accent)">◀ ACTUAL</span>' : ''}
      </div>
      <div style="padding:8px">
        ${round.ties.map(t => {
          const h = getTeamById(t.home), a = getTeamById(t.away);
          const isMy = t.home==='player'||t.away==='player';
          const myWon = t.played && t.winner==='player';
          return `<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;font-size:11px;border-radius:3px;${isMy?'background:rgba(0,212,255,0.05);color:var(--accent)':''};margin-bottom:2px">
            <span style="flex:1;text-align:right;${t.played&&t.winner===t.home?'font-weight:700':''}">${h?.name||'?'}</span>
            <span style="font-family:var(--font-mono);font-weight:600;min-width:50px;text-align:center">${t.played?t.scoreH+'-'+t.scoreA:'vs'}</span>
            <span style="flex:1;${t.played&&t.winner===t.away?'font-weight:700':''}">${a?.name||'?'}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  el.innerHTML = html;
}

function renderCalendario() {
  const myDiv = getMyDivision();
  const cal = myDiv.calendar;
  document.getElementById('calendarioList').innerHTML = cal.map((round,j)=>{
    const roundFixtures = round.map(f=>{
      const h=getTeamById(f.home),a=getTeamById(f.away);
      const isMyGame = f.home==='player'||f.away==='player';
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 12px;font-size:11px;${isMyGame?'color:var(--accent)':''};background:${isMyGame?'rgba(0,212,255,0.04)':'transparent'}">
        <span style="flex:1;text-align:right">${h?.name||'?'}</span>
        <span style="font-family:var(--font-mono);font-weight:600">${f.played?f.scoreH+'-'+f.scoreA:'vs'}</span>
        <span style="flex:1">${a?.name||'?'}</span>
        ${j===myDiv.currentJornada&&!f.played?`<span style="font-size:9px;color:var(--accent);letter-spacing:1px">${t('nextMatch')}</span>`:''}
      </div>`;
    }).join('');
    return `<div class="card" style="margin-bottom:8px">
      <div class="card-header"><span class="card-title">Matchday ${j+1}</span>${j<myDiv.currentJornada?'<span style="font-size:10px;color:var(--green)">✓ Played</span>':''}</div>
      ${roundFixtures}
    </div>`;
  }).join('');
}

function renderSquad() {
  const myTeam = getMyTeam();
  const starters = myTeam.squad.filter(p => p.inSquad);
  const bench    = myTeam.squad.filter(p => !p.inSquad);
  const formation = G.club.formation;
  const formSlots = FORMATIONS[formation] || FORMATIONS['4-4-2'];

  // Alertas de plantilla
  const alertEl = document.getElementById('squadAlerts');
  if (alertEl) {
    const injured    = starters.filter(p => p.injury && p.injury.jornadasLeft > 0);
    const suspended  = starters.filter(p => p.suspension > 0);
    const expiring   = myTeam.squad.filter(p => p.contract && p.contract.yearsLeft <= 1);
    const parts = [];
    if (injured.length)   parts.push(`<span style="color:var(--red)">${t('alertInjuredInXI', injured.length)}</span>`);
    if (suspended.length) parts.push(`<span style="color:var(--red)">${t('alertSuspendedInXI', suspended.length)}</span>`);
    if (expiring.length)  parts.push(`<span style="color:var(--yellow)">${t('alertExpiringCtrs', expiring.length)}</span>`);
    alertEl.innerHTML = parts.join(' · ');
  }

  function playerRow(p, slotIdx, isBench) {
    const overall   = calcOverall(p);
    const fat       = p.fatigue ?? 100;
    const injured   = !!(p.injury && p.injury.jornadasLeft > 0);
    const suspended = !!(p.suspension && p.suspension > 0);
    const warned    = !suspended && p.season && (p.season.yellows % 5 === 4) && p.season.yellows > 0;
    const fatColor  = fat > 60 ? 'var(--green)' : fat > 30 ? 'var(--yellow)' : 'var(--red)';
    const overallColor = overall >= 80 ? 'var(--green)' : overall >= 66 ? 'var(--yellow)' : 'var(--red)';
    const ageColor  = p.age < 22 ? 'var(--green)' : p.age > 32 ? 'var(--red)' : 'var(--text-dim)';
    const slot      = formSlots[slotIdx] || { pos: p.pos };

    const statusIcon = injured   ? `<span title="${p.injury.type} — ${p.injury.jornadasLeft}" style="color:var(--red)">🩹</span>`
                     : suspended ? `<span title="${_lang==='en'?'Sancionado':'Sancionado'} — ${p.suspension}j" style="color:var(--red)">🟥</span>`
                     : warned    ? `<span title="${t('warned')}" style="color:var(--yellow)">⚠️</span>`
                     : p.listedForSale ? `<span title="${_lang==='en'?'Listed: ':'Listed: '}${fmt(p.askingPrice)}" style="color:var(--accent)">💰</span>`
                     : '';

    const xpPct = p.age < 27 && p.potential > overall
      ? Math.round(((p.xp || 0) / xpNeededForLevel(p)) * 100) : -1;
    const devBar = xpPct >= 0
      ? `<div style="width:${Math.min(xpPct,100)}%;height:2px;background:var(--purple);border-radius:1px;margin-top:2px"></div>` : '';

    const contractStr = p.contract
      ? `${fmt(p.contract.salary)}/sem · ${p.contract.yearsLeft||0}y`
      : 'Sin contrato';
    const contractColor = (p.contract?.yearsLeft||0) <= 1 ? 'var(--red)' : 'var(--text-muted)';

    return `<div class="sq-row ${injured||suspended?'sq-unavailable':''}"
        data-pid="${p.id}"
        onclick="squadRowClick(event,'${p.id}')">
      <div class="sq-pos" style="color:${posColor(slot.pos)}">${slot.pos}</div>
      <div class="sq-main">
        <div class="sq-name">${p.name} ${statusIcon}</div>
        <div class="sq-meta">
          <span style="color:${ageColor}">${p.age}a</span>
          <span style="color:${contractColor};margin-left:8px">${contractStr}</span>
          ${xpPct >= 0 ? `<span style="color:var(--purple);margin-left:8px">DEV ${xpPct}%</span>` : ''}
        </div>
        ${devBar}
      </div>
      <div class="sq-attrs">
        <span style="color:${overallColor};font-family:var(--font-mono);font-size:14px;font-weight:700">${overall}</span>
        <div class="sq-fat-bar"><div style="width:${fat}%;height:100%;background:${fatColor};border-radius:2px"></div></div>
      </div>
    </div>`;
  }

  const startersEl = document.getElementById('squadStarters');
  const benchEl    = document.getElementById('squadBench');
  if (!startersEl || !benchEl) return;

  startersEl.innerHTML = starters.length === 0
    ? '<div style="color:var(--text-muted);font-size:12px;padding:12px">No hay titulares seleccionados.</div>'
    : starters.map((p, i) => playerRow(p, i, false)).join('');

  benchEl.innerHTML = bench.length === 0
    ? '<div style="color:var(--text-muted);font-size:12px;padding:8px">' + t('benchEmpty') + '</div>'
    : bench.map((p, i) => playerRow(p, starters.length + i, true)).join('');
}

// ============================================================
// MENÚ CONTEXTUAL DE PLANTILLA
// ============================================================
let _ctxPid = null;

function squadRowClick(e, pid) {
  e.stopPropagation();
  const myTeam  = getMyTeam();
  const p       = myTeam.squad.find(pl => pl.id === pid);
  if (!p) return;

  const injured   = !!(p.injury && p.injury.jornadasLeft > 0);
  const suspended = !!(p.suspension && p.suspension > 0);
  const unavailable = injured || suspended;
  const starters  = myTeam.squad.filter(pl => pl.inSquad);
  const formSlots = FORMATIONS[G.club.formation] || FORMATIONS['4-4-2'];

  _ctxPid = pid;
  const menu = document.getElementById('squadCtxMenu');
  const items = [];

  if (p.inSquad) {
    // Es TITULAR
    if (unavailable) {
      // Injured o sancionado en el 11 → forzar reemplazo
      const reason = injured ? t('ctxInjured', p.injury.jornadasLeft+'j') : t('ctxSuspended', p.suspension+'j');
      items.push(`<div class="ctx-label" style="color:var(--red)">${reason} — reemplazar:</div>`);
      const availBench = myTeam.squad.filter(pl => !pl.inSquad && !(pl.injury?.jornadasLeft > 0) && !(pl.suspension > 0));
      if (availBench.length === 0) {
        items.push(`<div class="ctx-item disabled">${t('ctxNoSubs')}</div>`);
      } else {
        availBench.forEach(sub => {
          const ov = calcOverall(sub);
          items.push(`<div class="ctx-item" onclick="squadReplace('${pid}','${sub.id}')">
            <span style="color:${posColor(sub.pos)}">${sub.pos}</span>
            <span class="ctx-name">${sub.name}</span>
            <span class="ctx-ov">${ov}</span>
          </div>`);
        });
      }
    } else {
      // Starter sano → opciones normales
      const slotIdx = starters.findIndex(pl => pl.id === pid);
      const slot = formSlots[slotIdx] || { pos: p.pos };
      items.push(`<div class="ctx-label">${t('ctxStarter', slot.pos)}</div>`);
      // Mover al banquillo (solo si hay suplente disponible)
      const hasSub = myTeam.squad.some(pl => !pl.inSquad && !(pl.injury?.jornadasLeft > 0) && !(pl.suspension > 0));
      items.push(`<div class="ctx-item${hasSub?'':' disabled'}" ${hasSub?`onclick="squadToBench('${pid}')"`:''}>${hasSub ? t('ctxToBench') : t('ctxToBenchNoSubs')}</div>`);
      // Cambiar posición / intercambiar con otro titular
      items.push(`<div class="ctx-label" style="margin-top:4px">${t('ctxSwapWith')}</div>`);
      starters.filter(pl => pl.id !== pid).forEach(other => {
        const ov = calcOverall(other);
        const otherSlot = formSlots[starters.findIndex(pl => pl.id === other.id)] || { pos: other.pos };
        items.push(`<div class="ctx-item" onclick="squadSwapStarters('${pid}','${other.id}')">
          <span style="color:${posColor(otherSlot.pos)}">${otherSlot.pos}</span>
          <span class="ctx-name">${other.name}</span>
          <span class="ctx-ov">${ov}</span>
        </div>`);
      });
      // Cambiar por suplente
      const availBench = myTeam.squad.filter(pl => !pl.inSquad && !(pl.injury?.jornadasLeft > 0) && !(pl.suspension > 0));
      if (availBench.length > 0) {
        items.push(`<div class="ctx-label" style="margin-top:4px">${t('ctxReplaceWith')}</div>`);
        availBench.forEach(sub => {
          const ov = calcOverall(sub);
          items.push(`<div class="ctx-item" onclick="squadReplace('${pid}','${sub.id}')">
            <span style="color:${posColor(sub.pos)}">${sub.pos}</span>
            <span class="ctx-name">${sub.name}</span>
            <span class="ctx-ov">${ov}</span>
          </div>`);
        });
      }
    }
  } else {
    // Es SUPLENTE
    if (unavailable) {
      const reason = injured ? t('ctxInjured', p.injury.jornadasLeft+'j') : t('ctxSuspended', p.suspension+'j');
      items.push(`<div class="ctx-label" style="color:var(--red)">${reason}</div>`);
      items.push(`<div class="ctx-item disabled">${t('ctxUnavailable')}</div>`);
    } else {
      items.push(`<div class="ctx-label">${t('ctxSub', p.pos)}</div>`);
      if (starters.length < 11) {
        // Hay hueco — colocar directamente
        items.push(`<div class="ctx-item" onclick="squadAddStarter('${pid}')">${t('ctxAddToSquad')}</div>`);
      } else {
        // Reemplazar a un titular
        items.push(`<div class="ctx-label" style="margin-top:4px">${t('ctxSubstituteFor')}</div>`);
        starters.forEach(starter => {
          const ov = calcOverall(starter);
          const slotIdx = starters.findIndex(pl => pl.id === starter.id);
          const slot = formSlots[slotIdx] || { pos: starter.pos };
          items.push(`<div class="ctx-item" onclick="squadReplace('${starter.id}','${pid}')">
            <span style="color:${posColor(slot.pos)}">${slot.pos}</span>
            <span class="ctx-name">${starter.name}</span>
            <span class="ctx-ov">${ov}</span>
          </div>`);
        });
      }
    }
  }

  items.push(`<div class="ctx-divider"></div>`);
  // List for transfer (solo on salena abierta)
  if (isTransferWindowOpen()) {
    const saleLabel = p.listedForSale ? t('ctxEditListing') : t('ctxListForSale');
    items.push(`<div class="ctx-item" onclick="closeSquadCtx();listPlayerForSale('${pid}')">${saleLabel}</div>`);
  }
  items.push(`<div class="ctx-item" onclick="closeSquadCtx();openPlayerModal('${pid}')">${t('ctxViewProfile')}</div>`);

  menu.innerHTML = items.join('');

  // Posicionar menú pegado al click
  const rect = e.currentTarget.getBoundingClientRect();
  const menuW = 240, menuH = Math.min(items.length * 36, 400);
  let top = rect.bottom + 4;
  let left = rect.left;
  if (top + menuH > window.innerHeight - 16) top = rect.top - menuH - 4;
  if (left + menuW > window.innerWidth - 16) left = window.innerWidth - menuW - 16;
  menu.style.top  = top  + 'px';
  menu.style.left = left + 'px';
  menu.style.maxHeight = '400px';
  menu.style.overflowY = 'auto';
  menu.style.display = 'block';
}

function closeSquadCtx() {
  const m = document.getElementById('squadCtxMenu');
  if (m) m.style.display = 'none';
  _ctxPid = null;
}

// Cerrar al clicar fuera
document.addEventListener('click', (e) => {
  const m = document.getElementById('squadCtxMenu');
  if (m && m.style.display !== 'none' && !m.contains(e.target)) closeSquadCtx();
});

// Acciones del menú contextual
function squadToBench(pid) {
  closeSquadCtx();
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === pid);
  if (!p) return;
  const sub = myTeam.squad.find(pl => !pl.inSquad && !(pl.injury?.jornadasLeft > 0) && !(pl.suspension > 0));
  if (!sub) return;
  p.inSquad = false;
  sub.inSquad = true;
  refreshSquadOrder();
  saveGame();
  renderSquad();
  renderFormationPitch();
  updateBudgetSidebar();
}

function squadReplace(outId, inId) {
  closeSquadCtx();
  const myTeam = getMyTeam();
  const outP = myTeam.squad.find(pl => pl.id === outId);
  const inP  = myTeam.squad.find(pl => pl.id === inId);
  if (!outP || !inP) return;
  const idxOut = myTeam.squad.indexOf(outP);
  const idxIn  = myTeam.squad.indexOf(inP);
  myTeam.squad.splice(idxIn, 1);
  myTeam.squad.splice(idxOut, 0, inP);
  outP.inSquad = false;
  inP.inSquad  = true;
  refreshSquadOrder();
  saveGame();
  renderSquad();
  renderFormationPitch();
  updateBudgetSidebar();
}

function squadSwapStarters(aPid, bPid) {
  closeSquadCtx();
  const myTeam = getMyTeam();
  const a = myTeam.squad.find(pl => pl.id === aPid);
  const b = myTeam.squad.find(pl => pl.id === bPid);
  if (!a || !b) return;
  const ia = myTeam.squad.indexOf(a);
  const ib = myTeam.squad.indexOf(b);
  [myTeam.squad[ia], myTeam.squad[ib]] = [myTeam.squad[ib], myTeam.squad[ia]];
  saveGame();
  renderSquad();
  renderFormationPitch();
}

function squadAddStarter(pid) {
  closeSquadCtx();
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === pid);
  if (!p || p.inSquad) return;
  p.inSquad = true;
  refreshSquadOrder();
  saveGame();
  renderSquad();
  renderFormationPitch();
  updateBudgetSidebar();
}

function renderStats() {
  const myTeam = getMyTeam();
  const st = myTeam.stats;
  const squad = myTeam.squad;
  document.getElementById('statsRecords').innerHTML = [
    {v:st.pts,l:'Puntos'},
    {v:st.g,l:'Victorias'},
    {v:st.e,l:'Empates'},
    {v:st.p,l:'Derrotas'},
    {v:st.gf,l:'Goles a favor'},
    {v:st.gc,l:'Goles en contra'},
  ].map(({v,l})=>`<div class="record-item"><div class="ri-val">${v}</div><div class="ri-label">${l}</div></div>`).join('');

  // Top scorers
  const scorers = squad.filter(p=>p.season.goals>0||p.season.gamesPlayed>0)
    .sort((a,b)=>b.season.goals-a.season.goals).slice(0,10);
  document.getElementById('topScorersTbody').innerHTML = scorers.map(p=>{
    const gp = p.season.gamesPlayed||0;
    const avgR = gp>0?(p.season.ratingSum/gp).toFixed(1):'-';
    return `<tr>
      <td>${p.name}</td>
      <td style="color:${posColor(p.pos)}">${p.pos}</td>
      <td>${gp}</td>
      <td style="color:var(--green);font-weight:600">${p.season.goals}</td>
      <td>${p.season.assists}</td>
      <td>${p.season.shots}</td>
      <td>${avgR}</td>
    </tr>`;
  }).join('');

  // History
  const hist = [...G.history].reverse();
  document.getElementById('historyList').innerHTML = hist.length===0
    ? '<div style="color:var(--text-muted);font-size:12px;padding:8px">Sin historial</div>'
    : hist.map(h=>{
      const myScore = h.myId===h.home?h.scoreH:h.scoreA;
      const oppScore = h.myId===h.home?h.scoreA:h.scoreH;
      const opp = getTeamById(h.myId===h.home?h.away:h.home);
      const res = myScore>oppScore?'win':myScore===oppScore?'draw':'loss';
      return `<div class="history-item">
        <span class="hi-date">${fmtDate(h.jornada,h.season)}</span>
        <span class="hi-match">vs ${opp?.name||'?'}</span>
        <span class="hi-result ${res}">${myScore}–${oppScore}</span>
      </div>`;
    }).join('');
}

// Transfer windows:
// Pre-season: jornada 0 (before first match of season)
// Winter window: jornadas 16-17 (mid-season)
// End of season: handled via season summary (budget available for next season)
function isTransferWindowOpen() {
  const j = getMyDivision().currentJornada;
  return getTransferWindowInfo(j).open;
}

function getTransferWindowStatus() {
  const myDiv = getMyDivision();
  const j = myDiv.currentJornada;
  const info = getTransferWindowInfo(j);
  const season = G.season || 1;

  if (info.open) {
    const closeJ = info.window === 'summer' ? 4 : info.window === 'winter' ? 18 : myDiv.calendar.length;
    const closeDate = jornadaDateStr(closeJ, season, _lang);
    const labels = {
      summer:    { es: '🌞 MERCADO DE VERANO', en: '🌞 SUMMER WINDOW' },
      winter:    { es: '❄️ MERCADO DE INVIERNO', en: '❄️ WINTER WINDOW' },
      endseason: { es: '🔄 MERCADO FIN DE TEMPORADA', en: '🔄 END OF SEASON WINDOW' }
    };
    const label = (labels[info.window]?.[_lang] || labels[info.window]?.es || 'MERCADO ABIERTO');
    return {
      open: true,
      label,
      desc: `Closes: ${closeDate}`,
      window: info.window
    };
  }

  // Calcular próxima ventana
  let nextJ = j < 17 ? 17 : 34;
  const nextDate = jornadaDateStr(nextJ, season, _lang);
  const jLeft = nextJ - j;
  return {
    open: false,
    label: _lang === 'en' ? '🔒 WINDOW CLOSED' : '🔒 VENTANA CERRADA',
    desc: _lang === 'en'
      ? `Next window opens ${nextDate} (${jLeft} matchday${jLeft!==1?'s':''} away)`
      : `Next window: ${nextDate} (${jLeft} matchday${jLeft!==1?'s':''} away)`
  };
}

function renderTransferList() {
  document.getElementById('budgetVal').textContent = fmt(G.club.budget);

  // Mostrar presupuesto salarial
  const bill = totalWageBill();
  const wageEl = document.getElementById('wageBudgetVal');
  const wageUsedEl = document.getElementById('wageUsedVal');
  if (wageEl) {
    wageEl.textContent = fmt(G.club.wageBudget || 0) + (_lang==='en'?'/año':'/año');
    const pct = G.club.wageBudget > 0 ? Math.round(bill / G.club.wageBudget * 100) : 0;
    const col = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yellow)' : 'var(--green)';
    if (wageUsedEl) wageUsedEl.innerHTML = `<span style="color:${col}">${t('wageUsed', fmt(bill), pct)}</span>`;
  }
  const status = getTransferWindowStatus();
  const badge = document.getElementById('transferWindowBadge');
  const msg   = document.getElementById('transferWindowMsg');
  const myDiv = getMyDivision();
  const currentDate = jornadaDateStr(myDiv.currentJornada, G.season, _lang);

  if (status.open) {
    badge.textContent = status.label;
    badge.style.cssText = 'background:rgba(0,230,118,0.12);color:var(--green);border:1px solid rgba(0,230,118,0.3);padding:4px 12px;display:inline-block;font-family:var(--font-display);font-size:10px;letter-spacing:1.5px;margin-bottom:6px';
    msg.innerHTML = `<div style="font-size:11px;color:var(--text-muted);margin-bottom:12px">${currentDate} · ${status.desc}</div>`;
  } else {
    badge.textContent = status.label;
    badge.style.cssText = 'background:rgba(255,61,90,0.08);color:var(--red);border:1px solid rgba(255,61,90,0.25);padding:4px 12px;display:inline-block;font-family:var(--font-display);font-size:10px;letter-spacing:1.5px;margin-bottom:6px';
    msg.innerHTML = `<div style="padding:20px;text-align:center;background:var(--bg3);border:1px solid var(--border)">
      <div style="font-size:12px;color:var(--text-muted)">📅 ${currentDate}</div>
      <div style="font-family:var(--font-display);font-size:13px;color:var(--text-dim);margin-top:6px">${status.desc}</div>
    </div>`;
    document.getElementById('transferList').innerHTML = '';
    return;
  }

  const cfg = DIV_CFG[G.league.myDivision];
  const windowInfo = getTransferWindowInfo(myDiv.currentJornada);
  const windowKey = `${G.season}_${windowInfo.window || 'pre'}`;
  if (!G._transferPool || G._transferWindowKey !== windowKey) {
    G._transferPool = [];

    // Cuotas por posición: variedad y cantidad generosa
    const posQuotas = [
      { pos: 'GK',  count: 6 },
      { pos: 'CB',  count: 8 },
      { pos: 'LB',  count: 5 },
      { pos: 'RB',  count: 5 },
      { pos: 'CDM', count: 7 },
      { pos: 'CM',  count: 8 },
      { pos: 'CAM', count: 6 },
      { pos: 'LM',  count: 4 },
      { pos: 'RM',  count: 4 },
      { pos: 'LW',  count: 6 },
      { pos: 'RW',  count: 6 },
      { pos: 'ST',  count: 10 },
    ];

    // Perfiles de jugador: distribución variada
    const profiles = [
      { weight: 0.12, label: 'joven_promesa',  qMod: () => -rndI(8,18),  age: () => rndI(16,19) },
      { weight: 0.10, label: 'super_promesa',  qMod: () => -rndI(2,10),  age: () => rndI(18,21) },
      { weight: 0.08, label: 'veterano',        qMod: () => rndI(-5,8),   age: () => rndI(33,37) },
      { weight: 0.12, label: 'crack',           qMod: () => rndI(10,20),  age: () => rndI(24,29) },
      { weight: 0.08, label: 'crack_joven',     qMod: () => rndI(6,14),   age: () => rndI(21,25) },
      { weight: 0.18, label: 'standard',        qMod: () => rndI(-3,6),   age: () => rndI(23,30) },
      { weight: 0.10, label: 'irregular',       qMod: () => -rndI(6,14),  age: () => rndI(22,32) },
      { weight: 0.08, label: 'maduro_solido',   qMod: () => rndI(0,8),    age: () => rndI(28,33) },
      { weight: 0.07, label: 'libre_barato',    qMod: () => -rndI(10,20), age: () => rndI(24,36) },
      { weight: 0.07, label: 'wildcard',        qMod: () => rndI(-12,15), age: () => rndI(19,34) },
    ];

    function pickProfile() {
      const r = Math.random();
      let cum = 0;
      for (const pr of profiles) {
        cum += pr.weight;
        if (r < cum) return pr;
      }
      return profiles[profiles.length - 1];
    }

    posQuotas.forEach(({ pos, count }) => {
      for (let i = 0; i < count; i++) {
        const profile = pickProfile();
        const q = clamp(cfg.baseQuality + profile.qMod(), 38, 97);
        const age = profile.age();
        const p = createPlayer(q, pos, 'tr'+pos+i+'_'+Date.now()+'_'+rndI(0,9999), false, age);
        G._transferPool.push(p);
      }
    });

    // Mezclar
    G._transferPool.sort(() => Math.random() - 0.5);
    G._transferWindowKey = windowKey;
  }

  // Filtro activo
  const activeFilter = G._transferFilter || 'ALL';
  const allPos = ['ALL','GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST'];
  const filtered = activeFilter === 'ALL'
    ? G._transferPool
    : G._transferPool.filter(p => p.pos === activeFilter);

  // Renderizar filtros
  const filterHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
    ${allPos.map(pos => `<button style="
      padding:3px 9px;font-family:var(--font-display);font-size:10px;letter-spacing:0.5px;
      cursor:pointer;border-radius:2px;transition:all 0.12s;
      background:${activeFilter===pos?'var(--accent)':'var(--bg3)'};
      color:${activeFilter===pos?'var(--bg)':'var(--text-muted)'};
      border:1px solid ${activeFilter===pos?'var(--accent)':'var(--border)'}"
      onclick="setTransferFilter('${pos}')">
      ${pos === 'ALL' ? 'TODOS' : pos}
    </button>`).join('')}
  </div>
  <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-bottom:10px">
    ${filtered.length} jugador${filtered.length !== 1 ? 'es' : ''} disponible${filtered.length !== 1 ? 's' : ''}
  </div>`;

  document.getElementById('transferList').innerHTML = filterHtml + filtered.map((p, i) => {
    // Usar índice real del pool completo para negociar
    const realIdx = G._transferPool.indexOf(p);
    const overall = calcOverall(p);
    const canAfford = G.club.budget >= p.value;
    let potHint = '';
    if (p.age < 23 && p.potential > overall + 8) potHint = '<span style="color:var(--gold);font-size:9px;margin-left:6px">★ GRAN PROMESA</span>';
    else if (p.age < 23 && p.potential > overall + 4) potHint = '<span style="color:var(--purple);font-size:9px;margin-left:6px">★ Promesa</span>';
    else if (p.age < 26 && p.potential > overall + 2) potHint = '<span style="color:var(--text-dim);font-size:9px;margin-left:6px">↗ Margen</span>';
    else if (p.age > 32) potHint = '<span style="color:var(--text-muted);font-size:9px;margin-left:6px">↘ Veterano</span>';
    const ageColor = p.age < 22 ? 'var(--green)' : p.age > 32 ? 'var(--red)' : 'var(--text-dim)';
    const estSalary = calcWeeklySalary(overall, p.age);
    const canAffordWages = (totalWageBill() + estSalary * 52) <= (G.club.wageBudget || 0) * 1.2;
    const wageWarn = !canAffordWages ? '<span style="color:var(--red);font-size:9px;margin-left:4px">⚠️ Wage limit</span>' : '';
    return `<div class="transfer-item">
      <div>
        <div class="ti-name">${p.name}${potHint}</div>
        <div class="ti-info">${p.pos} · ${overall} <span style="color:${ageColor}">· ${p.age} años</span> · <span style="color:var(--text-muted)">${fmt(estSalary)}/sem</span>${wageWarn}</div>
      </div>
      <button class="btn-sign" onclick="openNegModal(${realIdx})" ${canAfford?'':'style="opacity:0.4;cursor:not-allowed"'} ${canAfford?'':'disabled'}>NEGOCIAR</button>
    </div>`;
  }).join('');
}

function setTransferFilter(pos) {
  G._transferFilter = pos;
  renderTransferList();
}

function signPlayer(idx) {
  if (!isTransferWindowOpen()) { alert(t('marketClosed2')); return; }
  const p = G._transferPool[idx];
  if (!p || G.club.budget < p.value) return;
  const myTeam = getMyTeam();
  G.club.budget -= p.value;
  p.inSquad = false; // goes to bench
  myTeam.squad.push(p);
  G._transferPool.splice(idx, 1);
  saveGame();
  renderTransferList();
  renderSquad();
  renderFormationPitch();
  alert(`${p.name} fichado! Presupuesto restante: ${fmt(G.club.budget)}`);
}

// Drag desde el panel de plantilla (squad grid)
function onSquadCardDragStart(e, pid) {
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === pid);
  if (!p) return;
  dragState = {
    sourceEl: e.currentTarget,
    sourceType: p.inSquad ? 'pitch' : 'bench',
    sourcePid: pid
  };
  e.currentTarget.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', pid); } catch(_) {}
}

function onSquadCardDragEnd(e) {
  e.currentTarget.style.opacity = '';
  dragState = null;
}

