// GOAL OVERLAY
// ============================================================
function showGoalOverlay(){
  const o=document.getElementById('goalOverlay');
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const oppT=match.myTeamSide==='A'?match.teamB:match.teamA;
  const myGoal=myT.score>(match._lastMyScore||0);
  match._lastMyScore=myT.score;
  document.getElementById('goalText').textContent='GOL';
  document.getElementById('goalText').style.color=myGoal?'var(--green)':'var(--red)';
  o.classList.add('show');
  setTimeout(()=>o.classList.remove('show'),2200);
}

// ============================================================
// CONTROLS
// ============================================================
function togglePlay(){
  if(!match||match.state==='finished')return;
  isPlaying=!isPlaying;
  document.getElementById('btnPlay').textContent=isPlaying?'⏸ PAUSE':'▶ PLAY';
  if(isPlaying){autoScroll=true;simInterval=setInterval(processTick,simSpeed);}
  else clearInterval(simInterval);
}
function stepOneTick(){
  if(!match||match.state==='finished')return;
  if(isPlaying){clearInterval(simInterval);isPlaying=false;document.getElementById('btnPlay').textContent='▶ PLAY';}
  processTick();
}
function setSpeed(ms){
  simSpeed=ms;
  document.querySelectorAll('.spd-btn').forEach(b=>b.classList.remove('on'));
  const labels={250:'0.5x',120:'1x',60:'2x',20:'4x',5:'MAX'};
  document.querySelectorAll('.spd-btn').forEach(b=>{if(b.textContent===labels[ms])b.classList.add('on');});
  if(isPlaying){clearInterval(simInterval);simInterval=setInterval(processTick,ms);}
}
function switchMatchTab(t){
  document.querySelectorAll('.match-tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.match-panel').forEach(x=>x.classList.remove('active'));
  document.querySelector(`.match-tab[onclick="switchMatchTab('${t}')"]`).classList.add('active');
  document.getElementById(`mpanel-${t}`).classList.add('active');
}
function abandonMatch(){
  if(!confirm('¿Abandonar el partido? El resultado se registrará 0-3'))return;
  clearInterval(simInterval);isPlaying=false;
  match.state='finished';
  match.teamA.score=match.myIsHome?0:3;
  match.teamB.score=match.myIsHome?3:0;
  saveMatchResult();
  showScreen('screen-hub');initHub();
}

