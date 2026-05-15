// LOG
// ============================================================
const LOG_FILTER={
  all:()=>true,
  goal:e=>e.type==='event-goal',
  shot:e=>['event-shot','event-save'].includes(e.type),
  card:e=>['event-card-yellow','event-card-red'].includes(e.type),
  foul:e=>e.type==='event-foul'
};

function addLog(text,type='normal'){
  if(!match)return;
  const realMin=match.period==='first'?Math.floor(match.tick/4):45+Math.floor(match.tick/4);
  const entry={time:realMin,text,type};
  match.log.push(entry);
  appendLogEntry(entry,true);
  document.getElementById('matchTicker').innerHTML=`<span>${text}</span>`;
}

function appendLogEntry(entry,live=false){
  const c=document.getElementById('matchLog');
  const d=document.createElement('div');
  d.className=`log-entry ${entry.type}${live?' live':''}`;
  d.dataset.type=entry.type;
  d.innerHTML=`<span class="le-time">${entry.time}'</span><span class="le-text">${entry.text}</span>`;
  if(!LOG_FILTER[currentLogFilter](entry))d.classList.add('hidden');
  c.appendChild(d);
  if(autoScroll)c.scrollTop=c.scrollHeight;
}

function setLogFilter(f){
  currentLogFilter=f;
  document.querySelectorAll('.lf-btn').forEach(b=>b.classList.toggle('on',b.dataset.filter===f));
  document.querySelectorAll('#matchLog .log-entry').forEach(e=>{
    e.classList.toggle('hidden',!LOG_FILTER[f]({type:e.dataset.type||'normal'}));
  });
}
function scrollLogEnd(){const c=document.getElementById('matchLog');c.scrollTop=c.scrollHeight;autoScroll=true;}

function addEndBanner(){
  const c=document.getElementById('matchLog');
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const oppT=match.myTeamSide==='A'?match.teamB:match.teamA;
  const d=document.createElement('div');d.className='log-end-banner';
  const res=myT.score>oppT.score?'VICTORIA 🏆':myT.score===oppT.score?'EMPATE':'DERROTA';
  d.innerHTML=`<div class="leb-title">${res}</div>
    <div class="leb-score">${myT.score} – ${oppT.score}</div>
    <div class="leb-sub">${myT.name} vs ${oppT.name}</div>`;
  c.appendChild(d);c.scrollTop=c.scrollHeight;
}

