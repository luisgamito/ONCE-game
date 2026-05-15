// PANEL EQUIPOS RIVALES
// ============================================================
let _selectedTeamId = null;

function starsFromOverall(overall) {
  // 0-59 → 1★, 60-67 → 2★, 68-74 → 3★, 75-82 → 4★, 83+ → 5★
  if (overall >= 83) return '★★★★★';
  if (overall >= 75) return '★★★★☆';
  if (overall >= 68) return '★★★☆☆';
  if (overall >= 60) return '★★☆☆☆';
  return '★☆☆☆☆';
}

function starsColor(overall) {
  if (overall >= 83) return 'var(--gold)';
  if (overall >= 75) return '#f4c842';
  if (overall >= 68) return 'var(--yellow)';
  if (overall >= 60) return 'var(--text-dim)';
  return 'var(--text-muted)';
}

function renderTeamsPanel() {
  const allTeams = getAllTeams();
  const myDivId = G.league.myDivision;

  if (!_selectedTeamId || !allTeams.find(t => t.id === _selectedTeamId)) {
    // Default: first rival in my division
    const myDiv = getMyDivision();
    const rival = myDiv.teams.find(t => t.id !== 'player');
    _selectedTeamId = rival ? rival.id : allTeams.find(t => t.id !== 'player')?.id;
  }

  // Build selector grouped by division
  let selectorHtml = '';
  [1, 2].forEach(lvl => {
    const div = G.league.divisions[lvl];
    selectorHtml += `<div class="teams-div-label">${div.name}</div><div class="teams-selector">`;
    div.teams.forEach(t => {
      const isPlayer = t.id === 'player';
      const isActive = t.id === _selectedTeamId;
      selectorHtml += `<div class="team-chip ${isActive ? 'active' : ''} ${isPlayer ? 'player-team' : ''}"
        onclick="selectTeam('${t.id}')">${t.name}${isPlayer ? ' (tú)' : ''}</div>`;
    });
    selectorHtml += '</div>';
  });

  // Build squad view
  const team = allTeams.find(t => t.id === _selectedTeamId);
  let squadHtml = '';
  if (team) {
    const isPlayer = team.id === 'player';
    const sorted = [...team.squad].sort((a, b) => {
      const order = ['GK','CB','LB','RB','CDM','CM','LM','RM','CAM','LW','RW','ST'];
      return order.indexOf(a.pos) - order.indexOf(b.pos);
    });

    const starters = sorted.filter(p => p.inSquad);
    const bench = sorted.filter(p => !p.inSquad);

    const renderGroup = (players, label) => {
      if (players.length === 0) return '';
      return `<div class="section-title" style="margin-top:12px;margin-bottom:8px">${label}</div>
      <div class="rival-squad-grid">
        ${players.map(p => {
          const overall = calcOverall(p);
          const stars = starsFromOverall(overall);
          const starCol = starsColor(overall);
          const ageColor = p.age < 22 ? 'var(--green)' : p.age > 32 ? 'var(--red)' : 'var(--text-dim)';
          const injured = p.injury && p.injury.jornadasLeft > 0;
          const gp = p.season?.gamesPlayed || 0;
          const goals = p.season?.goals || 0;
          const assists = p.season?.assists || 0;
          const avgR = gp > 0 ? (p.season.ratingSum / gp).toFixed(1) : '-';
          return `<div class="rival-player-card" style="${injured ? 'opacity:0.5' : ''}">
            <div class="rpc-top">
              <span class="rpc-pos" style="color:${posColor(p.pos)}">${p.pos}</span>
              <span class="rpc-stars" style="color:${starCol}">${stars}</span>
            </div>
            <div class="rpc-name">${p.name}${injured ? ' 🩹' : ''}</div>
            <div class="rpc-age" style="color:${ageColor}">${p.age} años</div>
            <div class="rpc-stats">
              <div class="rpc-stat">PJ <span>${gp}</span></div>
              ${goals > 0 ? `<div class="rpc-stat">G <span style="color:var(--green)">${goals}</span></div>` : ''}
              ${assists > 0 ? `<div class="rpc-stat">A <span>${assists}</span></div>` : ''}
              ${gp > 0 ? `<div class="rpc-stat">VAL <span>${avgR}</span></div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>`;
    };

    const teamColor = isPlayer ? G.club.color : '#1c2530';
    const textCol = isPlayer ? (isDark(G.club.color) ? '#fff' : '#000') : '#6b8fa8';
    const avgOverall = Math.round(team.squad.reduce((s, p) => s + calcOverall(p), 0) / (team.squad.length || 1));

    squadHtml = `<div style="display:flex;align-items:center;gap:12px;padding:14px;background:var(--bg3);border:1px solid var(--border);margin-bottom:16px">
      <div style="width:44px;height:44px;border-radius:50%;background:${teamColor};color:${textCol};display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:13px;font-weight:700;flex-shrink:0">${team.abbr||team.name.slice(0,3).toUpperCase()}</div>
      <div style="flex:1">
        <div style="font-size:15px;font-weight:700;color:var(--white)">${team.name}${isPlayer ? ' <span style="font-size:10px;color:var(--accent);letter-spacing:1px">TU EQUIPO</span>' : ''}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Overall ${avgOverall} · ${team.squad.length} jugadores · ${G.league.divisions[team.division||1].name}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--font-display);font-size:28px;font-weight:700;color:${starsColor(avgOverall)}">${starsFromOverall(avgOverall)}</div>
        <div style="font-size:10px;color:var(--text-muted)">calidad general</div>
      </div>
    </div>
    ${renderGroup(starters, 'STARTERS')}
    ${renderGroup(bench, t('bench'))}`;
  }

  document.getElementById('teamsPanel').innerHTML = selectorHtml + squadHtml;
}

function selectTeam(teamId) {
  _selectedTeamId = teamId;
  renderTeamsPanel();
}

