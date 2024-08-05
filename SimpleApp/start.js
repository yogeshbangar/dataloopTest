let scene, camera, renderer, cube;
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 500;

  // Create a PCD loader instance
  const loader = new THREE.PCDLoader();

  // Load the PCD file
  loader.load(
    "_71.pcd",
    function (points) {
      // Add the points to the scene
      scene.add(points);
      // Render the scene
      renderer.render(scene, camera);
    },
    function (xhr) {
      // Called while loading is progressing
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      // Called if there's an error loading the file
      console.error("Error loading PCD file:", error);
    }
  );

  animate();
};
