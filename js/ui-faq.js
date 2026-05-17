// GUÍA / FAQ
// ============================================================
const GAME_VERSION = '1.7';

const FAQ_SECTIONS = [
  {
    title: 'PRIMEROS PASOS',
    items: [
      {
        q: '¿Cómo empiezo a jugar?',
        a: `Pulsa <strong>NUEVO JUEGO</strong> en la pantalla de inicio. Rellena cuatro campos:<br><br>
<strong>1. Nombre y abreviatura</strong> — nombre del club y 3 letras para el escudo.<br>
<strong>2. Color</strong> — color identitario del equipo.<br>
<strong>3. División</strong> — <em>Segunda</em> (media ≈65, presupuesto 2M€) para empezar con calma; <em>Primera</em> (media ≈78, presupuesto 8M€) si buscas reto inmediato.<br>
<strong>4. Formación y táctica</strong> — puedes cambiarlas después en cualquier momento.<br><br>
Al confirmar se generan 36 equipos únicos y aleatorios para esa partida.`
      },
      {
        q: '¿Qué debo hacer nada más empezar?',
        a: `<strong>Tienes mercado abierto hasta la jornada 4 (agosto).</strong> Aprovéchalo:<br><br>
1. Ve a 👥 <strong>Plantilla</strong> y revisa tu once. Detecta los puestos más débiles.<br>
2. Ve a 💰 <strong>Mercado</strong>, filtra por posición y negocia refuerzos.<br>
3. Comprueba el <strong>presupuesto salarial</strong> antes de fichar — el salario anual debe caber en tu masa salarial.<br>
4. Ajusta tu <strong>táctica</strong> según los jugadores disponibles, no al revés.`
      },
      {
        q: '¿Se guarda la partida automáticamente?',
        a: `Sí. El juego guarda tras cada partido, fichaje y cambio de alineación usando el <strong>almacenamiento local del navegador</strong>.<br><br>
⚠️ <strong>No borres los datos del sitio</strong> o perderás el progreso. En modo incógnito la partida no se conserva al cerrar.`
      },
      {
        q: '¿Qué diferencia hay entre Primera y Segunda División?',
        a: `<table style="width:100%;font-size:11px;border-collapse:collapse;margin-top:4px">
<tr style="color:var(--accent);font-family:var(--font-display);font-size:9px;letter-spacing:1px">
  <td style="padding:4px 8px">DIVISIÓN</td><td>MEDIA RIVALES</td><td>PRESUPUESTO</td><td>DIFICULTAD</td>
</tr>
<tr style="border-top:1px solid var(--border)">
  <td style="padding:4px 8px">Segunda</td><td>≈65 (±14)</td><td>2.000.000€</td><td>⭐⭐</td>
</tr>
<tr style="border-top:1px solid var(--border)">
  <td style="padding:4px 8px">Primera</td><td>≈78 (±14)</td><td>8.000.000€</td><td>⭐⭐⭐⭐</td>
</tr>
</table><br>
En Segunda, 6 equipos te superan en media, 6 son similares y 6 están por debajo. El objetivo inicial es <strong>ascender en las primeras 2-3 temporadas</strong>.`
      }
    ]
  },
  {
    title: 'PLANTILLA Y JUGADORES',
    items: [
      {
        q: '¿Cómo funciona la fatiga y por qué importa?',
        a: `Cada jugador tiene una barra de <strong>fatiga (0-100)</strong> que baja durante el partido:<br><br>
<span style="color:var(--green)">■ Verde (60-100)</span> — Rendimiento completo.<br>
<span style="color:var(--yellow)">■ Amarillo (30-59)</span> — Atributos al 85-92%.<br>
<span style="color:var(--red)">■ Rojo (0-29)</span> — Atributos al 65% y riesgo de lesión alto.<br><br>
Un partido completo drena <strong>55-65 puntos</strong>. Los suplentes que no juegan recuperan <strong>35-50 puntos por jornada</strong>. Con 20 jugadores en plantilla, la rotación es obligatoria desde la jornada 5-6.`
      },
      {
        q: '¿Cómo crecen los jugadores jóvenes?',
        a: `Los jugadores <strong>menores de 26 años</strong> con potencial superior a su media acumulan <strong>XP por partido</strong>. La barra aparece en su ficha (color morado).<br><br>
<strong>Lo que acelera el desarrollo:</strong><br>
— Ser titular (más acciones = más XP)<br>
— Buenas valoraciones (7.0+ da bonus extra)<br>
— Tácticas ofensivas con muchas acciones<br><br>
Al llenar la barra, uno o varios atributos suben. La ficha muestra <span style="color:var(--green)">↑ Mejora reciente</span> con la ganancia.<br><br>
⚠️ A partir de los 30 años los atributos empiezan a <strong>declinar</strong> gradualmente.`
      },
      {
        q: '¿Qué posiciones son más importantes?',
        a: `Según el motor del juego, por orden de impacto en el marcador:<br><br>
<strong>🥇 Portero (GK)</strong> — Reflejos y Posición determinan directamente cuántos goles encajas. Un GK de media 75 para el 60-70% de los tiros; uno de 55, solo el 45-55%.<br><br>
<strong>🥈 Delantero (ST/CF)</strong> — Disparo, Técnica y Velocidad controlan la tasa de gol. Es el mayor generador de ocasiones.<br><br>
<strong>🥉 Mediocampistas</strong> — Controlan la posesión y el tiempo en campo rival. Un buen CDM corta transiciones del rival.`
      },
      {
        q: '¿Qué hace cada atributo?',
        a: `<table style="width:100%;font-size:11px;border-collapse:collapse">
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Velocidad</td><td style="padding:3px 8px;color:var(--text-dim)">Pressing, carreras en profundidad, regates</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Técnica</td><td style="padding:3px 8px;color:var(--text-dim)">Pases exitosos, control y primer toque</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Disparo</td><td style="padding:3px 8px;color:var(--text-dim)">Probabilidad de gol en cada tiro</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Defensa</td><td style="padding:3px 8px;color:var(--text-dim)">Entradas, interceptaciones, presión</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Físico</td><td style="padding:3px 8px;color:var(--text-dim)">Resistencia a fatiga, duelos corporales</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Visión</td><td style="padding:3px 8px;color:var(--text-dim)">Pases filtrados, asistencias, creación</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Mentalidad</td><td style="padding:3px 8px;color:var(--text-dim)">Rendimiento bajo presión, consistencia</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px;color:var(--accent)">Posición</td><td style="padding:3px 8px;color:var(--text-dim)">Cobertura de espacios, anticipación</td></tr>
<tr><td style="padding:3px 8px;color:var(--accent)">Reflejos</td><td style="padding:3px 8px;color:var(--text-dim)">Solo porteros: paradas, reacciones</td></tr>
</table>`
      },
      {
        q: '¿Cómo funcionan las tarjetas y suspensiones?',
        a: `<strong>Amarilla:</strong> se acumula en temporada. Cada <strong>5 amarillas</strong> = 1 partido de suspensión.<br>
<strong>Segunda amarilla</strong> en el mismo partido = expulsión = 1 partido suspendido.<br>
<strong>Roja directa</strong> = 2-3 partidos de suspensión.<br><br>
Los jugadores con <span style="color:var(--yellow)">⚠️ AVISO</span> tienen 4 amarillas — la próxima los suspende.<br><br>
⚠️ El juego <strong>bloquea el inicio del partido</strong> si hay lesionados o sancionados en el once. Ve a 👥 Plantilla y sustitúyelos primero.`
      }
    ]
  },
  {
    title: 'TÁCTICAS Y FORMACIONES',
    items: [
      {
        q: '¿Qué táctica elegir según mi plantilla?',
        a: `<strong>Jugadores rápidos con buen disparo</strong> → <span class="tag">⚡ Contraataque</span> — Aguanta y golpea en transición. Muy eficaz en Segunda.<br><br>
<strong>Técnica alta, buenos mediocampistas</strong> → <span class="tag">⚙️ Posesión</span> o <span class="tag">♟️ Posicional</span> — Controla el partido desde atrás.<br><br>
<strong>Delantero físico dominante</strong> → <span class="tag">🎯 Directo</span> — Balones largos hacia él y el equipo recoge rechaces.<br><br>
<strong>Plantilla corta, jornadas seguidas</strong> → <span class="tag">🧱 Bloque bajo</span> — Ahorra energía y es difícil de superar.<br><br>
<strong>Plantilla equilibrada</strong> → <span class="tag">⚖️ Equilibrado</span> — Sin extremos. El mejor punto de partida si no sabes qué elegir.`
      },
      {
        q: '¿Las tácticas se contrarrestan entre sí?',
        a: `Sí, el motor aplica modificadores según el enfrentamiento. Consulta el panel 🔍 <strong>Equipos</strong> para ver qué usa el rival:<br><br>
<table style="width:100%;font-size:11px;border-collapse:collapse">
<tr style="color:var(--accent);font-family:var(--font-display);font-size:9px;letter-spacing:1px;border-bottom:1px solid var(--border)">
  <td style="padding:4px 8px">TU TÁCTICA</td><td>BATE A…</td><td>PIERDE CONTRA…</td>
</tr>
<tr style="border-bottom:1px solid var(--border)">
  <td style="padding:4px 8px">🧱 Bloque bajo</td><td>Tiki-Taka, Posesión</td><td>Directo, Bandas</td>
</tr>
<tr style="border-bottom:1px solid var(--border)">
  <td style="padding:4px 8px">⚡ Contraataque</td><td>Gegenpressing, Presión alta</td><td>Posicional, Bloque bajo</td>
</tr>
<tr style="border-bottom:1px solid var(--border)">
  <td style="padding:4px 8px">🎯 Directo</td><td>Bloque bajo, Posicional</td><td>Presión alta, Posesión</td>
</tr>
<tr style="border-bottom:1px solid var(--border)">
  <td style="padding:4px 8px">🔥 Gegenpressing</td><td>Posesión, Tiki-Taka</td><td>Contraataque, Vertical</td>
</tr>
<tr>
  <td style="padding:4px 8px">⚙️ Posesión</td><td>Directo, Bloque bajo†</td><td>Gegenpressing, Contra</td>
</tr>
</table>
<div style="font-size:10px;color:var(--text-muted);margin-top:6px">† Con ventaja de calidad. Estos modificadores se aplican también a los partidos simulados de otras jornadas.</div>`
      },
      {
        q: '¿Qué formación funciona mejor?',
        a: `No hay una "mejor" formación, pero sí orientaciones claras:<br><br>
<span class="tag">4-3-3</span> Versátil. Laterales suben en posesión. Equilibrio ataque/defensa.<br>
<span class="tag">4-2-3-1</span> Doble pivote protege bien. Ideal con Posesión o Presión alta.<br>
<span class="tag">4-4-2</span> Dos delanteros generan más ocasiones. Bueno con Directo o Contraataque.<br>
<span class="tag">3-5-2</span> Carrileros clave: necesitan Velocidad y Físico altos. Amplitud máxima.<br>
<span class="tag">5-3-2</span> Bloque muy sólido. Combínalo con Bloque bajo.<br>
<span class="tag">4-1-4-1</span> El CDM aislado es el corazón. Necesita Defensa ≥70.`
      },
      {
        q: '¿Cuándo cambiar táctica durante el partido?',
        a: `<strong>Vas ganando 1-0 y queda poco</strong> → <span class="tag">🧱 Bloque bajo</span> para proteger.<br>
<strong>Vas perdiendo y necesitas el gol</strong> → <span class="tag">🔥 Gegenpressing</span> o <span class="tag">🎯 Directo</span>.<br>
<strong>El rival domina la posesión</strong> → <span class="tag">⚡ Contraataque</span> para salir en transición.<br>
<strong>Dominas pero no metes</strong> → <span class="tag">↔️ Bandas</span> o <span class="tag">⬆️ Vertical</span>.<br><br>
El cambio se aplica inmediatamente en el partido en curso. Usa la pestaña <strong>GESTIÓN</strong> del panel derecho.`
      }
    ]
  },
  {
    title: 'MERCADO DE FICHAJES',
    items: [
      {
        q: '¿Cuándo está abierto el mercado?',
        a: `El mercado sigue el calendario real del fútbol europeo:<br><br>
<strong>🌞 Verano</strong> — Jornadas 0-4 (julio-agosto). La ventana más larga. Aprovéchala para reforzar bien el equipo.<br>
<strong>❄️ Invierno</strong> — Jornadas 17-18 (enero). Breve pero clave para tapar bajas o reforzar zonas débiles.<br>
<strong>🔄 Final de temporada</strong> — Tras la jornada 34 (julio). Prepara la siguiente campaña.<br><br>
Fuera de estas ventanas solo puedes vender jugadores o gestionar contratos.`
      },
      {
        q: '¿Cómo negocio un fichaje?',
        a: `1. Filtra por posición en el mercado y pulsa <strong>NEGOCIAR</strong>.<br>
2. Ajusta tu oferta con el slider.<br>
3. El club puede <strong>aceptar</strong>, <strong>contraofertar</strong> (te da un precio orientativo) o <strong>rechazar</strong>.<br>
4. Tienes hasta <strong>4 intentos</strong>. Si rechazan definitivamente, el jugador desaparece del mercado.<br>
5. Al aceptar el precio, negocias el <strong>contrato</strong>: salario semanal y duración (1-6 años).<br><br>
💡 <strong>Consejo:</strong> empieza ofreciendo el 80-85% del valor. El precio secreto real raramente supera el 130%.`
      },
      {
        q: '¿Cómo gestiono el presupuesto salarial?',
        a: `Hay <strong>dos presupuestos separados</strong>:<br><br>
<strong>💰 Fichajes</strong> — Para pagar traspasos. Se recibe del presupuesto inicial + ventas + premios de liga.<br>
<strong>📋 Masa salarial</strong> — Para pagar nóminas anuales. La barra del sidebar va de verde (holgado) a rojo (al límite).<br><br>
Si la barra está en <span style="color:var(--red)">rojo</span>, evita fichar jugadores con salarios altos. Al final de temporada se paga la nómina completa — si no alcanza el presupuesto salarial, la diferencia sale de fichajes.`
      },
      {
        q: '¿Cómo recibo y gestiono ofertas por mis jugadores?',
        a: `<strong>Automática:</strong> los rivales pueden ofrecer por jugadores con media ≥62 durante las ventanas (~30% probabilidad por jornada).<br><br>
<strong>Ofreciendo al mercado:</strong> en 👥 Plantilla, pulsa un jugador → "Ofrecer al mercado". Fija un precio mínimo. Los rivales ofrecen el 90-115% de tu precio. Esto sube la probabilidad al 40%.<br><br>
Al recibir una oferta tienes tres opciones:<br>
✓ <strong>Aceptar</strong> — el dinero va al presupuesto de fichajes.<br>
↔ <strong>Contraoferta</strong> — pides un 15-25% más. El rival acepta con un 60% de probabilidad.<br>
✕ <strong>Rechazar</strong> — las negociaciones se cierran.`
      },
      {
        q: '¿Qué jugadores debo fichar primero?',
        a: `Prioridad recomendada:<br><br>
<strong>1. Portero backup</strong> — Sin él, una lesión del portero titular es catastrófica.<br>
<strong>2. Delantero alternativo</strong> — Garantiza goles con rotaciones o lesiones.<br>
<strong>3. Laterales con velocidad alta</strong> — Protegen en transiciones y suben en ataque.<br>
<strong>4. Jóvenes con potencial (★ GRAN PROMESA)</strong> — Coste bajo, desarrollo alto.<br><br>
Evita gastar todo el presupuesto en un solo crack. Un equipo de 11 jugadores con media 65-68 supera a uno con 10 jugadores de media 60 y uno de 80.`
      }
    ]
  },
  {
    title: 'LIGA Y COMPETICIÓN',
    items: [
      {
        q: '¿Cómo funciona la liga?',
        a: `<strong>18 equipos</strong>, <strong>34 jornadas</strong> (todos contra todos, ida y vuelta). 3 puntos por victoria, 1 por empate.<br><br>
<strong>Ascenso/Descenso:</strong><br>
— Top 3 de Segunda → ascienden a Primera.<br>
— Bottom 3 de Primera → descienden a Segunda.<br><br>
<strong>Premios económicos:</strong><br>
Primera: 5M€ (campeón) → 100K€ (18º).<br>
Segunda: 1.5M€ (campeón) → 40K€ (18º).<br><br>
Los premios son la principal fuente de ingresos para fichar. Terminar en top 5 marca la diferencia presupuestaria.`
      },
      {
        q: '¿Qué es la Copa Nacional?',
        a: `Torneo eliminatorio paralelo a la liga con los <strong>36 equipos de ambas divisiones</strong>.<br><br>
Estructura: Ronda preliminar → Octavos → Cuartos → Semifinales → Final.<br><br>
La Copa no da premios económicos directos pero es ideal para <strong>rotar jugadores cansados</strong> y dar minutos a jóvenes en desarrollo. Un buen rendimiento en Copa puede también servir de colchón para una liga complicada.`
      },
      {
        q: '¿Cuándo apretar y cuándo rotar?',
        a: `<strong>Jornadas 1-4 (agosto)</strong> — Mercado abierto. Juega fuerte pero observa qué necesitas reforzar.<br>
<strong>Jornadas 5-15 (sept-nov)</strong> — Sin mercado. Rota cada 3-4 partidos para evitar fatiga acumulada.<br>
<strong>Jornadas 17-18 (enero)</strong> — Mercado de invierno. Si estás en descenso o en lucha por ascender, refuérzate.<br>
<strong>Jornadas 25-34 (marzo-mayo)</strong> — Sprint final. Si tienes objetivo claro, juega con tu mejor once aunque estén cansados.`
      }
    ]
  },
  {
    title: 'PARTIDOS',
    items: [
      {
        q: '¿Cómo funciona la pantalla de partido?',
        a: `El partido se simula en tiempo real en un campo 2D. Los 22 jugadores se mueven según táctica y rol.<br><br>
<strong>Controles:</strong><br>
— <strong>▶ / ⏸</strong> — Jugar / Pausar<br>
— <strong>0.5x / 1x / 2x / 4x / MAX</strong> — Velocidad<br>
— <strong>Pestaña LOG</strong> — Descripción textual de cada acción<br>
— <strong>Pestaña GESTIÓN</strong> — Sustituciones y cambio de táctica en vivo<br>
— <strong>Pestaña STATS</strong> — Posesión, tiros, faltas, córners en tiempo real<br>
— <strong>Pestaña JUGADORES</strong> — Valoraciones y estado de cada jugador`
      },
      {
        q: '¿Cuándo y cómo hacer sustituciones?',
        a: `En la pestaña <strong>GESTIÓN</strong> del panel derecho. Tienes <strong>5 sustituciones</strong> por partido.<br><br>
<strong>Cuándo sustituir:</strong><br>
— Jugador en <span style="color:var(--red)">rojo de fatiga</span> antes del min. 60.<br>
— Jugador con lesión leve que no quieres agravar.<br>
— Cambio táctico: meter un delantero extra si vas perdiendo.<br>
— Meter un mediocentro más en los últimos 10 min si vas ganando.`
      },
      {
        q: '¿Por qué el equipo marca pocos goles?',
        a: `Las causas más frecuentes:<br><br>
<strong>1. Disparo bajo en el delantero (&lt;60)</strong> — Es el atributo más directo para marcar. Con Disparo 55 convierte muy pocos tiros.<br>
<strong>2. Táctica demasiado defensiva</strong> — El Bloque bajo genera pocas ocasiones. Prueba Posesión o Bandas.<br>
<strong>3. Jugadores en rojo de fatiga</strong> — Reduce atributos un 35%. Un delantero agotado de media 70 rinde como uno de media 45.<br>
<strong>4. Sin delantero centro en el once</strong> — Sin ST el equipo genera pocas llegadas al área.`
      }
    ]
  },
  {
    title: 'CONTRATOS Y ECONOMÍA',
    items: [
      {
        q: '¿Cómo funcionan los contratos?',
        a: `Cada jugador tiene <strong>salario semanal</strong> y <strong>años restantes</strong>. Al fichar negocias ambos con sliders.<br><br>
<strong>Al final de temporada automáticamente:</strong><br>
— Se paga la nómina anual completa.<br>
— Los contratos se decrementan 1 año.<br>
— Jugadores con 0 años restantes <strong>abandonan el club</strong> como agentes libres.<br><br>
⚠️ Vigila en 👥 Plantilla los jugadores con <span style="color:var(--red)">1 año restante</span>. Si los quieres conservar, renegocia antes de que expire.`
      },
      {
        q: '¿Cuánto debo pagar de salario?',
        a: `Salarios de mercado aproximados por media del jugador:<br><br>
<table style="width:100%;font-size:11px;border-collapse:collapse">
<tr style="color:var(--accent);font-family:var(--font-display);font-size:9px;letter-spacing:1px;border-bottom:1px solid var(--border)">
  <td style="padding:3px 8px">MEDIA</td><td>SALARIO /SEM</td>
</tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px">50-55</td><td>300-600 €</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px">56-62</td><td>600-1.200 €</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px">63-68</td><td>1.200-2.800 €</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px">69-74</td><td>2.800-5.500 €</td></tr>
<tr style="border-bottom:1px solid var(--border)"><td style="padding:3px 8px">75-80</td><td>5.500-9.000 €</td></tr>
<tr><td style="padding:3px 8px">81+</td><td>9.000+ €</td></tr>
</table>
<div style="font-size:10px;color:var(--text-muted);margin-top:6px">Jugadores &lt;24 años tienen un descuento del ~25%.</div>`
      }
    ]
  },
  {
    title: 'CONSEJOS',
    items: [
      {
        q: '¿Cómo ascender en la primera temporada?',
        a: `<strong>1.</strong> Fíchate un portero ≥68 y un delantero ≥68 en pretemporada. Son los puestos con mayor impacto.<br>
<strong>2.</strong> Elige una táctica y <strong>mantenla</strong>. No la cambies cada jornada — cada táctica tiene sus matchups y aprenderlos lleva partidos.<br>
<strong>3.</strong> Rota sistemáticamente. Nunca dos partidos seguidos con el mismo once si puedes evitarlo.<br>
<strong>4.</strong> Vende antes de que expiren contratos de jugadores que no quieres renovar — en invierno puedes recuperar dinero en lugar de perderlos gratis en verano.<br>
<strong>5.</strong> Refuerza en el mercado de invierno si estás en el top 3, para no caer.`
      },
      {
        q: '¿Cómo explotar las contratácticas?',
        a: `Antes de cada partido consulta la táctica del rival en 🔍 <strong>Equipos</strong> y ajusta:<br><br>
— Rival usa <em>Gegenpressing</em> → cambia a <span class="tag">⚡ Contraataque</span>.<br>
— Rival usa <em>Bloque bajo</em> → cambia a <span class="tag">🎯 Directo</span> o <span class="tag">↔️ Bandas</span>.<br>
— Rival usa <em>Tiki-Taka</em> → cambia a <span class="tag">🧱 Bloque bajo</span>.<br>
— Rival usa <em>Directo</em> → <span class="tag">🟠 Presión alta</span> para cortarle el juego largo.<br><br>
Este ajuste puede equivaler a tener 5 puntos de media más sin gastar un euro.`
      },
      {
        q: '¿Cómo desarrollar jóvenes al máximo?',
        a: `<strong>Hazlos titulares</strong> — ganar XP en el banquillo es mucho más lento.<br>
<strong>Táctica ofensiva</strong> — más acciones = más XP. Un joven delantero se desarrolla más rápido en Gegenpressing que en Bloque bajo.<br>
<strong>Contrato largo</strong> — fírmalos con 4-5 años para no perderlos cuando más rinden (22-26).<br>
<strong>Paciencia</strong> — una mejora de 5-8 puntos puede llevar 3-6 temporadas. Un jugador con 58 de media a los 19 puede llegar a 74-78 a los 24.`
      },
      {
        q: '¿Qué hacer si voy descendiendo?',
        a: `Si estás en puestos de descenso en la jornada 10-15:<br><br>
<strong>1.</strong> Cambia a táctica conservadora: <span class="tag">🧱 Bloque bajo</span> o <span class="tag">⚡ Contraataque</span>.<br>
<strong>2.</strong> Refuerza portería y defensa en el mercado de invierno — encajar menos goles vale más que marcar más.<br>
<strong>3.</strong> Acepta empates contra equipos superiores — un punto es valioso.<br>
<strong>4.</strong> En los últimos minutos de un partido ganado, mete un mediocentro más por un extremo.<br><br>
Si desciendes: no es el fin. En Segunda hay más margen para desarrollar jóvenes y reconstruir con menos presión.`
      }
    ]
  }
];

const CHANGELOG_DATA = [
  { v: 'v1.7', items: [
    '170+ ciudades de Italia, Inglaterra, Francia, Alemania, Argentina y Brasil',
    '10 patrones de nombre distintos — cada partida genera 36 equipos únicos',
    'Garantía de 11 slots en el once: auto-relleno al vender o rescindir un titular',
    'Guía completa del juego con consejos basados en el motor real',
  ]},
  { v: 'v1.6', items: [
    'Motor táctico rediseñado: posiciones distintas en posesión y sin balón',
    '11 tácticas predefinidas, 5 mentalidades, 18 roles individuales',
    'Matchups tácticos aplicados también a partidos simulados',
    'Sistema de salarios, contratos (1-6 años) y masa salarial independiente',
    'Ofertas rivales con 3 opciones: aceptar, contraoferta, rechazar',
    'Ofrecer jugadores al mercado con precio mínimo',
    'Calendario con fechas reales y ventanas de fichajes por fecha',
    'Panel de plantilla con menú contextual por click/tap',
  ]},
  { v: 'v1.5', items: [
    'Sistema de tarjetas y suspensiones',
    'Progresión visible con barra de XP y notificación de mejora',
    'Fatiga calibrada correctamente',
    'Plantillas de 20 jugadores',
  ]},
  { v: 'v1.0', items: [
    'Lanzamiento: simulador 11v11 en canvas 2D',
    'Liga, Copa, ascensos/descensos, formaciones, tácticas',
    'Progresión y declive de jugadores',
  ]}
];

// ============================================================
// RENDER
// ============================================================
function renderFaq() {
  let html = `<div class="faq-version">ONCE Football Manager · v${GAME_VERSION}</div>`;

  // Secciones de guía
  FAQ_SECTIONS.forEach(sec => {
    html += `<div class="faq-section">`;
    html += `<div class="faq-section-title">${sec.title}</div>`;
    sec.items.forEach((item, i) => {
      const id = `faq_${sec.title.replace(/\s+/g,'_')}_${i}`;
      html += `
        <div class="faq-item" id="${id}">
          <div class="faq-q" onclick="toggleFaq('${id}')">
            <span>${item.q}</span>
            <span class="faq-toggle">▸</span>
          </div>
          <div class="faq-a">${item.a}</div>
        </div>`;
    });
    html += `</div>`;
  });

  // Changelog
  html += `<div class="faq-changelog">`;
  html += `<div class="faq-changelog-title">HISTORIAL DE CAMBIOS</div>`;
  CHANGELOG_DATA.forEach(entry => {
    html += `<div class="changelog-entry">
      <div class="changelog-ver">${entry.v}</div>
      <ul class="changelog-items">${entry.items.map(it => `<li>${it}</li>`).join('')}</ul>
    </div>`;
  });
  html += `</div>`;

  document.getElementById('faqContent').innerHTML = html;
}

function toggleFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const answer = item.querySelector('.faq-a');
  const arrow  = item.querySelector('.faq-toggle');
  const isOpen = answer.classList.contains('open');

  // Cerrar todos
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    const arr = a.parentElement.querySelector('.faq-toggle');
    if (arr) arr.textContent = '▸';
  });

  if (!isOpen) {
    answer.classList.add('open');
    if (arrow) arrow.textContent = '▾';
  }
}
