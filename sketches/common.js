/* Shared helpers for the p5.js sketches in the Matrix course.
   Math plane: origin at the center, Y pointing up, one unit = SCALE pixels.
*/

const MatrixCours = (() => {
  const SCALE = 32;

  // Math plane (origin at center, Y up) -> p5 screen (origin top-left, Y down)
  function worldToScreen(p, x, y) {
    return { x: p.width / 2 + x * SCALE, y: p.height / 2 - y * SCALE };
  }

  function screenToWorld(p, sx, sy) {
    return { x: (sx - p.width / 2) / SCALE, y: (p.height / 2 - sy) / SCALE };
  }

  function drawGrid(p, opts = {}) {
    const { step = 1, color = '#e5e1d6', axisColor = '#4a4a4a' } = opts;
    p.push();
    p.strokeWeight(1);

    p.stroke(color);
    const halfX = Math.ceil((p.width / 2) / SCALE);
    const halfY = Math.ceil((p.height / 2) / SCALE);
    for (let i = -halfX; i <= halfX; i += step) {
      const a = worldToScreen(p, i, -halfY);
      const b = worldToScreen(p, i, halfY);
      p.line(a.x, a.y, b.x, b.y);
    }
    for (let j = -halfY; j <= halfY; j += step) {
      const a = worldToScreen(p, -halfX, j);
      const b = worldToScreen(p, halfX, j);
      p.line(a.x, a.y, b.x, b.y);
    }

    p.stroke(axisColor);
    p.strokeWeight(1.2);
    const cx = worldToScreen(p, 0, 0);
    p.line(0, cx.y, p.width, cx.y);
    p.line(cx.x, 0, cx.x, p.height);

    p.noStroke();
    p.fill(axisColor);
    p.textSize(10);
    p.textAlign(p.LEFT, p.TOP);
    for (let i = -halfX; i <= halfX; i++) {
      if (i === 0) continue;
      const pos = worldToScreen(p, i, 0);
      p.text(i, pos.x + 2, pos.y + 2);
    }
    for (let j = -halfY; j <= halfY; j++) {
      if (j === 0) continue;
      const pos = worldToScreen(p, 0, j);
      p.text(j, pos.x + 4, pos.y - 6);
    }
    p.pop();
  }

  function drawArrow(p, fromX, fromY, toX, toY, opts = {}) {
    const { color = '#1f3a8a', weight = 2.5, head = 10, label = null, labelOffset = 12 } = opts;
    const a = worldToScreen(p, fromX, fromY);
    const b = worldToScreen(p, toX, toY);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) return;
    const ux = dx / len;
    const uy = dy / len;
    const tipX = b.x - ux * head * 0.6;
    const tipY = b.y - uy * head * 0.6;

    p.push();
    p.stroke(color);
    p.strokeWeight(weight);
    p.line(a.x, a.y, tipX, tipY);

    p.noStroke();
    p.fill(color);
    const px = -uy;
    const py = ux;
    p.triangle(
      b.x, b.y,
      tipX + px * head * 0.45, tipY + py * head * 0.45,
      tipX - px * head * 0.45, tipY - py * head * 0.45
    );

    if (label) {
      p.fill(color);
      p.textSize(14);
      p.textStyle(p.ITALIC);
      p.textAlign(p.CENTER, p.CENTER);
      const lx = b.x + ux * labelOffset + px * labelOffset * 0.6;
      const ly = b.y + uy * labelOffset + py * labelOffset * 0.6;
      p.text(label, lx, ly);
    }
    p.pop();
  }

  function drawDashedArrow(p, fromX, fromY, toX, toY, opts = {}) {
    const { color = '#8a8a85', weight = 1.5 } = opts;
    const a = worldToScreen(p, fromX, fromY);
    const b = worldToScreen(p, toX, toY);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const segs = Math.max(2, Math.floor(len / 8));

    p.push();
    p.stroke(color);
    p.strokeWeight(weight);
    p.drawingContext.setLineDash([4, 4]);
    p.line(a.x, a.y, b.x, b.y);
    p.drawingContext.setLineDash([]);
    p.pop();
  }

  function drawHandle(p, x, y, opts = {}) {
    const { color = '#1f3a8a', radius = 7, hover = false } = opts;
    const s = worldToScreen(p, x, y);
    p.push();
    p.noStroke();
    p.fill(255);
    p.circle(s.x, s.y, radius * 2 + 4);
    p.fill(color);
    p.circle(s.x, s.y, hover ? radius * 2 + 2 : radius * 2);
    p.pop();
  }

  function distanceScreenToWorld(p, sx, sy, wx, wy) {
    const target = worldToScreen(p, wx, wy);
    return Math.hypot(sx - target.x, sy - target.y);
  }

  return {
    SCALE,
    worldToScreen,
    screenToWorld,
    drawGrid,
    drawArrow,
    drawDashedArrow,
    drawHandle,
    distanceScreenToWorld,
    colors: {
      u: '#1f3a8a',
      v: '#b45309',
      sum: '#059669',
      scaled: '#7c3aed',
      ghost: '#8a8a85',
    }
  };
})();
