/**
 * game.js
 * Endless-runner game engine — sprite edition.
 *
 * Sprites used:
 *   sprites.walk  — default while on the ground
 *   sprites.jump  — while airborne
 *   sprites.rip   — shown frozen at death before the screen fades
 *
 * Obstacle types (unchanged):
 *   block     — rectangular ice block
 *   spire     — triangular ice spire
 *   avalanche — rock cluster that falls from above
 *
 * Call startGame() to begin.
 */

// ---- tunables ----
const GRAVITY        = 0.42;
const JUMP_FORCE     = -13.2;
const OBSTACLE_SPEED = 5.2;
const SPEED_RAMP     = 0.0008;
const PLAYER_W       = 52;   // hitbox width (px)
const PLAYER_H       = 64;   // hitbox height (px)
const GROUND_Y_RATIO = 0.78;

function startGame() {
  showScreen('game');

  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');
  let gW, gH;

  function resize() {
    gW = canvas.width  = canvas.offsetWidth;
    gH = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- state ----
  const player = { x: 0, y: 0, vy: 0, grounded: true };
  let obstacles  = [];
  let gameOver   = false;
  let gameTime   = 0;
  let spawnTimer = 0;
  let spawnInterval = 90;
  let jumpPressed = false;
  let deathFrame  = false;   // true once collision detected, freezes the rip sprite

  // Reset UI
  document.getElementById('dist').textContent = '0';
  document.getElementById('tap-hint').classList.add('show');

  // ---- input ----
  function onJump(e) {
    if (gameOver) return;
    if (e.type === 'keydown' && e.key !== ' ') return;
    if (e.type === 'keydown') e.preventDefault();
    if (!jumpPressed && player.grounded) {
      player.vy      = JUMP_FORCE;
      player.grounded = false;
      jumpPressed    = true;
    }
  }
  function onJumpUp() { jumpPressed = false; }

  document.addEventListener('keydown',  onJump);
  document.addEventListener('keyup',    onJumpUp);
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); onJump(e); });
  canvas.addEventListener('pointerup',   onJumpUp);

  function cleanup() {
    document.removeEventListener('keydown',  onJump);
    document.removeEventListener('keyup',    onJumpUp);
  }

  // ---- spawning ----
  function spawnObstacle() {
    const roll = Math.random();
    if (roll < 0.45) {
      obstacles.push({ type:'block', x: gW+40, w: 28+Math.random()*18, h: 30+Math.random()*30, falling:false });
    } else if (roll < 0.75) {
      obstacles.push({ type:'spire', x: gW+40, w: 18, h: 55+Math.random()*30, falling:false });
    } else {
      obstacles.push({ type:'avalanche', x: gW*0.5+Math.random()*gW*0.35, w: 50+Math.random()*40, h: 28+Math.random()*20, y:-60, vy:0, falling:true });
    }
  }

  // ----------------------------------------------------------------
  // BACKGROUND
  // ----------------------------------------------------------------
  function drawBackground(groundY) {
    const sky = ctx.createLinearGradient(0, 0, 0, gH);
    sky.addColorStop(0,   '#060a16');
    sky.addColorStop(0.6, '#0e1220');
    sky.addColorStop(1,   '#121828');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, gW, gH);

    // Far mountains
    ctx.fillStyle = '#101620';
    for (let i = -1; i < 6; i++) {
      const mx = i*200 - (gameTime*0.15) % 200;
      ctx.beginPath();
      ctx.moveTo(mx, groundY);
      ctx.lineTo(mx+100, groundY - 120 - ((i*37)%60));
      ctx.lineTo(mx+200, groundY);
      ctx.closePath(); ctx.fill();
    }
    // Near mountains
    ctx.fillStyle = '#0d1118';
    for (let i = -1; i < 6; i++) {
      const mx = i*180 - (gameTime*0.35) % 180;
      ctx.beginPath();
      ctx.moveTo(mx, groundY);
      ctx.lineTo(mx+90, groundY - 85 - ((i*53)%45));
      ctx.lineTo(mx+180, groundY);
      ctx.closePath(); ctx.fill();
    }
    // Ground
    const grd = ctx.createLinearGradient(0, groundY, 0, gH);
    grd.addColorStop(0, '#0f1420');
    grd.addColorStop(1, '#090b12');
    ctx.fillStyle = grd;
    ctx.fillRect(0, groundY, gW, gH);
    // Ground line
    ctx.strokeStyle = 'rgba(100,140,180,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(gW, groundY); ctx.stroke();
    // Snow
    ctx.fillStyle = 'rgba(180,200,220,0.15)';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(((i*137 + gameTime*0.3) % gW), ((i*89 + gameTime*0.12) % gH)*0.7, 1, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // ----------------------------------------------------------------
  // OBSTACLES
  // ----------------------------------------------------------------
  function drawObstacle(o, groundY) {
    const ox = o.x;
    const oy = o.falling ? o.y : (groundY - o.h);

    if (o.type === 'block') {
      const ig = ctx.createLinearGradient(ox, oy, ox, oy+o.h);
      ig.addColorStop(0,'#2a3550'); ig.addColorStop(0.3,'#3a4a6a'); ig.addColorStop(1,'#1a2238');
      ctx.fillStyle = ig;
      ctx.fillRect(ox, oy, o.w, o.h);
      ctx.fillStyle = 'rgba(180,210,240,0.12)';
      ctx.fillRect(ox+2, oy+2, o.w-4, 4);
      ctx.strokeStyle = 'rgba(100,150,200,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, o.w, o.h);

    } else if (o.type === 'spire') {
      ctx.fillStyle = '#2a3550';
      ctx.beginPath();
      ctx.moveTo(ox + o.w*0.5, oy);
      ctx.lineTo(ox + o.w, oy + o.h);
      ctx.lineTo(ox, oy + o.h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(180,210,240,0.15)';
      ctx.beginPath();
      ctx.moveTo(ox + o.w*0.5, oy+6);
      ctx.lineTo(ox + o.w*0.7, oy + o.h*0.4);
      ctx.lineTo(ox + o.w*0.5+1, oy + o.h*0.35);
      ctx.closePath(); ctx.fill();

    } else if (o.type === 'avalanche') {
      ctx.fillStyle = '#252d3f';
      ctx.beginPath(); ctx.ellipse(ox+o.w*0.35, oy+o.h*0.5, o.w*0.38, o.h*0.52, -0.2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1e2535';
      ctx.beginPath(); ctx.ellipse(ox+o.w*0.68, oy+o.h*0.55, o.w*0.30, o.h*0.42, 0.15, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2d3650';
      ctx.beginPath(); ctx.ellipse(ox+o.w*0.5, oy+o.h*0.25, o.w*0.25, o.h*0.32, 0.1, 0, Math.PI*2); ctx.fill();
      if (o.falling) {
        ctx.fillStyle = 'rgba(200,220,240,0.18)';
        ctx.beginPath(); ctx.ellipse(ox+o.w*0.5, oy, o.w*0.45, 6, 0, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  // ----------------------------------------------------------------
  // PLAYER SPRITE
  // The penguin runs to the RIGHT, and our sprites already face right,
  // so no flip is needed.  We pick the sprite based on state:
  //   grounded + alive  → sprites.walk
  //   airborne + alive  → sprites.jump
  //   dead              → sprites.rip  (wider, shorter — anchor at bottom-centre)
  // ----------------------------------------------------------------
  function drawPlayer(groundY) {
    let img, dw, dh, anchorX, anchorY;

    if (deathFrame) {
      // RIP sprite — wider and flat, sits on the ground
      img = sprites.rip;
      if (!img) return;
      dh = PLAYER_H * 0.55;                          // rip is squat
      dw = (img.naturalWidth / img.naturalHeight) * dh;
      anchorX = player.x - dw * 0.5;
      anchorY = groundY - dh;                         // bottom on ground
    } else if (player.grounded) {
      img = sprites.walk;
      if (!img) return;
      dh = PLAYER_H;
      dw = (img.naturalWidth / img.naturalHeight) * dh;
      anchorX = player.x - dw * 0.5;
      anchorY = player.y;                             // player.y is already top of hitbox
    } else {
      img = sprites.jump;
      if (!img) return;
      dh = PLAYER_H * 1.05;                          // jump sprite is a bit bigger
      dw = (img.naturalWidth / img.naturalHeight) * dh;
      anchorX = player.x - dw * 0.5;
      anchorY = player.y - dh * 0.08;                // slight upward nudge so feet clear ground nicely
    }

    // Subtle ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(player.x, groundY + 2, dw * 0.42, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(img, anchorX, anchorY, dw, dh);
  }

  // ----------------------------------------------------------------
  // MAIN LOOP
  // ----------------------------------------------------------------
  function gameLoop() {
    if (!player.grounded) {
        const title = document.getElementById('game-title');
        if (title) title.style.opacity = '0';
    }

    ctx.clearRect(0, 0, gW, gH);
    const groundY = gH * GROUND_Y_RATIO;
    const speed   = OBSTACLE_SPEED + gameTime * SPEED_RAMP;

    drawBackground(groundY);

    // --- update (only while alive) ---
    if (!gameOver) {
      gameTime++;
      spawnTimer++;
      if (spawnTimer >= spawnInterval) {
        spawnObstacle();
        spawnTimer = 0;
        spawnInterval = Math.max(48, 90 - gameTime * 0.02);
      }

      // Player physics
      player.vy += GRAVITY;
      player.y  += player.vy;
      const pBottom = groundY - PLAYER_H;
      if (player.y >= pBottom) {
        player.y     = pBottom;
        player.vy    = 0;
        player.grounded = true;
      }

      // Move obstacles + collision
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        if (o.falling) {
          o.vy += 0.5;
          o.y  += o.vy;
          if (o.y + o.h >= groundY) { o.y = groundY - o.h; o.falling = false; o.vy = 0; }
        } else {
          o.x -= speed;
        }
        if (o.x + (o.w||40) < -80) { obstacles.splice(i, 1); continue; }

        // AABB — slightly shrunk for fairness
        const ox = o.x;
        const oy = o.falling ? o.y : (groundY - o.h);
        const px = player.x - PLAYER_W * 0.38;
        const py = player.y;

        if ( px + PLAYER_W*0.7  > ox      &&
             px + PLAYER_W*0.12 < ox+o.w  &&
             py + PLAYER_H*0.88 > oy      &&
             py                 < oy+o.h ) {

          gameOver  = true;
          deathFrame = true;
          cleanup();

          // Show rip sprite for ~900ms, then fade to death screen
          setTimeout(() => {
            showScreen('death');
            const dt = document.getElementById('death-text');
            setTimeout(() => { dt.classList.add('visible');    }, 200);
            setTimeout(() => { dt.classList.remove('visible'); }, 3800);
            setTimeout(() => { showScreen('menu');             }, 5600);
          }, 900);
        }
      }

      document.getElementById('dist').textContent = Math.floor(gameTime * 0.28);
    }

    // Draw obstacles
    obstacles.forEach(o => drawObstacle(o, groundY));

    // Draw player sprite
    drawPlayer(groundY);

    // Hide tap hint after first jump
    if (!player.grounded) document.getElementById('tap-hint').classList.remove('show');

    requestAnimationFrame(gameLoop);
  }

  // Initialise player position
  player.x = gW * 0.18;
  player.y = gH * GROUND_Y_RATIO - PLAYER_H;

  gameLoop();
}