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
        style="left:${left};top:${top};background:${color};color:${textColor}">
      <span class="fp-overall">${overall}</span>
      ${p.pos.slice(0,2)}
      <span class="fp-name">${shortName}</span>
      ${badge}
    </div>`;
  }).join('');

  // Render bench
  const bench = myTeam.squad.filter(p=>!p.inSquad);
  document.getElementById('benchBar').innerHTML = bench.length === 0
    ? '<div class="bench-empty">Banquillo vacío</div>'
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

  // Wire up drag-and-drop
  setupFormationDragDrop();
}

let dragState = null; // { sourceEl, sourceType: 'pitch'|'bench', sourcePid }

function setupFormationDragDrop() {
  const pitchEl = document.getElementById('formationPitch');
  const benchEl = document.getElementById('benchBar');
  if (!pitchEl || !benchEl) return;

  // Pitch players (starters)
  pitchEl.querySelectorAll('.fp-player').forEach(el => {
    el.addEventListener('dragstart', e => {
      if (el.classList.contains('injured') || el.classList.contains('suspended')) { e.preventDefault(); return; }
      dragState = { sourceEl: el, sourceType: 'pitch', sourcePid: el.dataset.pid };
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', el.dataset.pid); } catch(_) {}
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      pitchEl.querySelectorAll('.fp-player').forEach(p => p.classList.remove('drop-target'));
      benchEl.classList.remove('drag-over');
      dragState = null;
    });
    el.addEventListener('dragover', e => {
      if (dragState && el !== dragState.sourceEl && !el.classList.contains('injured') && !el.classList.contains('suspended')) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('drop-target');
      }
    });
    el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drop-target');
      if (!dragState) return;
      // Swap pitch ↔ pitch (rearrange) OR bench → pitch (replace)
      const targetPid = el.dataset.pid;
      swapPlayers(dragState.sourcePid, targetPid);
    });
  });

  // Bench players
  benchEl.querySelectorAll('.bench-player').forEach(el => {
    el.addEventListener('dragstart', e => {
      if (el.classList.contains('injured') || el.classList.contains('suspended')) { e.preventDefault(); return; }
      dragState = { sourceEl: el, sourceType: 'bench', sourcePid: el.dataset.pid };
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', el.dataset.pid); } catch(_) {}
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      pitchEl.querySelectorAll('.fp-player').forEach(p => p.classList.remove('drop-target'));
      benchEl.classList.remove('drag-over');
      dragState = null;
    });
  });

  // Drop on bench (move starter → bench)
  benchEl.addEventListener('dragover', e => {
    if (dragState && dragState.sourceType === 'pitch') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      benchEl.classList.add('drag-over');
    }
  });
  benchEl.addEventListener('dragleave', e => {
    if (e.target === benchEl) benchEl.classList.remove('drag-over');
  });
  benchEl.addEventListener('drop', e => {
    e.preventDefault();
    benchEl.classList.remove('drag-over');
    if (!dragState || dragState.sourceType !== 'pitch') return;
    // Move starter to bench (replace with first available bench player)
    const myTeam = getMyTeam();
    const starter = myTeam.squad.find(p => p.id === dragState.sourcePid);
    const benchAvailable = myTeam.squad.find(p => !p.inSquad && (!p.injury || p.injury.jornadasLeft <= 0));
    if (!starter) return;
    if (!benchAvailable) {
      alert('No hay suplentes disponibles para reemplazar');
      return;
    }
    starter.inSquad = false;
    benchAvailable.inSquad = true;
    // Reorder: keep formation slot order
    refreshSquadOrder();
    saveGame();
    renderFormationPitch();
  });
}

function swapPlayers(sourcePid, targetPid) {
  const myTeam = getMyTeam();
  const source = myTeam.squad.find(p => p.id === sourcePid);
  const target = myTeam.squad.find(p => p.id === targetPid);
  if (!source || !target) return;

  // Case 1: Both starters — swap their slots in the squad array
  if (source.inSquad && target.inSquad) {
    const idxS = myTeam.squad.indexOf(source);
    const idxT = myTeam.squad.indexOf(target);
    [myTeam.squad[idxS], myTeam.squad[idxT]] = [myTeam.squad[idxT], myTeam.squad[idxS]];
  }
  // Case 2: Bench player replaces a starter (drag bench → pitch player)
  else if (!source.inSquad && target.inSquad) {
    source.inSquad = true;
    target.inSquad = false;
    // Put source exactly where target was in the array
    const idxT = myTeam.squad.indexOf(target);
    myTeam.squad.splice(myTeam.squad.indexOf(source), 1); // remove from bench position
    myTeam.squad.splice(idxT, 0, source);                 // insert into target's slot
  }
  // Case 3: Starter dragged onto a bench chip (swap)
  else if (source.inSquad && !target.inSquad) {
    source.inSquad = false;
    target.inSquad = true;
    const idxS = myTeam.squad.indexOf(source);
    myTeam.squad.splice(myTeam.squad.indexOf(target), 1);
    myTeam.squad.splice(idxS, 0, target);
  }

  saveGame();
  renderFormationPitch();
  renderSquad();
}

function refreshSquadOrder() {
  // Ensure starters come first in the squad array
  const myTeam = getMyTeam();
  const starters = myTeam.squad.filter(p => p.inSquad);
  const subs = myTeam.squad.filter(p => !p.inSquad);
  myTeam.squad = [...starters, ...subs];
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

