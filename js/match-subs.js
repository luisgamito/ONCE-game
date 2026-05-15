// SUBSTITUTIONS
// ============================================================
function openSubModal(){
  if(subsRemaining<=0){alert('No quedan sustituciones');return;}
  // Let user pick who goes OUT first (from playing starters)
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  if(!subPendingOut){
    document.getElementById('sub-info').textContent='Selecciona el jugador que SALE';
    document.getElementById('sub-bench-list').innerHTML = fieldP(myT).filter(p=>p.pos!=='GK'||(match.possession&&false)).map(p=>{
      return `<div class="transfer-item" style="cursor:pointer" onclick="selectSubOut('${p.id}')">
        <div><div class="ti-name">${p.name}</div><div class="ti-info">${p.pos} · Fat. ${Math.round(p.fatigue)} · Val. ${p.match.rating.toFixed(1)}</div></div>
        <div class="ti-price" style="color:var(--red)">SALE</div>
      </div>`;
    }).join('');
  }
  document.getElementById('subModal').classList.add('open');
}
function selectSubOut(id){
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const p=fieldP(myT).find(pl=>pl.id===id);
  if(!p)return;
  subPendingOut=p;
  document.getElementById('sub-info').textContent=`${p.name} SALE — Elige quién entra:`;
  document.getElementById('sub-bench-list').innerHTML = myT.bench.filter(b=>b.onField!==false).map(b=>{
    const overall=Math.round((b.attr.speed+b.attr.technique+b.attr.physical+b.attr.vision+b.attr.mentality+b.attr.shooting+b.attr.defense)/7);
    return `<div class="transfer-item" style="cursor:pointer" onclick="confirmSub('${b.id}')">
      <div><div class="ti-name">${b.name}</div><div class="ti-info">${b.pos} · Media ${overall} · Fat. ${Math.round(b.fatigue||100)}</div></div>
      <div class="ti-price" style="color:var(--green)">ENTRA</div>
    </div>`;
  }).join('');
}
function confirmSub(inId){
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const benchP=myT.bench.find(b=>b.id===inId);
  if(!benchP||!subPendingOut)return;
  pendingSubs.push({out:subPendingOut,in:benchP,applied:false});
  subPendingOut=null;
  closeSubModal();
  updateSubsUI();
}
function closeSubModal(){
  document.getElementById('subModal').classList.remove('open');
  subPendingOut=null;
}

function applyPendingSubs(){
  pendingSubs.filter(s=>!s.applied&&match.state==='playing').forEach(s=>{
    // Apply on goal reset or half time
    // For simplicity, apply at next tick opportunity (after ball changes)
    if(s.out===match.ballHolder)return; // wait
    applyOneSub(s);
  });
}
function applyPendingSubsHalfTime(){
  pendingSubs.filter(s=>!s.applied).forEach(s=>applyOneSub(s));
}
function applyOneSub(s){
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  s.out.onField=false;
  // Heredar posición del saliente
  s.in.x=s.out.x; s.in.y=s.out.y;
  s.in.baseX=s.out.baseX; s.in.baseY=s.out.baseY;
  // Heredar posiciones de fase del saliente (mismo slot táctico)
  s.in.defX=s.out.defX; s.in.defY=s.out.defY;
  s.in.attX=s.out.attX; s.in.attY=s.out.attY;
  // Rol táctico del saliente
  s.in.matchRole = s.out.matchRole || s.in.role || 'CM';
  // Estado de partido
  s.in.fatigue=100; s.in.currentSpeed=0; s.in.onField=true;
  s.in.driftX=0; s.in.driftY=0; s.in.driftRefreshTick=match.tick;
  s.in.match={goals:0,assists:0,shots:0,shotsOnTarget:0,passes:0,passSuccess:0,tackles:0,fouls:0,rating:6.0};
  s.in.cards={yellow:0,red:false};
  myT.starters=myT.starters.filter(p=>p!==s.out);
  myT.starters.push(s.in);
  myT.bench=myT.bench.filter(p=>p!==s.in);
  subsRemaining--;
  s.applied=true;
  addLog(`🔄 ${s.out.name} ↗ ${s.in.name}`,'event-whistle');
  updateSubsUI();
  renderMatchSquad();
}

function updateSubsUI(){
  document.getElementById('subsRemaining').textContent=`${subsRemaining} cambio${subsRemaining!==1?'s':''} disponible${subsRemaining!==1?'s':''}`;
  document.getElementById('subsPlanned').innerHTML=pendingSubs.filter(s=>!s.applied).map(s=>`
    <div class="sub-slot">
      <span class="ss-out">↗ ${s.out.name}</span>
      <span class="ss-arrow">→</span>
      <span class="ss-in">↘ ${s.in.name}</span>
    </div>`).join('');
}

function changeTacticLive(tac){
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  myT.tactic=tac;G.club.tactic=tac;
  updateTacticLiveUI();
  addLog(t('tacticChanged', tacticName(tac)),'event-whistle');
}
function updateTacticLiveUI(){
  document.querySelectorAll('#tacticLiveRow .tactic-chip').forEach(c=>{
    c.classList.toggle('active',c.dataset.tactic===G.club.tactic);
  });
}

