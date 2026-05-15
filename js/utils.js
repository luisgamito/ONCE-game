// UTILITY
// ============================================================
const rnd  = (a,b) => Math.random()*(b-a)+a;
const rndI = (a,b) => Math.floor(rnd(a,b+1));
const pick = arr  => arr[Math.floor(Math.random()*arr.length)];
const clamp= (v,a,b)=>Math.max(a,Math.min(b,v));
const chance=(p)  => Math.random()<p;
const distP=(a,b) => Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
const randName=()=> `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
const fmt = n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(0)+'K' : n.toString();
const fmtDate = (j,t) => `J${j} T${t}`;
const posColor = pos => {
  if (pos==='GK') return '#ffd600';
  if (['CB','LB','RB'].includes(pos)) return '#00d4ff';
  if (['CDM','CM','LM','RM','CAM'].includes(pos)) return '#00e676';
  return '#ff7043';
};

