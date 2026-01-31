/**
 * screens.js
 * Shared screen-switching utility.
 * Every other module imports nothing — it just calls showScreen('id').
 * This file must load first (it's first in index.html).
 */

const screens = {
  intro:    document.getElementById('intro'),
  menu:     document.getElementById('menu'),
  turnback: document.getElementById('turnback'),
  donothing:document.getElementById('donothing'),
  game:     document.getElementById('game-screen'),
  death:    document.getElementById('death')
};

/**
 * Hide every screen, then show the one with the given id.
 * @param {string} id   — key in the screens object above
 * @param {number} delay — optional delay in ms before switching
 */
function showScreen(id, delay = 0) {
  setTimeout(() => {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[id].classList.add('active');
  }, delay);
}