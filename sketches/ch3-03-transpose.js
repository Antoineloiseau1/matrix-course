/* Ch3 §3 — Sketch transposee.
   Une matrice 3x3 editable. La transposee est affichee a cote.
   Hover sur une case : la case symetrique de la transposee s'allume.
*/
(function () {
  const initial = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  let mat = initial.map(row => row.slice());
  let hover = null;
  let editing = null;

  new p5((p) => {
    const cellW = 56;
    const cellH = 42;
    const gap = 60;

    function originLeft() {
      return { x: 90, y: 80 };
    }
    function originRight() {
      const left = originLeft();
      return { x: left.x + 3 * cellW + gap, y: left.y };
    }

    function cellRectAt(origin, r, c) {
      return { x: origin.x + c * cellW, y: origin.y + r * cellH, w: cellW, h: cellH };
    }

    function cellUnderMouse() {
      const left = originLeft();
      const right = originRight();
      const mx = p.mouseX, my = p.mouseY;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const rect = cellRectAt(left, r, c);
          if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
            return { side: 'left', r, c };
          }
          const rect2 = cellRectAt(right, r, c);
          if (mx >= rect2.x && mx <= rect2.x + rect2.w && my >= rect2.y && my <= rect2.y + rect2.h) {
            return { side: 'right', r, c };
          }
        }
      }
      return null;
    }

    p.setup = () => {
      const c = p.createCanvas(620, 280);
      c.parent('transpose-canvas');
      c.canvas.classList.add('sketch-canvas');
      p.textFont('JetBrains Mono, monospace');
    };

    p.draw = () => {
      p.background('#fcfaf4');
      hover = cellUnderMouse();

      const left = originLeft();
      const right = originRight();

      // Titres
      p.noStroke();
      p.fill('#4d473d');
      p.textSize(13);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text('M', left.x + 1.5 * cellW, left.y - 8);
      p.text('Mᵀ (transposee)', right.x + 1.5 * cellW, right.y - 8);

      // Diagonale (visuel pour M et Mᵀ)
      p.push();
      p.stroke('rgba(184, 67, 31, 0.35)');
      p.strokeWeight(2);
      p.line(left.x, left.y, left.x + 3 * cellW, left.y + 3 * cellH);
      p.line(right.x, right.y, right.x + 3 * cellW, right.y + 3 * cellH);
      p.pop();

      // Cellules gauche (M)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const rect = cellRectAt(left, r, c);
          const isHovered = hover && hover.side === 'left' && hover.r === r && hover.c === c;
          // Mirror hover : si on hover (i,j) a gauche → (j,i) a droite
          // ou (j,i) a droite → (i,j) a gauche
          let isMirrored = false;
          if (hover) {
            if (hover.side === 'left' && hover.r === c && hover.c === r) isMirrored = true;
            if (hover.side === 'right' && hover.r === c && hover.c === r) isMirrored = true;
          }

          p.stroke('#d8d3c0');
          p.strokeWeight(1);
          if (isHovered) {
            p.fill('rgba(184, 67, 31, 0.18)');
          } else if (isMirrored) {
            p.fill('rgba(124, 45, 18, 0.12)');
          } else if (r === c) {
            p.fill('rgba(184, 67, 31, 0.07)');
          } else {
            p.fill('#fff');
          }
          p.rect(rect.x, rect.y, rect.w, rect.h);

          p.noStroke();
          p.fill('#1c1a15');
          p.textSize(14);
          p.textAlign(p.CENTER, p.CENTER);
          p.text(mat[r][c], rect.x + rect.w / 2, rect.y + rect.h / 2);
        }
      }

      // Cellules droite (M^T)
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const rect = cellRectAt(right, r, c);
          const isHovered = hover && hover.side === 'right' && hover.r === r && hover.c === c;
          let isMirrored = false;
          if (hover) {
            if (hover.side === 'left' && hover.r === c && hover.c === r) isMirrored = true;
            if (hover.side === 'right' && hover.r === c && hover.c === r) isMirrored = true;
          }

          p.stroke('#d8d3c0');
          p.strokeWeight(1);
          if (isHovered) {
            p.fill('rgba(184, 67, 31, 0.18)');
          } else if (isMirrored) {
            p.fill('rgba(124, 45, 18, 0.12)');
          } else if (r === c) {
            p.fill('rgba(184, 67, 31, 0.07)');
          } else {
            p.fill('#fff');
          }
          p.rect(rect.x, rect.y, rect.w, rect.h);

          p.noStroke();
          p.fill('#1c1a15');
          p.textSize(14);
          p.textAlign(p.CENTER, p.CENTER);
          // M^T[r][c] = M[c][r]
          p.text(mat[c][r], rect.x + rect.w / 2, rect.y + rect.h / 2);
        }
      }

      // Hint
      p.noStroke();
      p.fill('#8b8474');
      p.textSize(11);
      p.textAlign(p.CENTER, p.BOTTOM);
      let msg = 'Survole une case pour voir sa correspondance dans la transposee.';
      if (hover) {
        const r = hover.r, c = hover.c;
        const val = hover.side === 'left' ? mat[r][c] : mat[c][r];
        msg = `M${hover.side === 'left' ? '' : 'ᵀ'}[${r}][${c}] = M${hover.side === 'left' ? 'ᵀ' : ''}[${c}][${r}] = ${val}`;
      }
      p.text(msg, p.width / 2, p.height - 10);

      // Trace
      const trace = mat[0][0] + mat[1][1] + mat[2][2];
      p.fill('#b8431f');
      p.textSize(12);
      p.text(`trace(M) = ${mat[0][0]} + ${mat[1][1]} + ${mat[2][2]} = ${trace}`, p.width / 2, p.height - 28);
    };
  });
})();
