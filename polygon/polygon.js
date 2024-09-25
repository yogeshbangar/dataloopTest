import * as THREE from "three";
import { getWorldCoords } from "../util.js";
export default class Polygon {
  pointer = new THREE.Vector2();
  startPos = new THREE.Vector3(0, 0.0, 0);
  last = new THREE.Vector3(0.01, 0.0, -0.01);
  geometryNext = new THREE.BufferGeometry();
  verticesNext = new Float32Array([
    0.01, 0.0, -0.01, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  ]);
  meshNext;
  mesh;
  reset = false;
  scene;
  camera;
  orbitControls;
  createNew = (start) => {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([]);
    this.startPos.set(start.x, start.y, start.z);
    this.last.set(start.x + 0.01, start.y, start.z - 0.01);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    return mesh;
  };
  init() {
    this.geometryNext.setAttribute(
      "position",
      new THREE.BufferAttribute(this.verticesNext, 3)
    );
    const materialNext = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    this.meshNext = new THREE.Mesh(this.geometryNext, materialNext);
    this.mesh = this.createNew(new THREE.Vector3());
    this.scene.add(this.meshNext);
  }

  addNewPoint(newPoint) {
    // Get the existing position attribute from the geometry
    const positionAttribute = this.mesh.geometry.getAttribute("position");

    // Get the current vertex data as a Float32Array
    const currentVertices = positionAttribute.array;

    let thetaA =
      (180 / Math.PI) *
      Math.atan2(this.startPos.z - this.last.z, this.startPos.x - this.last.x);
    let thetaB =
      (180 / Math.PI) *
      Math.atan2(this.startPos.z - newPoint.z, this.startPos.x - newPoint.x);
    thetaA = thetaA < 0 ? 360 + thetaA : thetaA;
    thetaB = thetaB < 0 ? 360 + thetaB : thetaB;

    const diff = thetaB - thetaA;
    const isClock = diff < -180 || (diff > 0 && diff < 180);

    // Define the new vertices to be added as a Float32Array
    const newVertices = new Float32Array(
      isClock
        ? [
            this.last.x,
            this.last.y,
            this.last.z,
            this.startPos.x,
            this.startPos.y,
            this.startPos.z,
            newPoint.x,
            newPoint.y,
            newPoint.z,
          ]
        : [
            newPoint.x,
            newPoint.y,
            newPoint.z,
            this.startPos.x,
            this.startPos.y,
            this.startPos.z,
            this.last.x,
            this.last.y,
            this.last.z,
          ]
    );
    // Create a new Float32Array with the updated vertex data
    const updatedVertices = new Float32Array(
      currentVertices.length + newVertices.length
    );
    updatedVertices.set(currentVertices);
    updatedVertices.set(newVertices, currentVertices.length);

    // Set the updated vertex data as the new value of the position attribute
    // positionAttribute.setArray(updatedVertices);
    this.mesh.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(updatedVertices, 3)
    );

    // Update the geometry's bounding sphere to reflect the new vertices
    this.mesh.geometry.computeBoundingSphere();

    const position = this.meshNext.geometry.attributes.position;
    for (let i = 0; i < position.array.length; i++) {
      position.array[0] = newPoint.x;
      position.array[1] = newPoint.y;
      position.array[2] = newPoint.z;
    }
  }
  constructor(scene, camera, orbitControls) {
    this.scene = scene;
    this.camera = camera;
    this.orbitControls = orbitControls;
    this.init();
  }
  touchEvent(event, type) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    const posUp = getWorldCoords(
      this.pointer,
      this.camera,
      this.orbitControls.getPolarAngle()
    );
    if (type === "pointerMove") {
      const position = this.geometryNext.attributes.position;
      position.array[6] = posUp.x;
      position.array[7] = posUp.y;
      position.array[8] = posUp.z;
      position.needsUpdate = true;
    }
    if (type === "pointerUp") {
      if (this.reset) {
        this.mesh = this.createNew(posUp);
        const position = this.geometryNext.attributes.position;
        position.array[0] = posUp.x + 0.1;
        position.array[1] = posUp.y;
        position.array[2] = posUp.z + 0.1;
        position.array[3] = posUp.x;
        position.array[4] = posUp.y;
        position.array[5] = posUp.z;
        position.array[6] = posUp.x;
        position.array[7] = posUp.y;
        position.array[8] = posUp.z;
        position.needsUpdate = true;
        this.meshNext.visible = true;
        this.reset = false;
      } else {
        this.addNewPoint(posUp);
        this.last.copy(posUp);
      }
    }
  }
}
