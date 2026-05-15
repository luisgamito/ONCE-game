// NEGOCIACIÓN DE FICHAJES
// ============================================================
let _neg = null; // estado actual de negociación

function openNegModal(idx) {
  if (!isTransferWindowOpen()) { alert('El mercado de fichajes está cerrado.'); return; }
  const p = G._transferPool[idx];
  if (!p) return;
  const overall = calcOverall(p);

  // Precio oculto real que el club quiere (entre 1x y 1.4x del valor de mercado, con algo de azar)
  const secretMultiplier = rnd(0.95, 1.40);
  const secretPrice = Math.round(p.value * secretMultiplier / 1000) * 1000;

  _neg = {
    idx,
    player: p,
    marketValue: p.value,
    secretPrice,           // el precio mínimo real que aceptarán (oculto al jugador)
    minOffer: Math.round(p.value * 0.5 / 1000) * 1000,   // mínimo que puedes ofrecer
    maxOffer: Math.round(p.value * 1.6 / 1000) * 1000,   // máximo del slider
    rounds: 0,
    maxRounds: 4,
    lastResponse: null,
    blocked: false,        // true si rechazaron definitivamente
    currentOffer: p.value  // oferta actual del slider
  };

  document.getElementById('negPlayerName').textContent = p.name;
  document.getElementById('negPlayerMeta').textContent = `${p.pos} · ${overall} · ${p.age}a · Pot ${p.potential}`;
  document.getElementById('negMarketVal').textContent = fmt(p.value);
  document.getElementById('negOfferVal').textContent = fmt(p.value);
  document.getElementById('negRounds').textContent = t('attemptsLeft', _neg.maxRounds);
  document.getElementById('negResponse').className = 'neg-response pending';
  document.getElementById('negResponse').textContent = t('negPending');
  document.getElementById('negBtnSend').disabled = false;
  document.getElementById('negBtnSend').textContent = t('sendOffer');

  const slider = document.getElementById('negSlider');
  slider.min = _neg.minOffer;
  slider.max = _neg.maxOffer;
  slider.step = Math.round(p.value * 0.02 / 1000) * 1000 || 10000;
  slider.value = p.value;
  document.getElementById('negSliderMin').textContent = fmt(_neg.minOffer);
  document.getElementById('negSliderMax').textContent = fmt(_neg.maxOffer);

  document.getElementById('negModal').classList.add('open');
}

function onNegSlider() {
  if (!_neg) return;
  const val = parseInt(document.getElementById('negSlider').value);
  _neg.currentOffer = val;
  document.getElementById('negOfferVal').textContent = fmt(val);
}

function sendNegOffer() {
  if (!_neg || _neg.blocked) return;
  if (G.club.budget < _neg.currentOffer) {
    document.getElementById('negResponse').className = 'neg-response rejected';
    document.getElementById('negResponse').textContent = t('negNoFunds');
    return;
  }

  _neg.rounds++;
  const remainingRounds = _neg.maxRounds - _neg.rounds;
  const offer = _neg.currentOffer;
  const secret = _neg.secretPrice;
  const ratio = offer / secret;

  let responseClass, responseText, done = false;

  if (ratio >= 1.0) {
    // Oferta igual o superior al precio secreto → aceptan
    responseClass = 'accepted';
    responseText = t('negAccepted', _neg.player.name, offer);
    done = true;
    _neg.blocked = true;
    const _capturedIdx = _neg.idx;
    const _capturedOffer = offer;
    setTimeout(() => {
      closeNegModal();
      signPlayerDirect(_capturedIdx, _capturedOffer);
    }, 1400);
  } else if (ratio >= 0.88) {
    // Cerca pero no suficiente → contraoferta
    const counterOffer = Math.round((secret + offer) / 2 / 1000) * 1000;
    responseClass = 'counter';
    responseText = t('negCounter', counterOffer);
    // Sugerir la contraoferta en el slider
    document.getElementById('negSlider').value = counterOffer;
    _neg.currentOffer = counterOffer;
    document.getElementById('negOfferVal').textContent = fmt(counterOffer);
  } else if (ratio >= 0.72) {
    // Baja pero negociable
    responseClass = 'counter';
    responseText = t('negLow');
  } else {
    const hardReject = ratio < 0.55 || remainingRounds <= 0;
    if (hardReject) {
      responseClass = 'rejected';
      responseText = t('negRejected', _neg.player.name);
      _neg.blocked = true;
      done = true;
      document.getElementById('negBtnSend').disabled = true;
      document.getElementById('negBtnSend').textContent = t('closed');
      const _rIdx = _neg.idx;
      setTimeout(() => { removeFromPool(_rIdx); closeNegModal(); }, 1800);
    } else {
      responseClass = 'rejected';
      responseText = t('negTooLow');
    }
  }

  if (!done && remainingRounds <= 0) {
    responseClass = 'rejected';
    responseText = t('negNoAttempts');
    _neg.blocked = true;
    document.getElementById('negBtnSend').disabled = true;
    document.getElementById('negBtnSend').textContent = t('closed');
    const _rIdx2 = _neg.idx;
    setTimeout(() => { removeFromPool(_rIdx2); closeNegModal(); }, 1800);
  }

  document.getElementById('negResponse').className = `neg-response ${responseClass}`;
  document.getElementById('negResponse').textContent = responseText;
  document.getElementById('negRounds').textContent = t('attemptsLeft', Math.max(0, remainingRounds));
}

function removeFromPool(idx) {
  if (!G._transferPool || idx == null) return;
  G._transferPool.splice(idx, 1);
  saveGame();
  renderTransferList();
}

function closeNegModal() {
  document.getElementById('negModal').classList.remove('open');
  _neg = null;
}

function signPlayerDirect(idx, price) {
  const p = G._transferPool ? G._transferPool[idx] : null;
  if (!p || G.club.budget < price) return;
  // Abrir modal de negociación de contrato en lugar de fichar directamente
  openContractModal({ mode: 'sign', player: p, transferIdx: idx, transferPrice: price });
}


// ============================================================
// MODAL DE CONTRATO (al fichar o renegociar)
// ============================================================
let _contractCtx = null; // { mode:'sign'|'reneg', player, transferIdx, transferPrice }

function openContractModal(ctx) {
  _contractCtx = ctx;
  const p = ctx.player;
  const ov = calcOverall(p);
  const baseSalary = calcWeeklySalary(ov, p.age);

  document.getElementById('cmPlayerName').textContent = p.name;
  document.getElementById('cmPlayerMeta').textContent = `${p.pos} · ${p.age}a · Media ${ov}`;

  // Salario sugerido: mercado base ± 10%
  const suggestedSalary = Math.round(baseSalary / 500) * 500;
  document.getElementById('cmSalarySlider').min  = Math.round(baseSalary * 0.7 / 500) * 500;
  document.getElementById('cmSalarySlider').max  = Math.round(baseSalary * 1.6 / 500) * 500;
  document.getElementById('cmSalarySlider').step = 500;
  document.getElementById('cmSalarySlider').value = suggestedSalary;
  document.getElementById('cmSalaryVal').textContent = fmt(suggestedSalary) + '/sem';

  // Coste anual orientativo
  updateContractCostPreview();

  // Duración
  document.getElementById('cmYearsSlider').value = ctx.mode === 'reneg'
    ? Math.min(4, (p.contract?.yearsLeft || 2) + 1)
    : 3;
  document.getElementById('cmYearsVal').textContent = document.getElementById('cmYearsSlider').value + ' años';

  // Presupuesto salarial disponible
  const remaining = (G.club.wageBudget || 0) - totalWageBill() + annualWage(p);
  document.getElementById('cmWageInfo').innerHTML =
    `Presupuesto salarial restante: <strong style="color:var(--accent)">${fmt(Math.max(0, remaining))}</strong>/año`;

  if (ctx.mode === 'reneg') {
    document.getElementById('cmTitle').textContent = _lang==='en'?'RENEGOTIATE CONTRACT':'RENEGOCIAR CONTRATO';
    document.getElementById('cmCurrentContract').style.display = 'block';
    document.getElementById('cmCurrentContract').textContent =
      `Contrato actual: ${fmt(p.contract?.salary || 0)}/sem · ${p.contract?.yearsLeft || 0} año${(p.contract?.yearsLeft||0)!==1?'s':''} restante${(p.contract?.yearsLeft||0)!==1?'s':''}`;
  } else {
    document.getElementById('cmTitle').textContent = t('listingTitle').replace('TRANSFER','CONTRACT').replace('MERCADO','CONTRATO');
    document.getElementById('cmCurrentContract').style.display = 'none';
  }

  document.getElementById('contractModal').classList.add('open');
}

function onCmSalarySlider() {
  const v = parseInt(document.getElementById('cmSalarySlider').value);
  document.getElementById('cmSalaryVal').textContent = fmt(v) + '/sem';
  updateContractCostPreview();
}

function onCmYearsSlider() {
  const v = parseInt(document.getElementById('cmYearsSlider').value);
  document.getElementById('cmYearsVal').textContent = v + ' año' + (v!==1?'s':'');
  updateContractCostPreview();
}

function updateContractCostPreview() {
  const salary = parseInt(document.getElementById('cmSalarySlider').value);
  const years = parseInt(document.getElementById('cmYearsSlider').value);
  const annualCost = salary * 52;
  const totalCost = annualCost * years;
  document.getElementById('cmCostPreview').innerHTML =
    `<span style="color:var(--yellow)">${fmt(annualCost)}/año</span> · Total ${years} año${years!==1?'s':''}: <span style="color:var(--text-muted)">${fmt(totalCost)}</span>`;
}

function confirmContract() {
  if (!_contractCtx) return;
  const salary = parseInt(document.getElementById('cmSalarySlider').value);
  const years  = parseInt(document.getElementById('cmYearsSlider').value);
  const p = _contractCtx.player;

  // Comprobar que el salario anual cabe en el presupuesto
  const annualCost = salary * 52;
  const currentBill = totalWageBill() - annualWage(p); // excluye al jugador si es renegociación
  if (currentBill + annualCost > (G.club.wageBudget || 0) + annualWage(p)) {
    // Advertir pero no bloquear (el jugador puede aceptar igualmente pagando del presupuesto de fichajes)
    if (!confirm(`⚠️ El salario supera tu presupuesto salarial. La diferencia saldrá del presupuesto de fichajes. ¿Continuar?`)) return;
  }

  const contract = { salary, years, yearsLeft: years };

  if (_contractCtx.mode === 'sign') {
    // Fichar al jugador con este contrato
    const idx = _contractCtx.transferIdx;
    const price = _contractCtx.transferPrice;
    const myTeam = getMyTeam();
    if (G.club.budget < price) { alert(_lang==='en'?'Insufficient budget.':'No tienes presupuesto suficiente.'); return; }
    G.club.budget -= price;
    p.contract = contract;
    p.inSquad = false;
    p.isOpp = false;
    p.value = price;
    myTeam.squad.push(p);
    if (G._transferPool) G._transferPool.splice(idx, 1);
    closeContractModal();
    saveGame();
    renderTransferList();
    renderSquad();
    renderFormationPitch();
    if (typeof updateBudgetSidebar === 'function') updateBudgetSidebar();
    showRivalOfferToast({
      title: t('signingDone'),
      body: `${p.name} ${_lang==='en'?'signed for':'fichado por'} ${fmt(price)} · ${years}${_lang==='en'?'yr':'a'} · ${fmt(salary)}${_lang==='en'?'/wk':'/sem'}`,
      color: 'var(--green)', duration: 5000, noButtons: true
    });
  } else {
    // Renegociar
    p.contract = contract;
    closeContractModal();
    closePlayerModal();
    saveGame();
    renderSquad();
    if (typeof updateBudgetSidebar === 'function') updateBudgetSidebar();
    showRivalOfferToast({
      title: _lang==='en'?'✓ CONTRACT RENEWED':'✓ CONTRATO RENOVADO',
      body: `${p.name} · ${fmt(salary)}${_lang==='en'?'/wk':'/sem'} · ${years} ${_lang==='en'?'year'+(years!==1?'s':''):'año'+(years!==1?'s':'')}`,
      color: 'var(--green)', duration: 4000, noButtons: true
    });
  }
  _contractCtx = null;
}

function closeContractModal() {
  document.getElementById('contractModal').classList.remove('open');
  _contractCtx = null;
}
