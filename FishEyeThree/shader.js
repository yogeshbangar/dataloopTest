const DistortionShader = (obj) => { return {
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
  }};


  const distortionShaderFishEye = (lens)=>{
  return {
    uniforms: {
      tDiffuse: { value: null },
      k1: { value: lens.k1 },
      k2: { value: lens.k2 },
      k3: { value: lens.k3 },
      p1: { value: lens.p1 },
      p2: { value: lens.p2 }
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
    `
  };
}

