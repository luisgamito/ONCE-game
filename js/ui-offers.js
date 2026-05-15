// OFERTAS RIVALES POR TUS JUGADORES
// ============================================================

// Se llama al inicio de cada jornada para generar posibles ofertas
function generateRivalOffers() {
  if (!G || !isTransferWindowOpen()) return;
  const myTeam = getMyTeam();
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
        por <strong>${offer.playerName}</strong> (${offer.playerPos} · ${offer.playerOverall})
      </div>
      <div class="offer-toast-actions">
        <button class="toast-btn accept" onclick="acceptRivalOffer('${offer.id}')">✓ ACEPTAR</button>
        <button class="toast-btn counter" onclick="counterRivalOffer('${offer.id}')">↔ PEDIR MÁS</button>
        <button class="toast-btn reject" onclick="rejectRivalOffer('${offer.id}')">✕ RECHAZAR</button>
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
  // El dinero de la venta va al presupuesto de FICHAJES
  G.club.budget += offer.amount;
  myTeam.squad.splice(playerIdx, 1);
  dismissOffer(offerId);
  saveGame();
  renderSquad();
  renderFormationPitch();
  renderTransferList();
  showRivalOfferToast({
    title: t('saleComplete'),
    body: `${offer.playerName} vendido a ${offer.rivalName} por ${fmt(offer.amount)}. Presupuesto: ${fmt(G.club.budget)}`,
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
        title: '✓ CONTRAOFERTA ACEPTADA',
        body: `${offer.playerName} vendido a ${offer.rivalName} por ${fmt(counterAmt)}. Presupuesto: ${fmt(G.club.budget)}`,
        color: 'var(--green)', duration: 5000, noButtons: true
      });
    }
  } else {
    saveGame();
    showRivalOfferToast({
      title: '✗ CONTRAOFERTA RECHAZADA',
      body: `${offer.rivalName} no acepta pagar ${fmt(counterAmt)} por ${offer.playerName}. Las negociaciones se rompen.`,
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

