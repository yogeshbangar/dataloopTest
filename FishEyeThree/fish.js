const width = window.innerWidth;
const height = window.innerHeight;
const aspect = width / height;

class FishEye {
  data;
  constructor(data) {
    this.data = data;
    this.cameraNo = 0;
    this.init();
    this.animate();
  }
  init() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    document.body.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
    this.distortionPass = new THREE.ShaderPass(
      DistortionShader({ k1: 0, k2: 0, k3: 0, p1: 0, p2: 0 })
    );
    this.composer.addPass(this.distortionPass);

    this.setCameraProjection();
    this.cube = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshNormalMaterial()
    );
    this.scene.add(this.cube);
    const scale = 1.5; // Scale factor for the cube
    this.cube.scale.set(scale, scale, scale);
    this.cube.position.set(-8, -6, 6);
    document.addEventListener("keyup", this.keyHandler.bind(this));
    document.addEventListener("keydown", this.keyHandler.bind(this));
  }
  setCameraProjection() {
    const camValue = this.data.cameras[this.cameraNo];
    const position = camValue?.sensorsData?.extrinsic?.position;
    const rotation = camValue?.sensorsData?.extrinsic?.rotation;
    const intrinsicData = camValue?.sensorsData?.intrinsicData || {};
    const distortion = intrinsicData.distortion;
    console.log(
      this.cameraNo,"FishEye initialized with data:",
      camValue,distortion
    );
    this.camera.position.set(position.x, position.y, position.z);
    this.camera.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    const fy = intrinsicData?.fy || 75;
    const fovY = 2 * Math.atan(height / (2 * fy)) * (180 / Math.PI);
    this.camera.fov = fovY;
    this.camera.updateProjectionMatrix();
    this.adjustProjectionMatrix(intrinsicData);
    this.distortionPass.uniforms.k1.value = distortion.k1 || 0;
    this.distortionPass.uniforms.k2.value = distortion.k2 || 0;
    this.distortionPass.uniforms.k3.value = distortion.k3 || 0;
    this.distortionPass.uniforms.p1.value = distortion.p1 || 0;
    this.distortionPass.uniforms.p2.value = distortion.p2 || 0;
  }
  adjustProjectionMatrix({ cx, cy, skew, fx }) {
    console.log(cx, cy, skew, fx);
    const offsetX = (cx - width / 2) / (width / 2);
    const offsetY = -(cy - height / 2) / (height / 2);
    const skewFactor = skew / fx;
    const proj = this.camera.projectionMatrix.clone();
    proj.elements[8] = offsetX + skewFactor;
    proj.elements[9] = offsetY;
    this.camera.projectionMatrix.copy(proj);
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.cube.rotation.y += 0.01;
    this.cube.rotation.z += 0.01;
    this.composer.render();
  }
  keyHandler(event) {
    const cube = this.cube;
    const inc = 0.1;
    if (event.type === "keyup") {
      switch (event.key) {
        case "ArrowUp":
          cube.position.z += inc;
          break;
        case "ArrowDown":
          cube.position.z -= inc;
          break;
        case "ArrowLeft":
          cube.position.x -= inc;
          break;
        case "ArrowRight":
          cube.position.x += inc;
          break;
        case "a":
          cube.position.y += inc;
          break;
        case "z":
          cube.position.y -= inc;
          break;
        case "w":
          cube.position.set(-8, -6, 6);
          break;
        case "1":
          this.cameraNo++;
          this.setCameraProjection();
          break;
      }
    }
  }
}
