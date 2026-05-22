/* Ch3 §1 — Sketches for "What is a linear transformation".
   Two sketches: visual hook + linearity check.
*/
(function () {
  const M = MatrixCours;
  const C = M.colors;

  // ============================================================
  // SKETCH 1: Deformer — visual hook
  // ============================================================
  let mat = { a: 1, b: 0, c: 0, d: 1 };

  function setupSlider(id, key) {
    const s = document.getElementById(`deformer-${id}-slider`);
    const r = document.getElementById(`deformer-${id}-readout`);
    if (s) s.addEventListener('input', () => {
      mat[key] = parseFloat(s.value);
      if (r) r.textContent = mat[key].toFixed(2);
    });
  }
  setupSlider('a', 'a');
  setupSlider('b', 'b');
  setupSlider('c', 'c');
  setupSlider('d', 'd');

  function applyPreset(a, b, c, d) {
    mat = { a, b, c, d };
    [['a', a], ['b', b], ['c', c], ['d', d]].forEach(([k, v]) => {
      const slider = document.getElementById(`deformer-${k}-slider`);
      const readout = document.getElementById(`deformer-${k}-readout`);
      if (slider) slider.value = v;
      if (readout) readout.textContent = v.toFixed(2);
    });
  }

  const presets = {
    'identite': [1, 0, 0, 1],
    'rotation': [0, -1, 1, 0],
    'scaling': [1.5, 0, 0, 1.5],
    'shear': [1, 1, 0, 1],
    'reflex': [1, 0, 0, -1],
    'aplatir': [1, 1, 1, 1],
  };
  Object.entries(presets).forEach(([id, vals]) => {
    const btn = document.getElementById(`deformer-preset-${id}`);
    if (btn) btn.addEventListener('click', () => applyPreset(...vals));
  });

  new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(620, 440);
      c.parent('deformer-canvas');
      c.canvas.classList.add('sketch-canvas');
      p.textFont('JetBrains Mono, monospace');
    };

    p.draw = () => {
      p.background('#fcfaf4');
      M.drawGrid(p, { color: '#eee9d8', axisColor: '#b8b39c' });

      // Deformed grid
      const K = 6;
      p.push();
      p.stroke('rgba(184, 67, 31, 0.4)');
      p.strokeWeight(1);
      for (let i = -K; i <= K; i++) {
        const x0 = mat.a * i + mat.b * (-K);
        const y0 = mat.c * i + mat.d * (-K);
        const x1 = mat.a * i + mat.b * (K);
        const y1 = mat.c * i + mat.d * (K);
        const a = M.worldToScreen(p, x0, y0);
        const b = M.worldToScreen(p, x1, y1);
        p.line(a.x, a.y, b.x, b.y);
      }
      for (let j = -K; j <= K; j++) {
        const x0 = mat.a * (-K) + mat.b * j;
        const y0 = mat.c * (-K) + mat.d * j;
        const x1 = mat.a * (K) + mat.b * j;
        const y1 = mat.c * (K) + mat.d * j;
        const a = M.worldToScreen(p, x0, y0);
        const b = M.worldToScreen(p, x1, y1);
        p.line(a.x, a.y, b.x, b.y);
      }
      p.pop();

      // Transformed unit square
      const corners = [
        { x: 0, y: 0 },
        { x: mat.a, y: mat.c },
        { x: mat.a + mat.b, y: mat.c + mat.d },
        { x: mat.b, y: mat.d },
      ];
      p.push();
      p.noStroke();
      p.fill('rgba(30, 90, 122, 0.18)');
      p.beginShape();
      corners.forEach(pt => {
        const s = M.worldToScreen(p, pt.x, pt.y);
        p.vertex(s.x, s.y);
      });
      p.endShape(p.CLOSE);
      p.pop();

      // T(i) in dark blue, T(j) in terracotta
      M.drawArrow(p, 0, 0, mat.a, mat.c, { color: '#1e5a7a', label: 'T(i)', weight: 3 });
      M.drawArrow(p, 0, 0, mat.b, mat.d, { color: '#b8431f', label: 'T(j)', weight: 3 });

      // Info text
      const det = mat.a * mat.d - mat.b * mat.c;
      p.noStroke();
      p.fill('#4d473d');
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      p.text(`M = [[${mat.a.toFixed(2)}, ${mat.b.toFixed(2)}], [${mat.c.toFixed(2)}, ${mat.d.toFixed(2)}]]`, 12, 12);

      let detMsg;
      let detColor;
      if (Math.abs(det) < 0.001) { detMsg = 'singular (image is flattened)'; detColor = '#b07a1a'; }
      else if (det > 0) { detMsg = 'orientation preserved'; detColor = '#1e5a7a'; }
      else { detMsg = 'orientation flipped (mirror)'; detColor = '#b8431f'; }
      p.fill(detColor);
      p.text(`det = ${det.toFixed(2)}  —  ${detMsg}`, 12, 30);
    };
  });

  // ============================================================
  // SKETCH 2: Linearity check
  // Visually compare T(u+v) against T(u)+T(v)
  // ============================================================
  let mode = 'lineaire'; // 'lineaire' | 'translation' | 'carre'
  const btnLin = document.getElementById('verif-mode-lineaire');
  const btnTrans = document.getElementById('verif-mode-translation');
  const btnCarre = document.getElementById('verif-mode-carre');
  function setMode(m) {
    mode = m;
    [['lineaire', btnLin], ['translation', btnTrans], ['carre', btnCarre]].forEach(([k, b]) => {
      if (b) b.style.background = (k === m) ? 'var(--accent-soft)' : 'var(--bg-soft)';
    });
  }
  if (btnLin) btnLin.addEventListener('click', () => setMode('lineaire'));
  if (btnTrans) btnTrans.addEventListener('click', () => setMode('translation'));
  if (btnCarre) btnCarre.addEventListener('click', () => setMode('carre'));
  setMode('lineaire');

  function applyT(v) {
    if (mode === 'lineaire') {
      return { x: v.x - 0.3 * v.y, y: 0.5 * v.x + v.y };
    }
    if (mode === 'translation') {
      return { x: v.x + 1, y: v.y + 0.5 };
    }
    if (mode === 'carre') {
      return { x: Math.sign(v.x) * v.x * v.x * 0.4, y: Math.sign(v.y) * v.y * v.y * 0.4 };
    }
    return v;
  }

  new p5((p) => {
    let u = { x: 2, y: 1 };
    let v = { x: 1, y: 2 };
    let dragging = null;

    p.setup = () => {
      const c = p.createCanvas(620, 380);
      c.parent('verif-canvas');
      c.canvas.classList.add('sketch-canvas');
      p.textFont('JetBrains Mono, monospace');
    };

    p.draw = () => {
      p.background('#fcfaf4');
      M.drawGrid(p, { color: '#eee9d8', axisColor: '#b8b39c' });

      const Tu = applyT(u);
      const Tv = applyT(v);
      const sum = { x: u.x + v.x, y: u.y + v.y };
      const TsumLeft = applyT(sum);                // T(u + v)
      const TsumRight = { x: Tu.x + Tv.x, y: Tu.y + Tv.y };  // T(u) + T(v)

      // T(u) and T(v) in light dashed lines
      M.drawDashedArrow(p, 0, 0, Tu.x, Tu.y, { color: '#94aab3' });
      M.drawDashedArrow(p, 0, 0, Tv.x, Tv.y, { color: '#d4a999' });

      // T(u) + T(v): built head-to-tail
      M.drawArrow(p, 0, 0, Tu.x, Tu.y, { color: '#1e5a7a', weight: 2 });
      M.drawArrow(p, Tu.x, Tu.y, TsumRight.x, TsumRight.y, { color: '#b8431f', weight: 2 });
      // The point T(u) + T(v) (constructed sum)
      const RS = M.worldToScreen(p, TsumRight.x, TsumRight.y);
      p.push();
      p.noStroke();
      p.fill('#7c3aed');
      p.circle(RS.x, RS.y, 14);
      p.fill('#fff');
      p.stroke('#7c3aed');
      p.strokeWeight(2);
      p.circle(RS.x, RS.y, 14);
      p.pop();

      // T(u+v): direct point
      const LS = M.worldToScreen(p, TsumLeft.x, TsumLeft.y);
      p.push();
      p.fill('#059669');
      p.noStroke();
      p.circle(LS.x, LS.y, 16);
      p.fill('#fff');
      p.stroke('#059669');
      p.strokeWeight(2);
      p.circle(LS.x, LS.y, 16);
      p.pop();

      // Labels
      p.noStroke();
      p.fill('#059669');
      p.textSize(12);
      p.textStyle(p.ITALIC);
      p.textAlign(p.LEFT, p.CENTER);
      p.text('T(u+v)', LS.x + 12, LS.y - 8);
      p.fill('#7c3aed');
      p.text('T(u)+T(v)', RS.x + 12, RS.y + 12);

      // Original vectors u, v (dashed translation for the sum)
      M.drawArrow(p, 0, 0, u.x, u.y, { color: '#1f3a8a', label: 'u', weight: 2.5 });
      M.drawArrow(p, 0, 0, v.x, v.y, { color: '#b45309', label: 'v', weight: 2.5 });

      // Handles
      const mx = p.mouseX, my = p.mouseY;
      const overU = M.distanceScreenToWorld(p, mx, my, u.x, u.y) < 12;
      const overV = M.distanceScreenToWorld(p, mx, my, v.x, v.y) < 12;
      M.drawHandle(p, u.x, u.y, { color: '#1f3a8a', hover: overU || dragging === 'u' });
      M.drawHandle(p, v.x, v.y, { color: '#b45309', hover: overV || dragging === 'v' });

      // Distance between the two points: verdict
      const diff = Math.hypot(TsumLeft.x - TsumRight.x, TsumLeft.y - TsumRight.y);
      const verdict = diff < 0.001 ? 'T(u+v) = T(u)+T(v) ✓  → linear' : `gap = ${diff.toFixed(2)} → NOT linear`;
      const verdictColor = diff < 0.001 ? '#059669' : '#dc2626';
      p.fill(verdictColor);
      p.textStyle(p.NORMAL);
      p.textSize(13);
      p.textAlign(p.CENTER, p.TOP);
      p.text(verdict, p.width / 2, 12);

      p.cursor((overU || overV || dragging) ? 'grab' : 'default');
    };

    p.mousePressed = () => {
      if (M.distanceScreenToWorld(p, p.mouseX, p.mouseY, u.x, u.y) < 12) dragging = 'u';
      else if (M.distanceScreenToWorld(p, p.mouseX, p.mouseY, v.x, v.y) < 12) dragging = 'v';
    };
    p.mouseDragged = () => {
      if (!dragging) return;
      const w = M.screenToWorld(p, p.mouseX, p.mouseY);
      const snapped = { x: Math.round(w.x * 2) / 2, y: Math.round(w.y * 2) / 2 };
      if (dragging === 'u') u = snapped;
      else v = snapped;
    };
    p.mouseReleased = () => { dragging = null; };
  });
})();
