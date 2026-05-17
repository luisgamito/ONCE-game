// PLAYER MODAL
// ============================================================
function openPlayerModal(playerId) {
  const myTeam = getMyTeam();
  let p = myTeam.squad.find(pl=>pl.id===playerId);
  if (!p) {
    // Search in opponents (during match)
    if (match) {
      [match.teamA, match.teamB].forEach(t=>{
        const f = [...t.starters, ...(t.bench||[])].find(pl=>pl.id===playerId);
        if (f) p = f;
      });
    }
  }
  if (!p) return;
  const overall = calcOverall(p);
  const injured = p.injury && p.injury.jornadasLeft > 0;
  const suspended = p.suspension && p.suspension > 0;
  const warned = !suspended && p.season && p.season.yellows > 0 && (p.season.yellows % 5 === 4);
  const injStatus = injured
    ? `<span style="color:var(--red);margin-left:8px">🩹 ${p.injury.type || t('injured')} — ${p.injury.jornadasLeft}</span>`
    : suspended
    ? `<span style="color:var(--red);margin-left:8px">🟥 SANCIONADO — ${p.suspension} partido${p.suspension!==1?'s':''}</span>`
    : warned
    ? `<span style="color:var(--yellow);margin-left:8px">⚠️ BOOKED — next yellow = suspension</span>`
    : '';
  document.getElementById('pm-name').innerHTML = `${p.name}${injStatus}`;
  // Vague potential estimate (only show range for own players)
  let potText = '';
  if (p.age < 26 && p.potential > overall) {
    const gap = p.potential - overall;
    if (gap > 12) potText = ' · POT ★★★';
    else if (gap > 6) potText = ' · POT ★★';
    else if (gap > 2) potText = ' · POT ★';
  }
  document.getElementById('pm-meta').textContent = `${p.pos} · ${p.age} yrs · MEDIA ${overall}${potText} · Valor: ${fmt(p.value)}`;

  const attrKeys = [['speed','Velocidad'],['technique','Técnica'],['shooting','Disparo'],['defense','Defensa'],['physical','Físico'],['vision','Visión'],['mentality','Mentalidad'],['positioning','Posición'],['reflexes','Reflejos']];
  document.getElementById('pm-attrs').innerHTML = attrKeys.map(([k,label])=>{
    const v = p.attr[k];
    if (v == null) return '';
    const cls = v>=80?'high':v>=65?'mid':'low';
    // Comprobar si este atributo ha mejorado recientemente (comparar con peakAttr original)
    const isImproved = p.attrHistory && p.attrHistory[k] && p.attrHistory[k] > 0;
    const gainBadge = isImproved ? `<span style="color:var(--green);font-size:8px;font-weight:700">+${p.attrHistory[k]}</span>` : '';
    return `<div class="attr-item">
      <div class="attr-val ${cls}" style="position:relative">${v}${gainBadge}</div>
      <div class="attr-name">${label}</div>
    </div>`;
  }).join('');

  // Mejoras recientes de atributos
  if (p.lastLevelUp && p.lastLevelUp.season === G.season) {
    document.getElementById('pm-attrs').insertAdjacentHTML('afterend',
      `<div style="margin-top:8px;padding:8px 10px;background:rgba(0,230,118,0.07);border:1px solid var(--green);border-radius:2px;font-size:11px;color:var(--green)">
        ${t('recentLevelUp', p.lastLevelUp.gain > 0 ? p.lastLevelUp.gain : 1, p.lastLevelUp.jornada)}
       </div>`
    );
  }

  const s = p.season;
  const c = p.career;
  const gp = s.gamesPlayed||0;
  document.getElementById('pm-season-stats').innerHTML = [
    {v:s.goals,l:'Goals temp.'},{v:s.assists,l:'Asist. temp.'},
    {v:gp>0?(s.ratingSum/gp).toFixed(1):'-',l:'Val. media'},
    {v:`${c?.goals||0}`,l:'Goals carrera'}
  ].map(({v,l})=>`<div class="stat-block"><div class="sb-val">${v}</div><div class="sb-label">${l}</div></div>`).join('');

  const pers = p.personality;
  document.getElementById('pm-personality').innerHTML = [
    {l:'Motor',v:pers.workRate},{l:'Aguante',v:pers.stamina},
    {l:'Agresividad',v:pers.aggressiveness},{l:'Descaro',v:pers.flair},
    {l:'Urgencia',v:pers.urgency},{l:'Disciplina',v:pers.posDiscipline}
  ].map(({l,v})=>`<div class="stat-block"><div class="sb-val" style="font-size:22px">${v.toFixed(2)}</div><div class="sb-label">${l}</div></div>`).join('');

  // Sección de contrato (solo si es jugador propio y estamos en el hub)
  const releaseSection = document.getElementById('pm-release-section');
  const isOwnPlayer = getMyTeam().squad.some(pl => pl.id === p.id);
  if (isOwnPlayer && !match) {
    const compensation = rescissionCost(p);
    const saleInfo = p.listedForSale
      ? `<div style="padding:6px 10px;background:rgba(0,212,255,0.07);border:1px solid rgba(0,212,255,0.25);font-size:11px;color:var(--accent);margin-bottom:10px">${t('contractListed', '<strong>'+fmt(p.askingPrice)+'</strong>')}</div>`
      : '';
    releaseSection.innerHTML = `<div style="border-top:1px solid var(--border);padding-top:14px;margin-top:4px">
      <div style="font-family:var(--font-display);font-size:10px;letter-spacing:1.5px;color:var(--text-muted);margin-bottom:8px">CONTRATO</div>
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:12px">
        ${p.contract
          ? `<strong style="color:var(--text)">${contractLabel(p)}</strong><br><span style="color:var(--text-muted)">Rescisión: ${fmt(compensation)}</span>`
          : 'Sin contrato formal.'}
      </div>
      ${saleInfo}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <button class="btn" style="border-color:var(--accent);color:var(--accent)"
          onclick="closePlayerModal();openContractModal({mode:'reneg',player:getMyTeam().squad.find(pl=>pl.id==='${p.id}')})">
          🔄 RENOVAR
        </button>
        ${isTransferWindowOpen() ? `<button class="btn" style="border-color:var(--yellow);color:var(--yellow)"
          onclick="closePlayerModal();listPlayerForSale('${p.id}')">
          💰 ${p.listedForSale ? 'EDITAR OFERTA' : 'OFRECER'}
        </button>` : ''}
        <button class="btn" style="border-color:var(--red);color:var(--red)"
          onclick="releasePlayer('${p.id}', ${compensation})">
          ✕ RESCINDIR
        </button>
      </div>
    </div>`;
  } else {
    releaseSection.innerHTML = '';
  }

  document.getElementById('playerModal').classList.add('open');
}
function closePlayerModal() { document.getElementById('playerModal').classList.remove('open'); }

function releasePlayer(playerId, compensation) {
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === playerId);
  if (!p) return;
  if (G.club.budget < compensation) {
    alert(t('fireNoFunds', compensation));
    return;
  }
  if (!confirm(t('fireConfirm', p.name, compensation))) return;

  G.club.budget -= compensation;
  myTeam.squad = myTeam.squad.filter(pl => pl.id !== playerId);
  ensureElevenSlots(); // Rellenar el hueco automáticamente si era titular
  closePlayerModal();
  saveGame();
  renderSquad();
  renderFormationPitch();
  if (typeof updateBudgetSidebar === 'function') updateBudgetSidebar();
  showRivalOfferToast({
    title: 'CONTRATO RESCINDIDO',
    body: t('fireSuccess', p.name, compensation, G.club.budget),
    color: 'var(--red)',
    duration: 4000,
    noButtons: true
  });
}

