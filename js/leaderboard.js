// Klien papan skor.
// Sumber utama: data/leaderboard.php (menulis ke data/leaderboard.json di server XAMPP).
// Fallback otomatis ke localStorage bila PHP tidak tersedia (mis. dibuka statis).

const API = 'data/leaderboard.php';
const LS_KEY = 'tt_leaderboard_v2';

function lsRead(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e){ return []; } }
function lsWrite(list){ try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch(e){} }
function sortLB(list){ return list.sort((a,b)=> (b.stage-a.stage) || (b.points-a.points)).slice(0,50); }

export async function fetchBoard(){
  try {
    const r = await fetch(API, {cache:'no-store'});
    if(r.ok){ const data = await r.json(); if(Array.isArray(data)) return data; }
  } catch(e){ /* offline / tanpa PHP */ }
  return sortLB(lsRead());
}

export async function postScore(entry){
  // selalu simpan lokal sebagai cadangan
  const local = sortLB([...lsRead(), { ...entry, date: Date.now() }]);
  lsWrite(local);
  try {
    const r = await fetch(API, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(entry),
    });
    if(r.ok){ const data = await r.json(); if(Array.isArray(data)) return data; }
  } catch(e){ /* fallback */ }
  return local;
}

export async function clearBoard(){
  lsWrite([]);
  try { await fetch(API + '?action=clear', {method:'POST'}); } catch(e){}
}
