"use strict";

//
// Shaders
//
const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_color;

uniform mat4 u_matrix;

out vec3 v_color;

void main() {
  gl_Position = u_matrix * a_position;
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_color;
out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}
`;

//
// Matrix Library (m4) 
//
const m4 = {
  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function(tx, ty, tz) {
    return [
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function(m, tx, ty, tz) {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function(m, angleInRadians) {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  scale: function(m, sx, sy, sz) {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

  inverse: function(m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
             (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
             (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
             (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
             (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
      d * t0,
      d * t1,
      d * t2,
      d * t3,
      d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
           (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
      d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
           (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
      d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
           (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
      d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
           (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
      d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
           (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
      d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
           (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
      d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
           (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
      d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
           (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
      d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
           (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
      d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
           (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
      d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
           (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
      d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
           (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
    ];
  },

  lookAt: function(cameraPosition, target, up) {
    var zAxis = [
      cameraPosition[0] - target[0],
      cameraPosition[1] - target[1],
      cameraPosition[2] - target[2]
    ];
    var len = Math.hypot(zAxis[0], zAxis[1], zAxis[2]);
    if (len > 0.00001) {
      zAxis[0] /= len;
      zAxis[1] /= len;
      zAxis[2] /= len;
    }

    var xAxis = [
      up[1] * zAxis[2] - up[2] * zAxis[1],
      up[2] * zAxis[0] - up[0] * zAxis[2],
      up[0] * zAxis[1] - up[1] * zAxis[0]
    ];
    len = Math.hypot(xAxis[0], xAxis[1], xAxis[2]);
    if (len > 0.00001) {
      xAxis[0] /= len;
      xAxis[1] /= len;
      xAxis[2] /= len;
    }

    var yAxis = [
      zAxis[1] * xAxis[2] - zAxis[2] * xAxis[1],
      zAxis[2] * xAxis[0] - zAxis[0] * xAxis[2],
      zAxis[0] * xAxis[1] - zAxis[1] * xAxis[0]
    ];

    return [
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      cameraPosition[0], cameraPosition[1], cameraPosition[2], 1
    ];
  },
};

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

//
// WebGL Setup
//
let gl, program, positionLocation, colorLocation, matrixLocation;
let canvas;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking program:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function createMeshVAO(gl, mesh) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  return {
    vao: vao,
    numElements: mesh.numElements
  };
}

function drawMesh(meshVAO, worldMatrix, viewProjMatrix) {
  const matrix = m4.multiply(viewProjMatrix, worldMatrix);
  gl.uniformMatrix4fv(matrixLocation, false, matrix);
  gl.bindVertexArray(meshVAO.vao);
  gl.drawElements(gl.TRIANGLES, meshVAO.numElements, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null);
}

//
// Scene Setup
//
const scene = {
  player: {
    position: [0, 0, 0],  // Position represents bottom of cylinder (on ground)
    rotation: 0,
    radius: 2,
    speed: 0.4,
    rotationSpeed: 0.04,
    height: 8,  // Cylinder height
  },

  objects: [],

  ground: {
    size: 500,
  }
};

const groundMesh = makeSquare();
const playerMeshBase = makeCylinder(16, 8, 2);
const treeTrunkMesh = makeCylinder(12, 15, 2);
const treeCanopyMesh = makeSphere(16, 8);
const barnMesh = makeBarn();

// Create blue player mesh
const blueColors = [];
for (let i = 0; i < playerMeshBase.positions.length / 3; i++) {
  blueColors.push(0, 0, 1);
}
const playerMesh = {
  positions: playerMeshBase.positions,
  colors: new Float32Array(blueColors),
  indices: playerMeshBase.indices,
  numElements: playerMeshBase.numElements
};

let groundVAO, playerVAO, treeTrunkVAO, treeCanopyVAO, barnVAO;

const tree = {
  id: "tree",
  position: [30, 0, -40],  // Position represents bottom of trunk (on ground)
  radius: 10,
  trunkVAO: null,
  canopyVAO: null,
};

const barn = {
  id: "barn",
  position: [-40, 0, -20],  // Position represents bottom of barn (on ground)
  radius: 18,
  vao: null,
};

scene.objects.push(tree, barn);

//
// Input Handling
//
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

//
// Player Movement
//
function forwardVector(rotation) {
  return [
    Math.sin(rotation),
    0,
    Math.cos(rotation)
  ];
}

function updatePlayer() {
  const p = scene.player;
  
  if (keys["a"]) p.rotation += p.rotationSpeed;
  if (keys["d"]) p.rotation -= p.rotationSpeed;

  let forward = 0;
  if (keys["w"]) forward = 1;
  if (keys["s"]) forward = -1;

  if (forward !== 0) {
    const dir = forwardVector(p.rotation);
    let nextPos = [
      p.position[0] + dir[0] * forward * p.speed,
      0,  // Always keep player on ground (y=0)
      p.position[2] + dir[2] * forward * p.speed
    ];

    // Keep player within field bounds (ground is 500x500, centered at origin)
    // Account for player radius so player doesn't go outside the field
    const fieldHalfSize = scene.ground.size / 2;
    const maxX = fieldHalfSize - p.radius;
    const maxZ = fieldHalfSize - p.radius;
    nextPos[0] = Math.max(-maxX, Math.min(maxX, nextPos[0]));
    nextPos[2] = Math.max(-maxZ, Math.min(maxZ, nextPos[2]));

    if (!collides(nextPos, p.radius)) {
      p.position = nextPos;
    }
  }
  
  // Ensure player stays on ground and within bounds
  p.position[1] = 0;
  const fieldHalfSize = scene.ground.size / 2;
  const maxX = fieldHalfSize - p.radius;
  const maxZ = fieldHalfSize - p.radius;
  p.position[0] = Math.max(-maxX, Math.min(maxX, p.position[0]));
  p.position[2] = Math.max(-maxZ, Math.min(maxZ, p.position[2]));
}

function collides(pos, radius) {
  for (const obj of scene.objects) {
    const dx = pos[0] - obj.position[0];
    const dz = pos[2] - obj.position[2];
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < radius + obj.radius) {
      return true;
    }
  }
  return false;
}

//
// Camera
//
function computeCamera() {
  const p = scene.player;
  const f = forwardVector(p.rotation);
  
  // Camera looks at center of player (halfway up the cylinder)
  // Player bottom is at y=0, center is at y=height/2
  const playerCenter = [
    p.position[0],
    p.height / 2,
    p.position[2]
  ];

  // Camera positioned behind player, elevated
  const cameraPos = [
    playerCenter[0] - f[0] * 30,
    20,
    playerCenter[2] - f[2] * 30
  ];

  return {
    position: cameraPos,
    target: playerCenter,
  };
}

//
// Rendering
//
function renderPlayer(viewProj) {
  const p = scene.player;
  let world = m4.identity();
  // Cylinder mesh goes from y=0 to y=height, so translate by position to put bottom at y=0
  world = m4.translate(world, p.position[0], p.position[1], p.position[2]);
  world = m4.yRotate(world, p.rotation);
  drawMesh(playerVAO, world, viewProj);
}

function renderTree(viewProj) {
  const t = tree;
  
  // Trunk: cylinder mesh goes from y=0 to y=15, so translate by position to put bottom at y=0
  let world = m4.identity();
  world = m4.translate(world, t.position[0], t.position[1], t.position[2]);
  drawMesh(t.trunkVAO, world, viewProj);
  
  // Canopy: sphere centered at origin, translate to top of trunk (y=15) + sphere center
  world = m4.identity();
  world = m4.translate(world, t.position[0], 15, t.position[2]);
  drawMesh(t.canopyVAO, world, viewProj);
}

function renderBarn(viewProj) {
  const b = barn;
  // Barn: box is centered at origin, goes from y=-7.5 to y=+7.5
  // To put bottom at y=0, translate up by half height (7.5)
  let world = m4.identity();
  world = m4.translate(world, b.position[0], 7.5, b.position[2]);
  drawMesh(b.vao, world, viewProj);
}

function renderGround(viewProj) {
  let world = m4.identity();
  // Ground square is in XZ plane (y=0), rotate -90 degrees around X axis to lay flat in XZ plane
  // The square vertices are at y=0, so after rotation they're still at y=0
  world = m4.xRotate(world, -Math.PI / 2);
  // Scale to make the field larger (scale in X and Z directions)
  world = m4.scale(world, scene.ground.size, 1, scene.ground.size);
  drawMesh(groundVAO, world, viewProj);
}

//
// Animation Loop
//
function animate() {
  updatePlayer();

  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  gl.clearColor(0.529, 0.808, 0.922, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const cam = computeCamera();
  const view = m4.inverse(m4.lookAt(cam.position, cam.target, [0, 1, 0]));
  const proj = m4.perspective(Math.PI / 3, canvas.width / canvas.height, 0.1, 1000);
  const viewProj = m4.multiply(proj, view);

  renderGround(viewProj);
  renderTree(viewProj);
  renderBarn(viewProj);
  renderPlayer(viewProj);

  requestAnimationFrame(animate);
}

//
// Main Initialization
//
function main() {
  canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 not supported");
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    return;
  }

  positionLocation = gl.getAttribLocation(program, "a_position");
  colorLocation = gl.getAttribLocation(program, "a_color");
  matrixLocation = gl.getUniformLocation(program, "u_matrix");

  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  groundVAO = createMeshVAO(gl, groundMesh);
  playerVAO = createMeshVAO(gl, playerMesh);
  tree.trunkVAO = createMeshVAO(gl, treeTrunkMesh);
  tree.canopyVAO = createMeshVAO(gl, treeCanopyMesh);
  barn.vao = createMeshVAO(gl, barnMesh);

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  });

  animate();
}

main();
