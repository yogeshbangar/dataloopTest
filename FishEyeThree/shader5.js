export const fisheyeDistortionShader = (lens) => {
  console.log(`@@@@@@@@@`);
   return {
  uniforms: {
    tDiffuse: { value: null },
    k1: { value: lens.k1 || 0.0 },
    k2: { value: lens.k2 || 0.0 },
      k3: { value: lens.k3 || 0.0 },
      k4: { value: lens.k4 || 0.0 },
      k5: { value: lens.k5 || 0.0 },
      k6: { value: lens.k6 || 0.0 },
      k7: { value: lens.k7 || 0.0 },
      k8: { value: lens.k8 || 0.0 },
      k9: { value: lens.k9 || 0.0 },
      p1: { value: lens.p1 || 0.0 },
      p2: { value: lens.p2 || 0.0 },
      p3: { value: lens.p1 || 0.0 },
      p4: { value: lens.p2 || 0.0 },
      p5: { value: lens.p1 || 0.0 },
      p6: { value: lens.p2 || 0.0 },
      p7: { value: lens.p1 || 0.0 },
      p8: { value: lens.p2 || 0.0 },
      p9: { value: lens.p1 || 0.0 },
      
      r0: { value: lens.r0 || 1.0 },
      width: { value: lens.width || 1920 },
      height: { value: lens.height || 1536 },
      cx: { value: lens.cx || 961.968 },
      cy: { value: lens.cy || 769.914 },
      fx: { value: lens.fx || 555.724474032 },
      fy: { value: lens.fy || 555.978 },
    
    
    skew: { value: 0.0 },

  
  },

  vertexShader: `
    varying vec3 vCamDir;
    void main() {
      vCamDir = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float fx, fy, cx, cy, width, height, r0, skew;
    uniform float k1, k2, k3, k4, k5, k6, k7, k8, k9;
    uniform float p1, p2, p3, p4, p5, p6, p7, p8, p9;

    varying vec3 vCamDir;

    void main() {
      float x = vCamDir.x;
      float y = vCamDir.y;
      float z = vCamDir.z;

      float n2 = x*x + y*y;
      float r2 = n2 + z*z;

      float invR = (r2 > 0.0) ? inversesqrt(r2) : 0.0;
      float invN = (n2 > 0.0) ? inversesqrt(n2) : 0.0;

      float theta = acos(z * invR);
      float xu = theta * x * invN;
      float yu = theta * y * invN;

      float ru2 = xu*xu + yu*yu;
      float ru = sqrt(ru2);
      float ru0 = ru - r0;
      float ru02 = ru0 * ru0;

      // Radial distortion (Nth-order)
      float fD = 1.0 + k1*ru02 + k2*pow(ru02,2.0) + k3*pow(ru02,3.0)
                      + k4*pow(ru02,4.0) + k5*pow(ru02,5.0) + k6*pow(ru02,6.0);
      float xd = xu * fD;
      float yd = yu * fD;

      // Tangential distortion
      float ydT = yd + 2.0 * p1 * xu * yu + p2 * (ru2 + 2.0 * yu * yu);
      float xdT = xd + 2.0 * p2 * xu * yu + p1 * (ru2 + 2.0 * xu * xu) + skew * ydT;

      // Project to pixel space
      float u = fx * xdT + cx;
      float v = fy * ydT + cy;

      vec2 uv = vec2(u / width, v / height);

      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    }
  `
}};