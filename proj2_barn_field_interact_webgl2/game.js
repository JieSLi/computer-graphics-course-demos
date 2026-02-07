"use strict";

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

// Create meshes
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

  const gl = getGL();
  const canvas = getCanvas();
  if (!gl || !canvas) return;

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
  const canvas = document.querySelector("#canvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }
  
  if (!initWebGL(canvas)) {
    console.error("Failed to initialize WebGL");
    return;
  }

  // Create VAOs
  groundVAO = createMeshVAO(groundMesh);
  playerVAO = createMeshVAO(playerMesh);
  tree.trunkVAO = createMeshVAO(treeTrunkMesh);
  tree.canopyVAO = createMeshVAO(treeCanopyMesh);
  barn.vao = createMeshVAO(barnMesh);

  // Set canvas size
  const gl = getGL();
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Handle resize
  window.addEventListener("resize", () => {
    const gl = getGL();
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  });

  // Start animation
  animate();
}

// Start the game when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
