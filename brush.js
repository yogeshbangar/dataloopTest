import * as THREE from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
export default class Brush {
  pointer = new THREE.Vector2();
  scene;
  camera;
  transformControls;
  cubeBrush;
  shouldPaint = false;
  paintObject = new THREE.Group();
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.transformControls = new TransformControls(camera, renderer.domElement);
    // this.scene.add(this.transformControls);
    this.init();
  }
  init() {
    console.log("brush init");

    this.cubeBrush = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      })
    );
    this.scene.add(this.cubeBrush);
    this.scene.add(this.paintObject);
    this.transformControls.attach(this.cubeBrush);
    this.transformControls.addEventListener(
      "dragging-changed",
      this.draggingChanged_.bind(this)
    );
    this.transformControls.addEventListener(
      "change",
      this.onBoxChange_.bind(this)
    );
  }
  draggingChanged_(e) {
    console.log("draggingChanged_", e);
    this.shouldPaint = e.value;
  }
  onBoxChange_(e) {
    console.log(
      this.shouldPaint,
      "onBoxChange_",
      this.paintObject.children.length
    );
    if (this.shouldPaint) {
      let distance = 111110;
      if (this.paintObject.children.length > 0) {
        const pos =
          this.paintObject.children[this.paintObject.children.length - 1]
            .position;
        distance = this.cubeBrush.position.distanceTo(pos);
        console.log(distance);
      }
      if (distance > .41) this.paintObject.add(this.cubeBrush.clone());
    }
  }
}
