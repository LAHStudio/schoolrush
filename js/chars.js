const mat=c=>new T.MeshPhongMaterial({color:c,flatShading:true,shininess:0,specular:0});
function bx(p,w,h,d,c,x,y,z){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m}
const cosHas=(o,k)=>!!(o&&o.cos&&o.cos.indexOf(k)>=0); /* Round 17: worn cosmetics (cap, eye, beard, mos; Round 20e: vest) come in o.cos */
/* Round 23: chibi characters. The engine (heads, hair, tudung, outfits, cosmetics) comes from the four design viewers (player, student, teacher, NPC), merged into one closure so its helper names (mat, bx, ...) cannot clash with the game globals above. */
const CHR=(function(){
const matCache = new Map();
function mat(c, doubleSide) {
  const key = c + (doubleSide ? '_ds' : '');
  if (matCache.has(key)) return matCache.get(key);
  const m = new T.MeshLambertMaterial({
    color: c,
    flatShading: true,
    side: doubleSide ? T.DoubleSide : T.FrontSide
  });
  matCache.set(key, m);
  return m;
}

function addMesh(p, geo, c, x, y, z, rx, ry, rz, ds) {
  const m = new T.Mesh(geo, typeof c === 'string' ? mat(c, ds) : c);
  m.position.set(x || 0, y || 0, z || 0);
  if (rx) m.rotation.x = rx;
  if (ry) m.rotation.y = ry;
  if (rz) m.rotation.z = rz;
  m.castShadow = true;
  m.receiveShadow = false;
  p.add(m);
  return m;
}

function bx(p, w, h, d, c, x, y, z, rx, ry, rz) {
  return addMesh(p, new T.BoxGeometry(w, h, d), c, x, y, z, rx, ry, rz);
}

function pushOutwardTri(pos, a, b, c, center) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - center[0];
  const my = (a[1] + b[1] + c[1]) / 3 - center[1];
  const mz = (a[2] + b[2] + c[2]) / 3 - center[2];
  if (nx * mx + ny * my + nz * mz >= 0) {
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  } else {
    pos.push(a[0], a[1], a[2], c[0], c[1], c[2], b[0], b[1], b[2]);
  }
}

function createLoftGeo(rings, radialSegs, capBottom, capTop, arcStart, arcLen) {
  const pos = [];
  const nRings = rings.length;
  const defStart = arcStart !== undefined ? arcStart : 0;
  const defSpan = arcLen !== undefined ? arcLen : Math.PI * 2;
  const isFull = Math.abs(defSpan - Math.PI * 2) < 1e-4 && rings.every(r => r.arcStart === undefined);
  const steps = radialSegs;

  const ringVerts = rings.map(r => {
    const pts = [];
    const sA = r.arcStart !== undefined ? r.arcStart : defStart;
    const spA = r.arcLen !== undefined ? r.arcLen : defSpan;
    const count = isFull ? steps : steps + 1;
    for (let i = 0; i < count; i++) {
      const t = i / steps;
      const a = sA + t * spA + (r.phase || 0);
      let vx = Math.sin(a) * r.rx;
      let vz = Math.cos(a) * r.rz;
      if (r.backTuck && vz < -0.02) {
        vx *= (1 - r.backTuck);
        vz *= (1 - r.backTuck);
      }
      pts.push([vx + (r.ox || 0), r.y, vz + (r.oz || 0)]);
    }
    return pts;
  });

  const pushTri = (a, b, c) => {
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };

  for (let k = 0; k < nRings - 1; k++) {
    const r0 = ringVerts[k], r1 = ringVerts[k + 1];
    for (let i = 0; i < steps; i++) {
      const j = isFull ? (i + 1) % steps : i + 1;
      pushTri(r0[i], r0[j], r1[j]);
      pushTri(r0[i], r1[j], r1[i]);
    }
  }
  if (capBottom && isFull) {
    const c0 = [rings[0].ox || 0, rings[0].y, rings[0].oz || 0];
    const r0 = ringVerts[0];
    for (let i = 0; i < steps; i++) {
      const j = (i + 1) % steps;
      pushTri(c0, r0[j], r0[i]);
    }
  }
  if (capTop && isFull) {
    const topR = rings[nRings - 1];
    const c1 = [topR.ox || 0, topR.y, topR.oz || 0];
    const r1 = ringVerts[nRings - 1];
    for (let i = 0; i < steps; i++) {
      const j = (i + 1) % steps;
      pushTri(c1, r1[i], r1[j]);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function createThickOpenShell(rings, radialSegs, wallThick) {
  const pos = [];
  const nRings = rings.length;
  const steps = radialSegs;

  const outerVerts = [];
  const innerVerts = [];

  rings.forEach(r => {
    const oPts = [];
    const iPts = [];
    const wt = r.wallThick !== undefined ? r.wallThick : wallThick;
    const ox = r.ox || 0;
    const oz = r.oz || 0;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = r.arcStart + t * r.arcLen;
      const sa = Math.sin(a), ca = Math.cos(a);
      oPts.push([sa * r.rx + ox, r.y, ca * r.rz + oz]);
      iPts.push([sa * Math.max(0.004, r.rx - wt) + ox, r.y, ca * Math.max(0.004, r.rz - wt) + oz]);
    }
    outerVerts.push(oPts);
    innerVerts.push(iPts);
  });

  const pushTri = (a, b, c) => {
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };

  for (let k = 0; k < nRings - 1; k++) {
    const o0 = outerVerts[k], o1 = outerVerts[k + 1];
    const i0 = innerVerts[k], i1 = innerVerts[k + 1];
    for (let i = 0; i < steps; i++) {
      pushTri(o0[i], o0[i + 1], o1[i + 1]);
      pushTri(o0[i], o1[i + 1], o1[i]);
      pushTri(i0[i], i1[i + 1], i0[i + 1]);
      pushTri(i0[i], i1[i], i1[i + 1]);
    }
    pushTri(o0[0], o1[0], i1[0]);
    pushTri(o0[0], i1[0], i0[0]);

    pushTri(o0[steps], i1[steps], o1[steps]);
    pushTri(o0[steps], i0[steps], i1[steps]);
  }

  for (let i = 0; i < steps; i++) {
    const bO = outerVerts[0], bI = innerVerts[0];
    pushTri(bO[i], bI[i + 1], bO[i + 1]);
    pushTri(bO[i], bI[i], bI[i + 1]);

    const tO = outerVerts[nRings - 1], tI = innerVerts[nRings - 1];
    pushTri(tO[i], tO[i + 1], tI[i + 1]);
    pushTri(tO[i], tI[i + 1], tI[i]);
  }

  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

const cosHas = (o, k) => !!(o && o.cos && o.cos.indexOf(k) >= 0);

const baldMatCache = new Map();

function baldStubbleMat(skinCol) {
  if (baldMatCache.has(skinCol)) return baldMatCache.get(skinCol);

  const W = 512, H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  // 1. Base skin tone fill
  g.fillStyle = skinCol;
  g.fillRect(0, 0, W, H);

  // 2. Build buzzcut hairline mask (u = horizontal angle around head, v = bottom-to-top)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W;
  maskCanvas.height = H;
  const mg = maskCanvas.getContext('2d');

  mg.fillStyle = '#ffffff';
  mg.beginPath();
  for (let px = 0; px <= W; px += 2) {
    const u = px / W;
    const theta = (u - 0.5) * Math.PI * 2; // 0 = front, ±PI/2 = ears, ±PI = back
    const absT = Math.abs(theta);

    let vyBot;
    if (absT < 0.62) {
      // Crisp schoolboy front hairline across upper forehead
      vyBot = 0.146 - 0.006 * Math.cos(theta * 2.4);
    } else if (absT < 0.96) {
      // Squared temple corner dipping into short neat sideburn
      const t = (absT - 0.62) / 0.34;
      vyBot = 0.148 - 0.095 * Math.pow(t, 0.75);
    } else if (absT < 1.26) {
      // Clean arch over the ear
      const t = (absT - 0.96) / 0.30;
      vyBot = 0.053 + 0.025 * Math.sin(t * Math.PI);
    } else if (absT < 1.85) {
      // Curve neatly behind the ear toward nape
      const t = (absT - 1.26) / 0.59;
      vyBot = 0.053 - 0.135 * t;
    } else {
      // Tapered buzzed nape at back of head
      const t = Math.min(1, (absT - 1.85) / 1.29);
      vyBot = -0.082 - 0.058 * Math.sin(t * Math.PI * 0.5);
    }

    const vNorm = Math.max(0, Math.min(1, (vyBot + 0.27) / 0.54));
    const py = (1 - vNorm) * H;
    if (px === 0) mg.moveTo(px, py);
    else mg.lineTo(px, py);
  }
  mg.lineTo(W, 0);
  mg.lineTo(0, 0);
  mg.closePath();
  mg.fill();

  // 3. Generate greyish fine-hair stubble layer clipped to hairline mask
  const hairLayer = document.createElement('canvas');
  hairLayer.width = W;
  hairLayer.height = H;
  const hg = hairLayer.getContext('2d');

  // Cool greyish-charcoal buzzcut base shadow
  hg.fillStyle = 'rgba(58, 63, 74, 0.44)';
  hg.fillRect(0, 0, W, H);

  // Deterministic pseudo-random fine stubble follicles & micro-hairs
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const tones = [
    'rgba(34, 38, 46, 0.52)',
    'rgba(72, 78, 90, 0.48)',
    'rgba(108, 115, 128, 0.38)',
    'rgba(45, 49, 58, 0.45)'
  ];

  for (let i = 0; i < 6800; i++) {
    const x = rand() * W;
    const y = rand() * (H * 0.82);
    const col = tones[Math.floor(rand() * tones.length)];
    hg.fillStyle = col;
    if (rand() < 0.65) {
      hg.fillRect(x, y, 1.5, 1.5);
    } else {
      hg.fillRect(x, y, 1.2, 2.6);
    }
  }

  // Apply soft-feathered hairline mask
  hg.globalCompositeOperation = 'destination-in';
  hg.filter = 'blur(1.6px)';
  hg.drawImage(maskCanvas, 0, 0);
  hg.filter = 'none';

  // Composite stubble layer over skin tone
  g.drawImage(hairLayer, 0, 0);

  const tex = new T.CanvasTexture(c);
  tex.needsUpdate = true;

  const m = new T.MeshLambertMaterial({
    map: tex,
    flatShading: true
  });
  baldMatCache.set(skinCol, m);
  return m;
}

const fmCache = new Map();
function faceMat(o) { /* one texture per eye size and mouth, shared by every character */
  const k = (o.es || 1).toFixed(2) + "|" + (o.mouth || 0);
  if (!fmCache.has(k)) fmCache.set(k, faceMatRaw(o));
  return fmCache.get(k);
}
function faceMatRaw(o) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const es = o.es || 1;

  // Rounded-pill dark chibi eyes
  [82, 174].forEach(x => {
    const w = 28 * es;
    const h = 42 * es;
    const r = 11 * es;
    const x0 = x - w / 2, y0 = 132 - h / 2;
    g.fillStyle = '#14151b';
    g.beginPath();
    g.moveTo(x0 + r, y0);
    g.lineTo(x0 + w - r, y0);
    g.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    g.lineTo(x0 + w, y0 + h - r);
    g.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    g.lineTo(x0 + r, y0 + h);
    g.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    g.lineTo(x0, y0 + r);
    g.quadraticCurveTo(x0, y0, x0 + r, y0);
    g.closePath();
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(x + 5.5 * es, 121 - 2 * es, 5.2 * Math.sqrt(es), 0, Math.PI * 2);
    g.fill();
  });

  // Eyebrows
  g.strokeStyle = '#161311';
  g.lineWidth = 8.5;
  g.lineCap = 'round';
  [[62, 96, 102, 93], [154, 93, 194, 96]].forEach(b => {
    g.beginPath();
    g.moveTo(b[0], b[1]);
    g.quadraticCurveTo((b[0] + b[2]) / 2, b[1] - 4, b[2], b[3]);
    g.stroke();
  });

  // Subtle nose bridge shadow
  g.fillStyle = 'rgba(72, 34, 18, 0.34)';
  g.beginPath();
  g.ellipse(128, 156, 7, 4.5, 0, 0, Math.PI * 2);
  g.fill();

  // Soft cheek blush
  g.fillStyle = 'rgba(210, 88, 72, 0.22)';
  [54, 202].forEach(bxPos => {
    g.beginPath();
    g.ellipse(bxPos, 158, 15, 8, 0, 0, Math.PI * 2);
    g.fill();
  });

  // Mouth (0 = gentle smile, 1 = cheerful grin, 2 = surprised 'o')
  g.strokeStyle = '#5a2a1a';
  g.lineWidth = 6.5;
  g.lineCap = 'round';
  g.beginPath();
  if (o.mouth === 1) {
    g.arc(128, 181, 20, 0.2, Math.PI - 0.2);
    g.stroke();
  } else if (o.mouth === 2) {
    g.fillStyle = '#7a3326';
    g.ellipse(128, 190, 10.5, 8.5, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  } else {
    g.moveTo(111, 189);
    g.quadraticCurveTo(128, 197, 145, 189);
    g.stroke();
  }

  const tex = new T.CanvasTexture(c);
  tex.needsUpdate = true;
  return new T.MeshBasicMaterial({
    map: tex,
    transparent: true,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
}

function createChibiHead(skinCol, hairCol, forTudung, capHairTop, isBaldStubble) {
  const tuck = forTudung ? 0.13 : 0;
  const geo = createLoftGeo([
    { y: -0.27, rx: 0.22,  rz: 0.20,  phase: Math.PI / 8 },
    { y: -0.17, rx: 0.305, rz: 0.265, phase: Math.PI / 8 },
    { y:  0.00, rx: 0.315, rz: 0.272, phase: Math.PI / 8, backTuck: tuck * 0.45 },
    { y:  0.14, rx: 0.308, rz: 0.270, phase: Math.PI / 8, backTuck: tuck * 0.85 },
    { y:  0.18, rx: 0.305, rz: 0.268, phase: Math.PI / 8, backTuck: tuck },
    { y:  0.27, rx: 0.24,  rz: 0.22,  phase: Math.PI / 8, backTuck: tuck * 1.15 }
  ], 8, true, true);

  if (isBaldStubble && !forTudung) {
    const posAttr = geo.attributes.position;
    const uvs = new Float32Array(posAttr.count * 2);
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const theta = Math.atan2(vx, vz);
      const u = 0.5 + theta / (Math.PI * 2);
      const v = Math.max(0, Math.min(1, (vy + 0.27) / 0.54));
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
    geo.setAttribute('uv', new T.BufferAttribute(uvs, 2));

    const m = new T.Mesh(geo, baldStubbleMat(skinCol));
    m.position.set(0, 1.05, 0);
    m.castShadow = true;
    m.receiveShadow = false;
    return m;
  }

  if (!capHairTop) {
    const m = new T.Mesh(geo, mat(skinCol));
    m.position.set(0, 1.05, 0);
    m.castShadow = true;
    m.receiveShadow = false;
    return m;
  }

  const posAttr = geo.attributes.position;
  const colors = new Float32Array(posAttr.count * 3);
  const cSkin = new T.Color(skinCol);
  const cHair = new T.Color(hairCol || '#1a1d26');

  for (let i = 0; i < posAttr.count; i++) {
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const isHairZone = vz > 0.06 ? (vy >= 0.135) : (vy >= -0.01);
    const c = isHairZone ? cHair : cSkin;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new T.BufferAttribute(colors, 3));

  const m = new T.Mesh(geo, new T.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true
  }));
  m.position.set(0, 1.05, 0);
  m.castShadow = true;
  m.receiveShadow = false;
  return m;
}

function buildUnifiedHair(p, st, c, underCap) {
  if (!st || st === 'bald') return;
  const g = new T.Group();
  p.add(g);

  const N = 16;
  const RINGS = 6;
  const verts = [];
  const tris = [];

  // Style-specific crown height, volume, and shift
  let baseTopY = 1.388;
  let rxBase = 0.338;
  let rzBase = 0.302;
  let oxBase = 0.0;
  let ozBase = -0.006;

  if (st === 'short') {
    baseTopY = 1.358;
    rxBase = 0.326;
    rzBase = 0.292;
  } else if (st === 'side') {
    baseTopY = 1.384;
    rxBase = 0.340;
    rzBase = 0.304;
    oxBase = 0.014;
  } else if (st === 'spiky') {
    baseTopY = 1.405;
    rxBase = 0.326;
    rzBase = 0.292;
  } else if (st === 'crew') {
    baseTopY = 1.356;
    rxBase = 0.315;
    rzBase = 0.281;
  }

  for (let k = 0; k < RINGS; k++) {
    const t = k / (RINGS - 1);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const ang = ((a + Math.PI) % (Math.PI * 2)) - Math.PI;
      const absA = Math.abs(ang);

      let yBot;
      if (st === 'short') {
        // Neat trimmed schoolboy cut: high clean forehead, trimmed above ears, tapered back
        if (absA < 0.72) {
          yBot = 1.224 - 0.012 * Math.cos(ang * 2.2);
        } else if (absA < 1.15) {
          yBot = 1.075;
        } else if (absA < 1.85) {
          yBot = 1.115;
        } else {
          yBot = 0.975;
        }
      } else if (st === 'side') {
        // Belah Tepi: clear left-temple part notch + diagonal swept fringe across forehead
        if (absA < 0.78) {
          if (ang < -0.26) {
            // Parting notch on the left temple
            const notch = 1 - Math.min(1, Math.abs(ang + 0.44) / 0.22);
            yBot = 1.235 + 0.024 * notch;
          } else {
            // Diagonal swept quiff dipping across the right forehead
            const sweep = (ang + 0.26) / 1.04; // 0 -> 1 left-to-right
            yBot = 1.230 - 0.088 * Math.sin(sweep * Math.PI * 0.85);
          }
        } else if (absA < 1.15) {
          yBot = ang < 0 ? 1.045 : 1.015;
        } else if (absA < 1.85) {
          yBot = 1.105;
        } else {
          yBot = 0.935;
        }
      } else if (st === 'spiky') {
        // Terpacak: upward-swept jagged hairline + tight faded lower sides
        if (absA < 0.76) {
          const tooth = (i % 2 === 0) ? 0.022 : -0.026;
          yBot = 1.222 + tooth;
        } else if (absA < 1.15) {
          yBot = 1.065;
        } else if (absA < 1.85) {
          yBot = 1.115;
        } else {
          yBot = 0.955;
        }
      } else if (st === 'crew') {
        // Cukur: high-and-tight military/flat-top crop, high over ears & high nape
        if (absA < 0.72) {
          yBot = 1.232;
        } else if (absA < 1.85) {
          yBot = 1.118;
        } else {
          yBot = 1.028;
        }
      } else {
        // 'fringe' (Poni Rujukan) & female styles
        if (absA < 0.72) {
          let bang = 0;
          if (ang > -0.46 && ang < -0.18) bang = 0.080 * (1 - Math.abs(ang + 0.32) / 0.14);
          else if (ang > -0.18 && ang < 0.14) bang = 0.092 * (1 - Math.abs(ang + 0.02) / 0.16);
          else if (ang > 0.14 && ang < 0.44) bang = 0.076 * (1 - Math.abs(ang - 0.29) / 0.15);
          yBot = 1.245 - bang;
        } else if (absA < 1.12) {
          yBot = 0.995;
        } else if (absA < 1.85) {
          yBot = 1.095;
        } else {
          yBot = st === 'bob' ? 0.80 : 0.88;
        }
      }

      const yTop = underCap ? 1.242 : baseTopY;
      let y = yBot + (yTop - yBot) * Math.pow(t, st === 'crew' ? 0.65 : 0.78);

      let rx, rz;
      if (st === 'crew') {
        // Boxier flat-top shoulder profile
        if (t < 0.86) {
          rx = rxBase;
          rz = rzBase;
        } else {
          const s = (t - 0.86) / 0.14;
          rx = rxBase * (1 - 0.34 * s);
          rz = rzBase * (1 - 0.34 * s);
        }
      } else if (t < 0.82) {
        const s = t / 0.82;
        rx = rxBase - (underCap ? 0.012 : 0.022) * (s * s);
        rz = rzBase - (underCap ? 0.010 : 0.020) * (s * s);
      } else {
        const s = (t - 0.82) / 0.18;
        const topTaper = st === 'short' ? 0.18 : 0.36;
        rx = (underCap ? rxBase - 0.016 : rxBase - 0.022) * (1 - topTaper * s);
        rz = (underCap ? rzBase - 0.014 : rzBase - 0.020) * (1 - topTaper * s);
      }

      if (st === 'bob' && absA > 1.15 && t < 0.45) {
        rx += 0.022 * (1 - t / 0.45);
        rz += 0.018 * (1 - t / 0.45);
      }

      // Belah Tepi: fuller crown on the swept (+X) side, sleeker on the parted (-X) side
      if (st === 'side' && !underCap && t > 0.35) {
        const sideBias = Math.sin(a) * 0.018 * ((t - 0.35) / 0.65);
        y += sideBias;
        rx += Math.max(0, Math.sin(a)) * 0.014;
      }

      // Terpacak: pronounced spiky flare & tall jagged crown peaks
      if (st === 'spiky' && !underCap) {
        if (k === 0 && absA < 0.75 && i % 2 === 1) {
          // Upward-flared front spiky bangs
          rz += 0.024;
          rx += 0.012;
        }
        if (k >= 3) {
          const isPeak = (i % 2 === 0);
          const tier = (k === 5 ? 1.25 : k === 4 ? 0.95 : 0.45);
          const spike = (isPeak ? 0.068 : -0.014) * tier;
          y += spike;
          if (isPeak) {
            rx += 0.036 * tier;
            rz += 0.036 * tier;
          }
        }
      }

      let ox = oxBase * t;
      let oz = ozBase;
      if (absA > 1.85 && y < 0.95 && st !== 'bob') {
        rz *= 0.92;
      }

      verts.push([Math.sin(a) * rx + ox, y, Math.cos(a) * rz + oz]);
    }
  }

  const topCenterY = underCap
    ? 1.246
    : (st === 'crew' ? baseTopY : (st === 'spiky' ? baseTopY + 0.055 : baseTopY + 0.006));
  const topIdx = verts.length;
  verts.push([oxBase, topCenterY, -0.005]);

  for (let k = 0; k < RINGS - 1; k++) {
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      const i00 = k * N + i, i01 = k * N + j;
      const i10 = (k + 1) * N + i, i11 = (k + 1) * N + j;
      tris.push([i00, i01, i11], [i00, i11, i10]);
    }
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    tris.push([topIdx, (RINGS - 1) * N + i, (RINGS - 1) * N + j]);
  }

  const pos = [];
  tris.forEach(([a, b, cIdx]) => {
    pos.push(...verts[a], ...verts[b], ...verts[cIdx]);
  });
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  addMesh(g, geo, c, 0, 0, 0, 0, 0, 0, true);

  if (!underCap) {
    if (st === 'spiky') {
      // Bold 3D sculpted crown spikes for unmistakable spiky silhouette
      const tufts = [
        [ 0.00, 1.43,  0.14,  0.42,  0.00,  0.00, 0.075, 0.14],
        [-0.12, 1.41,  0.11,  0.38,  0.15,  0.32, 0.068, 0.13],
        [ 0.12, 1.41,  0.11,  0.38, -0.15, -0.32, 0.068, 0.13],
        [ 0.00, 1.44, -0.04, -0.18,  0.00,  0.00, 0.082, 0.15],
        [-0.14, 1.39, -0.06, -0.12,  0.10,  0.42, 0.068, 0.13],
        [ 0.14, 1.39, -0.06, -0.12, -0.10, -0.42, 0.068, 0.13],
        [ 0.00, 1.39, -0.19, -0.48,  0.00,  0.00, 0.070, 0.13]
      ];
      tufts.forEach(([tx, ty, tz, rx, ry, rz, rad, h]) => {
        addMesh(g, new T.ConeGeometry(rad, h, 4), c, tx, ty, tz, rx, ry, rz);
      });
    } else if (st === 'pony') {
      addMesh(g, new T.TorusGeometry(0.055, 0.02, 5, 8), '#ffd23f', 0, 1.22, -0.31, 0.3);
      const tail = createLoftGeo([
        { y: 0.86, rx: 0.055, rz: 0.055, oz: -0.38 },
        { y: 1.04, rx: 0.105, rz: 0.095, oz: -0.37 },
        { y: 1.21, rx: 0.07, rz: 0.07, oz: -0.32 }
      ], 6, true, true);
      addMesh(g, tail, c);
    } else if (st === 'bun') {
      addMesh(g, new T.DodecahedronGeometry(0.145, 0), c, 0, 1.43, -0.13, 0.3, 0.5, 0);
    } else if (st === 'pigtails') {
      [-1, 1].forEach(s => {
        addMesh(g, new T.TorusGeometry(0.045, 0.018, 5, 8), '#ffd23f', s * 0.33, 1.18, -0.06, 0, Math.PI / 2);
        const pg = createLoftGeo([
          { y: 0.80, rx: 0.05, rz: 0.05, ox: s * 0.41, oz: -0.06 },
          { y: 1.00, rx: 0.09, rz: 0.085, ox: s * 0.40, oz: -0.06 },
          { y: 1.18, rx: 0.06, rz: 0.06, ox: s * 0.35, oz: -0.06 }
        ], 6, true, true);
        addMesh(g, pg, c);
      });
    } else if (st === 'braid') {
      [0, 1, 2].forEach(k => {
        addMesh(g, new T.OctahedronGeometry(0.072 - k * 0.008, 0), c, 0, 1.08 - k * 0.11, -0.31 - k * 0.01, 0.2, Math.PI / 4);
      });
    }
  }
}

function buildWrappedTudung(p, col, tuckInVest) {
  const g = new T.Group();
  p.add(g);

  // Snug inner neck collar wrap
  addMesh(g, new T.CylinderGeometry(0.132, 0.155, 0.12, 8), col, 0, 0.74, 0.015);

  const zChin = tuckInVest ? 0.195 : 0.222;
  const zMidChest = tuckInVest ? 0.146 : 0.185;
  const xLowBib = tuckInVest ? 0.092 : 0.155;
  const zLowBib = tuckInVest ? 0.142 : 0.125;
  const zTip = tuckInVest ? 0.145 : 0.176;
  const yTip = tuckInVest ? 0.575 : 0.555;

  const rings = [
    // Ring 0: Flush face opening with inverted-V forehead peak (^)
    [
      [ 0.000, 1.305,  0.268],
      [ 0.148, 1.262,  0.256],
      [ 0.272, 1.178,  0.205],
      [ 0.326, 1.035,  0.168],
      [ 0.278, 0.895,  0.188],
      [ 0.132, 0.800,  zChin - 0.006],
      [ 0.000, 0.785,  zChin],
      [-0.132, 0.800,  zChin - 0.006],
      [-0.278, 0.895,  0.188],
      [-0.326, 1.035,  0.168],
      [-0.272, 1.178,  0.205],
      [-0.148, 1.262,  0.256]
    ],
    // Ring 1: Mid-crown & cheek contour (raised front crown clears top-front head corners)
    [
      [ 0.000, 1.418,  0.152],
      [ 0.208, 1.385,  0.132],
      [ 0.345, 1.245,  0.035],
      [ 0.366, 1.045, -0.005],
      [ 0.332, 0.855,  0.025],
      [ tuckInVest ? 0.155 : 0.188, 0.752, tuckInVest ? 0.138 : 0.145],
      [ 0.000, 0.732,  tuckInVest ? 0.150 : 0.175],
      [ tuckInVest ? -0.155 : -0.188, 0.752, tuckInVest ? 0.138 : 0.145],
      [-0.332, 0.855,  0.025],
      [-0.366, 1.045, -0.005],
      [-0.345, 1.245,  0.035],
      [-0.208, 1.385,  0.132]
    ],
    // Ring 2: Upper-back skull & shoulder drape
    [
      [ 0.000, 1.392, -0.175],
      [ 0.218, 1.352, -0.195],
      [ 0.348, 1.210, -0.225],
      [ 0.365, 1.000, -0.235],
      [ 0.342, 0.795, -0.165],
      [ tuckInVest ? 0.205 : 0.278, 0.705, tuckInVest ? 0.035 : 0.055],
      [ 0.000, 0.652,  zMidChest],
      [ tuckInVest ? -0.205 : -0.278, 0.705, tuckInVest ? 0.035 : 0.055],
      [-0.342, 0.795, -0.165],
      [-0.365, 1.000, -0.235],
      [-0.348, 1.210, -0.225],
      [-0.218, 1.352, -0.195]
    ],
    // Ring 3: Full back shoulder hem (y=0.725) + front pointed chest V-bib
    [
      [ 0.000, 1.180, -0.348],
      [ 0.215, 1.135, -0.325],
      [ 0.305, 0.935, -0.305],
      [ 0.265, 0.725, -0.245],
      [ tuckInVest ? 0.195 : 0.245, 0.720, -0.105],
      [ xLowBib, 0.650, zLowBib],
      [ 0.000, yTip, zTip],
      [-xLowBib, 0.650, zLowBib],
      [ tuckInVest ? -0.195 : -0.245, 0.720, -0.105],
      [-0.265, 0.725, -0.245],
      [-0.305, 0.935, -0.305],
      [-0.215, 1.135, -0.325]
    ]
  ];

  const verts = [];
  rings.forEach(r => r.forEach(pt => verts.push(pt)));
  const backCapIdx = verts.length;
  verts.push([0.000, 0.720, -0.258]);

  const M = 12;
  const pos = [];
  const pushTri = (a, b, cIdx) => {
    pos.push(...verts[a], ...verts[b], ...verts[cIdx]);
  };

  for (let k = 0; k < rings.length - 1; k++) {
    for (let i = 0; i < M; i++) {
      const j = (i + 1) % M;
      const i00 = k * M + i, i01 = k * M + j;
      const i10 = (k + 1) * M + i, i11 = (k + 1) * M + j;
      pushTri(i00, i11, i01);
      pushTri(i00, i10, i11);
    }
  }
  for (let i = 0; i < M; i++) {
    const j = (i + 1) % M;
    pushTri(backCapIdx, (rings.length - 1) * M + j, (rings.length - 1) * M + i);
  }

  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  addMesh(g, geo, col, 0, 0, 0, 0, 0, 0, true);
}

function build3DMoustache(p, col) {
  const g = new T.Group();
  p.add(g);

  // Faceted low-poly handlebar stations matching reference (z_back=0.2735, z_crest=0.306)
  const stations = [
    [0.000, 0.960, 0.946, 0.2735, 0.298], // 0: center V-dip under nose
    [0.028, 0.976, 0.939, 0.2735, 0.306], // 1: full inner peak
    [0.064, 0.967, 0.935, 0.2735, 0.303], // 2: mid wing shoulder
    [0.094, 0.953, 0.935, 0.2720, 0.296], // 3: outer U-curve bottom
    [0.115, 0.958, 0.944, 0.2640, 0.284], // 4: rising outer curl
    [0.119, 0.973, 0.962, 0.2560, 0.272], // 5: upturned handlebar hook
    [0.105, 0.976, 0.969, 0.2540, 0.264]  // 6: inward curled tip
  ];

  const pos = [];
  [-1, 1].forEach(s => {
    const rings = stations.map(([ax, yt, yb, zb, zf]) => {
      const x = s * ax;
      const ym = 0.5 * (yt + yb);
      const zm = 0.5 * (zb + zf);
      return [
        [x, yt, zm], // 0: top bevel
        [x, ym, zf], // 1: front ridge crest
        [x, yb, zm], // 2: bottom bevel
        [x, ym, zb]  // 3: flush back
      ];
    });

    for (let k = 0; k < rings.length - 1; k++) {
      const r0 = rings[k], r1 = rings[k + 1];
      const cx = 0.25 * (r0[0][0] + r0[2][0] + r1[0][0] + r1[2][0]);
      const cy = 0.25 * (r0[0][1] + r0[2][1] + r1[0][1] + r1[2][1]);
      const cz = 0.25 * (r0[1][2] + r0[3][2] + r1[1][2] + r1[3][2]);
      const ctr = [cx, cy, cz];

      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        pushOutwardTri(pos, r0[i], r0[j], r1[j], ctr);
        pushOutwardTri(pos, r0[i], r1[j], r1[i], ctr);
      }
    }

    const last = rings[rings.length - 1];
    const tipCtr = [s * 0.112, 0.972, 0.259];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      pushOutwardTri(pos, last[i], last[j], tipCtr, [s * 0.115, 0.965, 0.265]);
    }
  });

  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  addMesh(g, geo, col);
}

function build3DBeard(p, col, hasTudung, hasMoustache) {
  const g = new T.Group();
  p.add(g);

  const wScale = hasTudung ? 0.76 : 1.0;
  const zFrontShift = hasTudung ? 0.022 : 0.0;

  // 1. Front-only faceted low-poly V-beard (-81 deg to +81 deg: stays strictly in front of ears/face, zero back-of-head wrap)
  const vBeardGeo = createThickOpenShell([
    { y: 0.605, rx: 0.024,          rz: 0.022, oz: 0.205 + zFrontShift, arcStart: -1.42, arcLen: 2.84, wallThick: 0.016 },
    { y: 0.700, rx: 0.155 * wScale, rz: 0.145, oz: 0.125 + zFrontShift, arcStart: -1.42, arcLen: 2.84, wallThick: 0.055 },
    { y: 0.805, rx: 0.272 * wScale, rz: 0.256, oz: 0.042 + zFrontShift, arcStart: -1.42, arcLen: 2.84, wallThick: 0.085 },
    { y: 0.892, rx: 0.314 * wScale, rz: 0.280, oz: 0.012 + zFrontShift, arcStart: -1.42, arcLen: 2.84, wallThick: 0.095 }
  ], 6, 0.075);
  addMesh(g, vBeardGeo, col);

  // 2. Center soul-patch / chin tab rising below the lower lip
  const chinTab = createLoftGeo([
    { y: 0.882, rx: 0.032, rz: 0.020, oz: 0.278 + zFrontShift * 0.4, phase: Math.PI / 8 },
    { y: 0.910, rx: 0.022, rz: 0.016, oz: 0.279 + zFrontShift * 0.4, phase: Math.PI / 8 }
  ], 6, true, true);
  addMesh(g, chinTab, col);

  // 3. Front-cheek vertical pillars framing mouth corners
  [-1, 1].forEach(s => {
    const pillarGeo = createLoftGeo([
      { y: 0.882, rx: 0.044, rz: 0.024, ox: s * 0.086, oz: 0.275 + zFrontShift * 0.3, phase: Math.PI / 8 },
      { y: 0.952, rx: 0.042, rz: 0.022, ox: s * 0.084, oz: 0.274 + zFrontShift * 0.3, phase: Math.PI / 8 }
    ], 6, true, true);
    addMesh(g, pillarGeo, col);
  });

  // 4. Clean upper-lip moustache bridge when beard is worn without separate handlebar Misai
  if (!hasMoustache) {
    const lipBridge = createLoftGeo([
      { y: 0.944, rx: 0.095, rz: 0.022, oz: 0.276, phase: Math.PI / 8 },
      { y: 0.966, rx: 0.075, rz: 0.020, oz: 0.276, phase: Math.PI / 8 }
    ], 6, true, true);
    addMesh(g, lipBridge, col);
  }
}

function buildFaceMask(p) {
  const g = new T.Group();
  p.add(g);

  const maskRings = [
    { y: 0.785, rx: 0.252, rz: 0.264, arcStart: -0.60, arcLen: 1.20 },
    { y: 0.838, rx: 0.290, rz: 0.292, arcStart: -0.66, arcLen: 1.32 },
    { y: 0.892, rx: 0.300, rz: 0.298, arcStart: -0.68, arcLen: 1.36 },
    { y: 0.944, rx: 0.296, rz: 0.294, arcStart: -0.66, arcLen: 1.32 },
    { y: 0.978, rx: 0.282, rz: 0.285, arcStart: -0.62, arcLen: 1.24 }
  ];
  const shieldGeo = createThickOpenShell(maskRings, 8, 0.012);
  addMesh(g, shieldGeo, '#a4d2e2');

  const trimGeo = createThickOpenShell([
    { y: 0.972, rx: 0.284, rz: 0.287, arcStart: -0.62, arcLen: 1.24 },
    { y: 0.986, rx: 0.278, rz: 0.283, arcStart: -0.60, arcLen: 1.20 }
  ], 8, 0.013);
  addMesh(g, trimGeo, '#f4f7fb');

  [-1, 1].forEach(s => {
    const earTop = new T.Vector3(s * 0.314, 1.008, -0.005);
    const earBot = new T.Vector3(s * 0.314, 0.992, -0.005);

    const topPath = [
      new T.Vector3(s * 0.168, 0.976, 0.242),
      new T.Vector3(s * 0.296, 0.990, 0.108),
      earTop
    ];
    const botPath = [
      new T.Vector3(s * 0.162, 0.822, 0.236),
      new T.Vector3(s * 0.284, 0.888, 0.104),
      earBot
    ];

    [topPath, botPath].forEach(pts => {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const len = dir.length();
        const strap = new T.Mesh(new T.BoxGeometry(0.010, len + 0.004, 0.011), mat('#f4f7fb'));
        strap.position.copy(mid);
        strap.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
        g.add(strap);
      }
    });
  });
}

function buildPirateEyepatch(p) {
  const g = new T.Group();
  const k = '#15151a';
  p.add(g);

  addMesh(g, new T.CylinderGeometry(0.074, 0.070, 0.024, 6), k, -0.095, 1.022, 0.262, Math.PI / 2);

  const segs = [
    [[-0.215, 1.185, 0.172], [-0.115, 1.072, 0.256]],
    [[-0.115, 1.072, 0.256], [ 0.115, 0.902, 0.254]],
    [[ 0.115, 0.902, 0.254], [ 0.215, 0.838, 0.168]]
  ];

  segs.forEach(([a, b]) => {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b);
    const mid = va.clone().add(vb).multiplyScalar(0.5);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const strap = new T.Mesh(new T.BoxGeometry(0.022, len + 0.008, 0.014), mat(k));
    strap.position.copy(mid);
    strap.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
    g.add(strap);
  });
}

function buildOpenVest(p, W, hasTudung) {
  const g = new T.Group();
  p.add(g);

  const collarBoost = hasTudung ? 0.008 : 0.0;

  const vestRings = [
    { y: 0.382, rx: 0.254 * W, rz: 0.170, arcStart: 0.20, arcLen: Math.PI * 2 - 0.40 },
    { y: 0.560, rx: 0.242 * W, rz: 0.163 + collarBoost * 0.5, arcStart: 0.23, arcLen: Math.PI * 2 - 0.46 },
    { y: 0.715, rx: (0.228 + collarBoost) * W, rz: 0.155 + collarBoost, arcStart: 0.36, arcLen: Math.PI * 2 - 0.72 }
  ];
  const vestGeo = createThickOpenShell(vestRings, 12, 0.014);
  addMesh(g, vestGeo, '#f28c1c');

  const stripeBands = [
    { y0: 0.462, y1: 0.502, rx: 0.252 * W, rz: 0.170, arcStart: 0.215 },
    { y0: 0.592, y1: 0.632, rx: 0.242 * W, rz: 0.163 + collarBoost * 0.5, arcStart: 0.255 }
  ];
  stripeBands.forEach(sb => {
    const sGeo = createThickOpenShell([
      { y: sb.y0, rx: sb.rx, rz: sb.rz, arcStart: sb.arcStart, arcLen: Math.PI * 2 - sb.arcStart * 2 },
      { y: sb.y1, rx: sb.rx - 0.002, rz: sb.rz - 0.002, arcStart: sb.arcStart + 0.01, arcLen: Math.PI * 2 - (sb.arcStart + 0.01) * 2 }
    ], 12, 0.006);
    addMesh(g, sGeo, '#eef0be');
  });
}

function buildGlasses(p, style, frameCol, hasTudung) {
  if (!style || style === 'none') return;
  const g = new T.Group();
  p.add(g);

  const col = frameCol || '#181a20';
  const eyeX = 0.086;
  const eyeY = 1.023;
  const zFront = 0.285;

  const lensMat = new T.MeshBasicMaterial({
    color: '#dff2ff',
    transparent: true,
    opacity: 0.16,
    side: T.DoubleSide,
    depthWrite: false
  });

  bx(g, 0.056, 0.011, 0.012, col, 0, eyeY + 0.014, zFront);

  [-1, 1].forEach(s => {
    const cx = s * eyeX;
    if (style === 'round') {
      const rim = new T.Mesh(new T.TorusGeometry(0.052, 0.0065, 5, 8), mat(col));
      rim.position.set(cx, eyeY, zFront);
      g.add(rim);

      const lens = new T.Mesh(new T.CircleGeometry(0.048, 8), lensMat);
      lens.position.set(cx, eyeY, zFront - 0.002);
      g.add(lens);
    } else if (style === 'half') {
      bx(g, 0.112, 0.015, 0.014, col, cx, eyeY + 0.036, zFront);
      bx(g, 0.008, 0.068, 0.011, col, cx - s * 0.052, eyeY + 0.002, zFront);
      bx(g, 0.008, 0.068, 0.011, col, cx + s * 0.052, eyeY + 0.002, zFront);
      bx(g, 0.104, 0.006, 0.010, col, cx, eyeY - 0.032, zFront);

      const lens = new T.Mesh(new T.PlaneGeometry(0.098, 0.064), lensMat);
      lens.position.set(cx, eyeY + 0.002, zFront - 0.002);
      g.add(lens);
    } else {
      const w = 0.110, h = 0.080, t = 0.010;
      bx(g, w, t, 0.013, col, cx, eyeY + h / 2, zFront);
      bx(g, w, t, 0.013, col, cx, eyeY - h / 2, zFront);
      bx(g, t, h + t, 0.013, col, cx - w / 2, eyeY, zFront);
      bx(g, t, h + t, 0.013, col, cx + w / 2, eyeY, zFront);

      const lens = new T.Mesh(new T.PlaneGeometry(w - t, h - t), lensMat);
      lens.position.set(cx, eyeY, zFront - 0.002);
      g.add(lens);
    }

    const start = new T.Vector3(s * (eyeX + 0.054), eyeY + 0.016, zFront);
    const end = new T.Vector3(
      s * (hasTudung ? 0.308 : 0.318),
      eyeY + 0.004,
      hasTudung ? 0.175 : 0.010
    );
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const len = dir.length();
    const arm = new T.Mesh(new T.BoxGeometry(0.008, 0.009, len), mat(col));
    arm.position.copy(mid);
    arm.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), dir.normalize());
    g.add(arm);
  });
}

function buildApron(p, W, col, trimCol, isKain) {
  const g = new T.Group();
  p.add(g);

  // 1. Upper chest bib (y = 0.43 to 0.68)
  const bibGeo = createThickOpenShell([
    { y: 0.425, rx: 0.248 * W, rz: 0.164, arcStart: -0.62, arcLen: 1.24 },
    { y: 0.560, rx: 0.236 * W, rz: 0.158, arcStart: -0.52, arcLen: 1.04 },
    { y: 0.685, rx: 0.222 * W, rz: 0.150, arcStart: -0.44, arcLen: 0.88 }
  ], 6, 0.010);
  addMesh(g, bibGeo, col);

  // Top bib border & front pocket
  const topTrim = createThickOpenShell([
    { y: 0.672, rx: 0.224 * W, rz: 0.152, arcStart: -0.44, arcLen: 0.88 },
    { y: 0.692, rx: 0.221 * W, rz: 0.150, arcStart: -0.43, arcLen: 0.86 }
  ], 6, 0.011);
  addMesh(g, topTrim, trimCol);

  // Neck strap loop
  [-1, 1].forEach(s => {
    bx(g, 0.016, 0.075, 0.014, trimCol, s * 0.078 * W, 0.720, 0.128, -0.35, 0, s * 0.18);
  });

  // Waist tie band & back bow
  const waistBand = createThickOpenShell([
    { y: 0.405, rx: 0.252 * W, rz: 0.168, arcStart: -Math.PI, arcLen: Math.PI * 2 },
    { y: 0.432, rx: 0.249 * W, rz: 0.166, arcStart: -Math.PI, arcLen: Math.PI * 2 }
  ], 10, 0.010);
  addMesh(g, waistBand, trimCol);
  bx(g, 0.085, 0.036, 0.025, trimCol, 0, 0.418, -0.172);

  // 2. Lower apron skirt (pivoted at waist y = 0.41 so it drapes cleanly when sitting!)
  const skirtPivot = new T.Group();
  skirtPivot.position.set(0, 0.41, 0);
  g.add(skirtPivot);

  const hemSpread = isKain ? 1.04 : 1.0;
  const skirtGeo = createThickOpenShell([
    { y: -0.18, rx: 0.274 * W * hemSpread, rz: 0.192 * hemSpread, arcStart: -1.18, arcLen: 2.36 },
    { y: -0.09, rx: 0.264 * W * hemSpread, rz: 0.180 * hemSpread, arcStart: -1.16, arcLen: 2.32 },
    { y:  0.00, rx: 0.252 * W,             rz: 0.168,             arcStart: -1.14, arcLen: 2.28 }
  ], 8, 0.010);
  addMesh(skirtPivot, skirtGeo, col);

  // Lower apron pocket
  bx(skirtPivot, 0.14 * W, 0.085, 0.018, trimCol, 0, -0.085, 0.182 * hemSpread, -0.08);

  return skirtPivot;
}

function buildVendorCap(p, capCol, visorCol, hasTudung, isSecurity) {
  const g = new T.Group();
  p.add(g);

  const capY = hasTudung ? 1.38 : 1.31;
  const capS = hasTudung ? 1.06 : 1.0;
  const crown = createLoftGeo([
    { y: capY - 0.09, rx: 0.368 * capS, rz: 0.336 * capS, phase: Math.PI / 8 },
    { y: capY + 0.04, rx: 0.335 * capS, rz: 0.308 * capS, phase: Math.PI / 8 },
    { y: capY + 0.12, rx: 0.185 * capS, rz: 0.180 * capS, phase: Math.PI / 8 }
  ], 8, false, true);
  addMesh(g, crown, capCol);
  addMesh(g, new T.CylinderGeometry(0.26 * capS, 0.27 * capS, 0.032, 8), visorCol, 0, capY - 0.085, 0.255 * capS, 0.10);
  addMesh(g, new T.OctahedronGeometry(0.038, 0), visorCol, 0, capY + 0.13, 0);

  if (isSecurity) {
    // Gold cap badge on front crown
    addMesh(g, new T.OctahedronGeometry(0.036, 0), '#ffd23f', 0, capY - 0.015, 0.335 * capS);
  }
}

function buildSecurityDetails(p, W) {
  const g = new T.Group();
  p.add(g);

  // Black utility belt + silver buckle
  const beltGeo = createThickOpenShell([
    { y: 0.376, rx: 0.244 * W, rz: 0.161, arcStart: -Math.PI, arcLen: Math.PI * 2 },
    { y: 0.412, rx: 0.242 * W, rz: 0.160, arcStart: -Math.PI, arcLen: Math.PI * 2 }
  ], 10, 0.008);
  addMesh(g, beltGeo, '#14161c');
  bx(g, 0.056, 0.042, 0.022, '#cfd6e3', 0, 0.394, 0.162);

  // Dark shoulder epaulettes with gold stripes
  [-1, 1].forEach(s => {
    bx(g, 0.088, 0.020, 0.058, '#181d2b', s * 0.165 * W, 0.742, 0.0, 0, 0, -s * 0.18);
    bx(g, 0.016, 0.023, 0.060, '#ffd23f', s * 0.185 * W, 0.738, 0.0, 0, 0, -s * 0.18);
  });

  // Security chest shield badge & pocket flap
  addMesh(g, new T.OctahedronGeometry(0.032, 0), '#ffd23f', 0.115 * W, 0.625, 0.148);
  bx(g, 0.072, 0.024, 0.016, '#e6ebf5', -0.115 * W, 0.620, 0.147);
}

function build(o) {
  const G = new T.Group();
  const B = new T.Group();
  const ot = o.o;
  const W = o.w || 1;
  const legs = [];
  const arms = [];
  G.add(B);

  const isKain = !!(ot.skirt || ot.long);
  const HIP_Y = 0.39;
  const SH_Y = 0.72;

  /* 1. LEGS & SHOES (Hip pivot at y = 0.39) */
  [-1, 1].forEach(side => {
    const l = new T.Group();
    l.position.set(side * 0.115 * W, HIP_Y, 0);

    if (isKain) {
      const arcStart = side === 1 ? -0.12 : Math.PI - 0.12;
      const arcLen = Math.PI + 0.24;
      const panelGeo = createLoftGeo([
        { y: -0.31, rx: 0.245 * W, rz: 0.165, ox: -side * 0.115 * W, phase: 0 },
        { y: -0.15, rx: 0.232 * W, rz: 0.158, ox: -side * 0.115 * W, phase: 0 },
        { y:  0.00, rx: 0.220 * W, rz: 0.150, ox: -side * 0.115 * W, phase: 0 }
      ], 6, true, true, arcStart, arcLen);
      addMesh(l, panelGeo, ot.bot, 0, 0, 0, 0, 0, 0, true);
      addMesh(l, new T.CylinderGeometry(0.068 * W, 0.068 * W, 0.06, 8), ot.sock || (o.ad ? o.skin : '#f4f4f4'), 0, -0.32, 0);
    } else {
      const legGeo = createLoftGeo([
        { y: -0.33, rx: 0.088 * W, rz: 0.095, phase: Math.PI / 8 },
        { y: -0.15, rx: 0.094 * W, rz: 0.102, phase: Math.PI / 8 },
        { y:  0.01, rx: 0.102 * W, rz: 0.108, phase: Math.PI / 8 }
      ], 8, true, true);
      addMesh(l, legGeo, ot.bot);

      if (ot.stripe) {
        // Contour-wrapped tapered white stripe hugging the outer octagonal facets of the pant leg
        const sStart = side === 1 ? Math.PI * 0.25 : -Math.PI * 0.75;
        const stripeGeo = createThickOpenShell([
          { y: -0.325, rx: 0.0905 * W, rz: 0.0975, arcStart: sStart, arcLen: Math.PI * 0.50 },
          { y: -0.150, rx: 0.0965 * W, rz: 0.1045, arcStart: sStart, arcLen: Math.PI * 0.50 },
          { y: -0.005, rx: 0.1035 * W, rz: 0.1095, arcStart: sStart, arcLen: Math.PI * 0.50 }
        ], 3, 0.005);
        addMesh(l, stripeGeo, '#ffffff');
      }
    }

    const shoeY = -0.355;
    bx(l, 0.185 * W, 0.072, 0.25, ot.shoe, 0, shoeY, 0.03);
    bx(l, 0.19 * W, 0.018, 0.256, ot.shoe === '#f4f4f4' ? '#dfe3ec' : '#2a2d38', 0, shoeY - 0.032, 0.03);

    B.add(l);
    legs.push(l);
  });

  /* 2. CHIBI TORSO */
  if (isKain) {
    const hipCore = createLoftGeo([
      { y: 0.25, rx: 0.222 * W, rz: 0.148, phase: Math.PI / 8 },
      { y: 0.40, rx: 0.215 * W, rz: 0.145, phase: Math.PI / 8 }
    ], 8, true, true);
    addMesh(B, hipCore, ot.bot);

    const kurungGeo = createLoftGeo([
      { y: o.ad ? 0.24 : 0.25, rx: (o.ad ? 0.268 : 0.262) * W, rz: o.ad ? 0.175 : 0.172, phase: Math.PI / 8 },
      { y: 0.48, rx: 0.232 * W, rz: 0.155, phase: Math.PI / 8 },
      { y: 0.68, rx: 0.218 * W, rz: 0.146, phase: Math.PI / 8 },
      { y: 0.74, rx: 0.185 * W, rz: 0.130, phase: Math.PI / 8 }
    ], 8, true, true);
    addMesh(B, kurungGeo, ot.top);
    if (ot.kerongsang) {
      [0.645, 0.585, 0.525].forEach((ky, idx) => {
        addMesh(B, new T.OctahedronGeometry(idx === 0 ? 0.018 : 0.014, 0), '#ffd23f', 0, ky, 0.146 + idx * 0.003);
      });
    }
  } else {
    const shirtGeo = createLoftGeo([
      { y: 0.375, rx: 0.238 * W, rz: 0.155, phase: Math.PI / 8 },
      { y: 0.56,  rx: 0.226 * W, rz: 0.148, phase: Math.PI / 8 },
      { y: 0.70,  rx: 0.215 * W, rz: 0.142, phase: Math.PI / 8 },
      { y: 0.745, rx: 0.180 * W, rz: 0.125, phase: Math.PI / 8 }
    ], 8, true, true);
    addMesh(B, shirtGeo, ot.top);

    if (!ot.crew && (o.ad || !isKain)) {
      [-1, 1].forEach(s => {
        bx(B, 0.095, 0.042, 0.08, ot.top, s * 0.062, 0.74, 0.075, 0.25, s * 0.22, s * -0.18);
      });
    }

    if (ot.jumpsuit) {
      bx(B, 0.014, 0.35, 0.012, '#181c24', 0, 0.555, 0.148, -0.05);
      addMesh(B, createThickOpenShell([
        { y: 0.382, rx: 0.241 * W, rz: 0.158, arcStart: -Math.PI, arcLen: Math.PI * 2 },
        { y: 0.405, rx: 0.239 * W, rz: 0.157, arcStart: -Math.PI, arcLen: Math.PI * 2 }
      ], 10, 0.006), '#181c24');
    }
  }

  if (ot.tie) {
    const tz = o.ad ? 0.003 : 0;
    addMesh(B, new T.ConeGeometry(0.036, 0.055, 4), ot.tie, 0, 0.70, 0.145 + tz, Math.PI);
    bx(B, 0.052, 0.22, 0.022, ot.tie, 0, 0.57, 0.148 + tz * 1.7, o.ad ? -0.04 : 0);
    addMesh(B, new T.ConeGeometry(0.036, 0.05, 4), ot.tie, 0, 0.44, 0.148 + tz * 3.3, Math.PI);
    bx(B, 0.06, 0.035, 0.025, '#c8cdd8', 0, 0.39, 0.152 + tz * 1.3);
  }

  if (ot.nametag) {
    bx(B, 0.068, 0.024, 0.016, '#15161c', 0.112 * W, 0.625, 0.146);
    bx(B, 0.058, 0.008, 0.018, '#f4f7ff', 0.112 * W, 0.625, 0.146);
  }

  if (ot.badge) {
    const bCol = ot.badge === 'pe' ? '#ffffff' : '#e8c53a';
    bx(B, 0.055, 0.06, 0.02, bCol, 0.115 * W, 0.62, 0.146);
  }

  /* 3. ARMS IN NATURAL CHIBI A-POSE */
  [-1, 1].forEach(side => {
    const a = new T.Group();
    a.position.set(side * 0.232 * W, SH_Y, 0);
    a.rotation.z = side * 0.26;
    a.userData.z0 = side * 0.26; /* base A-pose angle, mop.js unpose() puts it back */

    const L = ot.ls ? 0.29 : 0.155;

    const slvGeo = createLoftGeo([
      { y: -L, rx: 0.065, rz: 0.065, phase: Math.PI / 8 },
      { y: -0.02, rx: 0.060, rz: 0.060, phase: Math.PI / 8 },
      { y:  0.035, rx: 0.036, rz: 0.036, phase: Math.PI / 8 }
    ], 8, true, true);
    addMesh(a, slvGeo, ot.sl || ot.top);

    if (ot.cuff) {
      // Phase-aligned (Math.PI / 8) tapered octagonal cuff matching all 8 faces of the sleeve
      const cuffH = 0.034;
      const tTop = cuffH / (L - 0.02);
      const rBot = 0.065 + 0.0022;
      const rTop = 0.065 + (0.060 - 0.065) * tTop + 0.0022;
      const cuffGeo = createLoftGeo([
        { y: -L - 0.001, rx: rBot, rz: rBot, phase: Math.PI / 8 },
        { y: -L + cuffH, rx: rTop, rz: rTop, phase: Math.PI / 8 }
      ], 8, true, true);
      addMesh(a, cuffGeo, ot.cuff);
    }

    const armGeo = createLoftGeo([
      { y: -0.34, rx: 0.046, rz: 0.046, phase: Math.PI / 8 },
      { y: -L, rx: 0.053, rz: 0.053, phase: Math.PI / 8 }
    ], 8, true, false);
    addMesh(a, armGeo, o.skin);

    addMesh(a, new T.DodecahedronGeometry(0.056, 0), o.skin, 0, -0.355, 0.005);
    bx(a, 0.032, 0.045, 0.032, o.skin, -side * 0.042, -0.345, 0.028, 0, 0, -side * 0.3);

    B.add(a);
    arms.push(a);
  });

  /* 4. NECK, BIG CHIBI HEAD, FACE & HAIR / TUDUNG */
  addMesh(B, new T.CylinderGeometry(0.085, 0.095, 0.09, 8), o.skin, 0, 0.76, 0);

  const tud = o.g === 'f' && !o.noTud ? (o.tud || ot.tud || (o.ad ? '#f3e7d3' : '#f6f7fb')) : null;
  const hasCosCap = cosHas(o, 'cap');
  const hasVCap = !!o.hasCap;
  const hasCap = hasCosCap || hasVCap;
  const hasVest = cosHas(o, 'vest') || !!o.hasVest;
  const hasApron = !!o.hasApron;
  const hasMos = cosHas(o, 'mos');
  const hasBeard = cosHas(o, 'beard') && !o.mask;
  const isBaldStubble = !tud && o.hs === 'bald';
  const fm = faceMat(o);

  B.add(createChibiHead(o.skin, o.hc, !!tud, hasCap && !tud && o.hs !== 'bald', isBaldStubble));

  const fPlane = new T.Mesh(new T.PlaneGeometry(0.48, 0.48), fm);
  fPlane.position.set(0, 1.03, 0.273);
  B.add(fPlane);

  if (tud) {
    buildWrappedTudung(B, tud, hasVest);
  } else {
    [-1, 1].forEach(s => {
      bx(B, 0.075, 0.13, 0.08, o.skin, s * 0.325, 1.01, -0.01);
    });
    buildUnifiedHair(B, o.hs, o.hc, hasCap);
  }

  // Front-only pleated surgical face mask with cheek-wrapped white ear loops
  if (o.mask) {
    buildFaceMask(B);
  }

  /* 5. PLAYER BAG COSMETICS (Topi, Penutup Mata, Misai + Janggut, Rompi) */
  if (hasVCap) {
    buildVendorCap(B, o.capCol || '#c8293a', o.visorCol || '#961a28', !!tud, !!ot.security);
  }

  if (hasCosCap) {
    const capY = tud ? 1.38 : 1.31;
    const capS = tud ? 1.06 : 1.0;
    const crown = createLoftGeo([
      { y: capY - 0.09, rx: 0.368 * capS, rz: 0.336 * capS, phase: Math.PI / 8 },
      { y: capY + 0.04, rx: 0.335 * capS, rz: 0.308 * capS, phase: Math.PI / 8 },
      { y: capY + 0.12, rx: 0.185 * capS, rz: 0.180 * capS, phase: Math.PI / 8 }
    ], 8, false, true);
    addMesh(B, crown, '#c8293a');
    addMesh(B, new T.CylinderGeometry(0.26 * capS, 0.27 * capS, 0.032, 8), '#a01c2c', 0, capY - 0.085, 0.255 * capS, 0.10);
    addMesh(B, new T.OctahedronGeometry(0.038, 0), '#8a1a28', 0, capY + 0.13, 0);
  }

  if (cosHas(o, 'eye')) {
    buildPirateEyepatch(B);
  }

  const fhCol = (o.hc === '#1a1d26' || o.hc === '#14161d') ? '#2c221c' : (o.hc || '#2c221c');
  if (hasMos) {
    build3DMoustache(B, fhCol);
  }
  if (hasBeard) {
    build3DBeard(B, fhCol, !!tud, hasMos);
  }

  if (hasVest) {
    buildOpenVest(B, W, !!tud);
  }

  let apronSkirt = null;
  if (hasApron) {
    apronSkirt = buildApron(B, W, o.apronCol || '#f2f4f8', o.apronTrim || '#cfd6e3', isKain);
  }

  if (ot.security) {
    buildSecurityDetails(B, W);
  }

  if (o.glasses && o.glasses !== 'none') {
    buildGlasses(B, o.glasses, o.glassCol, !!tud);
  }

  G.scale.setScalar((o.h || 1) * (o.ad ? CH_A : CH_S));
  G.userData = { legs, arms, B, apronSkirt, ht: hasCap ? 1.52 : 1.45, ph: Math.random() * 6, g: o.g || 'm' };
  G.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return G;
}

/* ====== Round 23: game layer (looks, outfits, roles). Everything above this line is the chibi engine from the four design viewers. ====== */
const CH_S = 1.2, CH_A = 1.08; /* Round 25: size knobs. CH_S = player and students, CH_A = teachers, staff and other adults (1 = native chibi size; the doors are 2.3 high, the lockers 2.0) */
const HCA = ['#14161d', '#2a1d16', '#3b2a1e', '#5a3a22', '#4c515c', '#8e95a3'];
const BH = ['short', 'fringe', 'spiky', 'side', 'crew'], GH = ['bob', 'pony', 'bun', 'pigtails', 'braid'];
const vhs = (g, h) => g === 'f' ? (GH.indexOf(h) >= 0 ? h : 'bob') : (BH.indexOf(h) >= 0 || h === 'bald' ? h : 'fringe');
const KURUNG = [
  { kurung: '#c47482', kain: '#9e5260', tudung: ['#f3e7d3', '#e8bcc4', '#8a3f4d', '#f7f3ed'] },
  { kurung: '#6c8c77', kain: '#4c6b57', tudung: ['#f3e7d3', '#bdd4c5', '#365240', '#f7f3ed'] },
  { kurung: '#8a79a8', kain: '#665682', tudung: ['#f3e7d3', '#cfc3e3', '#4d3e69', '#f7f3ed'] },
  { kurung: '#c79532', kain: '#9c701c', tudung: ['#f5ebd6', '#ebd094', '#69471b', '#382c2b'] },
  { kurung: '#7a2836', kain: '#591823', tudung: ['#f3e7d3', '#dba9b2', '#e8e0d5', '#47121b'] },
  { kurung: '#2d6e78', kain: '#1d5058', tudung: ['#f3e7d3', '#9ec9d0', '#163f46', '#f7f3ed'] },
  { kurung: '#d48c74', kain: '#ad6750', tudung: ['#f5eadc', '#f0c6b7', '#854633', '#f7f3ed'] },
  { kurung: '#266b4e', kain: '#194d37', tudung: ['#f3e7d3', '#98ccb6', '#123b2a', '#e8e0d5'] }
];
const KEMEJA = [
  { shirt: '#5c85b2', ties: ['#1c2c4a', '#7a2634', '#363d4a', '#8c6828'] },
  { shirt: '#7d2938', ties: ['#222630', '#4a3b2b', '#8c6828', '#384152'] },
  { shirt: '#5c755e', ties: ['#2a362b', '#5c3c24', '#222630', '#8c6828'] },
  { shirt: '#8878a6', ties: ['#3b2f52', '#222630', '#6e283b', '#464d5c'] },
  { shirt: '#e6dbc5', ties: ['#6e283b', '#2b4737', '#3b2b20', '#24354d'] },
  { shirt: '#2f6f78', ties: ['#193c42', '#7a2634', '#222630', '#8c6828'] },
  { shirt: '#474d59', ties: ['#7a2634', '#243854', '#8c6828', '#1d2026'] }
];
const SLACKS = ['#1e222b', '#2e241e', '#3b404c', '#52483b'];
const GLCOL = ['#181a20', '#4f301b', '#c9a23f', '#9ea7b5'];
const CTOPS = [
  { col: '#2f737d', tudung: ['#f3e7d3', '#9ec9d0', '#194248', '#f7f3ed'] },
  { col: '#c9685b', tudung: ['#f5eadc', '#f0beb7', '#7d342b', '#f7f3ed'] },
  { col: '#c99736', tudung: ['#f5ebd6', '#ebd094', '#69471b', '#382c2b'] },
  { col: '#63856e', tudung: ['#f3e7d3', '#bdd4c5', '#365240', '#f7f3ed'] },
  { col: '#5787b8', tudung: ['#f3e7d3', '#bdd4ed', '#26476b', '#f7f3ed'] },
  { col: '#7d2b39', tudung: ['#f3e7d3', '#dba9b2', '#47121b', '#e8e0d5'] },
  { col: '#8474a1', tudung: ['#f3e7d3', '#cfc3e3', '#4d3e69', '#f7f3ed'] },
  { col: '#e3d5be', tudung: ['#6e4730', '#3d4f43', '#8c3b47', '#2c3647'] }
];
const CBOT = [
  { col: '#263854' }, { col: '#20242e' }, { col: '#5c503e' },
  { col: '#542938', kain: 1 }, { col: '#294d42', kain: 1 }, { col: '#593924', kain: 1 }
];
const CAPS = [
  { col: '#c8293a', visor: '#961a28' }, { col: '#2556c9', visor: '#193d94' }, { col: '#e0a826', visor: '#b07f12' },
  { col: '#eef1f7', visor: '#c7cfde' }, { col: '#1c2650', visor: '#121836' }
];
const APRONS = [
  { col: '#f2f4f8', trim: '#cfd6e3' }, { col: '#1d2d4f', trim: '#385185' }, { col: '#732331', trim: '#9e384a' },
  { col: '#234d39', trim: '#387357' }, { col: '#4f3727', trim: '#75533c' }
];
const GLS = ['rect', 'round', 'half'];

const OUT = {
  uni: {
    m: { top: '#f6f7fb', bot: '#1c2650', shoe: '#f4f4f4' },
    f: { top: '#f6f7fb', bot: '#1c2650', shoe: '#f4f4f4', skirt: 0.3, ls: 1, tud: '#f6f7fb' }
  },
  pe: {
    m: { top: '#2556c9', bot: '#1f4ec2', shoe: '#9ca1aa', cuff: '#c8293a', stripe: 1, crew: 1, badge: 'pe' },
    f: { top: '#f6f7fb', sl: '#2556c9', cuff: '#c8293a', bot: '#1f4ec2', shoe: '#f4f4f4', stripe: 1, ls: 1, tud: '#f6f7fb' }
  },
  pre: {
    m: { top: '#4f8ad0', bot: '#1c2650', shoe: '#15151a', tie: '#1c2650', badge: 1, ls: 1 },
    f: { top: '#4f8ad0', bot: '#1c2650', shoe: '#15151a', skirt: 0.3, sock: '#f4f4f4', ls: 1, badge: 1, tud: '#3f78c4' }
  }
};

function player(g, out, L) {
  L = L || {};
  return build({
    g,
    o: OUT[out][g],
    skin: L.sk || '#b87a50',
    hc: L.hc || '#14161d',
    hs: vhs(g, L.hs),
    tud: g === 'f' ? L.tud : null,
    noTud: L.nt,
    es: L.es || 1,
    mouth: L.mo || 0,
    mask: L.mask,
    cos: typeof BAG !== 'undefined' && BAG.worn ? BAG.worn() : null
  }); /* Round 17: the menu page has no BAG, so the setup preview never shows cosmetics */
}

/* casual adult clothes shared by canteen staff, ice cream man, runcit shop and the nasi lemak makcik */
function casual(g, skin, sarung) {
  const f = g === 'f', top = R(CTOPS);
  let bot = f && sarung ? R(CBOT.filter(b => b.kain)) : (f ? R(CBOT) : R(CBOT.filter(b => !b.kain)));
  const o = { top: top.col, bot: bot.col, shoe: '#1e2028', skirt: bot.kain ? 0.3 : 0, sock: skin, ls: f ? 1 : (Math.random() < 0.5 ? 1 : 0), crew: !f };
  return { out: o, top };
}

function npc(role, g, x) {
  x = x || {};
  if (role === 'penjual') role = (g === 'f') ? 'nasilemak' : 'icecream';
  if (role === 'cuci' || role === 'guard') g = 'm';
  if (role === 'nasilemak') g = 'f';
  g = g || R(['m', 'f']);
  const f = g === 'f';
  const o = { g, skin: R(SK), hc: R(HC), h: rnd(0.95, 1.05), w: rnd(0.94, 1.1), mouth: R([0, 0, 1, 2]), es: R([0.85, 1, 1.15]) };
  if (role === 'murid' || role === 'pengawas') {
    o.o = Object.assign({}, OUT[x.out || (role === 'murid' ? (Math.random() < 0.2 ? 'pe' : 'uni') : 'pre')][g]);
    if (f) { if (Math.random() < 0.4) { o.noTud = true; o.hs = R(GH); } }
    else o.hs = R(['short', 'fringe', 'spiky', 'side', 'crew', 'short']);
    if (role === 'murid') o.mask = Math.random() < 0.2;
  } else {
    o.ad = 1; o.h = rnd(1.24, 1.32); o.w = rnd(1.04, 1.12); o.hc = R(HCA);
    if (role === 'cuci') {
      o.h = rnd(1.22, 1.28);
      o.o = { top: '#3c4d3a', bot: '#3c4d3a', shoe: '#241d18', ls: 1, jumpsuit: true };
      o.hs = 'short'; o.hasVest = true; o.glasses = 'rect'; o.glassCol = '#181a20'; o.cos = ['mos'];
    } else if (role === 'guard') {
      o.o = { top: '#f6f7fb', bot: '#161820', shoe: '#121318', ls: 1, security: true };
      o.hs = R(['short', 'crew']); o.hasCap = true; o.capCol = '#181d2b'; o.visorCol = '#0e111a';
    } else if (role === 'canteen' || role === 'icecream' || role === 'runcit' || role === 'nasilemak') {
      const c = casual(g, o.skin, role === 'nasilemak');
      o.o = c.out;
      if (f) { if (role === 'nasilemak' || Math.random() < 0.75) o.tud = R(c.top.tudung); else { o.noTud = true; o.hs = R(['bun', 'bob', 'pony']); } }
      else { o.hs = R(['short', 'fringe', 'side', 'crew', 'bald']); if (Math.random() < 0.25) o.cos = ['mos']; }
      if (Math.random() < 0.25) { o.glasses = R(GLS); o.glassCol = R(GLCOL); }
      if (role === 'canteen') {
        const ap = x.apronCol ? { col: x.apronCol, trim: x.apronTrim || '#f2f4f8' } : R(APRONS);
        o.hasApron = true; o.apronCol = ap.col; o.apronTrim = ap.trim;
        if (!f && Math.random() < 0.5) { const cp = R(CAPS); o.hasCap = true; o.capCol = cp.col; o.visorCol = cp.visor; }
      } else if (role === 'icecream') { const cp = R(CAPS); o.hasCap = true; o.capCol = cp.col; o.visorCol = cp.visor; }
    } else { /* guru (teacher); any other word also becomes a teacher */
      if (f) {
        const th = R(KURUNG);
        o.o = { top: th.kurung, bot: Math.random() < 0.5 ? th.kain : th.kurung, shoe: '#1b1d24', skirt: 0.3, sock: o.skin, ls: 1, nametag: Math.random() < 0.5 };
        if (Math.random() < 0.7) o.tud = R(th.tudung);
        else { o.noTud = true; o.hs = R(['bun', 'bob', 'pony']); o.o.kerongsang = Math.random() < 0.5; }
      } else {
        const th = R(KEMEJA);
        o.o = { top: th.shirt, bot: R(SLACKS), shoe: '#15151a', ls: 1, tie: Math.random() < 0.7 ? R(th.ties) : null, nametag: Math.random() < 0.5 };
        o.hs = R(['short', 'fringe', 'bald', 'side']);
        if (Math.random() < 0.3) o.cos = ['mos'];
      }
      if (Math.random() < 0.4) { o.glasses = R(GLS); o.glassCol = R(GLCOL); }
    }
  }
  if (x.h) o.h = x.h;
  const G = build(o); G.userData.g = g; return G;
}

function anim(G, t, mv) {
  const u = G.userData, w = Math.sin(t * 8 + u.ph);
  if (mv) {
    u.legs[0].rotation.x = w * 0.58; u.legs[1].rotation.x = -w * 0.58;
    u.arms[0].rotation.x = -w * 0.48; u.arms[1].rotation.x = w * 0.48;
    u.B.position.y = Math.abs(w) * 0.025;
  } else {
    u.legs.forEach(l => l.rotation.x = 0); u.arms.forEach(a => a.rotation.x = 0); u.B.position.y = 0;
  }
}
return { build, player, npc, anim, OUT, sz: { s: CH_S, a: CH_A } };
})();
function build(o) { return CHR.build(o) }
function player(g, out, L) { return CHR.player(g, out, L) }
function npc(role, g, x) { return CHR.npc(role, g, x) }
function anim(G, t, mv) { return CHR.anim(G, t, mv) }
const OUT = CHR.OUT;
const CHSZ = CHR.sz; /* Round 25: {s: student and player scale, a: adult scale} */
/* Round 25: y of a seated character: the hips (.39 x scale) rest on the seat top at .50 */
function seatY(G) { return 0.5 - 0.39 * (G ? G.scale.y : 1); }
/* Round 24: world height of a character's head top (userData.ht x scale); speech bubbles sit .14 above it */
function headY(G) { const u = G && G.userData; return ((u && u.ht) || 1.45) * (G ? G.scale.y : 1); }


/* Round 10b3: the easter egg vase. Low-poly faceted white vase (8 sides, shaded flat, edges nudged so the facets are uneven) with 6 bamboo sticks leaning out of it.
   Same look in every room (world, Kantin, Padang, classrooms). Built from code only. Size: about 1 m tall, 0.33 m radius, sticks up to 2 m. Callers add their own collision. */
function mkVase(p,x,z){const g=new T.Group(),pts=[[0,0],[.2,0],[.27,.12],[.32,.3],[.28,.5],[.33,.68],[.28,.86],[.24,.98],[.2,1],[.17,.96]].map(a=>new T.Vector2(a[0],a[1])),lg=new T.LatheGeometry(pts,8),pa=lg.attributes.position;
 for(let i=0;i<pa.count;i++){const px=pa.getX(i),py=pa.getY(i),pz=pa.getZ(i),j=1+.07*Math.sin(px*37.1+py*23.7+pz*51.3);pa.setX(i,px*j);pa.setZ(i,pz*j)}
 const v=new T.Mesh(lg,mat('#ecebe6'));v.material.side=T.DoubleSide;v.castShadow=true;g.add(v);
 const m0=new T.Mesh(new T.CylinderGeometry(.19,.19,.02,8),mat('#2e2a28'));m0.position.y=.93;g.add(m0);
 [[-.1,.05,.1,-.18,1.9],[.08,-.06,-.22,.1,1.65],[.02,.1,.05,.28,1.8],[-.05,-.09,.3,.05,1.5],[.1,.08,-.12,-.3,1.7],[-.02,-.02,-.05,.02,2]].forEach(a=>{const s=new T.Group(),L=a[4],c=new T.CylinderGeometry(.034,.04,L,6);c.translate(0,L/2,0);s.add(new T.Mesh(c,mat('#e0b060')));
  [.3,.58,.82].forEach(f=>{const r=new T.Mesh(new T.CylinderGeometry(.05,.05,.03,6),mat('#b98a3e'));r.position.y=L*f;s.add(r)});s.position.set(a[0],.95,a[1]);s.rotation.x=a[2];s.rotation.z=a[3];g.add(s)});
 g.position.set(x,0,z);p.add(g);return g}

/* Round 10g: glass double door (black-framed glass look). Flat MeshBasicMaterial planes only, all opaque: the wall fade in the world, Kantin and classrooms sets opacity directly.
   p = parent, (x,z) = centre of the door foot, ry = facing (normal = sin ry, cos ry), w x h = size, frame = frame colour, g0 = offset of the glass along the normal (layers sit in front of it).
   Glass #9fcde2, frame bars, centre stile, 2 leaves of 2 columns x 3 rows, copper handles. Returns the meshes (callers push them into their fade lists). */
function gdoor(p,x,z,ry,w,h,frame,g0){const nx=Math.sin(ry),nz=Math.cos(ry),tx=nz,tz=-nx,out=[],b=.07,kb=.16,st=.1;
 const pe=(pw,ph,c,o,y,e)=>{const m=new T.Mesh(new T.PlaneGeometry(pw,ph),new T.MeshBasicMaterial({color:c}));m.position.set(x+nx*(g0+e)+tx*o,y,z+nz*(g0+e)+tz*o);m.rotation.y=ry;p.add(m);out.push(m);return m};
 pe(w,h,'#9fcde2',0,h/2,0);
 pe(b,h,frame,-(w/2-b/2),h/2,.02);pe(b,h,frame,w/2-b/2,h/2,.02);pe(w,b,frame,0,h-b/2,.022);pe(w,kb,frame,0,kb/2,.022);pe(st,h,frame,0,h/2,.024); /* frame layers 2 mm apart so crossing bars never share a depth */
 const ih=h-kb-b,lw=w/2-b-st/2;
 [-1,1].forEach(s=>{const oc=s*(st/2+lw/2);pe(.045,ih,frame,oc,kb+ih/2,.026);[1,2].forEach(k=>pe(lw,.045,frame,oc,kb+ih*k/3,.028))});
 [-1,1].forEach(s=>pe(.05,.45,'#c98a5a',s*.2,1.05,.04));
 return out}
