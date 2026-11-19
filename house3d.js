(() => {
  if (!window.THREE) return;
  const T = THREE, calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .9, metalness: 0 }, o));
  const mat = {
    wall: M(0xf3f3f0), gray: M(0xc9cac8), roof: M(0x24262b), rib: M(0x0e0f11), blue: M(0x1a2cf5, { roughness: .6 }),
    cyan: M(0x19b4ff, { roughness: .25 }), glass: M(0x8fa4b4, { roughness: .2 }), frame: M(0x1a1c20), dark: M(0x131417),
    floor: M(0x6b6d70), seam: M(0x1c1d1f), stone: M(0x6f7b74), grass: M(0x738c3b), shrub: M(0x3f6d2a, { flatShading: true }),
    rock: M(0xfafafa, { flatShading: true }), step: M(0xeeeeea), pyr: M(0x8a8d90), lot: M(0xd2d7d3), base: M(0x2f6b6a), tile: M(0xb9bcb9), sofa: M(0x56657a), cush: M(0x7d8ca2), wood: M(0xa06a38), rug: M(0xd3c7b0)
  };
  const lineM = new T.LineBasicMaterial({ color: 0x15171a });
  const put = (g, m, x, y, z, e) => {
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m);
    if (e) m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry, 20), lineM));
    return m;
  };
  /* kotak berdasarkan batas x0..x1, y0..y1, z0..z1 */
  const bx = (g, x0, x1, y0, y1, z0, z1, m, e) =>
    put(g, new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, e);
  const poly = (g, pts, depth, m, z, e) => {
    const s = new T.Shape(); pts.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b));
    return put(g, new T.Mesh(new T.ExtrudeGeometry(s, { depth, bevelEnabled: false }), m), 0, 0, z, e);
  };
  const win = (g, cx, cy, w, h, z, cols, rows, dir) => {
    const f = (a, b) => [Math.min(z + dir * a, z + dir * b), Math.max(z + dir * a, z + dir * b)];
    let [p, q] = f(0, .07);
    bx(g, cx - w / 2 - .07, cx + w / 2 + .07, cy - h / 2 - .07, cy + h / 2 + .07, p, q, mat.wall, 1);
    [p, q] = f(.07, .09); bx(g, cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2, p, q, mat.glass);
    [p, q] = f(.07, .11);
    for (let i = 0; i <= cols; i++) { const x = cx - w / 2 + w * i / cols; bx(g, x - .02, x + .02, cy - h / 2, cy + h / 2, p, q, mat.frame); }
    for (let j = 0; j <= rows; j++) { const y = cy - h / 2 + h * j / rows; bx(g, cx - w / 2, cx + w / 2, y - .02, y + .02, p, q, mat.frame); }
  };

  function house(o2) {
    const g = new T.Group(), Y = .1, H1 = 3.3, H2 = 3.4;
    bx(g, -3.4, 3.4, 0, .1, -5.4, 5.4, mat.lot);

    /* dinding */
    bx(g, 2.9, 3.1, Y, H2, -5, 1.5, mat.wall, 1);          // kanan
    bx(g, -.1, 3.1, Y, H2, -5.2, -5, mat.wall, 1);         // belakang kanan
    bx(g, -.1, .1, Y, H2, -3.95, 1.5, mat.wall, 1);        // sekat tengah
    bx(g, -.1, .1, Y, H2, -5, -4.75, mat.wall, 1);
    bx(g, -.1, .1, 2.2, H2, -4.75, -3.95, mat.wall, 1);    // ambang atas lubang pintu dapur
    bx(g, -.12, .12, Y, 2.2, -4.78, -4.75, mat.wall, 1); bx(g, -.12, .12, Y, 2.2, -3.95, -3.92, mat.wall, 1);
    bx(g, -.45, .1, Y, .2, -4.75, -3.95, mat.step, 1);      // tangga kecil
    /* isi dapur yang terlihat dari lubang */
    bx(g, .1, 2.9, Y, .14, -5, -2.4, mat.tile);
    bx(g, .2, .85, Y, 1.8, -4.95, -4.4, mat.pyr, 1);       // kulkas
    bx(g, .15, .8, Y, .85, -4.35, -3.2, mat.wall, 1);      // meja dapur
    bx(g, .25, .65, .85, .9, -4.1, -3.6, mat.dark);        // kompor
    bx(g, .15, .8, 1.25, 1.3, -4.35, -3.2, mat.wall, 1);   // rak

    bx(g, -3.1, -2.9, Y, H1, -3.9, 1.5, mat.wall, 1);     // kiri
    bx(g, -3.1, -.1, Y, H1, -3.9, -3.7, mat.wall, 1);     // belakang kiri (sisi taman belakang)
    win(g, -1.5, 1.6, .7, 1.05, -3.9, 2, 3, -1);

    /* fasad kiri: abu-abu, jendela, list, strip biru */
    bx(g, -2.9, -.1, Y, H1, 1.5, 1.62, mat.gray, 1);
    bx(g, -3.1, -2.85, Y, H1, 1.5, 1.66, mat.wall, 1);
    [.93, 2.28].forEach(y => bx(g, -2.85, -.1, y, y + .02, 1.62, 1.635, mat.seam));
    win(g, -2.3, 1.55, .7, 1.2, 1.62, 2, 3, 1);
    bx(g, -2.78, -1.82, 2.25, 2.35, 1.62, 1.9, mat.wall, 1);
    bx(g, -.55, -.33, Y, H1, 1.62, 1.66, mat.blue, 1);

    /* fasad kanan: bingkai pelana (lebar 3, bahu 3,4, puncak 4,85) */
    poly(g, [[0, Y], [3, Y], [3, 3.4], [1.5, 4.85], [0, 3.4]], .28, mat.wall, 1.5, 1);
    poly(g, [[.14, Y], [2.86, Y], [2.86, 3.345], [1.5, 4.66], [.14, 3.345]], .03, mat.wall, 1.78, 1);
    poly(g, [[1.8, Y], [2.86, Y], [2.86, 3.345], [1.8, 4.37]], .03, mat.blue, 1.8, 1);
    for (let y = .25; y < 4.3; y += .13) {
      const xr = y > 3.345 ? 1.8 + (4.37 - y) / .9667 : 2.86;
      if (xr > 1.9) bx(g, 1.8, xr, y, y + .015, 1.83, 1.84, mat.seam);
    }
    [.55, .65].forEach((x, i) => bx(g, x, x + .02, 2.25, 3.7 + i * .1, 1.8, 1.81, mat.seam));
    /* pintu */
    bx(g, .3, 1.2, Y, 2.0, 1.8, 1.86, mat.blue, 1);
    for (let k = 0; k < 3; k++) bx(g, .38, 1.12, .2 + k * .58, .74 + k * .58, 1.86, 1.88, mat.cyan);
    bx(g, 1.06, 1.08, 1.0, 1.25, 1.88, 1.93, mat.dark);
    win(g, 1.5, 1.29, .36, 1.18, 1.8, 2, 3, 1);
    /* kanopi pintu, tangga, lampu */
    bx(g, .05, 1.8, 2.12, 2.22, 1.8, 2.55, mat.wall, 1);
    bx(g, .05, 1.8, 2.22, 2.3, 2.47, 2.55, mat.wall, 1);
    bx(g, .2, 1.35, Y, .2, 1.9, 2.6, mat.step, 1);
    bx(g, 2.35, 2.45, 1.55, 1.75, 1.84, 1.94, mat.dark);

    /* atap bergelombang + fascia */
    const roof = (x0, x1, z0, z1, y) => {
      bx(g, x0, x1, y, y + .1, z0, z1, mat.roof);
      for (let x = x0 + .12; x < x1 - .05; x += .14) bx(g, x - .025, x + .025, y + .1, y + .16, z0, z1, mat.rib);
    };
    roof(-.1, 3.1, -5.2, 1.5, H2);
    roof(-3.1, -.1, -3.9, 1.62, H1);

    /* sisi depan: lantai carport, dinding rendah */
    const wh = o2 ? 1.3 : .9;
    const cw = o2 ? .4 : 1.4;   // lebar lantai carport (Opsi 1: sampai tangga pintu)
    bx(g, -2.9, cw, Y, .17, 1.62, 5.0, mat.floor);
    bx(g, -2.9, cw, .17, .18, 3.3, 3.32, mat.seam);
    bx(g, -3.1, -2.9, Y, wh, 1.5, 5.1, mat.wall, 1); bx(g, -3.15, -2.85, wh, wh + .05, 1.5, 5.15, mat.wall, 1);
    if (!o2) { bx(g, 2.9, 3.1, Y, wh, 1.8, 5.1, mat.wall, 1); bx(g, 2.85, 3.15, wh, wh + .05, 1.8, 5.15, mat.wall, 1); }

    if (!o2) {
      bx(g, 1.4, 2.9, Y, .16, 1.62, 5.0, mat.grass);
      bx(g, 1.4, 2.9, .16, .17, 3.3, 3.32, mat.seam);
      const rock = (x, z, r, sx, sy, sz) => { const m = put(g, new T.Mesh(new T.IcosahedronGeometry(r, 1), mat.rock), x, .14 + r * sy * .8, z); m.scale.set(sx, sy, sz); };
      rock(2.2, 2.9, .55, 1, .85, 1); rock(1.7, 4.1, .4, 1.3, .55, .9); rock(2.4, 4.3, .38, 1.1, .55, 1.2);
    } else {
      bx(g, .4, 2.9, Y, .17, 1.62, 5.0, mat.stone);
      /* dinding kanan penuh sampai tepat di bawah kanopi */
      const sh = new T.Shape(); [[1.8, Y], [5.1, Y], [5.1, 2.3], [1.8, 2.78]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
      put(g, new T.Mesh(new T.ExtrudeGeometry(sh, { depth: .2, bevelEnabled: false }), mat.wall), 3.1, 0, 0, 1).rotation.y = -Math.PI / 2;
      /* pagar sliding: rel bawah, rangka, jeruji rapat, ujung jeruji putih, roda */
      const gx0 = -2.85, gx1 = 2.0, gz0 = 4.96, gz1 = 5.04;
      bx(g, -3.1, 2.1, Y, .17, 4.93, 5.07, mat.floor, 1);
      bx(g, gx0, gx1, 1.45, 1.53, gz0, gz1, mat.frame, 1);
      bx(g, gx0, gx1, .8, .85, gz0, gz1, mat.frame);
      bx(g, gx0, gx1, .22, .3, gz0, gz1, mat.frame, 1);
      bx(g, gx0, gx0 + .06, .22, 1.53, gz0, gz1, mat.frame); bx(g, gx1 - .06, gx1, .22, 1.53, gz0, gz1, mat.frame);
      for (let x = gx0 + .1; x < gx1 - .06; x += .1) {
        bx(g, x, x + .035, .3, 1.45, 4.975, 5.025, mat.dark);
        bx(g, x, x + .035, 1.53, 1.62, 4.975, 5.025, mat.step);
      }
      [-2.3, -.3, 1.5].forEach(x => bx(g, x - .08, x + .08, .17, .24, 4.97, 5.03, mat.frame));
      bx(g, -3.18, -2.82, Y, 1.7, 4.88, 5.12, mat.wall, 1);   // tiang ujung dinding kiri
      bx(g, 2.0, 2.1, Y, 1.6, 4.92, 5.08, mat.frame);          // tiang penahan gerbang
      /* pilar roster */
      bx(g, 2.1, 3.1, Y, 2.3, 4.85, 5.1, mat.wall, 1);
      bx(g, 2.25, 2.95, .45, 2.0, 5.1, 5.12, mat.dark);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) {
        const p = put(g, new T.Mesh(new T.CylinderGeometry(0, .085, .06, 4), mat.pyr), 2.34 + i * .175, .55 + j * .19, 5.15);
        p.rotation.x = Math.PI / 2;
      }
      /* kanopi pergola miring */
      const c = new T.Group(); c.position.set(1.6, 2.65, 3.4); c.rotation.x = .16; g.add(c);
      for (let i = 0; i <= 14; i++) bx(c, -1.45 + i * .2, -1.35 + i * .2, 0, .08, -1.65, 1.65, mat.rib);
      [-1.5, -.5, .5, 1.5].forEach(z => bx(c, -1.5, 1.5, -.08, 0, z - .04, z + .04, mat.frame));
      bx(c, -1.52, 1.52, -.05, .1, 1.6, 1.7, mat.frame); bx(c, -1.52, 1.52, -.05, .1, -1.7, -1.6, mat.frame);
      bx(g, .07, .17, Y, 2.5, 4.9, 5.0, mat.frame);
    }

    /* taman belakang */
    bx(g, -2.9, -.1, Y, .16, -5.0, -3.7, mat.grass);
    bx(g, -3.1, -.1, Y, .9, -5.2, -5.0, mat.wall, 1); bx(g, -3.15, -.05, .9, .95, -5.25, -4.95, mat.wall, 1);
    bx(g, -3.1, -2.9, Y, .9, -5.2, -3.9, mat.wall, 1);
    [[-2.3, -4.5], [-1.6, -4.8], [-2.6, -4.0]].forEach(([x, z]) => put(g, new T.Mesh(new T.IcosahedronGeometry(.3, 1), mat.shrub), x, .4, z));
    return g;
  }
  window.buildHouse3D = house;

  document.querySelectorAll('.cv').forEach(el => {
    const o2 = el.dataset.o === '2';
    const r = new T.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.shadowMap.enabled = true;
    el.appendChild(r.domElement);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(34, 1, .1, 120);
    sc.add(new T.HemisphereLight(0xffffff, 0x8aa3a0, .75));
    const sun = new T.DirectionalLight(0xfff3dc, .5); sun.position.set(-6, 14, 10); sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 }); sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0006;
    sc.add(sun);
    const base = put(sc, new T.Mesh(new T.CylinderGeometry(7.6, 7.6, .3, 72), mat.base), 0, -.15, 0); base.castShadow = false;
    sc.add(house(o2));

    let yaw = -.6, pit = .42, drag = null, idle = true, vis = false;
    const draw = () => {
      const d = 22, cp = Math.cos(pit);
      cam.position.set(d * cp * Math.sin(yaw), 1.3 + d * Math.sin(pit), d * cp * Math.cos(yaw));
      cam.lookAt(0, 1.3, 0); r.render(sc, cam);
    };
    const size = () => {
      const b = el.getBoundingClientRect(); if (!b.width) return;
      r.setSize(b.width, b.height); cam.aspect = b.width / b.height;
      cam.fov = b.width / b.height < .9 ? 40 : 34; cam.updateProjectionMatrix(); draw();
    };
    new ResizeObserver(size).observe(el);
    el.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; idle = false; el.setPointerCapture(e.pointerId); el.classList.add('grab'); });
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      yaw -= (e.clientX - drag[0]) * .009;
      if (e.pointerType === 'mouse') pit = Math.min(1.2, Math.max(.1, pit + (e.clientY - drag[1]) * .006));
      drag = [e.clientX, e.clientY]; draw();
    });
    ['pointerup', 'pointercancel'].forEach(ev => el.addEventListener(ev, () => { drag = null; el.classList.remove('grab'); }));
    el.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') yaw -= .15; else if (e.key === 'ArrowRight') yaw += .15; else return; idle = false; draw(); });
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: .1 }).observe(el);
    let last = performance.now();
    (function loop(n) {
      requestAnimationFrame(loop);
      if (idle && vis && !calm) { yaw += (n - last) * .00018; draw(); }
      last = n;
    })(last);
    size();
  });
})();
