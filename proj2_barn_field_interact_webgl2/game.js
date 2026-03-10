"use strict";

let gl, programInfo;

const scene = {
  player: {
    position: [0, 0, 0],
    rotation: 0,
    radius: 2,
    speed: 0.4,
    rotationSpeed: 0.04,
    height: 8,
  },
  objects: [],
  ground: { size: 500 },
};

// Geometry arrays (twgl-compatible format from geometry.js)
const groundArrays = makeSquare();
const playerBaseArrays = makeCylinder(16, 8, 2);
const treeTrunkArrays = makeCylinder(12, 15, 2);
const treeCanopyArrays = makeSphere(16, 8);
const barnArrays = makeBarn();

// Override cylinder colors to blue for the player
const playerVertCount = playerBaseArrays.a_position.data.length / 3;
const blueColors = [];
for (let i = 0; i < playerVertCount; i++) {
  blueColors.push(0, 0, 1);
}
const playerArrays = {
  a_position: playerBaseArrays.a_position,
  a_color:    { numComponents: 3, data: blueColors },
  indices:    playerBaseArrays.indices,
};

// Mesh handles (bufferInfo + VAO), created in main()
let groundMesh, playerMesh;

const tree = {
  id: "tree",
  position: [30, 0, -40],
  radius: 10,
  trunkMesh: null,
  canopyMesh: null,
};

const barn = {
  id: "barn",
  position: [-40, 0, -20],
  radius: 18,
  mesh: null,
};

scene.objects.push(tree, barn);

// --- Input ---

const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup",   e => keys[e.key.toLowerCase()] = false);

// --- Helpers ---

function forwardVector(rotation) {
  return [Math.sin(rotation), 0, Math.cos(rotation)];
}

function createMesh(arrays) {
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  const vao = twgl.createVAOFromBufferInfo(gl, programInfo, bufferInfo);
  return { bufferInfo, vao };
}

function drawMesh(mesh, worldMatrix, viewProjMatrix) {
  const matrix = m4.multiply(viewProjMatrix, worldMatrix);
  gl.bindVertexArray(mesh.vao);
  twgl.setUniforms(programInfo, { u_matrix: matrix });
  twgl.drawBufferInfo(gl, mesh.bufferInfo);
}

// --- Player Movement ---

function updatePlayer() {
  const p = scene.player;

  if (keys["a"]) p.rotation += p.rotationSpeed;
  if (keys["d"]) p.rotation -= p.rotationSpeed;

  let forward = 0;
  if (keys["w"]) forward = 1;
  if (keys["s"]) forward = -1;

  if (forward !== 0) {
    const dir = forwardVector(p.rotation);
    const nextPos = [
      p.position[0] + dir[0] * forward * p.speed,
      0,
      p.position[2] + dir[2] * forward * p.speed,
    ];

    const fieldHalfSize = scene.ground.size / 2;
    const maxX = fieldHalfSize - p.radius;
    const maxZ = fieldHalfSize - p.radius;
    nextPos[0] = Math.max(-maxX, Math.min(maxX, nextPos[0]));
    nextPos[2] = Math.max(-maxZ, Math.min(maxZ, nextPos[2]));

    if (!collides(nextPos, p.radius)) {
      p.position = nextPos;
    }
  }

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
    if (Math.sqrt(dx * dx + dz * dz) < radius + obj.radius) {
      return true;
    }
  }
  return false;
}

// --- Camera ---

function computeCamera() {
  const p = scene.player;
  const f = forwardVector(p.rotation);

  const playerCenter = [p.position[0], p.height / 2, p.position[2]];
  const cameraPos = [
    playerCenter[0] - f[0] * 30,
    20,
    playerCenter[2] - f[2] * 30,
  ];

  return { position: cameraPos, target: playerCenter };
}

// --- Rendering ---

function renderPlayer(viewProj) {
  const p = scene.player;
  let world = m4.identity();
  world = m4.translate(world, p.position[0], p.position[1], p.position[2]);
  world = m4.yRotate(world, p.rotation);
  drawMesh(playerMesh, world, viewProj);
}

function renderTree(viewProj) {
  let world = m4.identity();
  world = m4.translate(world, tree.position[0], tree.position[1], tree.position[2]);
  drawMesh(tree.trunkMesh, world, viewProj);

  world = m4.identity();
  world = m4.translate(world, tree.position[0], 15, tree.position[2]);
  drawMesh(tree.canopyMesh, world, viewProj);
}

function renderBarn(viewProj) {
  let world = m4.identity();
  world = m4.translate(world, barn.position[0], barn.position[1], barn.position[2]);
  drawMesh(barn.mesh, world, viewProj);
}

function renderGround(viewProj) {
  let world = m4.identity();
  world = m4.scale(world, scene.ground.size, 1, scene.ground.size);
  drawMesh(groundMesh, world, viewProj);
}

// --- Animation Loop ---

function animate() {
  updatePlayer();

  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.529, 0.808, 0.922, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const cam = computeCamera();
  const view = m4.inverse(m4.lookAt(cam.position, cam.target, [0, 1, 0]));
  const proj = m4.perspective(
    Math.PI / 3, gl.canvas.width / gl.canvas.height, 0.1, 1000);
  const viewProj = m4.multiply(proj, view);

  renderGround(viewProj);
  renderTree(viewProj);
  renderBarn(viewProj);
  renderPlayer(viewProj);

  requestAnimationFrame(animate);
}

// --- Initialization ---

function main() {
  const canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 not supported");
    return;
  }

  programInfo = twgl.createProgramInfo(gl,
    [vertexShaderSource, fragmentShaderSource]);

  gl.useProgram(programInfo.program);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  groundMesh      = createMesh(groundArrays);
  playerMesh      = createMesh(playerArrays);
  tree.trunkMesh  = createMesh(treeTrunkArrays);
  tree.canopyMesh = createMesh(treeCanopyArrays);
  barn.mesh       = createMesh(barnArrays);

  animate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
