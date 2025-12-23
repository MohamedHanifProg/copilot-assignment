const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const ui = {
  score: document.getElementById("score"),
  hp: document.getElementById("hp"),
  level: document.getElementById("level"),
  progress: document.getElementById("progress"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  btnRestart: document.getElementById("btnRestart"),
};

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

// ---------- Input ----------
const keys = new Set();
addEventListener("keydown", (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key.toLowerCase() === "r") restart();
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

ui.btnRestart.addEventListener("click", restart);

// ---------- Game state ----------
let t = 0;
let running = true;

const world = {
  gravity: 1600,
  floorY: () => innerHeight - 90,
};

const player = {
  x: innerWidth / 2,
  y: world.floorY(),
  vx: 0,
  vy: 0,
  w: 34,
  h: 44,
  speed: 760,
  jump: 680,
  onGround: true,
};

let score = 0;
let hp = 3;
let level = 1;
let progress = 0; // 0..100

const hazards = [];
const coins = [];
const particles = [];

function rand(a, b) { return a + Math.random() * (b - a); }

function spawnHazard() {
  const fromLeft = Math.random() < 0.5;
  hazards.push({
    x: fromLeft ? -40 : innerWidth + 40,
    y: world.floorY() + rand(8, 40),
    r: rand(10, 18),
    vx: fromLeft ? rand(260, 520) : -rand(260, 520),
  });
}

function spawnCoin() {
  coins.push({
    x: rand(60, innerWidth - 60),
    y: world.floorY() - rand(60, 240),
    r: 10,
    wob: rand(0, Math.PI * 2),
  });
}

function burst(x, y, n, power, neon = "rgba(0,255,225,") {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    particles.push({
      x, y,
      vx: Math.cos(a) * rand(40, power),
      vy: Math.sin(a) * rand(40, power),
      life: rand(0.35, 0.75),
      age: 0,
      neon,
    });
  }
}

function rectCircleHit(rx, ry, rw, rh, cx, cy, cr) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy <= cr * cr;
}

let hazardTimer = 0;
let coinTimer = 0;

function restart() {
  score = 0; hp = 3; level = 1; progress = 0;
  hazards.length = 0; coins.length = 0; particles.length = 0;
  player.x = innerWidth / 2;
  player.y = world.floorY();
  player.vx = 0; player.vy = 0; player.onGround = true;
  running = true;
  ui.overlay.classList.add("hidden");
}

// ---------- Loop ----------
let last = performance.now();
requestAnimationFrame(loop);

function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (running) update(dt);
  draw(dt);

  requestAnimationFrame(loop);
}

function update(dt) {
  t += dt;

  // difficulty scales with level
  const hazardRate = Math.max(0.25, 1.1 - level * 0.08);
  const coinRate = Math.max(0.55, 1.35 - level * 0.06);

  hazardTimer += dt;
  coinTimer += dt;

  if (hazardTimer >= hazardRate) {
    hazardTimer = 0;
    spawnHazard();
    // sometimes spawn a second
    if (level >= 4 && Math.random() < 0.35) spawnHazard();
  }

  if (coinTimer >= coinRate) {
    coinTimer = 0;
    spawnCoin();
  }

  // Input -> velocity
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const jump = keys.has("arrowup") || keys.has("w") || keys.has(" ");

  let target = 0;
  if (left) target -= 1;
  if (right) target += 1;

  // smooth acceleration
  const accel = 12;
  player.vx += (target * player.speed - player.vx) * Math.min(1, accel * dt);

  // jump
  if (jump && player.onGround) {
    player.vy = -player.jump;
    player.onGround = false;
    burst(player.x, player.y + player.h, 16, 220, "rgba(255,61,245,");
  }

  // physics
  player.vy += world.gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // bounds
  player.x = Math.max(10, Math.min(innerWidth - player.w - 10, player.x));
  const floor = world.floorY();
  if (player.y >= floor) {
    player.y = floor;
    player.vy = 0;
    player.onGround = true;
  }

  // move hazards
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.x += h.vx * dt;

    // offscreen cleanup
    if (h.x < -120 || h.x > innerWidth + 120) hazards.splice(i, 1);

    // collision
    if (rectCircleHit(player.x, player.y, player.w, player.h, h.x, h.y, h.r)) {
      hazards.splice(i, 1);
      hp--;
      burst(player.x + player.w / 2, player.y + player.h / 2, 26, 260, "rgba(255,80,120,");
      glitchKick(0.35);

      if (hp <= 0) end(false);
    }
  }

  // coins + wobble
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    c.wob += dt * 6;
    const cy = c.y + Math.sin(c.wob) * 6;

    if (rectCircleHit(player.x, player.y, player.w, player.h, c.x, cy, c.r + 2)) {
      coins.splice(i, 1);
      score += 10;
      progress = Math.min(100, progress + 6);
      burst(c.x, cy, 18, 230, "rgba(0,255,225,");
      if (progress >= 100) {
        level++;
        progress = 0;
        score += 50;
        burst(innerWidth / 2, innerHeight / 2, 50, 420, "rgba(255,61,245,");
        glitchKick(0.55);
        if (level >= 8) end(true);
      }
    }
  }

  // particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.001, dt);
    p.vy *= Math.pow(0.001, dt);
    if (p.age >= p.life) particles.splice(i, 1);
  }

  // UI
  ui.score.textContent = String(score);
  ui.hp.textContent = String(hp);
  ui.level.textContent = String(level);
  ui.progress.style.width = `${progress}%`;
}

function end(win) {
  running = false;
  ui.overlay.classList.remove("hidden");
  ui.overlayTitle.textContent = win ? "Arcade Restored!" : "Game Over";
  ui.overlayText.textContent = win
    ? `You stabilized the glitch. Final score: ${score}`
    : `The glitch won this run. Final score: ${score}`;
}

// ---------- Drawing (with glitch effect) ----------
let glitchTime = 0;
function glitchKick(sec) { glitchTime = Math.max(glitchTime, sec); }

function draw(dt) {
  // background
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  // scanlines
  ctx.globalAlpha = 0.10;
  for (let y = 0; y < innerHeight; y += 4) {
    ctx.fillRect(0, y, innerWidth, 1);
  }
  ctx.globalAlpha = 1;

  // floor
  const floor = world.floorY();
  ctx.fillStyle = "rgba(0,255,225,0.10)";
  ctx.fillRect(0, floor + player.h, innerWidth, innerHeight - floor);
  ctx.strokeStyle = "rgba(0,255,225,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, floor + player.h);
  ctx.lineTo(innerWidth, floor + player.h);
  ctx.stroke();

  // hazards
  for (const h of hazards) {
    glowCircle(h.x, h.y, h.r, "rgba(255,61,245,0.85)");
  }

  // coins
  for (const c of coins) {
    const cy = c.y + Math.sin(c.wob) * 6;
    glowCircle(c.x, cy, c.r, "rgba(0,255,225,0.85)");
    // tiny highlight
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(c.x - 3, cy - 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // player
  drawPlayer(player.x, player.y, player.w, player.h);

  // particles
  for (const p of particles) {
    const a = 1 - p.age / p.life;
    ctx.fillStyle = p.neon + (0.65 * a) + ")";
    ctx.fillRect(p.x, p.y, 2.2, 2.2);
  }

  // glitch overlay (brief)
  if (glitchTime > 0) {
    glitchTime -= dt;
    const strength = Math.min(1, glitchTime * 3);
    const bands = Math.floor(8 + strength * 18);

    for (let i = 0; i < bands; i++) {
      const y = rand(0, innerHeight);
      const h = rand(6, 22);
      const xShift = rand(-18, 18) * strength;
      ctx.drawImage(canvas, 0, y, innerWidth, h, xShift, y, innerWidth, h);
    }
  }
}

function glowCircle(x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer(x, y, w, h) {
  // body
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(0,255,225,0.55)";
  ctx.fillStyle = "rgba(0,255,225,0.22)";
  ctx.fillRect(x, y, w, h);

  // outline
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(0,255,225,0.75)";
  ctx.strokeRect(x, y, w, h);

  // “core”
  ctx.fillStyle = "rgba(255,61,245,0.25)";
  ctx.fillRect(x + 8, y + 10, w - 16, h - 20);

  ctx.restore();
}
