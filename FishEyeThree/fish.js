const width = 1500; //window.innerWidth;
const height = 1200; //window.innerHeight;
const aspect = width / height;

function configureCamera(
    camera,
    intrinsicData,
    width,
    height
) {
    const fov = 2 * Math.atan((0.5 * height) / intrinsicData.fy)
    camera.aspect = width / height
    camera.fov = (fov * 180) / Math.PI
    camera.setViewOffset(
        width,
        height,
        0.5 * width - intrinsicData.cx,
        0.5 * height - intrinsicData.cy,
        width,
        height
    )

    camera.updateProjectionMatrix()
    camera.scale.x = intrinsicData.fy / intrinsicData.fx
}

function orientCamera(
    camera,
    index,
    frame
) {
    const extrinsic = frame?.images?.[index]?.sensorsData?.extrinsic
    console.log('orientCamera', frame?.images?.[index]);
    if (
        camera &&
        extrinsic?.rotation &&
        frame?.rotation &&
        extrinsic?.translation
    ) {
        console.log('extrinsic~~~',extrinsic);
        const imageQ = new THREE.Quaternion(
            extrinsic.rotation.x,
            extrinsic.rotation.y,
            extrinsic.rotation.z,
            extrinsic.rotation.w
        ).normalize()
        const frameQ = new THREE.Quaternion(
            frame.rotation.x,
            frame.rotation.y,
            frame.rotation.z,
            frame.rotation.w
        ).normalize()
        const mulQ = frameQ.multiply(imageQ)
        camera.quaternion.copy(mulQ.multiply(new THREE.Quaternion(1, 0, 0, 0)))
        camera.position
            .set(
                extrinsic.translation.x - frame.translation.x,
                extrinsic.translation.y - frame.translation.y,
                extrinsic.translation.z - frame.translation.z
            )
            .applyQuaternion(frame.rotation)
    }
}

const coordinates = {
  direction: {
    x: -0.22887238544706023,
    y: -0.9734564351730242,
    z: 0,
  },
  interpolation: "Linear",
  position: {
    x: 32.7659481040472,
    y: 8.114036812901583,
    z: 1.493252,
  },
  rotation: {
    x: 0,
    y: 0,
    z: -1.8017154900187053,
  },
  scale: {
    x: 6.276564,
    y: 2.498287471244047,
    z: 2.178916,
  },
};

class FishEye {
  data;
  constructor(data) {
    this.fishText = document.getElementById("fishText");
    this.data = data;
    this.cameraNo = 1;
    this.frameNo = 0;
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
    this.cube.scale.set(
      coordinates.scale.x,
      coordinates.scale.y,
      coordinates.scale.z
    );
    this.cube.position.set(
      coordinates.position.x,
      coordinates.position.y,
      coordinates.position.z
    );
    this.cube.rotation.set(
      coordinates.rotation.x,
      coordinates.rotation.y,
      coordinates.rotation.z
    );
    document.addEventListener("keyup", this.keyHandler.bind(this));
    document.addEventListener("keydown", this.keyHandler.bind(this));
  }
  setCameraProjection() {
    const camValue = this.data.cameras[this.cameraNo];
    const position = camValue?.sensorsData?.extrinsic?.position;
    const rotation = camValue?.sensorsData?.extrinsic?.rotation;
    const intrinsicData = camValue?.sensorsData?.intrinsicData || {};
    const distortion = intrinsicData.distortion;
    if (this.fishText)
      this.fishText.innerHTML = `NO:${this.cameraNo}_${camValue?.name}_id:${camValue?.id}`;

    console.log(
      "Camera No:",
      this.cameraNo,
      "\nPosition:",
      position,
      "\nRotation:",
      rotation,
      "\nIntrinsic Data:",
      intrinsicData,
      "\nDistortion:",
      distortion
    );
    configureCamera(
      this.camera,
      intrinsicData,
      width,
      height
    );
    orientCamera(this.camera,this.cameraNo, this.data.frames[this.frameNo]);
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
    // this.cube.rotation.y += 0.01;
    // this.cube.rotation.z += 0.01;
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
