// FORMATION PITCH (hub sidebar)
// ============================================================
function renderFormationPitch() {
  const myTeam = getMyTeam();
  const formation = G.club.formation;
  const pos = FORMATIONS[formation]||FORMATIONS['4-4-2'];
  const starters = myTeam.squad.filter(p=>p.inSquad).slice(0,11);
  const color = G.club.color;
  const textColor = isDark(color)?'#fff':'#111';

  document.getElementById('fpPlayers').innerHTML = starters.map((p,i)=>{
    const fp = pos[i]||{x:.5,y:.5};
    const left = (fp.x*100).toFixed(1)+'%';
    const top  = (fp.y*100).toFixed(1)+'%';
    const shortName = p.name.split(' ')[1]||p.name.slice(0,8);
    const overall = calcOverall(p);
    const injured = p.injury && p.injury.jornadasLeft > 0;
    const suspended = p.suspension && p.suspension > 0;
    const warned = !suspended && p.season && p.season.yellows > 0 && (p.season.yellows % 5 === 4);
    const statusClass = injured ? 'injured' : suspended ? 'suspended' : '';
    const badge = suspended
      ? `<span class="fp-status-badge" style="background:var(--red)">🟥</span>`
      : warned
      ? `<span class="fp-status-badge" style="background:var(--yellow);color:#000">⚠️</span>`
      : injured
      ? `<span class="fp-status-badge" style="background:var(--red)">🩹</span>`
      : '';
    return `<div class="fp-player ${statusClass}"
        data-pid="${p.id}" data-slot="${i}"
        draggable="${(injured||suspended)?'false':'true'}"
        style="left:${left};top:${top};background:${color};color:${textColor};cursor:pointer"
        onclick="fpPlayerClick(event,'${p.id}')"
        ondragstart="fpDragStart(event,'${p.id}',${i})"
        ondragend="fpDragEnd(event)">
      <span class="fp-overall">${overall}</span>
      ${p.pos.slice(0,2)}
      <span class="fp-name">${shortName}</span>
      ${badge}
    </div>`;
  }).join('');

  // Render bench
  const bench = myTeam.squad.filter(p=>!p.inSquad);
  document.getElementById('benchBar').innerHTML = bench.length === 0
    ? `<div class="bench-empty">${t('benchEmpty')}</div>`
    : bench.map(p=>{
      const overall = calcOverall(p);
      const injured = p.injury && p.injury.jornadasLeft > 0;
      const suspended = p.suspension && p.suspension > 0;
      const warned = !suspended && p.season && p.season.yellows > 0 && (p.season.yellows % 5 === 4);
      const shortName = p.name.split(' ')[1]||p.name.slice(0,8);
      const statusSuffix = suspended ? ' · 🟥 SANCIONADO' : warned ? ' · ⚠️ AMONESTADO' : injured ? ' · LESIONADO' : '';
      return `<div class="bench-player ${injured?'injured':suspended?'suspended':''}"
          data-pid="${p.id}"
          draggable="${(injured||suspended)?'false':'true'}"
          title="${p.name} · ${p.pos} · MEDIA ${overall}${statusSuffix}">
        <span class="bp-pos" style="color:${posColor(p.pos)}">${p.pos}</span>
        <span class="bp-name">${shortName}</span>
        <span class="bp-rating">${overall}</span>
      </div>`;
    }).join('');

  // Wire up drag-and-drop (solo desktop)
  setupFormationDragDrop();
}

// Click en chapita del campo → abrir el mismo menú contextual que en la lista
function fpPlayerClick(e, pid) {
  e.stopPropagation();
  // Reusar el menú contextual de squadRowClick pasando el elemento como referencia
  squadRowClick(e, pid);
}

// Variables de drag del campo
let fpDragPid = null;
let fpDragSlot = null;

function fpDragStart(e, pid, slot) {
  fpDragPid = pid;
  fpDragSlot = slot;
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', pid); } catch(_) {}
  setTimeout(() => {
    const el = document.querySelector(`.fp-player[data-pid="${pid}"]`);
    if (el) el.classList.add('dragging');
  }, 0);
}

function fpDragEnd(e) {
  document.querySelectorAll('.fp-player').forEach(p => p.classList.remove('dragging','drop-target'));
  document.getElementById('benchBar')?.classList.remove('drag-over');
  fpDragPid = null; fpDragSlot = null;
}

let dragState = null; // mantener compatibilidad

function setupFormationDragDrop() {
  const pitchEl = document.getElementById('formationPitch');
  const benchEl = document.getElementById('benchBar');
  if (!pitchEl || !benchEl) return;

  // Drop sobre otra chapita del campo (intercambiar titulares)
  pitchEl.querySelectorAll('.fp-player').forEach(el => {
    el.addEventListener('dragover', e => {
      if (fpDragPid && el.dataset.pid !== fpDragPid && !el.classList.contains('injured') && !el.classList.contains('suspended')) {
        e.preventDefault();
        el.classList.add('drop-target');
      }
    });
    el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drop-target');
      if (!fpDragPid || el.dataset.pid === fpDragPid) return;
      squadSwapStarters(fpDragPid, el.dataset.pid);
      fpDragPid = null;
    });
  });

  // Drop sobre chip del banquillo (titular → banquillo, suplente entra)
  benchEl.querySelectorAll('.bench-player').forEach(el => {
    el.addEventListener('dragover', e => {
      if (fpDragPid && !el.classList.contains('injured') && !el.classList.contains('suspended')) {
        e.preventDefault();
        el.classList.add('drop-target');
      }
    });
    el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drop-target');
      if (!fpDragPid) return;
      const inId = el.dataset.pid;
      squadReplace(fpDragPid, inId);
      fpDragPid = null;
    });
  });

  // Drop en zona del banquillo (titular va al banco, primer suplente disponible entra)
  benchEl.addEventListener('dragover', e => {
    if (fpDragPid) { e.preventDefault(); benchEl.classList.add('drag-over'); }
  });
  benchEl.addEventListener('dragleave', e => {
    if (e.target === benchEl || !benchEl.contains(e.relatedTarget)) benchEl.classList.remove('drag-over');
  });
  benchEl.addEventListener('drop', e => {
    e.preventDefault();
    benchEl.classList.remove('drag-over');
    if (!fpDragPid) return;
    squadToBench(fpDragPid);
    fpDragPid = null;
  });

  // DROP de chapita de banquillo sobre el campo (suplente reemplaza titular)
  benchEl.querySelectorAll('.bench-player').forEach(el => {
    el.addEventListener('dragstart', e => {
      if (el.classList.contains('injured') || el.classList.contains('suspended')) { e.preventDefault(); return; }
      fpDragPid = el.dataset.pid;
      fpDragSlot = null;
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', el.dataset.pid); } catch(_) {}
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => { el.classList.remove('dragging'); fpDragPid = null; });
  });

  // El campo acepta drops de suplentes
  pitchEl.addEventListener('dragover', e => {
    if (fpDragPid) { e.preventDefault(); }
  });
}

function refreshSquadOrder() {
  const myTeam = getMyTeam();
  const starters = myTeam.squad.filter(p => p.inSquad);
  const subs = myTeam.squad.filter(p => !p.inSquad);
  myTeam.squad = [...starters, ...subs];
}

// Garantiza siempre 11 titulares. Si faltan, promueve suplentes disponibles.
// Llamar después de cualquier operación que elimine o mueva jugadores.
function ensureElevenSlots() {
  const myTeam = getMyTeam();
  if (!myTeam) return;

  const starterCount = () => myTeam.squad.filter(p => p.inSquad).length;

  while (starterCount() < 11) {
    // Buscar el mejor suplente disponible (no lesionado, no sancionado)
    const available = myTeam.squad.filter(p =>
      !p.inSquad &&
      !(p.injury && p.injury.jornadasLeft > 0) &&
      !(p.suspension && p.suspension > 0)
    );
    if (available.length === 0) break; // No hay más jugadores disponibles
    // Promover el de mayor media
    const best = available.reduce((a, b) => calcOverall(a) >= calcOverall(b) ? a : b);
    best.inSquad = true;
  }

  refreshSquadOrder();
}

function changeFormation(f) {
  G.club.formation = f;
  renderFormationPitch();
  saveGame();
}

function updateTacticChips(rowId, activeTactic) {
  document.querySelectorAll(`#${rowId} .tactic-chip`).forEach(c=>{
    c.classList.toggle('active', c.dataset.tactic===activeTactic);
  });
  document.querySelector(`#${rowId}`).onclick = (e)=>{
    const chip = e.target.closest('.tactic-chip');
    if (!chip) return;
    G.club.tactic = chip.dataset.tactic;
    updateTacticChips(rowId, G.club.tactic);
    saveGame();
  };
  // Mostrar descripción si existe el elemento
  const descEl = document.getElementById('tacticDesc');
  if (descEl) {
    descEl.textContent = tacticDesc(activeTactic);
  }
}

