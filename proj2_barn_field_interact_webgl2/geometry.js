"use strict";

//
// Geometry Creation Functions
//
function makeCircle(segments) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Center vertex
  positions.push(0, 0, 0);
  colors.push(0.5, 0.5, 0.5);

  // Circle vertices
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(angle), 0, Math.sin(angle));
    colors.push(0.5, 0.5, 0.5);
  }

  // Indices for triangles
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
    numElements: indices.length
  };
}

function makeSquare() {
  const positions = [
    -0.5, 0, -0.5,
     0.5, 0, -0.5,
     0.5, 0,  0.5,
    -0.5, 0,  0.5,
  ];
  // 0x3cb371 = RGB(60, 179, 113) = (0.235, 0.702, 0.443)
  const colors = [
    0.235, 0.702, 0.443,
    0.235, 0.702, 0.443,
    0.235, 0.702, 0.443,
    0.235, 0.702, 0.443,
  ];
  // Reverse winding order for counter-clockwise (front-facing)
  const indices = [
    0, 2, 1,
    0, 3, 2,
  ];

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
    numElements: indices.length
  };
}

function makeCylinder(segments, height, radius) {
  const positions = [];
  const colors = [];
  const indices = [];

  // Bottom circle
  positions.push(0, 0, 0);
  // 0x8b4513 = RGB(139, 69, 19) = (0.545, 0.271, 0.075)
  colors.push(0.545, 0.271, 0.075);
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
    colors.push(0.545, 0.271, 0.075);
  }

  // Top circle
  positions.push(0, height, 0);
  colors.push(0.545, 0.271, 0.075);
  const topCenterIndex = segments + 2;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions.push(radius * Math.cos(angle), height, radius * Math.sin(angle));
    colors.push(0.545, 0.271, 0.075);
  }

  // Bottom face indices (counter-clockwise when viewed from below)
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i + 1, i);
  }

  // Top face indices (counter-clockwise when viewed from above)
  for (let i = 1; i <= segments; i++) {
    indices.push(topCenterIndex, topCenterIndex + i + 1, topCenterIndex + i);
  }

  // Side indices (counter-clockwise when viewed from outside)
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
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
    numElements: indices.length
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
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = radius * cosPhi * sinTheta;
      const y = radius * cosTheta;
      const z = radius * sinPhi * sinTheta;

      positions.push(x, y, z);
      // 0x228b22 = RGB(34, 139, 34) = (0.133, 0.545, 0.133)
      colors.push(0.133, 0.545, 0.133);
    }
  }

  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const first = lat * (segments + 1) + lon;
      const second = first + segments + 1;

      // Counter-clockwise winding for front-facing
      indices.push(first, first + 1, second);
      indices.push(second, first + 1, second + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
    numElements: indices.length
  };
}

function makeBox(width, height, depth) {
  const w = width / 2;
  const h = height / 2;
  const d = depth / 2;

  const positions = [
    -w, -h,  d,   w, -h,  d,   w,  h,  d,  -w,  h,  d,
    -w, -h, -d,  -w,  h, -d,   w,  h, -d,   w, -h, -d,
    -w,  h, -d,  -w,  h,  d,   w,  h,  d,   w,  h, -d,
    -w, -h, -d,   w, -h, -d,   w, -h,  d,  -w, -h,  d,
     w, -h, -d,   w,  h, -d,   w,  h,  d,   w, -h,  d,
    -w, -h, -d,  -w, -h,  d,  -w,  h,  d,  -w,  h, -d,
  ];

  const colors = [];
  const red = [0.698, 0.133, 0.133];
  for (let i = 0; i < 24; i++) {
    colors.push(...red);
  }

  // Counter-clockwise winding for front-facing (viewed from outside)
  const indices = [
    0,  2,  1,    0,  3,  2,    // front
    4,  6,  5,    4,  7,  6,    // back
    8,  10, 9,    8,  11, 10,   // top
    12, 14, 13,   12, 15, 14,   // bottom
    16, 18, 17,   16, 19, 18,   // right
    20, 22, 21,   20, 23, 22,   // left
  ];

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    indices: new Uint16Array(indices),
    numElements: indices.length
  };
}

function makeBarn() {
  return makeBox(20, 15, 25);
}
