/**
 * main.js
 * Entry point — called by loader.js via initApp() once all sprites are loaded.
 *
 * Responsibilities:
 *   1. Intro fade-in → fade-out → show menu + kick off menu scene
 *   2. Wire up the three menu buttons
 */

function initApp() {
    
    // Music
    initAudio(); 

    document.getElementById('mute-btn').addEventListener('click', toggleMute);
    updateMuteIcon();

  // ============================================================
  // 1. INTRO SEQUENCE
  // ============================================================
  const introTxt = document.getElementById('intro-text');

  setTimeout(() => { introTxt.classList.add('visible'); }, 600);
  setTimeout(() => { introTxt.classList.remove('visible'); }, 3800);
  setTimeout(() => {
    showScreen('menu');
    startMenuScene();
  }, 5400);

  // ============================================================
  // 2. MENU BUTTON — Play
  // ============================================================
  document.getElementById('btn-play').addEventListener('click', () => {
    startMusic();
    startGame();
  });

  // ============================================================
  // 3. MENU BUTTON — Turn back
  // ============================================================
  document.getElementById('btn-turn').addEventListener('click', () => {
    showScreen('turnback');
    const prose = document.getElementById('turn-text');
    setTimeout(() => { prose.classList.add('visible'); }, 300);
    setTimeout(() => { prose.classList.remove('visible'); }, 3200);
    setTimeout(() => { showScreen('menu'); }, 5000);
  });

  // ============================================================
  // 4. MENU BUTTON — Do nothing
  // ============================================================
  document.getElementById('btn-nothing').addEventListener('click', () => {
    showScreen('donothing');
    const regretBtn = document.getElementById('regret-btn');
    regretBtn.classList.remove('visible');
    setTimeout(() => { regretBtn.classList.add('visible'); }, 4200);
  });

  document.getElementById('regret-btn').addEventListener('click', () => {
    document.getElementById('regret-btn').classList.remove('visible');
    showScreen('menu');
  });
}

// If loader.js already finished before this script parsed, kick off now.
// Otherwise loader.js will call initApp() when it's done.
if (SPRITES_READY) initApp();