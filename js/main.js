// ============================================================
// SCREEN ROUTING
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'screen-match') {
    setTimeout(() => { initPitch(); }, 50);
  }
}

// ============================================================
// INIT
// ============================================================
(function(){
  const savedTheme = localStorage.getItem('once_theme') || 'dark';
  applyTheme(savedTheme);

  _lang = localStorage.getItem('once_lang') || 'es';
  syncTacticsLang();
  applyLang();

  if (loadGame()) {
    // Migrar táctica antigua
    if (G && G.club && G.club.tactic === 'block') G.club.tactic = 'parking';

    // Migrar partidas sin wageBudget
    if (G && G.club && !G.club.wageBudget) {
      G.club.wageBudget = G.league && G.league.myDivision === 1 ? 3000000 : 1000000;
    }

    // Migrar jugadores sin contrato
    if (G && G.league) {
      getAllTeams().forEach(team => {
        team.squad.forEach(p => {
          if (!p.contract) {
            const ov = calcOverall(p);
            p.contract = genContract(ov, p.age);
          }
          if (!p.season) p.season = { goals:0, assists:0, shots:0, shotsOnTarget:0, passes:0, passSuccess:0, tackles:0, fouls:0, gamesPlayed:0, ratingSum:0, yellows:0 };
          if (p.season && !p.season.yellows) p.season.yellows = 0;
          if (p.suspension == null) p.suspension = 0;
        });
      });
    }

    document.getElementById('btnContinue').style.display = 'block';
    if (G._pendingOffers && G._pendingOffers.length > 0) renderPendingOffers();
  }
})();
