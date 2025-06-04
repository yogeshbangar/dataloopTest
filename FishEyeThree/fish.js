const widthArr =  [2848, 1920, 1920, 1920]; //window.innerWidth;
const heightArr = [2848, 1536, 1536, 1536]; //window.innerHeight;
const IMGS = widthArr.length;
function configureCamera0(camera, intrinsicData, width, height) {
  const { fx, fy, cx, cy, skew } = intrinsicData;
  const fov = 2 * Math.atan((0.5 * height) / fy);
  camera.aspect = width / height;
  camera.fov = (fov * 180) / Math.PI;
  camera.setViewOffset(
    width,
    height,
    0.5 * width - cx,
    0.5 * height - cy,
    width,
    height
  );

  camera.scale.x = fy / fx;
  camera.updateProjectionMatrix();
}
function configureCamera(camera, intrinsicData, width, height) {
  const { fx, fy, cx, cy, skew } = intrinsicData;

  // 1️⃣ Compute FOV and aspect
  const fov = 2 * Math.atan((0.5 * height) / fy);
  camera.aspect = width / height;
  camera.fov = (fov * 180) / Math.PI;

  // 2️⃣ Set view offset (principal point)
  camera.setViewOffset(
    width,
    height,
    0.5 * width - cx,
    0.5 * height - cy,
    width,
    height
  );

  // 3️⃣ Scale X for fx/fy mismatch
  camera.scale.x = fy / fx;

  // 4️⃣ Update projection matrix
  camera.updateProjectionMatrix();

  // 5️⃣ Apply skew (modify projectionMatrix[4])
  // OpenCV skew maps to element (1,0) or [4] in Three.js's column-major matrix
  const skewFactor = skew / fx; // Normalize by focal length
  camera.projectionMatrix.elements[4] = skewFactor;
}
function orientCamera(camera, index, frame) {
  const extrinsic = frame?.images?.[index]?.sensorsData?.extrinsic;
  console.log("orientCamera", frame);
  if (
    camera &&
    extrinsic?.rotation &&
    frame?.rotation &&
    extrinsic?.translation
  ) {
    console.log("extrinsic~~~", extrinsic);
    const imageQ = new THREE.Quaternion(
      extrinsic.rotation.x,
      extrinsic.rotation.y,
      extrinsic.rotation.z,
      extrinsic.rotation.w
    ).normalize();
    const frameQ = new THREE.Quaternion(
      frame.rotation.x,
      frame.rotation.y,
      frame.rotation.z,
      frame.rotation.w
    ).normalize();
    const mulQ = frameQ.multiply(imageQ);
    camera.quaternion.copy(mulQ.multiply(new THREE.Quaternion(1, 0, 0, 0)));
    console.log("Camera Quaternion:", imageQ, frameQ, mulQ, camera.quaternion);
    camera.position
      .set(
        extrinsic.translation.x - frame.translation.x,
        extrinsic.translation.y - frame.translation.y,
        extrinsic.translation.z - frame.translation.z
      )
      .applyQuaternion(frame.rotation);
    console.log(
      camera.position,
      "Camera~~~~Quaternion:",
      extrinsic.translation
    );
  }
}

const coordinates = [
  {
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
  },
  {
    direction: {
      x: -0.9572052641759686,
      y: -0.2894098862060762,
      z: 0,
    },
    interpolation: "Linear",
    position: {
      x: 61.59896812830782,
      y: -0.06057867305030551,
      z: 5.5143052234179315,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -2.847982369950351,
    },
    scale: {
      x: 6.3787748432118665,
      y: 6.418264841295544,
      z: 9.4374372026182,
    },
  },
  {
    direction: {
      x: -0.9572052641759686,
      y: -0.2894098862060762,
      z: 0,
    },
    interpolation: "Linear",
    position: {
      x: -27.366169,
      y: 5.867037,
      z: -0.127086,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.2673898942514081,
    },
    scale: {
      x: 4.501174,
      y: 1.95,
      z: 1.62291,
    },
  },
  {
    position: {
      x: 5.808877198539894,
      y: 25.055109490845656,
      z: 1.8414529330131728,
    },
    scale: {
      x: 6.470243086782148,
      y: 6.708694563901662,
      z: 4.682905866026346,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 2.990434566611472,
    },
    interpolation: "Linear",
    direction: {
      x: -0.9885973525667148,
      y: 0.15058311491692117,
      z: 0,
    },
  },
];

class FishEye {
  data;
  constructor(data) {
    this.fishText = document.getElementById("fishText");
    this.fishImg = document.getElementById("fishImg");
    this.data = data;
    this.cameraNo = 1;
    this.frameNo = 0;
    this.init();
    this.animate();
  }
  init() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(
      widthArr[this.cameraNo % IMGS],
      heightArr[this.cameraNo % IMGS]
    );
    document.body.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
    this.distortionPass = new THREE.ShaderPass(
      distortionShaderFishEyeCamera({})
    );
    this.composer.addPass(this.distortionPass);
    this.eventInit();
    this.setCameraProjection();
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i];
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshNormalMaterial()
      );
      cube.scale.set(coord.scale.x, coord.scale.y, coord.scale.z);
      cube.position.set(coord.position.x, coord.position.y, coord.position.z);
      cube.rotation.set(coord.rotation.x, coord.rotation.y, coord.rotation.z);
      this.scene.add(cube);
      this.cube = cube;
    }
  }
  setCameraProjection() {
    const camValue = this.data.cameras[this.cameraNo];
    const position = camValue?.sensorsData?.extrinsic?.position;
    const rotation = camValue?.sensorsData?.extrinsic?.rotation;
    const intrinsicData = camValue?.sensorsData?.intrinsicData || {};
    const distortion = intrinsicData.distortion;
    this.distortion = distortion;
    const width = widthArr[this.cameraNo % IMGS];
    const height = heightArr[this.cameraNo % IMGS];
    const fov =
      2 * Math.atan(height / (2 * intrinsicData.fy)) * (180 / Math.PI); // vertical FOV in degrees
    // const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    const camera = this.camera;
    // camera.position.set(position.x, position.y, position.z);
    // camera.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    console.log(camera.position, "Camera~~~a~Quaternion:", camera.quaternion);
    configureCamera(this.camera, intrinsicData, width, height);
    orientCamera(this.camera, this.cameraNo, this.data.frames[this.frameNo]);
    this.adjustProjectionMatrix(intrinsicData);
    if (this.fishImg) {
      const w = widthArr[this.cameraNo % IMGS];
      const h = heightArr[this.cameraNo % IMGS];
      this.fishImg.src = `img${this.cameraNo % IMGS}.jpg`;
      this.fishImg.style.width = `${w}px`;
      this.fishImg.style.height = `${h}px`;
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
      const loader = new THREE.TextureLoader();
      loader.load(`img${this.cameraNo % IMGS}.jpg`, (texture) => {
        // this.scene.background = texture;
        console.log("Background texture loaded:", texture);
      });
    }
    if (this.fishText)
      this.fishText.innerHTML = `
        Intrinsic: ${JSON.stringify(intrinsicData, null, 2)}<br>
        ${
          "pos: " + JSON.stringify(position, null, 2) + " No: " + camValue.id
        }<br>
        Rot: ${JSON.stringify(rotation, null, 2)}<br>`;

    console.log("Camera Projection Matrix:", this.camera);
  }
  adjustProjectionMatrix({ cx, cy, skew, fx, fy, distortion }) {
    const width = widthArr[this.cameraNo % IMGS];
    const height = heightArr[this.cameraNo % IMGS];
    const offsetX = (cx - width / 2) / (width / 2);
    const offsetY = -(cy - height / 2) / (height / 2);
    const skewFactor = skew / fx;
    // const proj = this.camera.projectionMatrix.clone();
    // console.log(skewFactor,`adjustProjectionMatrix~~`, cx, cy, skew, fx);
    // proj.elements[8] =-offsetX + skewFactor;
    // proj.elements[9] =-offsetY;
    // this.camera.projectionMatrix.copy(proj);
    const m = -150;
    const _distortion = {
      ...distortion,
      k1: distortion.k1 * m,
      k2: distortion.k2 * m,
      k3: distortion.k3 * m,
      k4: distortion.k4 * m,
      k5: distortion.k5 * m,
      k6: distortion.k6 * m,
      k7: distortion.k7 * m,
      k8: distortion.k8 * m,
      k9: distortion.k9 * m,
      p1: distortion.p1 * m,
      p2: distortion.p2 * m,
    };
    const val = {
      k1: -0.0841882,
      k2: -0.0339981,
      k3: 0.0859536,
      k4: -0.0583792,
      k5: 0.0191657,
      k6: -0.00309023,
      k7: 0.000196057,
      k8: 0,
      k9: 0,
      p1: -0.000131398,
      p2: -0.0000279048,
      p3: 0,
      p4: 0,
      p5: 0,
      p6: 0,
      p7: 0,
      p8: 0,
      p9: 0,
      r0: 2.2,
    };
    this.distortionPass.uniforms.k1.value = _distortion.k1 || 0;
    this.distortionPass.uniforms.k2.value = _distortion.k2 || 0;
    this.distortionPass.uniforms.k3.value = _distortion.k3 || 0;
    this.distortionPass.uniforms.k4.value = _distortion.k4 || 0;
    this.distortionPass.uniforms.k5.value = _distortion.k5 || 0;
    this.distortionPass.uniforms.k6.value = _distortion.k6 || 0;
    this.distortionPass.uniforms.k7.value = _distortion.k7 || 0;
    this.distortionPass.uniforms.k8.value = _distortion.k9 || 0;
    this.distortionPass.uniforms.k9.value = _distortion.k9 || 0;
    this.distortionPass.uniforms.r0.value = _distortion.r0 || 1;
    this.distortionPass.uniforms.p1.value = _distortion.p1 || 0;
    this.distortionPass.uniforms.p2.value = _distortion.p2 || 0;
    // this.distortionPass.uniforms.p3.value = _distortion.p3 || 0;
    // this.distortionPass.uniforms.p4.value = _distortion.p4 || 0;
    // this.distortionPass.uniforms.p5.value = _distortion.p5 || 0;
    // this.distortionPass.uniforms.p6.value = _distortion.p6 || 0;
    // this.distortionPass.uniforms.p7.value = _distortion.p7 || 0;
    // this.distortionPass.uniforms.p8.value = _distortion.p8 || 0;
    // this.distortionPass.uniforms.p9.value = _distortion.p9 || 0;

    this.k1Slider.value = this.k1Value.innerHTML = _distortion.k1;
    this.k2Slider.value = this.k2Value.innerHTML = _distortion.k2;
    this.k3Slider.value = this.k3Value.innerHTML = _distortion.k3;
    this.p1Slider.value = this.p1Value.innerHTML = _distortion.p1;
    this.p2Slider.value = this.p2Value.innerHTML = _distortion.p2;
    // this.distortionPass.uniforms.cx.value = cx;
    // this.distortionPass.uniforms.cy.value = cy;
    // this.distortionPass.uniforms.fx.value = fx;
    // this.distortionPass.uniforms.fy.value = fy || 0;

    // this.distortionPass.uniforms.inverse.value = false;
    console.log(
      _distortion,
      `adjustProjectionMatrix~~`,
      this.distortionPass.uniforms
    );
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    // this.cube.rotation.y += 0.01;
    // this.cube.rotation.z += 0.01;
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
  eventInit() {
    document.addEventListener("keyup", this.keyHandler.bind(this));
    document.addEventListener("keydown", this.keyHandler.bind(this));
    this.k1Slider = document.getElementById("k1-slider");
    this.k2Slider = document.getElementById("k2-slider");
    this.k3Slider = document.getElementById("k3-slider");
    this.p1Slider = document.getElementById("p1-slider");
    this.p2Slider = document.getElementById("p2-slider");
    this.k1Value = document.getElementById("k1-value");
    this.k2Value = document.getElementById("k2-value");
    this.k3Value = document.getElementById("k3-value");
    this.p1Value = document.getElementById("p1-value");
    this.p2Value = document.getElementById("p2-value");
    this.distortionToggle = document.getElementById("distortion-toggle");
    this.distortionToggle.addEventListener("input", (e) => {
      this.distortionPass.uniforms.inverse.value = e.target.checked;
      console.log(
        e,
        e.target.checked,
        "Distortion toggle:",
        this.distortionPass.uniforms
      );
    });
    this.k1Slider.addEventListener("input", (e) => {
      this.distortionPass.uniforms.k1.value = parseFloat(e.target.value);
      this.k1Value.innerHTML = e.target.value;
    });

    this.k2Slider.addEventListener("input", (e) => {
      this.distortionPass.uniforms.k2.value = parseFloat(e.target.value);
      this.k2Value.innerHTML = e.target.value;
    });

    this.k3Slider.addEventListener("input", (e) => {
      this.distortionPass.uniforms.k3.value = parseFloat(e.target.value);
      this.k3Value.innerHTML = e.target.value;
    });
    this.p1Slider.addEventListener("input", (e) => {
      this.distortionPass.uniforms.p1.value = parseFloat(e.target.value);
      this.p1Value.innerHTML = e.target.value;
    });

    this.p2Slider.addEventListener("input", (e) => {
      this.distortionPass.uniforms.p2.value = parseFloat(e.target.value);
      this.p2Value.innerHTML = e.target.value;
    });
  }
  keyHandler(event) {
    const cube = this.cube;
    const inc = 1;
    if (event.type === "keydown") {
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
          this.cameraNo = this.cameraNo % IMGS;
          this.setCameraProjection();
          break;
        case "2":
          if (this.cameraNo > 0) {
            this.cameraNo--;
            this.setCameraProjection();
          }
          break;
        case "3":
          const dis = {
            k1: 466.35917211,
            k2: 32.48178784,
            k3: -52.1509689,
            k4: 73.79780387,
            k5: -30.12830986,
            k6: -0.37231277,
            p1: 0,
            p2: 0,
          };
          const distortion = dis; //this.distortion || {};
          const mul = -0.1;
          this.distortionPass.uniforms.k1.value = mul * distortion.k1 || 0;
          this.distortionPass.uniforms.k2.value = mul * distortion.k2 || 0;
          this.distortionPass.uniforms.k3.value = mul * distortion.k3 || 0;
          this.distortionPass.uniforms.p1.value = mul * distortion.p1 || 0;
          this.distortionPass.uniforms.p2.value = mul * distortion.p2 || 0;
          console.log("Distortion reset to:~~~~~", distortion);
          break;
        case "4":
          this.distortionPass.uniforms.k1.value -= 1;
          console.log(
            "Distortion reset to:~~~~~",
            this.distortionPass.uniforms
          );
        case "5":
          this.distortionPass.uniforms.r0.value -= 0.1;
          console.log(
            this.distortionPass.uniforms.r0.value,
            "Distortion reset to:~~~~~",
            this.distortionPass.uniforms
          );
          break;
        case "6":
          this.distortionPass.uniforms.r0.value += 0.1;
          console.log(
            this.distortionPass.uniforms.r0.value,
            "Distortion reset to:~~~~~",
            this.distortionPass.uniforms
          );
          break;
      }
    }
  }
}
