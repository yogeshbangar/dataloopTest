import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PCDLoader } from "three/addons/loaders/PCDLoader.js";
import Polygon from "./polygon.js";
import Brush from "./brush.js";
const MODE_BRUSH = "MODE_BRUSH";
const MODE_POLYGON = "MODE_POLYGON";
const uvGridUrl = "./uv_grid_directx.jpg";
let mode = MODE_BRUSH;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 50, 50);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const map = new THREE.TextureLoader().load(uvGridUrl);
map.wrapS = map.wrapT = THREE.RepeatWrapping;
map.anisotropy = 16;
const bGeometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  map: map,
  color: 0x00ff00,
});
const loader = new PCDLoader();

const cube = new THREE.Mesh(bGeometry, material);
scene.add(cube);
cube.position.z = 0;
cube.visible = false;
scene.add(new THREE.GridHelper(100, 100, 0x888888, 0x444444));

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableRotate = false;
CreateCurve();
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
document.addEventListener("pointerup", (e) => {
  touchEvent(e, "pointerUp");
});
document.addEventListener("pointermove", (e) => {
  touchEvent(e, "pointerMove");
});
document.addEventListener("keydown", (e) => {
  dealWithKeyboard(e, "keydown");
});
document.addEventListener("keyup", (e) => {
  dealWithKeyboard(e, "keyUp");
});
animate();
const polygon = new Polygon(scene, camera, orbitControls);
const brush = new Brush(scene, camera, renderer);
function touchEvent(event, type) {
  if (mode === MODE_POLYGON) polygon.touchEvent(event, type);
}

function dealWithKeyboard(event, type) {
  console.log(event.type);
  if (event.keyCode === 27) {
    polygon.reset = true;
    polygon.meshNext.visible = false;
  }
  if (event.keyCode === 32) {
    orbitControls.enableRotate = event.type === "keydown";
  }
}

const polyBtn = document.getElementById("polygon");
const brushBtn = document.getElementById("brush");
polyBtn.onclick = function () {
  polyBtn.style.background = "#ffaaaa";
  brushBtn.style.background = "unset";
  mode = MODE_POLYGON;
};
brushBtn.onclick = function () {
  brushBtn.style.background = "#ffaaaa";
  polyBtn.style.background = "unset";
  mode = MODE_BRUSH;
};
if (mode === MODE_POLYGON) {
  polyBtn.style.background = "#ffaaaa";
  brushBtn.style.background = "unset";
}
if (mode === MODE_BRUSH) {
  brushBtn.style.background = "#ffaaaa";
  polyBtn.style.background = "unset";
}

function CreateCurve() {
  const x = 0,
    y = 0,d=10;
console.log("~~~~");
  const heartShape = new THREE.Shape();

  heartShape.moveTo( x-d, y+d )
  .lineTo( x+d, y-d )
  .lineTo( x-d, y-d )
  .lineTo( x-d, y-d*2 )
  .lineTo( x-d, y-d*5 )
  ; // clos

  const geometry = new THREE.ShapeGeometry(heartShape);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}
