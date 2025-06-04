const DistortionShader = (obj) => {
  return {
    uniforms: {
      tDiffuse: { value: null },
      k1: { value: obj.k1 },
      k2: { value: obj.k2 },
      k3: { value: obj.k3 },
      p1: { value: obj.p1 },
      p2: { value: obj.p2 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float k1, k2, k3, p1, p2;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          float x = uv.x;
          float y = uv.y;
          float r2 = x*x + y*y;
          float r4 = r2 * r2;
          float r6 = r4 * r2;

          float radial = 1.0 + k1 * r2 + k2 * r4 + k3 * r6;

          // Tangential distortion
          float dx = 2.0 * p1 * x * y + p2 * (r2 + 2.0 * x * x);
          float dy = p1 * (r2 + 2.0 * y * y) + 2.0 * p2 * x * y;

          vec2 distorted = vec2(x * radial + dx, y * radial + dy);
          distorted = (distorted + 1.0) / 2.0;

          if (distorted.x < 0.0 || distorted.x > 1.0 || distorted.y < 0.0 || distorted.y > 1.0) {
            gl_FragColor = vec4(0.0);
          } else {
            gl_FragColor = texture2D(tDiffuse, distorted);
          }
        }
      `,
  };
};

const distortionShaderFishEye = (lens) => {
  return {
    uniforms: {
      tDiffuse: { value: null },
      k1: { value: lens.k1 || 0.0 },
      k2: { value: lens.k2 || 0.0 },
      k3: { value: lens.k3 || 0.0 },
      p1: { value: lens.p1 || 0.0 },
      p2: { value: lens.p2 || 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float k1, k2, k3, p1, p2;
      uniform bool inverse;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv * 2.0 - 1.0; // [-1,1] space
        float r = length(uv);
        float theta = atan(uv.y, uv.x);
        float r_distorted = r + k1*pow(r,3.0) + k2*pow(r,5.0) + k3*pow(r,7.0);
        vec2 distorted = r_distorted * vec2(cos(theta), sin(theta));
        distorted += vec2(2.0*p1*distorted.x*distorted.y + p2*(r*r + 2.0*distorted.x*distorted.x),
                          p1*(r*r + 2.0*distorted.y*distorted.y) + 2.0*p2*distorted.x*distorted.y);
        distorted = (distorted + 1.0) * 0.5;
        if (distorted.x < 0.0 || distorted.x > 1.0 || distorted.y < 0.0 || distorted.y > 1.0) {
          gl_FragColor = vec4(0.0);
        } else {
          gl_FragColor = texture2D(tDiffuse, distorted);
        }
      }
    `,
  };
};
const distortionShaderFishEyeCamera = (lens) => {
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
      r0: { value: lens.r0 || 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float k1, k2, k3, k4, k5, k6, k7, k8, k9, p1, p2, r0;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv * 2.0 - 1.0; // [-1,1] space
        float x = uv.x;
        float y = uv.y;
        float r = length(uv) / r0; // Normalize by r0

        float r2 = r*r;
        float r4 = r2*r2;
        float r6 = r4*r2;
        float r8 = r4*r4;
        float r10 = r8*r2;
        float r12 = r6*r6;
        float r14 = r12*r2;
        float r16 = r8*r8;
        float r18 = r16*r2;

        float radial = 1.0 + k1*r2 + k2*r4 + k3*r6 + k4*r8 + k5*r10 + k6*r12 + k7*r14 + k8*r16 + k9*r18;

        // Tangential distortion (simplified 2nd order)
        float dx = 2.0*p1*x*y + p2*(r2 + 2.0*x*x);
        float dy = p1*(r2 + 2.0*y*y) + 2.0*p2*x*y;

        vec2 distorted = vec2(x * radial + dx, y * radial + dy);
        distorted = (distorted + 1.0) * 0.5; // Map back to [0,1]

        if (distorted.x < 0.0 || distorted.x > 1.0 || distorted.y < 0.0 || distorted.y > 1.0) {
          gl_FragColor = vec4(0.0);
        } else {
          gl_FragColor = texture2D(tDiffuse, distorted);
        }
      }
    `
  };
};
const distortionShaderFishEyeCamera0 = (lens) => {
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
      r0: { value: lens.r0 || 1.0 },
      width: { value: lens.width || 1920 },
      height: { value: lens.height || 1536 },
      cx: { value: lens.cx || 961.968 },
      cy: { value: lens.cy || 769.914 },
      fx: { value: lens.fx || 555.724474032 },
      fy: { value: lens.fy || 555.978 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float k1, k2, k3, k4, k5, k6, k7, k8, k9;
      uniform float p1, p2, r0;
      uniform float width, height, cx, cy, fx, fy;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv * vec2(width, height);
        float x = (uv.x - cx) / fx;
        float y = (uv.y - cy) / fy;

        float r2 = x*x + y*y;
        float r4 = r2 * r2;
        float r6 = r4 * r2;
        float r8 = r4 * r4;
        float r10 = r8 * r2;
        float r12 = r6 * r6;
        float r14 = r8 * r6;
        float r16 = r8 * r8;
        float r18 = r16 * r2;

        float radial = 1.0 + k1*r2 + k2*r4 + k3*r6 + k4*r8 + k5*r10 + k6*r12 + k7*r14 + k8*r16 + k9*r18;

        float x_distorted = x * radial + 2.0*p1*x*y + p2*(r2 + 2.0*x*x);
        float y_distorted = y * radial + p1*(r2 + 2.0*y*y) + 2.0*p2*x*y;

        // Optional r0 scaling (applies globally)
        x_distorted *= r0;
        y_distorted *= r0;

        vec2 distorted = vec2(fx * x_distorted + cx, fy * y_distorted + cy) / vec2(width, height);

        if (distorted.x < 0.0 || distorted.x > 1.0 || distorted.y < 0.0 || distorted.y > 1.0) {
          gl_FragColor = vec4(0.0);
        } else {
          gl_FragColor = texture2D(tDiffuse, distorted);
        }
      }
    `
  };
};