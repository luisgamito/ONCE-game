// RENDERING
// ============================================================
const canvas=document.getElementById('pitch');
const ctx=canvas.getContext('2d');

function initPitch(){
  const cont=canvas.parentElement;
  canvas.width=cont.clientWidth;
  canvas.height=cont.clientHeight-26; // minus ticker
  renderMatchFrame();
}

function drawPitchBg(){
  const W=canvas.width,H=canvas.height;
  ctx.fillStyle='#1a3a14';
  ctx.fillRect(0,0,W,H);
  const sw=FW/10;
  for(let i=0;i<10;i++){
    ctx.fillStyle=i%2===0?'#1d3f17':'#1a3a14';
    ctx.fillRect(FX+i*sw*(W/PITCH_W),FY*(H/PITCH_H),sw*(W/PITCH_W),(FH)*(H/PITCH_H));
  }
  const scx=W/PITCH_W,scy=H/PITCH_H;
  ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=1.2;
  ctx.strokeRect(FX*scx,FY*scy,FW*scx,FH*scy);
  ctx.beginPath();ctx.moveTo((FX+FW/2)*scx,FY*scy);ctx.lineTo((FX+FW/2)*scx,(FY+FH)*scy);ctx.stroke();
  ctx.beginPath();ctx.arc((FX+FW/2)*scx,(FY+FH/2)*scy,FH*.13*scy,0,Math.PI*2);ctx.stroke();
  const paW=FW*.155*scx,paH=FH*.59*scy,paT=(FY+(FH-FH*.59)/2)*scy;
  ctx.strokeRect(FX*scx,paT,paW,paH);ctx.strokeRect((FX+FW-FW*.155)*scx,paT,paW,paH);
  ctx.fillStyle='rgba(255,255,255,0.6)';
  ctx.beginPath();ctx.arc((FX+FW*.1)*scx,(FY+FH*.5)*scy,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc((FX+FW*.9)*scx,(FY+FH*.5)*scy,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc((FX+FW/2)*scx,(FY+FH/2)*scy,3,0,Math.PI*2);ctx.fill();
  // Goals
  const gH=FH*.108*scy,gW=10,gT=(FY+(FH-FH*.108)/2)*scy;
  ctx.fillStyle='rgba(255,255,255,0.07)';
  ctx.fillRect(FX*scx-gW,gT,gW,gH);ctx.strokeRect(FX*scx-gW,gT,gW,gH);
  ctx.fillRect((FX+FW)*scx,gT,gW,gH);ctx.strokeRect((FX+FW)*scx,gT,gW,gH);
}

function f2c(x,y){
  const W=canvas.width,H=canvas.height,scx=W/PITCH_W,scy=H/PITCH_H;
  return{cx:(FX+x*FW)*scx,cy:(FY+y*FH)*scy};
}

function drawMatchPlayers(){
  if(!match)return;
  const myColor=G.club.color;
  [match.teamA,match.teamB].forEach(team=>{
    const isMyTeam=team.side===match.myTeamSide;
    const color=isMyTeam?myColor:'#ff3d5a';
    const textColor=isMyTeam?(isDark(myColor)?'#fff':'#111'):'#fff';
    fieldP(team).forEach(p=>{
      const{cx,cy}=f2c(p.x,p.y);
      const isHolder=p===match.ballHolder;
      const sl=p.currentSpeed||0;
      if(sl>.55){
        ctx.save();ctx.globalAlpha=clamp((sl-.55)*1.5*.45,.05,.5);
        const r=12+sl*4;
        const g2=ctx.createRadialGradient(cx,cy,5,cx,cy,r);
        g2.addColorStop(0,color);g2.addColorStop(1,color+'00');
        ctx.fillStyle=g2;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();ctx.ellipse(cx,cy+8,7,3.5,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,isHolder?10:8,0,Math.PI*2);
      ctx.fillStyle=color;ctx.fill();
      ctx.strokeStyle=isHolder?'#ffd600':'rgba(255,255,255,0.3)';ctx.lineWidth=isHolder?2.5:1;ctx.stroke();
      ctx.fillStyle=textColor;ctx.font=`bold ${isHolder?8:7}px JetBrains Mono`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.pos.slice(0,2),cx,cy);
      if(p.cards.yellow>=1&&!p.cards.red){ctx.fillStyle='#ffd600';ctx.fillRect(cx+7,cy-12,5,7);}
      if(p.cards.red){ctx.fillStyle='#ff3d5a';ctx.fillRect(cx+7,cy-12,5,7);}
      const bw=14,bh=2;
      ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(cx-bw/2,cy+11,bw,bh);
      const fc=p.fatigue>60?'#00e676':p.fatigue>30?'#ffd600':'#ff3d5a';
      ctx.fillStyle=fc;ctx.fillRect(cx-bw/2,cy+11,bw*(p.fatigue/100),bh);
    });
  });
}

function drawMatchBall(){
  if(!match)return;
  const{cx,cy}=f2c(match.ballX,match.ballY);
  ctx.beginPath();ctx.ellipse(cx+2,cy+4,5,3,0,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,5.5,0,Math.PI*2);ctx.fillStyle='#ffd600';ctx.fill();
  ctx.strokeStyle='#92400e';ctx.lineWidth=1;ctx.stroke();
}

function renderMatchFrame(){
  if(!canvas.width)return;
  drawPitchBg();drawMatchPlayers();drawMatchBall();
  updateMatchHUD();updateMatchStats();renderMatchSquad();
}

function updateMatchHUD(){
  if(!match)return;
  const myScore=match.myTeamSide==='A'?match.teamA.score:match.teamB.score;
  const oppScore=match.myTeamSide==='A'?match.teamB.score:match.teamA.score;
  document.getElementById('mhScoreOwn').textContent=myScore;
  document.getElementById('mhScoreOpp').textContent=oppScore;
  const realMin=match.period==='first'?Math.floor(match.tick/4):45+Math.floor(match.tick/4);
  const sec=(match.tick%4)*15;
  document.getElementById('mhMinute').textContent=`${realMin}:${sec.toString().padStart(2,'0')}`;
  document.getElementById('mhPeriod').textContent=match.state==='finished'?'END':match.period==='first'?'1ST HALF':'2ND HALF';
}

function updateMatchStats(){
  if(!match)return;
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const oppT=match.myTeamSide==='A'?match.teamB:match.teamA;
  const totPos=myT.possession+oppT.possession||1;
  const posOwn=Math.round(myT.possession/totPos*100);
  const stats=[
    {n:'Possession',ov:posOwn,op:100-posOwn,own:posOwn+'%',opp:(100-posOwn)+'%'},
    {n:'Disparos',ov:myT.shots,op:oppT.shots,own:myT.shots,opp:oppT.shots},
    {n:'On target',ov:myT.shotsOnTarget||0,op:oppT.shotsOnTarget||0,own:myT.shotsOnTarget||0,opp:oppT.shotsOnTarget||0},
    {n:'Fouls',ov:myT.fouls,op:oppT.fouls,own:myT.fouls,opp:oppT.fouls},
    {n:'Corners',ov:myT.corners,op:oppT.corners,own:myT.corners,opp:oppT.corners},
    {n:'Offsides',ov:myT.offsides,op:oppT.offsides,own:myT.offsides,opp:oppT.offsides}
  ];
  document.getElementById('matchStatsPanel').innerHTML=`<div class="ms-label">ESTADÍSTICAS EN VIVO</div>`+stats.map(s=>{
    const tot=(s.ov||0)+(s.op||0)||1;
    const pA=(s.ov||0)/tot*100,pB=(s.op||0)/tot*100;
    return `<div class="ms-bar-row">
      <div class="ms-bar-label"><span class="own">${s.own}</span><span class="name">${s.n}</span><span class="opp">${s.opp}</span></div>
      <div class="ms-bar"><div class="ms-bar-own" style="width:${pA}%"></div><div class="ms-bar-opp" style="width:${pB}%"></div></div>
    </div>`;
  }).join('');
}

function renderMatchSquad(){
  if(!match)return;
  const myT=match.myTeamSide==='A'?match.teamA:match.teamB;
  const oppT=match.myTeamSide==='A'?match.teamB:match.teamA;
  const myColor=G.club.color;
  const renderTeam=(team,cls,colorStr)=>{
    const players=[...fieldP(team)].sort((a,b)=>{
      const ro={GK:0,DEF:1,MID:2,FWD:3};
      return (ro[a.role]||2)-(ro[b.role]||2);
    });
    return `<div class="msq-team-title ${cls}">${team.name}</div>`+players.map((p,i)=>{
      const fc=p.fatigue>60?'#00e676':p.fatigue>30?'#ffd600':'#ff3d5a';
      return `<div class="msq-player" onclick="openPlayerModal('${p.id}')">
        <span class="msq-num">${i+1}</span>
        <span class="msq-pos" style="background:var(--bg-overlay);color:${posColor(p.pos)}">${p.pos}</span>
        <span class="msq-name">${p.name.split(' ')[1]||p.name}</span>
        <div class="msq-fatigue"><div class="msq-fat-fill" style="width:${p.fatigue}%;background:${fc}"></div></div>
        <span class="msq-rat">${p.match.rating.toFixed(1)}</span>
      </div>`;
    }).join('');
  };
  document.getElementById('matchSquadPanel').innerHTML=
    renderTeam(myT,'own',myColor)+
    '<div style="height:10px"></div>'+
    renderTeam(oppT,'opp','#ff3d5a');
}

