// POST MATCH
// ============================================================
function showPostMatch(){
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const oppT=match.myTeamSide==='A'?match.teamB:match.teamA;
  const myS=myT.score,oppS=oppT.score;
  const res=myS>oppS?'win':myS===oppS?'draw':'loss';
  const resText=myS>oppS?'VICTORIA':'draw'===res?'EMPATE':'DERROTA';

  document.getElementById('pmcScore').textContent=match.myIsHome?`${myS} – ${oppS}`:`${oppS} – ${myS}`;
  document.getElementById('pmcTeamA').textContent=match.myIsHome?G.club.name:oppT.name;
  document.getElementById('pmcTeamB').textContent=match.myIsHome?oppT.name:G.club.name;
  document.getElementById('pmcResult').className=`pmc-result ${res}`;
  document.getElementById('pmcResult').textContent=resText;

  // MVP
  const mvp=[...myT.starters].sort((a,b)=>b.match.rating-a.match.rating)[0];
  if(mvp){
    document.getElementById('pmcMvp').innerHTML=`
      <div class="pmc-mvp-badge">${mvp.pos}</div>
      <div class="pmc-mvp-info">
        <div class="pmc-mvp-label">MVP DEL PARTIDO</div>
        <div class="pmc-mvp-name">${mvp.name}</div>
        <div class="pmc-mvp-detail">${mvp.pos} · ${mvp.match.goals}G · ${mvp.match.assists}A</div>
      </div>
      <div class="pmc-mvp-rating">${mvp.match.rating.toFixed(1)}</div>`;
  }

  // Players table
  document.getElementById('pmcPlayersTbody').innerHTML=myT.starters.map(p=>{
    const pacc=p.match.passes>0?Math.round(p.match.passSuccess/p.match.passes*100)+'%':'–';
    const rc=p.match.rating>=7.5?'var(--green)':p.match.rating>=6.5?'var(--yellow)':'var(--red)';
    return `<tr>
      <td><span style="color:${posColor(p.pos)};font-size:10px;font-weight:700;margin-right:4px">${p.pos}</span>${p.name}</td>
      <td>90</td>
      <td style="color:var(--green)">${p.match.goals||'—'}</td>
      <td>${p.match.shots}</td>
      <td>${pacc}</td>
      <td style="color:${p.fatigue>60?'var(--green)':p.fatigue>30?'var(--yellow)':'var(--red)'}">${Math.round(p.fatigue)}</td>
      <td style="color:${rc};font-weight:600">${p.match.rating.toFixed(1)}</td>
    </tr>`;
  }).join('');

  // Match stats
  const stats=[
    {n:'Posesión',own:Math.round(myT.possession/(myT.possession+oppT.possession||1)*100)+'%',opp:Math.round(oppT.possession/(myT.possession+oppT.possession||1)*100)+'%',ov:myT.possession,op:oppT.possession},
    {n:'Disparos',own:myT.shots,opp:oppT.shots,ov:myT.shots,op:oppT.shots},
    {n:'A puerta',own:myT.shotsOnTarget||0,opp:oppT.shotsOnTarget||0,ov:myT.shotsOnTarget||0,op:oppT.shotsOnTarget||0},
    {n:'Faltas',own:myT.fouls,opp:oppT.fouls,ov:myT.fouls,op:oppT.fouls},
    {n:'Córners',own:myT.corners,opp:oppT.corners,ov:myT.corners,op:oppT.corners}
  ];
  document.getElementById('pmcMatchStats').innerHTML=stats.map(s=>{
    const tot=(s.ov||0)+(s.op||0)||1;
    const pA=(s.ov||0)/tot*100,pB=(s.op||0)/tot*100;
    return `<div class="ms-bar-row">
      <div class="ms-bar-label"><span class="own">${s.own}</span><span class="name">${s.n}</span><span class="opp">${s.opp}</span></div>
      <div class="ms-bar"><div class="ms-bar-own" style="width:${pA}%"></div><div class="ms-bar-opp" style="width:${pB}%"></div></div>
    </div>`;
  }).join('');

  document.getElementById('postMatchOverlay').classList.add('show');
}

function closePostMatch(){
  document.getElementById('postMatchOverlay').classList.remove('show');
  // If there's a season summary pending, show it
  if (G.lastSeasonSummary && !G._summaryShown) {
    G._summaryShown = true;
    showSeasonSummary();
    return;
  }
  showScreen('screen-hub');
  initHub();
}

function showSeasonSummary() {
  const s = G.lastSeasonSummary;
  if (!s) return;
  const myDiv = G.league.divisions[s.division];
  const sortedAtEnd = [...myDiv.teams].sort((a,b)=>b.stats.pts-a.stats.pts);
  const myTeam = getMyTeam();
  let outcome, description, color;
  if (s.promoted) {
    outcome = '¡ASCENSO!'; color = 'var(--green)';
    description = `Tu club asciende a Primera División tras quedar ${s.finalPos}º`;
  } else if (s.relegated) {
    outcome = 'DESCENSO'; color = 'var(--red)';
    description = `Tu club desciende a Segunda División tras quedar ${s.finalPos}º`;
  } else if (s.finalPos === 1) {
    outcome = '¡CAMPEÓN!'; color = 'var(--gold)';
    description = `Tu club gana la ${myDiv.name}`;
  } else {
    outcome = `${s.finalPos}º LUGAR`; color = 'var(--accent)';
    description = `Temporada completada en ${myDiv.name}`;
  }
  document.getElementById('ssOutcome').textContent = outcome;
  document.getElementById('ssOutcome').style.color = color;
  document.getElementById('ssDescription').textContent = description;

  // Body: prize money, top scorer, key events
  const topScorer = [...myTeam.squad].sort((a,b)=>b.season.goals-a.season.goals)[0];
  const cup = G.league.cup;
  const cupResult = cup.completed && cup.winner === 'player' ? '🏆 CAMPEÓN DE COPA' : '';

  document.getElementById('ssBody').innerHTML = `
    <div class="records-grid" style="margin-bottom:16px">
      <div class="record-item">
        <div class="ri-val">${s.finalPos}º</div>
        <div class="ri-label">Posición Final</div>
      </div>
      <div class="record-item">
        <div class="ri-val" style="color:var(--gold)">${fmt(s.leaguePrize)}</div>
        <div class="ri-label">Premio Liga</div>
      </div>
      <div class="record-item">
        <div class="ri-val" style="color:var(--green)">${myTeam.stats.pts}</div>
        <div class="ri-label">Puntos</div>
      </div>
    </div>
    ${cupResult ? `<div style="text-align:center;font-family:var(--font-display);font-size:18px;color:var(--gold);margin-bottom:14px;letter-spacing:2px">${cupResult}</div>` : ''}
    ${topScorer && topScorer.season.goals > 0 ? `
      <div class="section-title">Máximo goleador del equipo</div>
      <div class="pmc-mvp">
        <div class="pmc-mvp-badge">${topScorer.pos}</div>
        <div class="pmc-mvp-info">
          <div class="pmc-mvp-label">⚽ ${topScorer.season.goals} GOLES EN ${topScorer.season.gamesPlayed} PARTIDOS</div>
          <div class="pmc-mvp-name">${topScorer.name}</div>
          <div class="pmc-mvp-detail">${topScorer.age} años · MEDIA ${calcOverall(topScorer)}</div>
        </div>
      </div>` : ''}
    <div class="section-title">Finanzas de temporada</div>
    <div style="background:var(--bg3);padding:12px;border:1px solid var(--border);font-size:12px;color:var(--text-dim)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span>Nómina pagada:</span>
        <span style="color:var(--red);font-family:var(--font-mono)">-${fmt(s.wagesPaid || 0)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span>Premio de liga:</span>
        <span style="color:var(--green);font-family:var(--font-mono)">+${fmt(s.leaguePrize)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:6px;margin-top:6px">
        <span style="color:var(--text)">Presupuesto fichajes:</span>
        <span style="color:var(--gold);font-family:var(--font-mono);font-weight:700">${fmt(G.club.budget)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px">
        <span style="color:var(--text)">Presupuesto salarial:</span>
        <span style="color:var(--accent);font-family:var(--font-mono)">${fmt(G.club.wageBudget || 0)}</span>
      </div>
    </div>
    ${s.expiredContracts && s.expiredContracts.length > 0 ? `
      <div style="margin-top:12px;padding:10px 12px;background:rgba(255,85,113,0.06);border:1px solid rgba(255,85,113,0.25);font-size:11px">
        <div style="color:var(--red);font-family:var(--font-display);letter-spacing:1px;margin-bottom:6px">⚠️ CONTRATOS EXPIRADOS</div>
        <div style="color:var(--text-dim)">${s.expiredContracts.join(', ')} han abandonado el club al terminar su contrato.</div>
      </div>` : ''}
    ${s.promoted || s.relegated ? `
      <div style="margin-top:16px;padding:12px;background:${s.promoted?'rgba(0,230,118,0.06)':'rgba(255,61,90,0.06)'};border:1px solid ${s.promoted?'var(--green)':'var(--red)'};font-size:12px">
        ${s.promoted
          ? `<strong style="color:var(--green)">+${fmt(PROMOTION_BONUS)}</strong> bonus por ascenso. La próxima temporada juegas en ${G.league.divisions[1].name}.`
          : `Próxima temporada juegas en ${G.league.divisions[2].name}. Tendrás que reconstruir.`}
      </div>` : ''}
  `;
  document.getElementById('seasonSummaryOverlay').classList.add('show');
}

function closeSeasonSummary() {
  document.getElementById('seasonSummaryOverlay').classList.remove('show');
  delete G.lastSeasonSummary;
  delete G._summaryShown;
  saveGame();
  showScreen('screen-hub');
  initHub();
}

