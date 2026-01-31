/**
 * menu-scene.js
 * Looping menu background with sprite-based penguins.
 *
 * Choreography:
 *   - 4 penguins start together in the centre-left.
 *   - After a short delay the lone one peels off to the RIGHT
 *     (toward the mountains) while the other 3 continue LEFT.
 *   - When any penguin exits the screen it wraps to the other side
 *     and the whole cycle repeats.
 *
 * Call startMenuScene() once after the menu becomes visible.
 */

function startMenuScene() {
  const canvas = document.getElementById('scene-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- time ----
  let t = 0;

  // ---- mountains (generated once) ----
  const mtn1 = [], mtn2 = [];
  for (let i = 0; i < 8; i++) {
    mtn1.push({ x: i * 220 - 100, w: 280, h: 180 + Math.random() * 120 });
    mtn2.push({ x: i * 180 - 80,  w: 220, h: 100 + Math.random() * 100 });
  }

  // ---- stars ----
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random(), y: Math.random() * 0.4,
    s: 0.5 + Math.random() * 1.8, a: Math.random()
  }));

  // ---- snow ----
  const snow = Array.from({ length: 60 }, () => ({
    x: Math.random(), y: Math.random(),
    s: 0.5 + Math.random() * 2, sp: 0.3 + Math.random() * 1.2
  }));

  // ----------------------------------------------------------------
  // Penguin state objects
  //   index 0 = the lone one (goes RIGHT)
  //   index 1-3 = the flock  (go LEFT)
  // ----------------------------------------------------------------
  // Sprite render sizes (height we want on screen; width scales from image aspect)
  const PENG_H = 72;   // flock members smaller
  const LONE_H = 90;   // the lone penguin slightly bigger for focus

  function spriteW(img, drawH) {
    return img ? (img.naturalWidth / img.naturalHeight) * drawH : drawH;
  }

  // Penguins initialised fresh each cycle inside resetPenguins().
  let penguins = [];

  // Phase timing
  const WALK_TOGETHER_SECS = 1.4;   // seconds all walk left together
  const SPEED_FLOCK  = 38;          // px / sec  (flock walks left)
  const SPEED_LONE   = 34;          // px / sec  (lone one walks right)

  function resetPenguins() {
    // Everyone starts bunched together near centre-left
    const startX = W * 0.42;
    const groundY = H * 0.78;

    penguins = [
      // lone penguin — index 0
      { x: startX,       y: groundY, dir: -1, phase: 0, strayed: false, size: LONE_H },
      // flock — indices 1-3, slightly staggered
      { x: startX - 30,  y: groundY, dir: -1, phase: 0.8, strayed: false, size: PENG_H },
      { x: startX - 55,  y: groundY, dir: -1, phase: 1.9, strayed: false, size: PENG_H },
      { x: startX - 15,  y: groundY, dir: -1, phase: 2.7, strayed: false, size: PENG_H }
    ];
  }
  resetPenguins();

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------
  function drawMountains(layer, baseY, col1, col2, offX) {
    layer.forEach(m => {
      const mx = m.x + offX;
      ctx.beginPath();
      ctx.moveTo(mx, baseY);
      ctx.lineTo(mx + m.w * 0.5, baseY - m.h);
      ctx.lineTo(mx + m.w, baseY);
      ctx.closePath();
      const g = ctx.createLinearGradient(mx, baseY - m.h, mx, baseY);
      g.addColorStop(0, col1); g.addColorStop(1, col2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  /**
   * Draw a single penguin sprite.
   * @param {object} p      – penguin state { x, y, dir, phase, size }
   * @param {number} elapsed – seconds since scene start (for walk cycle)
   */
  function drawPenguin(p, elapsed) {
    const img = sprites.idle || sprites.walk;  // default: walking sprite
    if (!img) return;

    const dh = p.size;
    const dw = spriteW(img, dh);

    // The penguin sprites face RIGHT by default.
    // If dir === -1 (walking left) we flip horizontally.
    ctx.save();

    // Position: anchor at bottom-centre of the sprite
    const drawX = p.x - dw * 0.5;
    const drawY = p.y - dh;

    if (p.dir === -1) {
      // Flip around the penguin's centre-x
      ctx.translate(p.x, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -dw * 0.5, drawY, dw, dh);
    } else {
      ctx.drawImage(img, drawX, drawY, dw, dh);
    }

    ctx.restore();
  }

  // ----------------------------------------------------------------
  // Main loop
  // ----------------------------------------------------------------
  function frame() {
    t += 0.016;   // ~60 fps
    ctx.clearRect(0, 0, W, H);

    const groundY = H * 0.78;

    // --- sky ---
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   '#0a0e1a');
    sky.addColorStop(0.5, '#121828');
    sky.addColorStop(1,   '#1a1f30');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // --- stars ---
    stars.forEach(s => {
      const tw = 0.3 + 0.7 * Math.sin(t * 2 + s.a * 10);
      ctx.fillStyle = `rgba(200,210,230,${tw * 0.6})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.s, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- mountains ---
    drawMountains(mtn2, H * 0.62, '#141b2a', '#1a2238', Math.sin(t * 0.05) * 15);
    drawMountains(mtn1, groundY,  '#0f1420', '#161d2e', Math.sin(t * 0.08) * 20);

    // --- ground ---
    const grd = ctx.createLinearGradient(0, groundY, 0, H);
    grd.addColorStop(0, '#111820');
    grd.addColorStop(1, '#0a0d14');
    ctx.fillStyle = grd;
    ctx.fillRect(0, groundY, W, H);

    // --- ice-path line ---
    ctx.strokeStyle = 'rgba(180,200,220,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.5, H);
    ctx.quadraticCurveTo(W * 0.5, H * 0.86, W * 0.7, groundY);
    ctx.stroke();

    // --- snow ---
    snow.forEach(s => {
      s.y += 0.0003 * s.sp;
      if (s.y > 1) { s.y = 0; s.x = Math.random(); }
      ctx.fillStyle = 'rgba(200,210,225,0.25)';
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.s * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // ----------------------------------------------------------------
    // Update & draw penguins
    // ----------------------------------------------------------------
    const dt = 0.016; // seconds per frame

    penguins.forEach((p, i) => {
      if (i === 0 && !p.strayed && t > WALK_TOGETHER_SECS) {
        // The lone penguin peels off to the right
        p.dir     = 1;
        p.strayed = true;
      }

      // Move
      const speed = (i === 0) ? SPEED_LONE : SPEED_FLOCK;
      p.x += p.dir * speed * dt;
      p.phase += dt * 4; // walk-cycle phase (not used for frame selection yet, but kept for future)

      // Wrap: if off-screen, reset the whole group
      if ((p.dir === 1 && p.x > W + 60) || (p.dir === -1 && p.x < -60)) {
        resetPenguins();
        t = 0; // restart timing so the stray delay fires again
        return; // stop updating this frame after reset
      }
    });

    // Draw back-to-front (flock first, lone penguin on top)
    // Sort: flock (indices 1-3) drawn first, lone (0) last
    [1, 2, 3, 0].forEach(i => {
      if (penguins[i]) drawPenguin(penguins[i], t);
    });

    requestAnimationFrame(frame);
  }

  frame();
}