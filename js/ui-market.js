// NEGOCIACIÓN DE FICHAJES
// ============================================================
let _neg = null; // current negotiation state

function openNegModal(idx) {
  if (!isTransferWindowOpen()) { alert('El mercado de fichajes está cerrado.'); return; }
  const p = G._transferPool[idx];
  if (!p) return;
  const overall = calcOverall(p);

  // Precio oculto: entre 0.9x y 1.5x del valor. El usuario no lo ve nunca.
  const secretMultiplier = rnd(0.90, 1.50);
  const secretPrice = Math.round(p.value * secretMultiplier / 1000) * 1000;

  // Rango del slider: amplio, no revela el valor real
  // Mínimo simbólico, máximo generoso — el usuario tiene que tantear
  const sliderMax = Math.round(p.value * 2.2 / 1000) * 1000;
  const sliderStep = Math.max(10000, Math.round(sliderMax * 0.015 / 1000) * 1000);

  _neg = {
    idx,
    player: p,
    secretPrice,
    minOffer: sliderStep,       // empieza desde casi 0
    maxOffer: sliderMax,
    rounds: 0,
    maxRounds: 4,
    lastResponse: null,
    blocked: false,
    currentOffer: sliderStep    // slider arranca desde el mínimo
  };

  // Modal: mostrar solo info del jugador, SIN valor de mercado
  document.getElementById('negPlayerName').textContent = p.name;
  document.getElementById('negPlayerMeta').textContent = `${p.pos} · Media ${overall} · ${p.age} años`;
  // (valor de mercado oculto — negociación a ciegas)
  document.getElementById('negOfferVal').textContent = fmt(sliderStep);
  document.getElementById('negRounds').textContent = t('attemptsLeft', _neg.maxRounds);
  document.getElementById('negResponse').className = 'neg-response pending';
  document.getElementById('negResponse').textContent = 'Ajusta tu oferta y envíala al club vendedor.';
  document.getElementById('negBtnSend').disabled = false;
  document.getElementById('negBtnSend').textContent = t('sendOffer');

  const slider = document.getElementById('negSlider');
  slider.min  = _neg.minOffer;
  slider.max  = _neg.maxOffer;
  slider.step = sliderStep;
  slider.value = _neg.minOffer;
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
    // Aceptan
    responseClass = 'accepted';
    responseText = t('negAccepted', _neg.player.name, offer);
    done = true;
    _neg.blocked = true;
    const _idx = _neg.idx, _off = offer;
    setTimeout(() => { closeNegModal(); signPlayerDirect(_idx, _off); }, 1200);

  } else if (ratio >= 0.85) {
    // Cerca — pista vaga sin número
    responseClass = 'counter';
    responseText = remainingRounds > 0
      ? '↔ Oferta baja, pero el club está dispuesto a escuchar. Mejora tu propuesta.'
      : (done = false, _neg.blocked = true, '✗ Negociaciones cerradas. El club ha perdido la paciencia.');
    if (_neg.blocked) responseClass = 'rejected';

  } else if (ratio >= 0.65) {
    // Bastante baja
    responseClass = 'counter';
    responseText = remainingRounds > 0
      ? '↔ El club rechaza la oferta. Están dispuestos a vender, pero quieren más dinero.'
      : (done = false, _neg.blocked = true, '✗ Negociaciones rotas. No ha habido acuerdo.');
    if (_neg.blocked) responseClass = 'rejected';

  } else {
    // Oferta muy baja
    responseClass = 'counter';
    responseText = remainingRounds > 0
      ? '↔ Oferta muy por debajo de las expectativas del club. No han respondido formalmente.'
      : (done = false, _neg.blocked = true, '✗ El club ha rechazado todas las ofertas. Negociaciones cerradas.');
    if (_neg.blocked) responseClass = 'rejected';
  }

  if (!done && remainingRounds <= 0 && !_neg.blocked) {
    _neg.blocked = true;
    responseClass = 'rejected';
    responseText = '✗ Sin más intentos. El club cierra las negociaciones.';
  }

  document.getElementById('negResponse').className = `neg-response ${responseClass}`;
  document.getElementById('negResponse').textContent = responseText;
  document.getElementById('negRounds').textContent = _neg.blocked && !done ? '' : t('attemptsLeft', Math.max(0, remainingRounds));

  if (_neg.blocked && !done) {
    document.getElementById('negBtnSend').disabled = true;
    document.getElementById('negBtnSend').textContent = 'CERRADO';
    const _rIdx = _neg.idx;
    setTimeout(() => { removeFromPool(_rIdx); closeNegModal(); }, 2000);
  }
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

  // Duration
  document.getElementById('cmYearsSlider').value = ctx.mode === 'reneg'
    ? Math.min(4, (p.contract?.yearsLeft || 2) + 1)
    : 3;
  document.getElementById('cmYearsVal').textContent = document.getElementById('cmYearsSlider').value + ' years';

  // Wage budget disponible
  const remaining = (G.club.wageBudget || 0) - totalWageBill() + annualWage(p);
  document.getElementById('cmWageInfo').innerHTML =
    `Presupuesto salarial restante: <strong style="color:var(--accent)">${fmt(Math.max(0, remaining))}</strong>/año`;

  if (ctx.mode === 'reneg') {
    document.getElementById('cmTitle').textContent = _lang==='en'?'RENEGOTIATE CONTRACT':'RENEGOCIAR CONTRATO';
    document.getElementById('cmCurrentContract').style.display = 'block';
    document.getElementById('cmCurrentContract').textContent =
      `Contrato actual: ${fmt(p.contract?.salary || 0)}/sem · ${p.contract?.yearsLeft || 0} year${(p.contract?.yearsLeft||0)!==1?'s':''} remaining`;
  } else {
    document.getElementById('cmTitle').textContent = t('listingTitle').replace('TRANSFER','CONTRATO').replace('MERCADO','CONTRATO');
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
  document.getElementById('cmYearsVal').textContent = v + ' year' + (v!==1?'s':'');
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
  const currentBill = totalWageBill() - annualWage(p); // exclude player if renegotiating
  if (currentBill + annualCost > (G.club.wageBudget || 0) + annualWage(p)) {
    // Advertir pero no bloquear (el jugador puede aceptar igualmente pagando del presupuesto de fichajes)
    if (!confirm('⚠️ Wage exceeds your wage budget. The difference will come from the transfer budget. Continue?')) return;
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
      body: `${p.name} 'fichado por' ${fmt(price)} · ${years}'yr' · ${fmt(salary)}'/sem'`,
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
      title: '✓ CONTRACT RENEWED',
      body: `${p.name} · ${fmt(salary)}'/sem' · ${years} 'year'+(years!==1?'s':'')`,
      color: 'var(--green)', duration: 4000, noButtons: true
    });
  }
  _contractCtx = null;
}

function closeContractModal() {
  document.getElementById('contractModal').classList.remove('open');
  _contractCtx = null;
}
