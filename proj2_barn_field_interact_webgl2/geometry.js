"use strict";

function makeCircle(segments) {
  const positions = [];
  const colors = [];
  const indices = [];

  positions.push(0, 0, 0);
  colors.push(0.5, 0.5, 0.5);

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle), 0, Math.sin(angle));
    colors.push(0.5, 0.5, 0.5);
  }

  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }

  return {
    a_position: { numComponents: 3, data: positions },
    a_color:    { numComponents: 3, data: colors },
    indices:    indices,
  };
}

function makeSquare() {
  return {
    a_position: {
      numComponents: 3,
      data: [
        -0.5, 0, -0.5,
         0.5, 0, -0.5,
         0.5, 0,  0.5,
        -0.5, 0,  0.5,
      ],
    },
    a_color: {
      numComponents: 3,
      // 0x3cb371 = mediumseagreen
      data: [
        0.235, 0.702, 0.443,
        0.235, 0.702, 0.443,
        0.235, 0.702, 0.443,
        0.235, 0.702, 0.443,
      ],
    },
    indices: [0, 2, 1, 0, 3, 2],
  };
}

function makeCylinder(segments, height, radius) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Bottom cap
  positions.push(0, 0, 0);
  // 0x8b4513 = saddlebrown
  colors.push(0.545, 0.271, 0.075);
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
    colors.push(0.545, 0.271, 0.075);
  }

  // Top cap
  positions.push(0, height, 0);
  colors.push(0.545, 0.271, 0.075);
  const topCenterIndex = segments + 2;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(radius * Math.cos(angle), height, radius * Math.sin(angle));
    colors.push(0.545, 0.271, 0.075);
  }

  for (let i = 1; i <= segments; i++) {
    indices.push(0, i + 1, i);
  }

  for (let i = 1; i <= segments; i++) {
    indices.push(topCenterIndex, topCenterIndex + i + 1, topCenterIndex + i);
  }

  const bottomStart = 1;
  const topStart = topCenterIndex + 1;
  for (let i = 0; i < segments; i++) {
    const b0 = bottomStart + i;
    const b1 = bottomStart + i + 1;
    const t0 = topStart + i;
    const t1 = topStart + i + 1;
    indices.push(b0, t0, b1);
    indices.push(b1, t0, t1);
  }

  return {
    a_position: { numComponents: 3, data: positions },
    a_color:    { numComponents: 3, data: colors },
    indices:    indices,
  };
}

function makeSphere(segments, radius) {
  const positions = [];
  const colors = [];
  const indices = [];

  for (let lat = 0; lat <= segments; lat++) {
    const theta = lat * Math.PI / segments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= segments; lon++) {
      const phi = lon * 2 * Math.PI / segments;
      positions.push(
        radius * Math.cos(phi) * sinTheta,
        radius * cosTheta,
        radius * Math.sin(phi) * sinTheta
      );
      // 0x228b22 = forestgreen
      colors.push(0.133, 0.545, 0.133);
    }
  }

  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const first = lat * (segments + 1) + lon;
      const second = first + segments + 1;
      indices.push(first, first + 1, second);
      indices.push(second, first + 1, second + 1);
    }
  }

  return {
    a_position: { numComponents: 3, data: positions },
    a_color:    { numComponents: 3, data: colors },
    indices:    indices,
  };
}

function makeBox(width, height, depth) {
  const w = width / 2, h = height / 2, d = depth / 2;

  const positions = [
    // front  (z = +d)
    -w, -h,  d,   w, -h,  d,   w,  h,  d,  -w,  h,  d,
    // back   (z = -d)
    -w, -h, -d,  -w,  h, -d,   w,  h, -d,   w, -h, -d,
    // top    (y = +h)
    -w,  h, -d,  -w,  h,  d,   w,  h,  d,   w,  h, -d,
    // bottom (y = -h)
    -w, -h, -d,   w, -h, -d,   w, -h,  d,  -w, -h,  d,
    // right  (x = +w)
     w, -h, -d,   w,  h, -d,   w,  h,  d,   w, -h,  d,
    // left   (x = -w)
    -w, -h, -d,  -w, -h,  d,  -w,  h,  d,  -w,  h, -d,
  ];

  // 0xb32222 = firebrick
  const colors = [];
  for (let i = 0; i < 24; i++) {
    colors.push(0.698, 0.133, 0.133);
  }

  // CCW winding when viewed from outside each face
  const indices = [
    0,  1,  2,    0,  2,  3,
    4,  5,  6,    4,  6,  7,
    8,  9,  10,   8,  10, 11,
    12, 13, 14,   12, 14, 15,
    16, 17, 18,   16, 18, 19,
    20, 21, 22,   20, 22, 23,
  ];

  return {
    a_position: { numComponents: 3, data: positions },
    a_color:    { numComponents: 3, data: colors },
    indices:    indices,
  };
}

function makeBarn() {
  const w = 10;       // half-width  (total 20)
  const wallH = 10;   // wall height
  const peakH = 15;   // roof peak height
  const d = 12.5;     // half-depth  (total 25)

  const wallColor = [0.698, 0.133, 0.133]; // firebrick red
  const roofColor = [0.45, 0.08, 0.08];    // darker red

  const positions = [];
  const colors = [];
  const indices = [];
  let idx = 0;

  // Helper: add a face (quad or pentagon) with CCW winding from outside.
  // Pentagon uses a triangle-fan from the first vertex.
  function addFace(verts, color) {
    const base = idx;
    for (const v of verts) {
      positions.push(v[0], v[1], v[2]);
      colors.push(color[0], color[1], color[2]);
      idx++;
    }
    for (let i = 1; i < verts.length - 1; i++) {
      indices.push(base, base + i, base + i + 1);
    }
  }

  // Front gable (z = +d, outward normal = +z)
  addFace([
    [-w, 0, d], [w, 0, d], [w, wallH, d], [0, peakH, d], [-w, wallH, d],
  ], wallColor);

  // Back gable (z = -d, outward normal = -z)
  addFace([
    [-w, 0, -d], [-w, wallH, -d], [0, peakH, -d], [w, wallH, -d], [w, 0, -d],
  ], wallColor);

  // Left wall (x = -w, outward normal = -x)
  addFace([
    [-w, 0, -d], [-w, 0, d], [-w, wallH, d], [-w, wallH, -d],
  ], wallColor);

  // Right wall (x = +w, outward normal = +x)
  addFace([
    [w, 0, d], [w, 0, -d], [w, wallH, -d], [w, wallH, d],
  ], wallColor);

  // Bottom (y = 0, outward normal = -y)
  addFace([
    [-w, 0, d], [-w, 0, -d], [w, 0, -d], [w, 0, d],
  ], wallColor);

  // Left roof slope (outward normal = upper-left)
  addFace([
    [-w, wallH, -d], [-w, wallH, d], [0, peakH, d], [0, peakH, -d],
  ], roofColor);

  // Right roof slope (outward normal = upper-right)
  addFace([
    [w, wallH, d], [w, wallH, -d], [0, peakH, -d], [0, peakH, d],
  ], roofColor);

  return {
    a_position: { numComponents: 3, data: positions },
    a_color:    { numComponents: 3, data: colors },
    indices:    indices,
  };
}
