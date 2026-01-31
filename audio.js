// audio.js
const audio = {
  music: null,
  muted: false,
  started: false
};

function initAudio() {
  audio.music = new Audio('assets/music.mp3');
  audio.music.loop = true;
  audio.music.volume = 0.5;
}

function startMusic() {
  if (!audio.music || audio.started || audio.muted) return;
  audio.music.play().catch(() => {});
  audio.started = true;
}

function toggleMute() {
  audio.muted = !audio.muted;

  if (audio.muted) {
    audio.music.pause();
  } else {
    audio.music.play().catch(() => {});
  }

  updateMuteIcon();
}

function updateMuteIcon() {
  const btn = document.getElementById('mute-btn');
  btn.textContent = audio.muted ? '🔇' : '🔊';
}
