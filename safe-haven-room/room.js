// Safe Haven first room — original code by Night Watch (Game Off 2026, theme SHIFT).
// Art is CC0; see CREDITS.md. Nothing here was installed or bought.
(function () {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = 480;
  const H = 270;
  const SCALE = 2;
  const TREE = { x: 240, y: 158, r: 16 };
  const START = { x: 240, y: 230 };
  const FRIEND_START = { x: 378, y: 176 };

  function load(name) {
    const img = new Image();
    img.src = "assets/" + name;
    return img;
  }

  const art = {
    hero: load("hero.png"),
    friend: load("friend.png"),
    life: load("tree-life.png"),
    edge: load("tree-edge.png"),
    wide: load("tree-wide.png"),
    small: load("tree-small.png"),
    gem: load("gem.png"),
    grass: load("grass.png"),
  };

  // A ring of trees around a clearing. The Tree of Life stands in the middle.
  const edgeTrees = [
    { kind: "wide", x: 36, y: 118 },
    { kind: "edge", x: 100, y: 78 },
    { kind: "small", x: 168, y: 64 },
    { kind: "small", x: 300, y: 62 },
    { kind: "edge", x: 360, y: 80 },
    { kind: "wide", x: 444, y: 120 },
    { kind: "edge", x: 40, y: 210 },
    { kind: "small", x: 86, y: 248 },
    { kind: "small", x: 400, y: 248 },
    { kind: "edge", x: 450, y: 210 },
    { kind: "small", x: 20, y: 160 },
    { kind: "small", x: 460, y: 164 },
  ];

  const gems = [
    { x: 132, y: 150 },
    { x: 348, y: 196 },
  ];

  const keys = Object.create(null);
  const player = { x: START.x, y: START.y, dir: 1, walk: 0, target: null };
  const friend = { x: FRIEND_START.x, y: FRIEND_START.y, dir: -1, walk: 0, following: false, home: false };

  // Start at night so the first view is the lantern-lit clearing.
  let day = false;
  let shiftFlash = 0;
  let tick = 0;

  function isDay() {
    return day;
  }

  function toggleShift() {
    day = !day;
    shiftFlash = 18;
  }

  function onKey(e, down) {
    const k = e.key;
    if (k === " " || k === "ArrowUp" || k === "ArrowDown" || k === "ArrowLeft" || k === "ArrowRight" || k === "Shift") {
      e.preventDefault();
    }
    if (!down) {
      keys[k] = 0;
      return;
    }
    keys[k] = 1;
    if (k === "Shift" && !e.repeat) toggleShift();
  }

  window.addEventListener("keydown", function (e) { onKey(e, true); });
  window.addEventListener("keyup", function (e) { onKey(e, false); });

  document.getElementById("shiftBtn").addEventListener("click", function (e) {
    e.preventDefault();
    toggleShift();
  });

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const src = (e.touches && e.touches[0]) || e;
    return {
      x: ((src.clientX - rect.left) / rect.width) * W,
      y: ((src.clientY - rect.top) / rect.height) * H,
    };
  }

  function setWalkTarget(e) {
    e.preventDefault();
    player.target = canvasPoint(e);
  }

  canvas.addEventListener("pointerdown", setWalkTarget);
  canvas.addEventListener("pointermove", function (e) {
    if (e.buttons) setWalkTarget(e);
  });

  function clampToClearing(ent) {
    const cx = 240;
    const cy = 168;
    const rx = 196;
    const ry = 96;
    let dx = ent.x - cx;
    let dy = ent.y - cy;
    const nx = dx / rx;
    const ny = dy / ry;
    const d2 = nx * nx + ny * ny;
    if (d2 > 1) {
      const d = Math.sqrt(d2);
      ent.x = cx + dx / d;
      ent.y = cy + dy / d;
    }
    const tdx = ent.x - TREE.x;
    const tdy = ent.y - TREE.y;
    const td = Math.hypot(tdx, tdy);
    if (td < TREE.r + 8 && td > 0) {
      const push = (TREE.r + 8) / td;
      ent.x = TREE.x + tdx * push;
      ent.y = TREE.y + tdy * push;
    }
  }

  function stepToward(ent, tx, ty, speed) {
    const dx = tx - ent.x;
    const dy = ty - ent.y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return false;
    const s = Math.min(speed, d);
    ent.x += (dx / d) * s;
    ent.y += (dy / d) * s;
    if (Math.abs(dx) > 0.4) ent.dir = dx < 0 ? -1 : 1;
    ent.walk += 1;
    return true;
  }

  function lanternPos() {
    // The golden lantern sits on the hero's right, which is +x when facing right
    // and -x once the sprite is flipped to face left.
    return {
      x: player.x + player.dir * 10,
      y: player.y - 18,
    };
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function friendVisible() {
    if (isDay()) return false;
    const lantern = lanternPos();
    return Math.hypot(friend.x - lantern.x, friend.y - 20 - lantern.y) < 92;
  }

  function update() {
    tick += 1;

    let mx = 0;
    let my = 0;
    if (keys.ArrowLeft || keys.a || keys.A) mx -= 1;
    if (keys.ArrowRight || keys.d || keys.D) mx += 1;
    if (keys.ArrowUp || keys.w || keys.W) my -= 1;
    if (keys.ArrowDown || keys.s || keys.S) my += 1;

    if (mx || my) {
      player.target = null;
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx / len) * 1.35;
      player.y += (my / len) * 1.35;
      if (mx) player.dir = mx < 0 ? -1 : 1;
      player.walk += 1;
    } else if (player.target) {
      const moving = stepToward(player, player.target.x, player.target.y, 1.35);
      if (!moving) player.target = null;
    }

    clampToClearing(player);

    if (!friend.home && !isDay() && dist(player, friend) < 44) {
      friend.following = true;
    }

    if (friend.home) {
      stepToward(friend, TREE.x + 22, TREE.y + 4, 0.7);
      clampToClearing(friend);
    } else if (friend.following) {
      if (dist(player, friend) > 22) {
        stepToward(friend, player.x, player.y, 1.15);
        clampToClearing(friend);
      }
      if (dist(friend, TREE) < 36) {
        friend.home = true;
        friend.following = false;
      }
    }

    if (shiftFlash > 0) shiftFlash -= 1;
  }

  // Draw a character sprite centered at the feet (x, y).
  function figure(img, x, y, dir) {
    const w = img.width * SCALE;
    const h = img.height * SCALE;
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.scale(dir, 1);
    ctx.drawImage(img, 0, 0, img.width, img.height, -w / 2, -h + 4, w, h);
    ctx.restore();
  }

  function tree(img, x, y, scale) {
    const s = scale || SCALE;
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, 0, 0, img.width, img.height, Math.round(x - w / 2), Math.round(y - h + 6), w, h);
  }

  function lanternGlow(x, y, radius, alpha) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, radius);
    g.addColorStop(0, "rgba(255,214,120," + alpha + ")");
    g.addColorStop(0.35, "rgba(255,186,80," + alpha * 0.35 + ")");
    g.addColorStop(1, "rgba(255,186,80,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function statusText() {
    const world = isDay() ? "Day" : "Night";
    if (friend.home) return world + " · Home. You are safe here.";
    if (friend.following) return world + " · The friend is following you. Lead them to the tree.";
    if (isDay()) return world + " · A friend is waiting in the dark. Press Shift.";
    if (friendVisible()) return world + " · A lost friend is in the lantern light.";
    return world + " · Walk the lantern toward the eastern trees.";
  }

  function drawSky() {
    if (isDay()) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#7ea4d4");
      g.addColorStop(0.45, "#c9b38a");
      g.addColorStop(1, "#d9c59a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,220,150,0.85)";
      ctx.beginPath();
      ctx.arc(86, 42, 16, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0a1020");
      g.addColorStop(0.55, "#14182c");
      g.addColorStop(1, "#1a2230");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#d7def8";
      for (let i = 0; i < 36; i++) {
        const sx = (i * 97 + 13) % W;
        const sy = (i * 53 + 8) % 110;
        const tw = ((tick + i * 9) % 80) < 6 ? 2 : 1;
        ctx.fillRect(sx, sy, tw, tw);
      }
    }
  }

  function drawGrass() {
    const tile = 32;
    for (let y = 70; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        const variant = (x / tile + y / tile * 3) % 3 | 0;
        ctx.drawImage(art.grass, variant * 32, 0, 32, 32, x, y, tile, tile);
      }
    }
    if (isDay()) {
      ctx.fillStyle = "rgba(255, 210, 120, 0.14)";
    } else {
      ctx.fillStyle = "rgba(10, 16, 40, 0.42)";
    }
    ctx.fillRect(0, 70, W, H - 70);
    const fade = ctx.createLinearGradient(0, 58, 0, 92);
    if (isDay()) {
      fade.addColorStop(0, "rgba(201, 179, 138, 0.85)");
      fade.addColorStop(1, "rgba(201, 179, 138, 0)");
    } else {
      fade.addColorStop(0, "rgba(16, 20, 40, 0.7)");
      fade.addColorStop(1, "rgba(16, 20, 40, 0)");
    }
    ctx.fillStyle = fade;
    ctx.fillRect(0, 58, W, 34);
  }

  function drawGems() {
    if (isDay()) return;
    const frame = Math.floor(tick / 6) % 10;
    for (const g of gems) {
      const bob = Math.sin(tick / 14 + g.x) * 2;
      ctx.drawImage(art.gem, frame * 18, 0, 18, 30, Math.round(g.x - 9), Math.round(g.y - 26 + bob), 18, 30);
    }
  }

  function draw() {
    drawSky();
    drawGrass();

    // Far trees first, then the Tree of Life, then people, then near trees.
    const far = edgeTrees.filter(function (t) { return t.y < TREE.y; });
    const near = edgeTrees.filter(function (t) { return t.y >= TREE.y; });
    far.sort(function (a, b) { return a.y - b.y; });
    near.sort(function (a, b) { return a.y - b.y; });

    for (const t of far) tree(art[t.kind], t.x, t.y, t.kind === "wide" ? 2 : SCALE);

    drawGems();

    const lantern = lanternPos();
    lanternGlow(lantern.x, lantern.y, isDay() ? 36 : 90 + Math.sin(tick / 10) * 4, isDay() ? 0.28 : 0.55);

    const actors = [
      { y: TREE.y, draw: function () { tree(art.life, TREE.x, TREE.y, 2); } },
      { y: friend.y, draw: drawFriend },
      { y: player.y, draw: drawPlayer },
    ].sort(function (a, b) { return a.y - b.y; });
    for (const a of actors) a.draw();

    for (const t of near) tree(art[t.kind], t.x, t.y, t.kind === "wide" ? 2 : SCALE);

    if (!isDay()) {
      const g = ctx.createRadialGradient(lantern.x, lantern.y, 16, lantern.x, lantern.y, 170);
      g.addColorStop(0, "rgba(0,0,10,0.04)");
      g.addColorStop(0.45, "rgba(0,0,16,0.38)");
      g.addColorStop(1, "rgba(4,6,18,0.78)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    if (shiftFlash > 0) {
      ctx.fillStyle = "rgba(255,240,200," + (shiftFlash / 36) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(8,10,16,0.45)";
    ctx.fillRect(0, 0, W, 16);
    ctx.fillStyle = "#fff";
    ctx.font = "10px system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(statusText(), 8, 4);
  }

  function drawPlayer() {
    figure(art.hero, player.x, player.y, player.dir);
  }

  function drawFriend() {
    const see = friend.home || friend.following || friendVisible();
    if (!see && isDay()) {
      ctx.globalAlpha = 0.28;
      figure(art.friend, friend.x, friend.y, friend.dir);
      ctx.globalAlpha = 1;
      return;
    }
    if (!see) return;
    if (friend.home) {
      lanternGlow(friend.x, friend.y - 22, 28, 0.35);
    }
    figure(art.friend, friend.x, friend.y, friend.dir);
  }

  function frame() {
    update();
    draw();
    requestAnimationFrame(frame);
  }

  const ready = Object.values(art).map(function (img) {
    return img.decode ? img.decode() : new Promise(function (resolve) {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  window.__haven = function () {
    return {
      day: isDay(),
      following: friend.following,
      home: friend.home,
      visible: friendVisible() || friend.following || friend.home,
      status: statusText(),
      player: { x: player.x, y: player.y },
      friend: { x: friend.x, y: friend.y },
    };
  };

  Promise.all(ready).then(function () {
    document.body.dataset.ready = "1";
    frame();
  });
})();
