// GAME STATE
// ============================================================
let G = null; // global game state

// ============================================================
// PERSISTENCE
// ============================================================
function saveGame() {
  try { localStorage.setItem('once_save', JSON.stringify(G)); } catch(e){}
}
function loadGame() {
  try {
    const s = localStorage.getItem('once_save');
    if (s) { G = JSON.parse(s); return true; }
  } catch(e){}
  return false;
}

// ============================================================
