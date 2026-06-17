import { fetchBoard, postScore, clearBoard } from './leaderboard.js';

export function initGame(){
  "use strict";
  const $ = s => document.querySelector(s);

  /* ---------- Karakter SVG ---------- */
  function kid(shirt,shorts,hair){
    const skin="var(--kulit)";
    return `<svg viewBox="0 0 150 175" class="kidsvg"><g class="lean">
      <path d="M70 112 C58 132 50 148 45 165" stroke="${skin}" stroke-width="16" stroke-linecap="round" fill="none"/>
      <ellipse cx="46" cy="167" rx="12" ry="6" fill="${skin}"/>
      <path d="M82 112 C97 130 106 146 112 160" stroke="${skin}" stroke-width="17" stroke-linecap="round" fill="none"/>
      <ellipse cx="114" cy="162" rx="13" ry="6.5" fill="${skin}"/>
      <path d="M58 98 q17 -9 32 0 l4 20 q-20 8 -40 0 Z" fill="${shorts}"/>
      <path d="M56 58 q19 -11 38 0 l5 44 q-24 11 -48 0 Z" fill="${shirt}"/>
      <path d="M86 64 C112 68 130 80 141 89" stroke="${shirt}" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M106 72 C122 78 134 85 144 90" stroke="${skin}" stroke-width="11" stroke-linecap="round" fill="none"/>
      <circle cx="145" cy="91" r="8" fill="${skin}"/>
      <path d="M84 78 C108 82 127 90 140 97" stroke="${skin}" stroke-width="10" stroke-linecap="round" fill="none"/>
      <circle cx="141" cy="98" r="7" fill="${skin}"/>
      <rect x="60" y="44" width="15" height="18" rx="6" fill="${skin}"/>
      <circle cx="60" cy="34" r="21" fill="${skin}"/>
      <path d="M39 33 a21 21 0 0 1 42 -1 q-9 -9 -22 -7 q-13 2 -20 8 Z" fill="${hair}"/>
      <path d="M38 29 q22 -9 44 1 l-2 8 q-21 -9 -41 -1 Z" fill="var(--merah)"/>
      <path d="M39 31 l-9 5 7 3 Z" fill="var(--merah)"/>
      <circle cx="55" cy="36" r="2.4" fill="#3a2a20"/>
      <circle cx="66" cy="36" r="2.4" fill="#3a2a20"/>
      <path d="M57 43 q4 3 9 0" stroke="#c47b66" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </g></svg>`;
  }

  $("#teamL").innerHTML =
    kid("var(--krem)","#2f3340","var(--rambut)")+kid("#fff","#9c2933","#2b2724")+kid("var(--krem)","#34384a","#46342a");
  $("#teamR").innerHTML =
    kid("var(--merah)","#e9deb6","#2b2724")+kid("#c62a35","#2f3340","var(--rambut)")+kid("var(--merah)","#34384a","#3a2f28");

  $("#knot").innerHTML =
    `<svg viewBox="0 0 30 40" width="30" height="40">
      <rect x="13" y="-2" width="4" height="60" rx="2" fill="#7a4a16"/>
      <path d="M16 2 h18 v14 h-18 z" fill="var(--merah)"/><path d="M16 9 h18 v7 h-18 z" fill="#fff"/>
      <ellipse cx="15" cy="20" rx="9" ry="6" fill="#b5762a"/>
      <path d="M15 20 l-8 7 5 1 z" fill="#a8691f"/><path d="M15 20 l8 7 -5 1 z" fill="#a8691f"/>
    </svg>`;

  $("#splashScene").innerHTML =
    `<div class="rope2"></div><div class="sknot"></div>
     <div class="sk l1">${kid("var(--krem)","#2f3340","var(--rambut)")}</div>
     <div class="sk l2">${kid("#fff","#9c2933","#2b2724")}</div>
     <div class="sk r1">${kid("var(--merah)","#e9deb6","#2b2724")}</div>
     <div class="sk r2">${kid("#c62a35","#2f3340","var(--rambut)")}</div>`;

  let b="";for(let i=0;i<24;i++)b+="<span></span>";$("#bunting").innerHTML=b;

  /* ---------- Audio ---------- */
  let AC=null;
  function ac(){ if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}
    if(AC&&AC.state==="suspended")AC.resume(); return AC; }
  function tone(freq,dur,type,vol,when){ const c=ac(); if(!c)return; const t=(when||c.currentTime);
    const o=c.createOscillator(),g=c.createGain(); o.type=type||"sine"; o.frequency.value=freq;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol||0.2,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+0.02); }
  function sfxTug(side){ const f=side==="r"?320:240; tone(f+Math.random()*40,0.09,"square",0.13); tone(f*1.5,0.06,"triangle",0.07); }
  function sfxWhistle(){ const c=ac(); if(!c)return; const t=c.currentTime; tone(1200,0.18,"sine",0.22,t); tone(1500,0.22,"sine",0.18,t+0.05); }
  function sfxCount(){ tone(660,0.12,"square",0.18); }
  function sfxWin(){ const c=ac(); if(!c)return; let t=c.currentTime; [523,659,784,1047].forEach((f,i)=>tone(f,0.22,"triangle",0.22,t+i*0.12)); }
  function sfxLose(){ const c=ac(); if(!c)return; let t=c.currentTime; [392,330,262,196].forEach((f,i)=>tone(f,0.25,"sawtooth",0.16,t+i*0.13)); }
  function sfxFanfare(){ const c=ac(); if(!c)return; let t=c.currentTime;
    [523,659,784,1047,1319,1047,1319,1568].forEach((f,i)=>tone(f,0.28,"triangle",0.22,t+i*0.13)); }

  /* ---------- Musik latar ---------- */
  const N={"0":0,C3:130.81,E3:164.81,F3:174.61,G3:196,A3:220,
    C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
  const MEL =["G4","C5","C5","C5","E5","D5","C5","D5","E5","E5","E5","G5","F5","E5","D5","0",
              "F5","F5","E5","D5","C5","E5","G4","C5","E5","D5","C5","B4","C5","0","G4","0"];
  const BASS=["C3","0","G3","0","C3","0","G3","0","C3","0","E3","0","F3","0","G3","0",
              "F3","0","A3","0","C3","0","G3","0","C3","0","E3","0","G3","0","C3","0"];
  let musicOn=true, musicTimer=null, mStep=0, musicGain=null;
  function mNote(freq,dur,type,vol){ if(!freq)return; const c=ac(); if(!c||!musicGain)return;
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime;
    o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(musicGain); o.start(t); o.stop(t+dur+0.03); }
  function startMusic(){ if(musicTimer||!musicOn)return; const c=ac(); if(!c)return;
    if(!musicGain){ musicGain=c.createGain(); musicGain.gain.value=0.6; musicGain.connect(c.destination); }
    const sd=0.17;
    musicTimer=setInterval(()=>{ mNote(N[MEL[mStep%MEL.length]],sd*0.92,"triangle",0.045);
      if(mStep%2===0) mNote(N[BASS[mStep%BASS.length]],sd*1.6,"square",0.03); mStep++; }, sd*1000); }
  function stopMusic(){ if(musicTimer){clearInterval(musicTimer); musicTimer=null;} }
  $("#btnMusic").addEventListener("click",()=>{ ac(); musicOn=!musicOn;
    $("#btnMusic").textContent=musicOn?"🔊":"🔇"; if(musicOn)startMusic(); else stopMusic(); });

  /* ---------- Confetti ---------- */
  const cvs=$("#confetti"), cx=cvs.getContext("2d"); let parts=[],cfraf=null;
  function sizeCanvas(){ const a=$("#app"); cvs.width=a.clientWidth; cvs.height=a.clientHeight; }
  window.addEventListener("resize",sizeCanvas); sizeCanvas();
  const COLORS=["#d9333f","#ffce3a","#fff","#36b56b","#ff6a72","#e0a500"];
  function confetti(n){ sizeCanvas(); n=n||140;
    for(let i=0;i<n;i++)parts.push({x:Math.random()*cvs.width,y:-20-Math.random()*cvs.height*0.5,
      vx:(Math.random()-0.5)*3,vy:2+Math.random()*4,s:5+Math.random()*7,rot:Math.random()*6.28,
      vr:(Math.random()-0.5)*0.3,c:COLORS[(Math.random()*COLORS.length)|0]});
    if(!cfraf)cfStep(); }
  function cfStep(){ cx.clearRect(0,0,cvs.width,cvs.height); let alive=[];
    for(const p of parts){ p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.rot+=p.vr; if(p.y>cvs.height+20)continue; alive.push(p);
      cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.fillStyle=p.c; cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.6); cx.restore(); }
    parts=alive; if(parts.length){cfraf=requestAnimationFrame(cfStep);} else {cfraf=null; cx.clearRect(0,0,cvs.width,cvs.height);} }

  /* ---------- Penyimpanan skor terbaik ---------- */
  const BEST_KEY="tt_best_v2", NAME_KEY="tt_name_v2";
  function lsGet(k,def){ try{const v=localStorage.getItem(k); return v==null?def:JSON.parse(v);}catch(e){return def;} }
  function lsSet(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
  function getBest(){ return +lsGet(BEST_KEY,0)||0; }
  function esc(s){ return String(s).replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c])); }

  /* ---------- Konfigurasi game ---------- */
  const STAGES=[
    {name:"Pemanasan Kampung",mult:0.62},{name:"Lapangan RT",mult:0.84},{name:"Final Kelurahan",mult:1.06},
    {name:"Semifinal Kecamatan",mult:1.30},{name:"GRAND FINAL 17-an",mult:1.60},
  ];
  const BASE={ easy:{cpu:0.075,drift:0.085,label:"Santai"},
               normal:{cpu:0.100,drift:0.115,label:"Seru"}, hard:{cpu:0.130,drift:0.150,label:"Sadis"} };
  const PULL_CPU=0.055, PULL_DUO=0.024, WIN=0.045, TIER_BONUS={easy:1,normal:1.5,hard:2};

  /* ---------- State ---------- */
  let mode="cpu", tier="normal", playerName="";
  let stage=1, totalPoints=0;
  let pos=0.5, running=false, raf=null, last=0;
  let tapsL=0, tapsR=0, startTime=0, curCpu=0, curDrift=0;
  let lastResult=null, boardHighlight=0, pauseElapsed=0;

  const bar=$("#bar"),knot=$("#knot"),teamL=$("#teamL"),teamR=$("#teamR"),
        pejet=$("#pejet"),pejet2=$("#pejet2"),hint=$("#hint"),toast=$("#toast"),
        countdown=$("#countdown"),stageChip=$("#stageChip");

  /* ---------- Manajemen layar ---------- */
  const SCREENS=["scrSplash","scrSetup","scrStageClear","scrLose","scrMaster","scrDuoEnd"];
  function showScreen(id){ SCREENS.forEach(s=>$("#"+s).classList.toggle("hidden",s!==id)); }
  function hideScreens(){ SCREENS.forEach(s=>$("#"+s).classList.add("hidden")); }

  /* ---------- Render arena ---------- */
  function render(){ const pct=pos*100;
    bar.style.width=pct+"%"; knot.style.left=pct+"%";
    teamL.style.right=(100-pct)+"%"; teamL.style.left="auto"; teamR.style.left=pct+"%"; }

  function loop(t){ if(!running)return; if(!last)last=t;
    const dt=Math.min(0.05,(t-last)/1000); last=t;
    if(mode==="cpu"){ pos+=curCpu*dt; pos+=curDrift*dt; }
    pos=Math.max(0,Math.min(1,pos)); render();
    if(pos>=1-WIN)return finish(false);
    if(pos<=WIN)return finish(true);
    raf=requestAnimationFrame(loop); }

  function yank(team){ team.classList.remove("yank"); void team.offsetWidth; team.classList.add("yank"); }
  function flash(btn){ btn.classList.add("down"); clearTimeout(btn._t); btn._t=setTimeout(()=>btn.classList.remove("down"),70); }
  function pullLeft(){ if(!running)return; tapsL++; pos-=(mode==="cpu"?PULL_CPU:PULL_DUO); pos=Math.max(0,Math.min(1,pos));
    yank(teamL); flash(pejet); sfxTug("l"); render(); spawnToast(); if(pos<=WIN)finish(true); }
  function pullRight(){ if(!running||mode!=="duo")return; tapsR++; pos+=PULL_DUO; pos=Math.max(0,Math.min(1,pos));
    yank(teamR); flash(pejet2); sfxTug("r"); render(); if(pos>=1-WIN)finish(false); }

  let lastToast=0;
  function spawnToast(){ const now=performance.now(); if(now-lastToast<240)return; lastToast=now;
    const m=["HEYAA!","TARIK!","AYO!","SEMANGAT!","KUAT!"]; toast.textContent=m[(Math.random()*m.length)|0];
    toast.classList.remove("show"); void toast.offsetWidth; toast.classList.add("show"); }

  /* ---------- Input ---------- */
  pejet.addEventListener("pointerdown",e=>{e.preventDefault();ac();pullLeft();});
  pejet2.addEventListener("pointerdown",e=>{e.preventDefault();ac();pullRight();});
  window.addEventListener("keydown",e=>{ if(e.repeat)return;
    if(e.target&&e.target.tagName==="INPUT")return;
    if(e.code==="Escape"){ if(running)pauseGame(); else if(!$("#scrPause").classList.contains("hidden"))resumeGame(); return; }
    if(e.code==="Space"){ e.preventDefault(); if(running)pullLeft(); return; }
    if(mode==="duo"&&running){ if(e.code==="KeyA")pullLeft(); if(e.code==="KeyL")pullRight(); } });

  /* ---------- Setup ---------- */
  $("#mode").addEventListener("click",e=>{const x=e.target.closest("[data-m]");if(!x)return;
    mode=x.dataset.m; sel("#mode",x); $("#diffWrap").classList.toggle("hidden",mode==="duo");});
  $("#diff").addEventListener("click",e=>{const x=e.target.closest("[data-d]");if(!x)return; tier=x.dataset.d; sel("#diff",x);});
  function sel(wrap,btn){$(wrap).querySelectorAll("button").forEach(x=>x.classList.toggle("sel",x===btn));}

  /* ---------- Hitung mundur ---------- */
  function countdownThen(cb){ let n=3; countdown.classList.remove("hidden"); showCount(n);
    const iv=setInterval(()=>{ n--;
      if(n>0)showCount(n); else if(n===0){showCount("MULAI!"); sfxWhistle();}
      else {clearInterval(iv); countdown.classList.add("hidden"); cb();} },750); }
  function showCount(v){ countdown.textContent=v; countdown.classList.remove("pop"); void countdown.offsetWidth;
    countdown.classList.add("pop"); if(typeof v==="number")sfxCount(); }

  /* ---------- Mulai kampanye / stage ---------- */
  function startCampaign(){
    hideScreens();
    if(mode==="duo"){ startDuo(); return; }
    $("#lblL").textContent=playerName.toUpperCase().slice(0,8)||"KAMU"; $("#lblR").textContent="CPU";
    pejet2.style.display="none"; $("#p1lbl").textContent="tekan terus"; stageChip.style.display="";
    stage=1; totalPoints=0; startStage();
  }
  function startStage(){
    hideScreens();
    const st=STAGES[stage-1], base=BASE[tier];
    curCpu=base.cpu*st.mult; curDrift=base.drift*st.mult;
    stageChip.innerHTML=`🏁 STAGE <b class="text-emas">${stage}</b>/5 · ${st.name}`;
    pos=0.5; tapsL=0; tapsR=0; render();
    countdownThen(()=>{ running=true; last=0; startTime=performance.now(); $("#btnPause").style.display="flex";
      hint.textContent=stage>=5?"GRAND FINAL! Pejet sekuat tenaga! 👑":"PEJET terus! Jangan berhenti! 💥";
      raf=requestAnimationFrame(loop); });
  }
  function startDuo(){
    pejet2.style.display="flex"; $("#p1lbl").textContent="Pemain 1";
    $("#lblL").textContent="PEMAIN 1"; $("#lblR").textContent="PEMAIN 2"; $("#lblR").style.background="var(--emas)";
    stageChip.style.display="none"; pos=0.5; tapsL=0; tapsR=0; render();
    countdownThen(()=>{ running=true; last=0; startTime=performance.now(); $("#btnPause").style.display="flex";
      hint.textContent="P1 (kiri) vs P2 (kanan) — adu cepat! ⚔️"; raf=requestAnimationFrame(loop); });
  }

  /* ---------- Selesai ronde ---------- */
  function finish(leftWins){ if(!running)return; running=false; cancelAnimationFrame(raf); $("#btnPause").style.display="none";
    const dur=(performance.now()-startTime)/1000;
    if(mode==="duo") endDuo(leftWins,dur); else endStage(leftWins,dur); }

  function stagePoints(taps,dur){ return Math.max(1,Math.round((taps/Math.max(dur,0.1))*60*(1+stage*0.4)*TIER_BONUS[tier])); }
  function dots(elId,doneCount,nowStage){ const el=$(elId); let h="";
    for(let i=1;i<=5;i++){ const c=i<=doneCount?"done":(i===nowStage?"now":""); h+=`<span class="${c}">${i<=doneCount?"✓":i}</span>`; }
    el.innerHTML=h; }

  function endStage(win,dur){
    if(win){
      const pts=stagePoints(tapsL,dur); totalPoints+=pts; sfxWin(); confetti(140);
      if(stage>=5){ showMaster(dur); return; }
      $("#scTitle").textContent=`STAGE ${stage} SELESAI! 🎉`;
      dots("#scDots",stage,stage+1);
      $("#scScore").innerHTML=`+${pts} poin <span class="text-[#6a5237] text-[13px]">(total ${totalPoints})</span>`;
      $("#scMsg").textContent=`${tapsL}x pejet dalam ${dur.toFixed(1)} detik. Lanjut ke ${STAGES[stage].name}!`;
      showScreen("scrStageClear");
    }else{
      sfxLose(); dots("#loseDots",stage-1,stage);
      $("#loseMsg").textContent=`Tambang ketarik CPU di stage ${stage} (${STAGES[stage-1].name}). Coba lagi ya! Total poin: ${totalPoints}.`;
      showScreen("scrLose");
    }
  }

  async function showMaster(dur){
    lastResult={master:true,points:totalPoints};
    $("#masterName").textContent=(playerName||"Kamu").toUpperCase()+" 👑";
    $("#masterMsg").innerHTML=`Kamu menaklukkan <b>semua 5 stage</b> level ${BASE[tier].label} dan jadi <b>MASTER TARIK TAMBANG 17-AN!</b> 🇮🇩`;
    $("#masterScore").innerHTML=`Total Skor:<span class="pts">${totalPoints} poin</span>`;
    $("#masterBest").textContent="⭐ Skor terbaik: "+Math.max(getBest(),totalPoints)+" poin";
    showScreen("scrMaster"); sfxFanfare();
    confetti(180); setTimeout(()=>confetti(120),700); setTimeout(()=>confetti(120),1500);
    const r=await saveRun(5); boardHighlight=r.hl;
  }

  function endDuo(leftWins,dur){
    confetti(150); sfxWin();
    const who=leftWins?"PEMAIN 1 🔴":"PEMAIN 2 🟡";
    $("#duoRes").innerHTML=`<span class="text-hijau">${who} MENANG!</span>`;
    $("#duoMsg").textContent=`Duel sengit ${dur.toFixed(1)} detik! P1 ${tapsL}x pejet, P2 ${tapsR}x pejet.`;
    lastResult={duo:true}; showScreen("scrDuoEnd");
  }

  /* ---------- Simpan skor / leaderboard ---------- */
  async function saveRun(stageReached){
    const name=(playerName||"Anak Hebat").slice(0,14); lsSet(NAME_KEY,name);
    const entry={name,stage:stageReached,points:totalPoints,tier};
    const list=await postScore(entry);
    if(totalPoints>getBest()) lsSet(BEST_KEY,totalPoints);
    refreshBest();
    const mine=list.filter(e=>e.name===name&&e.points===totalPoints).sort((a,b)=>(b.date||0)-(a.date||0))[0];
    return { list, hl: mine?mine.date:0 };
  }
  function refreshBest(){ const best=getBest();
    document.querySelectorAll("[data-best]").forEach(el=>{
      el.textContent=best?("⭐ Skor terbaik: "+best+" poin"):"Belum ada skor. Jadilah Master! 🏆"; }); }

  function renderLB(list,hl){ const lb=(list||[]).slice(0,10), el=$("#lbList"), medal=["🥇","🥈","🥉"];
    if(!lb.length){ el.innerHTML='<div class="lb-empty">Belum ada skor.<br>Tamatkan 5 stage untuk jadi Master! 👑</div>'; return; }
    el.innerHTML=lb.map((e,i)=>`<li class="${e.date===hl?'me':''}">
      <span class="rank">${medal[i]||(i+1)}</span>
      <span class="nm">${esc(e.name)}<span class="meta"> · ${e.stage>=5?'👑 Master':'Stage '+e.stage} · ${(BASE[e.tier]||{}).label||''}</span></span>
      <span class="pts">${e.points}<small>poin</small></span></li>`).join("");
  }
  async function openBoard(hl){
    $("#scrBoard").classList.remove("hidden");
    $("#lbList").innerHTML='<div class="lb-empty">Memuat papan skor…</div>';
    const list=await fetchBoard(); renderLB(list, hl!=null?hl:boardHighlight);
  }
  function closeBoard(){ $("#scrBoard").classList.add("hidden"); }

  /* ---------- Share ---------- */
  function shareText(){
    if(lastResult&&lastResult.master)
      return `👑 Aku jadi MASTER TARIK TAMBANG 17-AN! Tamat 5 stage level ${BASE[tier].label} dengan ${totalPoints} poin! 🪢🇮🇩 Berani lawan aku?`;
    if(lastResult&&lastResult.duo)
      return `🪢 Seru main TARIK TAMBANG YUK adu cepat! Ayo tarik tambang bareng di 17-an! 🇮🇩`;
    return `🪢 Ayo main TARIK TAMBANG YUK! Pejet secepat mungkin biar menang! 🇮🇩`;
  }
  function doShare(btn){ const txt=shareText();
    if(navigator.share){ navigator.share({title:"Tarik Tambang Yuk!",text:txt}).catch(()=>{}); return; }
    if(navigator.clipboard&&navigator.clipboard.writeText)
      navigator.clipboard.writeText(txt).then(()=>flashBtn(btn,"Tersalin ✓"),()=>flashBtn(btn,"Gagal"));
    else flashBtn(btn,"Tersalin ✓"); }
  function flashBtn(btn,m){ const o=btn.textContent; btn.textContent=m; setTimeout(()=>btn.textContent=o,1400); }

  /* ---------- Jeda / kembali ke awal ---------- */
  function pauseGame(){ if(!running)return; running=false; cancelAnimationFrame(raf);
    pauseElapsed=performance.now()-startTime; $("#scrPause").classList.remove("hidden"); }
  function resumeGame(){ $("#scrPause").classList.add("hidden");
    countdownThen(()=>{ running=true; last=0; startTime=performance.now()-pauseElapsed; raf=requestAnimationFrame(loop); }); }
  function goSplash(){ running=false; cancelAnimationFrame(raf); countdown.classList.add("hidden");
    $("#btnPause").style.display="none"; $("#scrPause").classList.add("hidden"); closeBoard(); showScreen("scrSplash"); }

  /* ---------- Navigasi tombol ---------- */
  $("#btnSplashStart").addEventListener("click",()=>{ ac(); startMusic();
    $("#setupName").value=lsGet(NAME_KEY,"")||""; showScreen("scrSetup"); });
  $("#btnBackSplash").addEventListener("click",()=>showScreen("scrSplash"));
  $("#btnSetupStart").addEventListener("click",()=>{ ac(); playerName=$("#setupName").value.trim()||"Anak Hebat"; startCampaign(); });

  $("#btnNextStage").addEventListener("click",()=>{ stage++; startStage(); });
  $("#btnRetry").addEventListener("click",()=>{ startStage(); });
  $("#btnQuit").addEventListener("click",()=>{ if(totalPoints>0) saveRun(stage-1); showScreen("scrSplash"); });

  $("#btnMasterAgain").addEventListener("click",()=>showScreen("scrSetup"));
  $("#btnAgainDuo").addEventListener("click",()=>showScreen("scrSetup"));
  $("#btnShareMaster").addEventListener("click",e=>doShare(e.currentTarget));
  $("#btnShareDuo").addEventListener("click",e=>doShare(e.currentTarget));

  $("#btnBoardSplash").addEventListener("click",()=>openBoard());
  $("#btnBoardMaster").addEventListener("click",()=>openBoard());
  $("#btnBoardClose").addEventListener("click",closeBoard);
  $("#btnClearLb").addEventListener("click",async ()=>{ if(confirm("Hapus semua skor di papan?")){
    await clearBoard(); lsSet(BEST_KEY,0); renderLB([]); refreshBest(); } });

  $("#btnPause").addEventListener("click",pauseGame);
  $("#btnResume").addEventListener("click",resumeGame);
  ["btnHomePause","btnHomeStage","btnHomeMaster","btnHomeDuo","btnHomeBoard"].forEach(id=>$("#"+id).addEventListener("click",goSplash));

  refreshBest(); render(); showScreen("scrSplash");
}
