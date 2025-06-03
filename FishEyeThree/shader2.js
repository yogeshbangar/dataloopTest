
  



// Fisheye Distortion Shader for Three.js EffectComposer
// Usage: const fisheyePass = new ShaderPass(FisheyeShader);

const FisheyeShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.5 },
    height: { value: 1.0 },
    aspectRatio: { value: 1.0 },
    cylindricalRatio: { value: 1.0 }
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
    uniform float strength;
    uniform float height;
    uniform float aspectRatio;
    uniform float cylindricalRatio;
    
    varying vec2 vUv;
    
    void main() {
      // Normalize coordinates to [-1, 1] range
      vec2 coord = vUv * 2.0 - 1.0;
      
      // Apply aspect ratio correction
      coord.x *= aspectRatio;
      
      // Calculate distance from center
      float distance = length(coord);
      
      // Apply fisheye distortion
      if (distance > 0.0) {
        // Barrel distortion formula
        float theta = atan(distance) * strength;
        float radius = theta;
        
        // Cylindrical projection option
        radius = mix(radius, theta * cylindricalRatio, cylindricalRatio - 1.0);
        
        // Apply height scaling
        coord *= radius / distance;
        coord.y *= height;
      }
      
      // Convert back to UV coordinates
      coord.x /= aspectRatio;
      vec2 uv = coord * 0.5 + 0.5;
      
      // Sample texture with bounds checking
      if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
        gl_FragColor = texture2D(tDiffuse, uv);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    }
  `
};

// Alternative version with more control parameters
const FisheyeShaderAdvanced = {
  uniforms: {
    tDiffuse: { value: null },
    distortion: { value: 0.5 },
    fisheyeSize: { value: 1.0 },
    centerX: { value: 0.5 },
    centerY: { value: 0.5 },
    alpha: { value: 1.0 }
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
    uniform float distortion;
    uniform float fisheyeSize;
    uniform float centerX;
    uniform float centerY;
    uniform float alpha;
    
    varying vec2 vUv;
    
    void main() {
      vec2 center = vec2(centerX, centerY);
      vec2 coord = vUv - center;
      
      float distance = length(coord);
      
      if (distance < fisheyeSize) {
        float percent = distance / fisheyeSize;
        
        if (distortion > 0.0) {
          // Barrel distortion
          percent = pow(percent, 1.0 + distortion * 0.5);
        } else {
          // Pincushion distortion
          percent = pow(percent, 1.0 / (1.0 - distortion * 0.5));
        }
        
        coord *= percent / distance;
      }
      
      vec2 uv = coord + center;
      
      if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
        vec4 color = texture2D(tDiffuse, uv);
        gl_FragColor = vec4(color.rgb, color.a * alpha);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
  `
};
