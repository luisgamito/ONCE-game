// SISTEMA DE ENTRENAMIENTO
// ============================================================

const TRAINING_MODES = [
  {
    id: 'rest',
    icon: '😴',
    name: 'Descanso activo',
    desc: 'Los jugadores recuperan fatiga. Ideal tras partidos intensos o rachas de jornadas seguidas.',
    effect: 'Recuperación de +30-45 pts de fatiga para toda la plantilla.',
    color: 'var(--green)',
    apply(squad) {
      let log = [];
      squad.forEach(p => {
        const prev = p.fatigue;
        p.fatigue = clamp((p.fatigue ?? 100) + rndI(30, 45), 0, 100);
        log.push(`${p.name}: +${Math.round(p.fatigue - prev)} fatiga (${Math.round(p.fatigue)})`);
      });
      return { summary: `Plantilla recuperada. Media de fatiga: ${Math.round(squad.reduce((s,p)=>s+p.fatigue,0)/squad.length)}%.`, detail: log.slice(0,5) };
    }
  },
  {
    id: 'development',
    icon: '📈',
    name: 'Desarrollo técnico',
    desc: 'Sesión enfocada en mejorar habilidades individuales. Acelera la progresión de los jugadores jóvenes.',
    effect: 'Jugadores menores de 26 años ganan +15-25% de XP extra. Todos ganan algo.',
    color: 'var(--purple, #9c27b0)',
    apply(squad) {
      let improved = [];
      squad.forEach(p => {
        if (!p.xp) p.xp = 0;
        const isYoung = p.age < 26;
        const hasPotential = p.potential > calcOverall(p);
        if (hasPotential) {
          const xpNeeded = xpNeededForLevel(p);
          const bonus = isYoung ? rndI(12, 22) : rndI(4, 10);
          p.xp += bonus;
          // Comprobar si sube de nivel
          const prevOv = calcOverall(p);
          while (p.xp >= xpNeededForLevel(p)) {
            p.xp -= xpNeededForLevel(p);
            levelUpAttribute(p);
          }
          const newOv = calcOverall(p);
          if (newOv > prevOv) {
            improved.push(`${p.name} ↑ ${prevOv}→${newOv}`);
          }
        }
        // Leve recuperación de fatiga
        p.fatigue = clamp((p.fatigue ?? 100) + rndI(5, 12), 0, 100);
      });
      return {
        summary: improved.length > 0
          ? `¡${improved.length} jugador${improved.length>1?'es han':'ha'} mejorado de media!`
          : 'Sesión completada. Los jóvenes acumulan XP de desarrollo.',
        detail: improved.length > 0 ? improved.slice(0,5) : ['Los jugadores con potencial acumulan experiencia.']
      };
    }
  },
  {
    id: 'tactical',
    icon: '♟️',
    name: 'Cohesión táctica',
    desc: 'Trabajo específico en automatismos de la táctica actual. Mejora el entendimiento colectivo.',
    effect: 'Bonus del +5% en pases y pressing durante el siguiente partido.',
    color: 'var(--accent)',
    apply(squad) {
      // El bonus táctico se aplica como flag temporal
      if (!G.club.trainingBonus) G.club.trainingBonus = {};
      G.club.trainingBonus.tactical = true;
      G.club.trainingBonus.tacticUsed = G.club.tactic;
      // Leve recuperación de fatiga
      squad.forEach(p => {
        p.fatigue = clamp((p.fatigue ?? 100) + rndI(8, 15), 0, 100);
      });
      return {
        summary: `Cohesión táctica mejorada para el próximo partido con ${TACTICS_CFG[G.club.tactic]?.name || G.club.tactic}.`,
        detail: ['Bonus activo: +5% en pases y pressing.', 'Se consume en el siguiente partido.']
      };
    }
  },
  {
    id: 'physical',
    icon: '💪',
    name: 'Preparación física',
    desc: 'Trabajo de resistencia y fuerza. Aumenta el techo de fatiga para los próximos partidos.',
    effect: 'Los titulares arrancan el próximo partido con +10 pts extra de fatiga.',
    color: 'var(--yellow)',
    apply(squad) {
      if (!G.club.trainingBonus) G.club.trainingBonus = {};
      G.club.trainingBonus.physical = true;
      // Recuperación moderada
      squad.forEach(p => {
        p.fatigue = clamp((p.fatigue ?? 100) + rndI(15, 25), 0, 100);
        // Pequeño boost permanente de physical para jóvenes muy raramente
        if (p.age < 24 && Math.random() < 0.05) {
          p.attr.physical = clamp((p.attr.physical || 60) + 1, 30, 99);
        }
      });
      return {
        summary: `Plantilla preparada físicamente. Los titulares arrancarán el siguiente partido con energía extra.`,
        detail: ['Bonus activo: +10 fatiga al inicio del próximo partido.', 'Recuperación adicional completada.']
      };
    }
  }
];

// ============================================================
// MODAL
// ============================================================
function openTrainingModal() {
  const myDiv = getMyDivision();
  const j = myDiv.currentJornada;
  const dateStr = jornadaDateStr(j, G.season);

  document.getElementById('trainingDateInfo').textContent = `${t('matchdayLabel', j)} · ${dateStr}`;

  // Comprobar si ya entrenó esta jornada
  const alreadyTrained = G.club.lastTrainingJornada === j && G.club.lastTrainingSeason === G.season;

  const optContainer = document.getElementById('trainingOptions');
  const feedback = document.getElementById('trainingFeedback');
  feedback.style.display = 'none';

  if (alreadyTrained) {
    optContainer.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:12px">
      ✓ Ya has entrenado esta semana.<br>
      <span style="font-size:11px;color:var(--text-muted)">El entrenamiento se reinicia tras cada jornada.</span>
    </div>`;
  } else {
    optContainer.innerHTML = TRAINING_MODES.map(mode => `
      <div onclick="applyTraining('${mode.id}')" style="
        border:1px solid var(--border2);padding:14px 16px;cursor:pointer;
        transition:all 0.15s;background:var(--surface);display:flex;gap:14px;align-items:flex-start"
        onmouseover="this.style.borderColor='${mode.color}';this.style.background='var(--surface2)'"
        onmouseout="this.style.borderColor='var(--border2)';this.style.background='var(--surface)'">
        <div style="font-size:24px;flex-shrink:0">${mode.icon}</div>
        <div>
          <div style="font-family:var(--font-display);font-size:12px;letter-spacing:1px;color:${mode.color};margin-bottom:4px">${mode.name.toUpperCase()}</div>
          <div style="font-size:11px;color:var(--text-dim);line-height:1.5;margin-bottom:4px">${mode.desc}</div>
          <div style="font-size:10px;color:var(--text-muted)">${mode.effect}</div>
        </div>
      </div>`).join('');
  }

  document.getElementById('trainingModal').classList.add('open');
}

function applyTraining(modeId) {
  const myDiv = getMyDivision();
  const j = myDiv.currentJornada;
  const mode = TRAINING_MODES.find(m => m.id === modeId);
  if (!mode) return;

  const myTeam = getMyTeam();
  const result = mode.apply(myTeam.squad);

  // Marcar como entrenado esta jornada
  G.club.lastTrainingJornada = j;
  G.club.lastTrainingSeason = G.season;

  // Mostrar feedback
  const optContainer = document.getElementById('trainingOptions');
  optContainer.innerHTML = '';

  const feedback = document.getElementById('trainingFeedback');
  feedback.style.display = 'block';
  feedback.innerHTML = `
    <div style="font-size:13px;font-weight:600;margin-bottom:8px">${mode.icon} ${result.summary}</div>
    ${result.detail.map(d => `<div style="font-size:11px;color:var(--text-muted);margin-top:3px">— ${d}</div>`).join('')}
  `;

  saveGame();
  renderSquad();
  if (typeof updateBudgetSidebar === 'function') updateBudgetSidebar();
}

function closeTrainingModal() {
  document.getElementById('trainingModal').classList.remove('open');
}

// ============================================================
// APLICAR BONUS TÁCTICO EN EL PARTIDO
// ============================================================
// Se llama desde startMatch() para consumir los bonuses activos
function consumeTrainingBonuses() {
  if (!G.club.trainingBonus) return;
  const bonus = G.club.trainingBonus;

  if (bonus.physical) {
    // +10 fatiga a los titulares al inicio del partido
    const myTeam = getMyTeam();
    myTeam.squad.filter(p => p.inSquad).forEach(p => {
      p.fatigue = clamp((p.fatigue ?? 100) + 10, 0, 100);
    });
  }

  // Limpiar bonuses (se consumen)
  G.club.trainingBonus = {};
  saveGame();
}
