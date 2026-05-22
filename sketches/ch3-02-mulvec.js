/* Ch3 §2 — Sketches for "Multiplying a matrix".
   Sketch 1: M·v viewed as a linear combination of the columns (tip-to-tail construction).
   Sketch 2: Composition A·B vs A∘B (two paths, same destination).
*/
(function () {
  const M = MatrixCours;
  const C = M.colors;

  // ============================================================
  // SKETCH 1 — M·v = v.x · col_0(M) + v.y · col_1(M)
  // ============================================================
  let m1 = { a: 1.5, b: -0.5, c: 0.5, d: 1 };

  function setupMulVecSlider(id, key) {
    const s = document.getElementById(`mulvec-${id}-slider`);
    const r = document.getElementById(`mulvec-${id}-readout`);
    if (s) s.addEventListener('input', () => {
      m1[key] = parseFloat(s.value);
      if (r) r.textContent = m1[key].toFixed(2);
    });
  }
  setupMulVecSlider('a', 'a');
  setupMulVecSlider('b', 'b');
  setupMulVecSlider('c', 'c');
  setupMulVecSlider('d', 'd');

  new p5((p) => {
    let v = { x: 2, y: 1 };
    let dragging = false;

    p.setup = () => {
      const c = p.createCanvas(620, 420);
      c.parent('mulvec-canvas');
      c.canvas.classList.add('sketch-canvas');
      p.textFont('JetBrains Mono, monospace');
    };

    p.draw = () => {
      p.background('#fcfaf4');
      M.drawGrid(p, { color: '#eee9d8', axisColor: '#b8b39c' });

      const col0 = { x: m1.a, y: m1.c };
      const col1 = { x: m1.b, y: m1.d };
      const partA = { x: v.x * col0.x, y: v.x * col0.y };
      const result = { x: partA.x + v.y * col1.x, y: partA.y + v.y * col1.y };

      // Tip-to-tail construction: v.x · col_0, then v.y · col_1 starting from the tip
      // Dashed lines for the scaled columns
      M.drawDashedArrow(p, 0, 0, partA.x, partA.y, { color: '#c9d4dc' });
      M.drawDashedArrow(p, partA.x, partA.y, result.x, result.y, { color: '#e8c6b5' });

      // "Original" columns in light dashed lines as a reminder
      const ghostCol0End = { x: col0.x, y: col0.y };
      const ghostCol1End = { x: col1.x, y: col1.y };
      M.drawArrow(p, 0, 0, ghostCol0End.x, ghostCol0End.y, { color: 'rgba(30, 90, 122, 0.45)', weight: 1.5 });
      M.drawArrow(p, 0, 0, ghostCol1End.x, ghostCol1End.y, { color: 'rgba(184, 67, 31, 0.45)', weight: 1.5 });

      // Input vector v
      M.drawArrow(p, 0, 0, v.x, v.y, { color: '#4d473d', label: 'v', weight: 2.5 });

      // Result M·v in purple (emphasizes the result)
      M.drawArrow(p, 0, 0, result.x, result.y, { color: '#7c2d12', label: 'M·v', weight: 3 });

      const mx = p.mouseX, my = p.mouseY;
      const overV = M.distanceScreenToWorld(p, mx, my, v.x, v.y) < 12;
      M.drawHandle(p, v.x, v.y, { color: '#4d473d', hover: overV || dragging });

      // Readout
      p.noStroke();
      p.fill('#4d473d');
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);
      p.text(`M = [[${m1.a.toFixed(2)}, ${m1.b.toFixed(2)}], [${m1.c.toFixed(2)}, ${m1.d.toFixed(2)}]]`, 12, 12);
      p.text(`v = (${v.x.toFixed(1)}, ${v.y.toFixed(1)})`, 12, 30);
      p.fill('#7c2d12');
      p.text(`M·v = ${v.x.toFixed(1)} · col₀ + ${v.y.toFixed(1)} · col₁ = (${result.x.toFixed(2)}, ${result.y.toFixed(2)})`, 12, 48);

      // Mini legend
      p.textAlign(p.RIGHT, p.BOTTOM);
      p.fill('#1e5a7a');
      p.text('col_0 = T(i)', p.width - 12, p.height - 28);
      p.fill('#b8431f');
      p.text('col_1 = T(j)', p.width - 12, p.height - 12);

      p.cursor((overV || dragging) ? 'grab' : 'default');
    };

    p.mousePressed = () => {
      if (M.distanceScreenToWorld(p, p.mouseX, p.mouseY, v.x, v.y) < 12) dragging = true;
    };
    p.mouseDragged = () => {
      if (!dragging) return;
      const w = M.screenToWorld(p, p.mouseX, p.mouseY);
      v = { x: Math.round(w.x * 2) / 2, y: Math.round(w.y * 2) / 2 };
    };
    p.mouseReleased = () => { dragging = false; };
  });

  // ============================================================
  // SKETCH 2 — Composition: A · B
  // Three stages: original / after B / after A∘B
  // ============================================================
  const presetsCompose = {
    'rot-then-scale': { B: [0, -1, 1, 0], A: [1.5, 0, 0, 1.5], name: 'rotate then scale' },
    'scale-then-rot': { B: [1.5, 0, 0, 1.5], A: [0, -1, 1, 0], name: 'scale then rotate' },
    'rot-then-shear': { B: [0, -1, 1, 0], A: [1, 1, 0, 1], name: 'rotate then shear' },
    'shear-then-rot': { B: [1, 1, 0, 1], A: [0, -1, 1, 0], name: 'shear then rotate' },
  };

  let composeKey = 'rot-then-scale';
  Object.keys(presetsCompose).forEach(key => {
    const btn = document.getElementById(`compose-${key}`);
    if (btn) btn.addEventListener('click', () => { composeKey = key; });
  });

  function mulMatVec(M_, v) {
    return { x: M_[0] * v.x + M_[1] * v.y, y: M_[2] * v.x + M_[3] * v.y };
  }
  function mulMatMat(A, B) {
    return [
      A[0] * B[0] + A[1] * B[2],
      A[0] * B[1] + A[1] * B[3],
      A[2] * B[0] + A[3] * B[2],
      A[2] * B[1] + A[3] * B[3],
    ];
  }

  new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(620, 380);
      c.parent('compose-canvas');
      c.canvas.classList.add('sketch-canvas');
      p.textFont('JetBrains Mono, monospace');
    };

    p.draw = () => {
      p.background('#fcfaf4');

      const { A, B } = presetsCompose[composeKey];
      const C_ = mulMatMat(A, B);

      const square = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];

      // Three horizontal mini-frames
      const cellW = p.width / 3;
      const labels = ['1. start', '2. after B', '3. after A (= after A·B)'];

      [0, 1, 2].forEach((stage, i) => {
        p.push();
        p.translate(i * cellW, 0);

        // Centered mini-grid
        const cx = cellW / 2;
        const cy = p.height / 2 + 10;
        const scale = 28;

        // Axes
        p.stroke('#d8d3c0');
        p.strokeWeight(1);
        p.line(0, cy, cellW, cy);
        p.line(cx, 30, cx, p.height - 30);

        // Compute corners
        let corners = square.map(pt => ({ ...pt }));
        if (i >= 1) corners = corners.map(pt => mulMatVec(B, pt));
        if (i >= 2) corners = corners.map(pt => mulMatVec(A, pt));

        // Polygon
        p.push();
        p.noStroke();
        if (i === 0) p.fill('rgba(140, 140, 140, 0.25)');
        else if (i === 1) p.fill('rgba(184, 67, 31, 0.25)');
        else p.fill('rgba(124, 45, 18, 0.3)');
        p.beginShape();
        corners.forEach(pt => p.vertex(cx + pt.x * scale, cy - pt.y * scale));
        p.endShape(p.CLOSE);
        p.pop();

        // Label
        p.noStroke();
        p.fill('#4d473d');
        p.textSize(11);
        p.textAlign(p.CENTER, p.TOP);
        p.text(labels[i], cellW / 2, 12);

        // Separator between cells
        if (i < 2) {
          p.stroke('#d8d3c0');
          p.strokeWeight(1);
          p.line(cellW, 30, cellW, p.height - 30);
        }

        p.pop();
      });

      // Summary text at the bottom
      p.noStroke();
      p.fill('#4d473d');
      p.textSize(11);
      p.textAlign(p.CENTER, p.BOTTOM);
      const fmt = (v) => v.toFixed(1).replace('.0', '');
      p.text(`B = [[${fmt(B[0])}, ${fmt(B[1])}], [${fmt(B[2])}, ${fmt(B[3])}]]   A = [[${fmt(A[0])}, ${fmt(A[1])}], [${fmt(A[2])}, ${fmt(A[3])}]]   A·B = [[${fmt(C_[0])}, ${fmt(C_[1])}], [${fmt(C_[2])}, ${fmt(C_[3])}]]`, p.width / 2, p.height - 8);
    };
  });
})();
