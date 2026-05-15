// FAQ / AYUDA
// ============================================================
const GAME_VERSION = '1.6';

const FAQ_DATA_ES = [
  { section: 'PRIMEROS PASOS', items: [
    { q: '¿Cómo creo mi club?', a: 'En la pantalla de inicio pulsa <strong>NUEVO JUEGO</strong>. Elige nombre, abreviatura, color, formación, táctica y división de inicio. El presupuesto inicial varía según la división elegida.' },
    { q: '¿Qué división debo elegir al empezar?', a: 'Si es tu primera partida, <strong>Segunda División</strong> es más asequible (calidad media ≈65). Si buscas un reto desde el principio, empieza en Primera (≈78).' },
    { q: '¿Se guarda la partida automáticamente?', a: 'Sí. El juego guarda tras cada partido, fichaje y cambio de alineación. Los datos se almacenan en el navegador (localStorage). <strong>No borres los datos del sitio</strong> si quieres conservar tu progreso.' }
  ]},
  { section: 'PLANTILLA Y ALINEACIÓN', items: [
    { q: '¿Cómo cambio la alineación?', a: '<strong>En escritorio:</strong> arrastra las chapitas del campo o los jugadores del banquillo.<br><br><strong>En móvil:</strong> toca cualquier jugador en 👥 Plantilla y usa los botones de <em>Gestión de alineación</em>.' },
    { q: '¿Qué significa la barra de FORMA?', a: '<strong style="color:var(--green)">FRESCO (100)</strong> → pleno rendimiento. <strong style="color:var(--yellow)">CANSADO (30-60)</strong> → rendimiento reducido. <strong style="color:var(--red)">AGOTADO (0)</strong> → mayor riesgo de lesión. Los que no juegan recuperan 35-50 puntos por jornada.' },
    { q: '¿Cómo funcionan las lesiones?', a: '9 tipos en 3 niveles de gravedad:<br>— <em>Leve</em>: 1-4 jornadas<br>— <em>Moderada</em>: 3-8 jornadas<br>— <em>Grave</em>: 8-16 jornadas<br>El riesgo sube con la fatiga baja, la edad y baja con el atributo físico.' },
    { q: '¿Qué pasa si despido a un jugador?', a: 'Pagas una <strong>compensación del 25% de su valor de mercado</strong>. El jugador abandona el club inmediatamente. Solo puedes despedir si tienes presupuesto suficiente.' },
    { q: '¿Cómo crecen los jugadores?', a: 'Los jugadores jóvenes (menores de 26) ganan XP por partido según su rendimiento. Cuando acumulan suficiente XP, sus atributos suben hasta su potencial máximo. Tras los 30 años empiezan a declinar.' }
  ]},
  { section: 'TÁCTICAS', items: [
    { q: '¿Cómo funciona el sistema táctico?', a: 'Cada táctica es un <strong>preset</strong> que combina una <em>mentalidad</em> (defensiva → atacante) con ~20 instrucciones específicas: línea defensiva, intensidad de presión, contrapresión, compactación, amplitud, tempo, verticalidad, longitud de pase, sesgo de tiro, regate, centros, balones filtrados, etc. Cambiar de táctica reordena el comportamiento de todo el equipo.' },
    { q: '¿Qué tácticas hay y en qué se diferencian?', a: `<strong>Posesión:</strong><br><span class="tag">🔵 Tiki-Taka</span> Posesión total con presión inmediata. Movilidad y pases cortos.<br><span class="tag">⚙️ Posesión</span> Circulación corta y paciente.<br><span class="tag">♟️ Posicional</span> Ocupación ordenada de zonas, atrae el press.<br><span class="tag">⬆️ Vertical</span> Posesión ágil con verticalización rápida.<br><br><strong>Presión:</strong><br><span class="tag">🔥 Gegenpressing</span> Recuperación inmediata tras pérdida.<br><span class="tag">🟠 Presión alta</span> Línea alta y press en campo rival.<br><br><strong>Defensivas:</strong><br><span class="tag">⚡ Contraataque</span> Bloque medio, transición rápida.<br><span class="tag">🧱 Bloque bajo</span> Defensa profunda y compacta.<br><br><strong>Otras:</strong><br><span class="tag">🎯 Directo</span> Balones largos al delantero referencia.<br><span class="tag">↔️ Bandas</span> Centros constantes al área.<br><span class="tag">⚖️ Equilibrado</span> Sin extremos, sólido.` },
    { q: '¿Las tácticas se contrarrestan entre sí?', a: 'Sí. <strong>Bloque bajo</strong> bate al tiki-taka pero pierde con juego directo. <strong>Contraataque</strong> destroza al gegenpressing. <strong>Posesión</strong> rinde mal frente a contras letales. Estos modificadores se aplican tanto en partidos jugados como en las simulaciones de las otras jornadas.' },
    { q: '¿Qué son los roles individuales?', a: 'Cada slot de la formación tiene un <strong>rol específico</strong> que afecta su comportamiento. Por ejemplo, en un 4-3-3 los laterales son <em>FB</em> (lateral) y suben en posesión; en un 3-5-2 son <em>WB</em> (carrilero) y dan amplitud máxima. Hay 18 roles distintos: central con salida (BPD), pivote (AC), organizador (DLP), box-to-box (BBM), mediapunta (AM), interior (IF), extremo invertido (IW), delantero referencia (TF), goleador de área (PF), etc.' },
    { q: '¿Las formaciones afectan al juego?', a: 'Sí, mucho. Cada formación tiene <strong>posiciones distintas en defensa y en ataque</strong>: en posesión los laterales suben, los carrileros se incorporan, los extremos se cierran (cut inside) y los box-to-box rompen líneas. Sin balón el equipo recupera su forma compacta. Además, tener más mediocampistas que el rival da ventaja en la zona ancha.' },
    { q: '¿Puedo cambiar la táctica durante el partido?', a: 'Sí. En la pestaña <strong>GESTIÓN</strong> del panel derecho durante el partido. El cambio se aplica inmediatamente y reorganiza el comportamiento del equipo.' }
  ]},
  { section: 'MERCADO DE FICHAJES', items: [
    { q: '¿Cuándo puedo fichar?', a: '<strong>Pretemporada</strong> (jornada 0) y <strong>mercado de invierno</strong> (jornadas 16-17). Fuera de estas ventanas el mercado está cerrado.' },
    { q: '¿Cómo funciona la negociación?', a: 'Cada jugador tiene un <strong>precio secreto real</strong> (95%-140% de su valor). Tienes hasta <strong>4 intentos</strong>. El club puede aceptar, contraofertar o rechazar definitivamente.' },
    { q: '¿Qué significan los símbolos en el mercado?', a: '<strong>★ GRAN PROMESA</strong> — joven con potencial muy superior.<br><strong>↗ Margen</strong> — algo de recorrido todavía.<br><strong>↘ Veterano</strong> — mayor de 32, en declive.' },
  ]},
  { section: 'LIGA Y COMPETICIÓN', items: [
    { q: '¿Cómo funciona la liga?', a: '18 equipos, 34 jornadas (doble vuelta). Top 3 de Segunda ascienden; bottom 3 de Primera descienden. Premios económicos por posición final.' },
    { q: '¿Qué es la Copa?', a: 'Torneo eliminatorio con los 36 equipos de ambas divisiones. Ronda preliminar → octavos → cuartos → semis → final.' },
    { q: '¿Los equipos tienen diferentes niveles?', a: 'Sí: 6 candidatos al título/ascenso (calidad alta), 6 zona media, 6 zona baja por división.' }
  ]},
  { section: 'PANTALLA DE PARTIDO', items: [
    { q: '¿Cómo funciona la simulación?', a: 'Partido en tiempo real en canvas 2D. Controla la velocidad con <strong>0.5x / 1x / 2x / 4x / MAX</strong>. Puedes pausar en cualquier momento.' },
    { q: '¿Puedo hacer sustituciones?', a: 'Sí, en la pestaña <strong>GESTIÓN</strong> del panel derecho. Se aplican en el siguiente momento de pausa natural.' },
  ]}
];

const FAQ_DATA_EN = [
  { section: 'GETTING STARTED', items: [
    { q: 'How do I create my club?', a: 'On the start screen, press <strong>NEW GAME</strong>. Choose a name, abbreviation, colour, formation, tactic and starting division. The initial budget varies by division.' },
    { q: 'Which division should I start in?', a: 'For your first game, <strong>Second Division</strong> is more forgiving (avg quality ≈65). For an immediate challenge, start in the First Division (≈78).' },
    { q: 'Is the game saved automatically?', a: 'Yes. The game saves after every match, signing and lineup change. Data is stored in your browser (localStorage). <strong>Do not clear site data</strong> if you want to keep your progress.' }
  ]},
  { section: 'SQUAD & LINEUP', items: [
    { q: 'How do I change the lineup?', a: '<strong>Desktop:</strong> drag player tokens on the pitch or from the bench.<br><br><strong>Mobile:</strong> tap any player in 👥 Squad and use the <em>Lineup Management</em> buttons in their profile.' },
    { q: 'What does the FORM bar mean?', a: '<strong style="color:var(--green)">FRESH (100)</strong> → full performance. <strong style="color:var(--yellow)">TIRED (30-60)</strong> → reduced output. <strong style="color:var(--red)">EXHAUSTED (0)</strong> → high injury risk. Players who do not play recover 35-50 points per matchday.' },
    { q: 'How do injuries work?', a: '9 types across 3 severity levels:<br>— <em>Minor</em>: 1-4 matchdays<br>— <em>Moderate</em>: 3-8 matchdays<br>— <em>Serious</em>: 8-16 matchdays<br>Risk increases with low fatigue, age, and decreases with high physical attribute.' },
    { q: 'What happens when I release a player?', a: 'You pay a <strong>compensation of 25% of their market value</strong>. The player leaves immediately. You must have enough budget to cover the compensation.' },
    { q: 'How do players improve?', a: 'Young players (under 26) earn XP per match based on performance. Once they accumulate enough XP, their attributes increase up to their hidden potential. After 30, attributes gradually decline.' }
  ]},
  { section: 'TACTICS', items: [
    { q: 'How does the tactical system work?', a: 'Each tactic is a <strong>preset</strong> that combines a <em>mentality</em> (defensive → attacking) with around 20 specific instructions: defensive line, pressing intensity, counter-press, compactness, width, tempo, directness, pass length, shooting bias, dribble bias, crossing, through balls, and more. Changing tactic reshapes the whole team behaviour.' },
    { q: 'What tactics are there and how do they differ?', a: `<strong>Possession:</strong><br><span class="tag">🔵 Tiki-Taka</span> Total possession with immediate counter-press.<br><span class="tag">⚙️ Possession</span> Patient short passing.<br><span class="tag">♟️ Positional</span> Disciplined zonal play, lures the press.<br><span class="tag">⬆️ Vertical</span> Quick possession with vertical runs.<br><br><strong>Pressing:</strong><br><span class="tag">🔥 Gegenpressing</span> Immediate recovery after losing the ball.<br><span class="tag">🟠 High Press</span> High line and constant pressure.<br><br><strong>Defensive:</strong><br><span class="tag">⚡ Counter-attack</span> Mid block, fast transitions.<br><span class="tag">🧱 Low Block</span> Deep, compact defence.<br><br><strong>Other:</strong><br><span class="tag">🎯 Direct</span> Long balls to the target forward.<br><span class="tag">↔️ Wing Play</span> Constant crosses into the box.<br><span class="tag">⚖️ Balanced</span> No extremes, solid.` },
    { q: 'Do tactics counter each other?', a: 'Yes. <strong>Low block</strong> beats tiki-taka but loses to direct play. <strong>Counter-attack</strong> destroys gegenpressing. <strong>Possession</strong> struggles against lethal counters. These modifiers apply both in your matches and in the simulated other fixtures.' },
    { q: 'What are individual roles?', a: 'Each slot in the formation has a <strong>specific role</strong> that affects behaviour. In a 4-3-3 the full-backs are <em>FB</em> and overlap; in a 3-5-2 they are <em>WB</em> (wing-backs) and provide maximum width. There are 18 distinct roles including ball-playing defender (BPD), anchor (AC), deep-lying playmaker (DLP), box-to-box (BBM), attacking mid (AM), inside forward (IF), inverted winger (IW), target forward (TF), poacher (PF), and more.' },
    { q: 'Do formations affect gameplay?', a: 'Yes, a lot. Each formation has <strong>different positions in defence and in attack</strong>: in possession the full-backs push forward, wing-backs join the attack, wingers cut inside and box-to-box midfielders break lines. Out of possession the team reverts to its compact shape. Also, having more midfielders than your opponent gives you a numerical advantage in the middle.' },
    { q: 'Can I change tactic during the match?', a: 'Yes. Use the <strong>MANAGEMENT</strong> tab on the right panel during the match. The change applies immediately and reorganises team behaviour.' }
  ]},
  { section: 'TRANSFER MARKET', items: [
    { q: 'When can I sign players?', a: '<strong>Pre-season</strong> (matchday 0) and <strong>winter market</strong> (matchdays 16-17). Outside these windows the market is closed.' },
    { q: 'How does negotiation work?', a: 'Each player has a hidden <strong>real price</strong> (95%-140% of their value). You have up to <strong>4 attempts</strong>. The club can accept, counter-offer, or close negotiations permanently.' },
    { q: 'What do the market symbols mean?', a: '<strong>★ GREAT PROSPECT</strong> — young player with much higher potential than current rating.<br><strong>↗ Room to grow</strong> — some improvement still possible.<br><strong>↘ Veteran</strong> — over 32, in decline.' }
  ]},
  { section: 'LEAGUE & COMPETITION', items: [
    { q: 'How does the league work?', a: '18 teams, 34 matchdays (home and away). Top 3 in Second Division are promoted; bottom 3 in First Division are relegated. Prize money awarded by final position.' },
    { q: 'What is the Cup?', a: 'A knockout tournament with all 36 teams from both divisions. Preliminary round → last 16 → quarter-finals → semis → final.' },
    { q: 'Do rival teams have different quality levels?', a: 'Yes: 6 title/promotion candidates (high quality), 6 mid-table, 6 relegation battlers per division.' }
  ]},
  { section: 'MATCH SCREEN', items: [
    { q: 'How does the simulation work?', a: 'Real-time match on a 2D canvas. Control speed with <strong>0.5x / 1x / 2x / 4x / MAX</strong>. You can pause at any time.' },
    { q: 'Can I make substitutions?', a: 'Yes, via the <strong>MANAGEMENT</strong> tab on the right panel. Subs are applied at the next natural pause.' }
  ]}
];

const CHANGELOG_ES = [
  { v: 'v1.6', items: ['Motor táctico rediseñado: posiciones distintas en posesión y sin balón','11 tácticas predefinidas (Tiki-Taka, Gegenpressing, Posicional, Vertical, Bloque bajo…)','5 mentalidades (Defensiva, Cauta, Equilibrada, Ofensiva, Atacante) que ajustan múltiples instrucciones','18 roles individuales por posición (carrilero, central con salida, mediapunta, extremo invertido…)','Counter-press tras pérdida y transición ofensiva tras recuperación','Matchups tácticos: el bloque bajo bate a posesión, el contraataque devasta a presión alta, etc.','Trampa de fuera de juego que depende de la táctica defensiva del rival','Nueva formación 4-1-4-1 con mediocentro defensivo aislado'] },
  { v: 'v1.5', items: ['Sistema de traducción completo ES/EN con persistencia en localStorage','Botón de idioma en intro, hub y pantalla de partido','FAQ y changelog disponibles en ambos idiomas','Todas las cadenas dinámicas del juego traducidas (negociación, lesiones, despidos, tácticas)'] },
  { v: 'v1.4', items: ['6 tácticas con efecto real en el motor de simulación','Descripción de táctica activa en el sidebar del hub','Sección FAQ / Ayuda con changelog integrado'] },
  { v: 'v1.3', items: ['Modo diurno / nocturno con persistencia en localStorage','Banco de nombres ampliado (~140 × ~110) con variedad internacional'] },
  { v: 'v1.2', items: ['Recuperación de fatiga real para jugadores que descansan (35-50 puntos/jornada)','Sistema de lesiones: 9 tipos, 3 niveles de gravedad','Mercado ampliado a ~44 jugadores con cuotas por posición y filtros','Gestión de alineación táctil en móvil','Despido de jugadores con compensación económica'] },
  { v: 'v1.1', items: ['Ligas a 18 equipos (34 jornadas, 3 ascensos/descensos)','Distribución de calidades escalonada','Panel de equipos rivales con plantillas y estadísticas','Sistema de negociación de fichajes con precio secreto','Diseño responsive para móvil'] },
  { v: 'v1.0', items: ['Lanzamiento inicial: simulador de partidos 11v11','Gestión de plantilla, fichajes, formaciones y tácticas','Sistema de progresión y declive de jugadores','Liga y Copa con ascensos/descensos'] }
];

const CHANGELOG_EN = [
  { v: 'v1.6', items: ['Tactical engine redesigned: distinct positions in and out of possession','11 preset tactics (Tiki-Taka, Gegenpressing, Positional, Vertical, Low Block…)','5 mentalities (Defensive, Cautious, Balanced, Positive, Attacking) that adjust multiple instructions','18 individual roles per position (wing-back, ball-playing CB, attacking mid, inverted winger…)','Counter-press after loss and quick offensive transition after recovery','Tactical matchups: low block beats possession, counter-attack devastates high pressing, etc.','Offside trap that depends on opponent\'s defensive tactic','New 4-1-4-1 formation with isolated defensive midfielder'] },
  { v: 'v1.5', items: ['Full ES/EN translation system with localStorage persistence','Language button on intro, hub and match screen','FAQ and changelog available in both languages','All dynamic game strings translated (negotiation, injuries, releases, tactics)'] },
  { v: 'v1.4', items: ['6 tactics with real effect on the simulation engine','Active tactic description in hub sidebar','FAQ / Help section with integrated changelog'] },
  { v: 'v1.3', items: ['Light / dark mode with localStorage persistence','Expanded name pool (~140 × ~110) with international variety'] },
  { v: 'v1.2', items: ['Real fatigue recovery for resting players (35-50 pts/matchday)','Injury system: 9 types, 3 severity levels','Transfer market expanded to ~44 players with position quotas and filters','Touch-friendly lineup management on mobile','Player release with financial compensation'] },
  { v: 'v1.1', items: ['Leagues expanded to 18 teams (34 matchdays, 3 up/down)','Tiered quality distribution','Rival team panel with squads and stats','Transfer negotiation with secret price','Mobile responsive design'] },
  { v: 'v1.0', items: ['Initial release: 11v11 match simulator','Squad management, signings, formations and tactics','Player progression and decline system','League and Cup with promotion/relegation'] }
];

function renderFaq() {
  const isEn = _lang === 'en';

  const FAQ_DATA_CURRENT = isEn ? FAQ_DATA_EN : FAQ_DATA_ES;

  let html = `<div class="faq-header">
    <div class="faq-title">${t('faqTitle')}</div>
    <div class="faq-version">ONCE Football Manager · v${GAME_VERSION}</div>
  </div>`;

  FAQ_DATA_CURRENT.forEach(section => {
    html += `<div class="faq-section">
      <div class="faq-section-title">${section.section}</div>`;
    section.items.forEach((item, i) => {
      const id = `faq_${section.section.replace(/[\s\/]/g,'_')}_${i}`;
      html += `<div class="faq-item">
        <div class="faq-q" onclick="toggleFaq('${id}')">
          <span>${item.q}</span>
          <span class="faq-toggle" id="${id}_icon">▼</span>
        </div>
        <div class="faq-a" id="${id}">${item.a}</div>
      </div>`;
    });
    html += `</div>`;
  });

  const cl = isEn ? CHANGELOG_EN : CHANGELOG_ES;
  html += `<div class="faq-changelog">
    <div class="faq-changelog-title">${t('changelogTitle')}</div>
    ${cl.map(e => `<div class="changelog-entry">
      <div class="changelog-ver">${e.v}</div>
      <ul class="changelog-items">${e.items.map(i=>`<li>${i}</li>`).join('')}</ul>
    </div>`).join('')}
  </div>`;

  document.getElementById('faqContent').innerHTML = html;
}

function toggleFaq(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById(id + '_icon');
  if (!el) return;
  const isOpen = el.classList.toggle('open');
  if (icon) icon.textContent = isOpen ? '▲' : '▼';
}

