import { Vector3 } from "three";
export const angle = (n) => {
  const inc = n || 1;
  for (let i = 0; i < 360; i += inc) {
    console.log(
      i,
      (i * (Math.PI / 180)).toFixed(2),
      Math.sin(i * (Math.PI / 180)).toFixed(2)
    );
  }
};
export const getWorldCoords = (pointer, camera, polarAngle) => {
  const mouse = new Vector3();
  mouse.x = pointer.x;
  mouse.y = pointer.y;
  mouse.z = 0.1; // set to z position of mesh objects
  // reverse projection from 3D to screen
  mouse.unproject(camera);
  // convert from point to a direction
  mouse.sub(camera.position);
  // scale the projected ray
  let distance = -camera.position.y / mouse.y;

  if (polarAngle > 1.3) {
    distance = -camera.position.z / mouse.z;
  }
  const scaled = mouse.multiplyScalar(distance);
  const coords = camera.position.clone().add(scaled);
  coords.y = 0;
  return coords;
};
