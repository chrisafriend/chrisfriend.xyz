import * as THREE from 'three';
import { OrbitControls } from 'controls/OrbitControls.js';
import { GLTFLoader } from 'loaders/GLTFLoader.js';
// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
// import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById('viewer');

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// scene & camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7);
scene.add(dir);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true; // enable or disable zoom as you prefer

// loader (GLB in public/)
const loader = new GLTFLoader();
loader.load('/ucs_icon.glb', (gltf) => {
  const model = gltf.scene;

  // Auto-center & scale
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = (maxDim > 0) ? (1.5 / maxDim) : 1;
  model.scale.setScalar(scale);

  // center
  box.setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  scene.add(model);
}, undefined, (err) => {
  console.error('GLB load error:', err);
});

// fallback: if GLB fails, show a simple axes or cube
function addFallback() {
  const grid = new THREE.AxesHelper(1.5);
  scene.add(grid);
}
setTimeout(() => {
  if (scene.children.length <= 2) addFallback(); // ambient + dir = 2, so add fallback if only lights exist
}, 1500);

// resize handling
function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', resize);

// animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
