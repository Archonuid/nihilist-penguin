// loader.js
const sprites = {};
let SPRITES_READY = false;

const sheet = new Image();
sheet.src = 'assets/penguin-sheet.png'; // <-- your sprite image

sheet.onload = () => {
  const sw = sheet.naturalWidth / 2;
  const sh = sheet.naturalHeight / 2;

  // helper to extract a quadrant into its own canvas-image
  function slice(x, y) {
    const c = document.createElement('canvas');
    c.width = sw;
    c.height = sh;
    const ctx = c.getContext('2d');
    ctx.drawImage(
      sheet,
      x * sw, y * sh, sw, sh,
      0, 0, sw, sh
    );
    const img = new Image();
    img.src = c.toDataURL();
    return img;
  }

  // quadrant mapping:
  // [0,0] top-left     → walk
  // [1,0] top-right    → idle
  // [0,1] bottom-left  → jump
  // [1,1] bottom-right → rip
  sprites.walk = slice(0, 0);
  sprites.idle = slice(1, 0);
  sprites.jump = slice(0, 1);
  sprites.rip  = slice(1, 1);

  SPRITES_READY = true;
  initApp();
};
