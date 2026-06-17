import { mount } from './loader.js';

// Urutan komponen mengikuti urutan tumpukan (gameplay dulu, lalu modal/overlay).
const COMPONENTS = [
  'chrome', 'hud', 'arena', 'controls',
  'splash', 'setup', 'stage-clear', 'lose', 'master', 'duo-end', 'board', 'pause',
];

(async () => {
  try {
    await mount('#app', COMPONENTS);
    const { initGame } = await import('./game.js');
    initGame();
  } catch (err) {
    console.error(err);
    document.querySelector('#app').innerHTML =
      '<div class="p-8 text-center text-merah font-bold">Gagal memuat game.<br>Pastikan dibuka lewat server (http://localhost/...), bukan file://</div>';
  }
})();
