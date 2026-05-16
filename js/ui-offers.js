// OFERTAS RIVALES POR TUS JUGADORES
// ============================================================

// Se llama al inicio de cada jornada para generar posibles ofertas
function generateRivalOffers() {
  if (!G || !isTransferWindowOpen()) return;  const myTeam = getMyTeam();
  if (!myTeam || myTeam.squad.length === 0) return;

  if (Math.random() > 0.30) return;

  const candidates = myTeam.squad.filter(p => {
    const ov = calcOverall(p);
    return p.inSquad && ov >= 62 && !(p.injury && p.injury.jornadasLeft > 0);
  });
  if (candidates.length === 0) return;

  const target = pick(candidates);
  const overall = calcOverall(target);
  const rivals = getAllTeams().filter(t => t.id !== 'player');
  if (rivals.length === 0) return;
  const rival = pick(rivals);

  const offerMultiplier = rnd(0.90, 1.30);
  const offerAmt = Math.round(target.value * offerMultiplier / 1000) * 1000;

  if (!G._pendingOffers) G._pendingOffers = [];
  G._pendingOffers.push({
    id: Date.now() + '_' + rndI(0, 9999),
    playerId: target.id,
    playerName: target.name,
    playerPos: target.pos,
    playerOverall: overall,
    rivalName: rival.name,
    amount: offerAmt,
    canCounter: true  // el jugador puede rechazar y proponer precio
  });

  renderPendingOffers();
}

function renderPendingOffers() {
  if (!G._pendingOffers || G._pendingOffers.length === 0) return;
  const inbox = document.getElementById('offerInbox');
  inbox.innerHTML = '';
  G._pendingOffers.slice(-3).forEach(offer => {
    const toast = document.createElement('div');
    toast.className = 'offer-toast';
    toast.id = 'toast_' + offer.id;
    toast.innerHTML = `
      <div class="offer-toast-title">💰 ${t('offerReceived').replace('💰 ','')}</div>
      <div class="offer-toast-body">
        <strong>${offer.rivalName}</strong> ofrece <strong style="color:var(--green)">${fmt(offer.amount)}</strong>
        for <strong>${offer.playerName}</strong> (${offer.playerPos} · ${offer.playerOverall})
      </div>
      <div class="offer-toast-actions">
        <button class="toast-btn accept" onclick="acceptRivalOffer('${offer.id}')">✓ ACCEPT</button>
        <button class="toast-btn counter" onclick="counterRivalOffer('${offer.id}')">↔ COUNTER</button>
        <button class="toast-btn reject" onclick="rejectRivalOffer('${offer.id}')">✕ REJECT</button>
      </div>`;
    inbox.appendChild(toast);
  });
}

function acceptRivalOffer(offerId) {
  if (!G._pendingOffers) return;
  const offer = G._pendingOffers.find(o => o.id === offerId);
  if (!offer) return;

  const myTeam = getMyTeam();
  const playerIdx = myTeam.squad.findIndex(p => p.id === offer.playerId);
  if (playerIdx === -1) { dismissOffer(offerId); return; }

  const player = myTeam.squad[playerIdx];
  player.listedForSale = false;
  player.askingPrice = null;
  G.club.budget += offer.amount;
  myTeam.squad.splice(playerIdx, 1);
  dismissOffer(offerId);
  saveGame();
  renderSquad();
  renderFormationPitch();
  renderTransferList();
  showRivalOfferToast({
    title: t('saleComplete'),
    body: `${offer.playerName} sold to ${offer.rivalName} for ${fmt(offer.amount)}. Presupuesto: ${fmt(G.club.budget)}`,
    color: 'var(--green)',
    duration: 5000,
    noButtons: true
  });
}

function counterRivalOffer(offerId) {
  if (!G._pendingOffers) return;
  const offer = G._pendingOffers.find(o => o.id === offerId);
  if (!offer) return;

  // Pedir un 15-25% más. El rival acepta con 60% de probabilidad.
  const counterAmt = Math.round(offer.amount * rnd(1.15, 1.25) / 1000) * 1000;
  const accepts = Math.random() < 0.60;

  dismissOffer(offerId);

  if (accepts) {
    const myTeam = getMyTeam();
    const playerIdx = myTeam.squad.findIndex(p => p.id === offer.playerId);
    if (playerIdx !== -1) {
      G.club.budget += counterAmt;
      myTeam.squad.splice(playerIdx, 1);
      saveGame();
      renderSquad();
      renderFormationPitch();
      renderTransferList();
      showRivalOfferToast({
        title: t('saleComplete'),
        body: `${offer.playerName} sold to ${offer.rivalName} for ${fmt(counterAmt)}. Presupuesto: ${fmt(G.club.budget)}`,
        color: 'var(--green)', duration: 5000, noButtons: true
      });
    }
  } else {
    saveGame();
    showRivalOfferToast({
      title: '✗ COUNTER REJECTED',
      body: _lang==='en' ? `${offer.rivalName} rejected the ${fmt(counterAmt)} bid for ${offer.playerName}. Negotiations have ended.` : `${offer.rivalName} rejected the offer of ${fmt(counterAmt)} for ${offer.playerName}. Negotiations have ended.`,
      color: 'var(--red)', duration: 4000, noButtons: true
    });
  }
}

function rejectRivalOffer(offerId) {
  dismissOffer(offerId);
  saveGame();
}

function dismissOffer(offerId) {
  if (!G._pendingOffers) return;
  G._pendingOffers = G._pendingOffers.filter(o => o.id !== offerId);
  const el = document.getElementById('toast_' + offerId);
  if (el) el.remove();
}

function showRivalOfferToast({ title, body, color='var(--yellow)', duration=3500, noButtons=false }) {
  const inbox = document.getElementById('offerInbox');
  const toast = document.createElement('div');
  toast.className = 'offer-toast';
  toast.style.borderLeftColor = color;
  toast.innerHTML = `<div class="offer-toast-title" style="color:${color}">${title}</div><div class="offer-toast-body">${body}</div>`;
  inbox.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// Hook: llamar generateRivalOffers al inicio de cada jornada (tras simular partido)
const _origSaveMatchResult = typeof saveMatchResult === 'function' ? saveMatchResult : null;


// ============================================================
// JUGADORES ON SALE (listeds al mercado)
// ============================================================

function listPlayerForSale(pid) {
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === pid);
  if (!p) return;

  // Modal simple con precio mínimo
  const overall = calcOverall(p);
  const suggested = Math.round(p.value / 1000) * 1000;

  // Crear modal inline
  const existing = document.getElementById('listingModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'listingModal';
  modal.className = 'modal-overlay open';
  modal.innerHTML = `
    <div class="modal" style="width:380px;padding:0;overflow:hidden">
      <div class="neg-player-header">
        <div class="neg-player-name">OFRECER AL MERCADO</div>
        <div class="neg-player-name" style="font-size:15px;margin-top:4px">${p.name}</div>
        <div class="neg-player-meta">${p.pos} · ${p.age}a · OVR ${overall}</div>
      </div>
      <div class="neg-body">
        ${p.listedForSale ? `<div style="padding:8px 0;font-size:11px;color:var(--yellow)">⚠️ Already listed at ${fmt(p.askingPrice)}. You can change the price or remove the listing.</div>` : ''}
        <div class="neg-price-row">
          <span class="neg-price-label">Asking price</span>
          <span class="neg-price-val" id="listingPriceVal">${fmt(suggested)}</span>
        </div>
        <div class="neg-slider-wrap">
          <input type="range" class="neg-slider" id="listingSlider"
            min="${Math.round(p.value * 0.5 / 1000) * 1000}"
            max="${Math.round(p.value * 2.5 / 1000) * 1000}"
            step="${Math.round(p.value * 0.05 / 1000) * 1000 || 10000}"
            value="${p.askingPrice || suggested}"
            oninput="document.getElementById('listingPriceVal').textContent=fmt(parseInt(this.value))">
          <div class="neg-range-labels">
            <span>${fmt(Math.round(p.value*0.5/1000)*1000)}</span>
            <span>Valor: ${fmt(p.value)}</span>
            <span>${fmt(Math.round(p.value*2.5/1000)*1000)}</span>
          </div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin:8px 0 12px">
          Los equipos rivales pueden hacer ofertas durante la ventana de fichajes.
        </div>
        <div class="neg-actions">
          <button class="btn accent" onclick="confirmListing('${pid}')">📢 LIST</button>
          ${p.listedForSale ? `<button class="btn" style="border-color:var(--red);color:var(--red)" onclick="withdrawListing('${pid}')">✕ REMOVE</button>` : ''}
          <button class="btn" onclick="document.getElementById('listingModal').remove()">CANCEL</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function confirmListing(pid) {
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === pid);
  if (!p) return;
  const price = parseInt(document.getElementById('listingSlider').value);
  p.listedForSale = true;
  p.askingPrice = price;
  document.getElementById('listingModal')?.remove();
  saveGame();
  renderSquad();
  showRivalOfferToast({
    title: t('listingOffered'),
    body: t('listingConfirm', p.name, fmt(price)),
    color: 'var(--accent)', duration: 4000, noButtons: true
  });
}

function withdrawListing(pid) {
  const myTeam = getMyTeam();
  const p = myTeam.squad.find(pl => pl.id === pid);
  if (!p) return;
  p.listedForSale = false;
  p.askingPrice = null;
  document.getElementById('listingModal')?.remove();
  saveGame();
  renderSquad();
  showRivalOfferToast({
    title: t('listingWithdrawn'),
    body: t('listingWithdraw', p.name),
    color: 'var(--text-muted)', duration: 3000, noButtons: true
  });
}

// Generar ofertas para jugadores listados
function generateOffersForListedPlayers() {
  if (!G || !isTransferWindowOpen()) return;
  const myTeam = getMyTeam();
  const listed = myTeam.squad.filter(p => p.listedForSale && p.askingPrice);
  if (listed.length === 0) return;

  listed.forEach(p => {
    if (Math.random() > 0.40) return; // 40% de chance por jornada de ventana

    const rivals = getAllTeams().filter(t => t.id !== 'player');
    if (!rivals.length) return;
    const rival = pick(rivals);

    // El rival ofrece entre 90% y 115% del precio pedido
    const pct = rnd(0.90, 1.15);
    const offerAmt = Math.round(p.askingPrice * pct / 1000) * 1000;

    if (!G._pendingOffers) G._pendingOffers = [];
    // Evitar duplicados para el mismo jugador
    const alreadyHasOffer = G._pendingOffers.some(o => o.playerId === p.id);
    if (alreadyHasOffer) return;

    G._pendingOffers.push({
      id: Date.now() + '_' + rndI(0, 9999),
      playerId: p.id,
      playerName: p.name,
      playerPos: p.pos,
      playerOverall: calcOverall(p),
      rivalName: rival.name,
      amount: offerAmt,
      fromListing: true
    });
    renderPendingOffers();
  });
}
