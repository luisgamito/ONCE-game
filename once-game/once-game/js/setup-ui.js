// ============================================================
document.getElementById('colorPicker').addEventListener('click',e=>{
  const opt=e.target.closest('.color-option');
  if(!opt)return;
  document.querySelectorAll('.color-option').forEach(c=>c.classList.remove('selected'));
  opt.classList.add('selected');
});
document.getElementById('leaguePicker').addEventListener('click',e=>{
  const opt=e.target.closest('.league-option');
  if(!opt)return;
  document.querySelectorAll('.league-option').forEach(c=>c.classList.remove('selected'));
  opt.classList.add('selected');
});
document.getElementById('matchLog').addEventListener('scroll',function(){
  autoScroll=this.scrollHeight-this.scrollTop-this.clientHeight<40;
});
window.addEventListener('resize',()=>{if(match)initPitch();});

