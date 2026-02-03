import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

//
// Scene, Camera, Renderer
//
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//
// Lighting
//
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(50, 100, 20);
scene.add(sun);

//
// Ground (grassy field)
//
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x3cb371 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

//
// Tree (simple trunk + canopy)
//
const tree = new THREE.Group();

const trunk = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2, 15),
  new THREE.MeshStandardMaterial({ color: 0x8b4513 })
);
trunk.position.y = 7.5;

const canopy = new THREE.Mesh(
  new THREE.SphereGeometry(8),
  new THREE.MeshStandardMaterial({ color: 0x228b22 })
);
canopy.position.y = 18;

tree.add(trunk, canopy);
tree.position.set(30, 0, -40);
scene.add(tree);

//
// Barn (simple box)
//
const barn = new THREE.Mesh(
  new THREE.BoxGeometry(20, 15, 25),
  new THREE.MeshStandardMaterial({ color: 0xb22222 })
);
barn.position.set(-40, 7.5, -20);
scene.add(barn);

//
// Player (capsule-like)
//
const player = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2, 8),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
player.position.set(0, 4, 0);
scene.add(player);

//
// Collision objects
//
const obstacles = [
  { position: tree.position, radius: 10 },
  { position: barn.position, radius: 18 },
];

//
// Player state
//
const playerState = {
  speed: 0.4,
  rotationSpeed: 0.04,
  radius: 2,
};

//
// Input
//
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

//
// Collision check (circle-circle)
//
function collides(pos) {
  for (const obj of obstacles) {
    const dx = pos.x - obj.position.x;
    const dz = pos.z - obj.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    if (dist < playerState.radius + obj.radius) {
      return true;
    }
  }
  return false;
}

//
// Update player
//
function updatePlayer() {
  if (keys["a"]) player.rotation.y += playerState.rotationSpeed;
  if (keys["d"]) player.rotation.y -= playerState.rotationSpeed;

  let forward = 0;
  if (keys["w"]) forward = 1;
  if (keys["s"]) forward = -1;

  if (forward !== 0) {
    const dir = new THREE.Vector3(
      Math.sin(player.rotation.y),
      0,
      Math.cos(player.rotation.y)
    );

    const nextPos = player.position.clone()
      .add(dir.multiplyScalar(forward * playerState.speed));

    if (!collides(nextPos)) {
      player.position.copy(nextPos);
    }
  }
}

//
// Camera follows player
//
function updateCamera() {
  const offset = new THREE.Vector3(
    -Math.sin(player.rotation.y) * 30,
    20,
    -Math.cos(player.rotation.y) * 30
  );

  camera.position.copy(player.position).add(offset);
  camera.lookAt(player.position);
}

//
// Animation loop
//
function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateCamera();

  renderer.render(scene, camera);
}

animate();

//
// Resize
//
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

