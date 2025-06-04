// Simplified Camera Distortion Shader using only k1, k2, k3, p1, p2 coefficients
// Assumes normalized coordinates with center at (0.5, 0.5)

const CameraDistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    // Radial distortion coefficients
    k1: { value: 0.0 },
    k2: { value: 0.0 },
    k3: { value: 0.0 },
    // Tangential distortion coefficients
    p1: { value: 0.0 },
    p2: { value: 0.0 },
    // Control parameters
    scale: { value: 1.0 },
    inverse: { value: false }
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
    uniform float scale;
    uniform bool inverse;
    
    varying vec2 vUv;
    
    // Apply radial and tangential distortion (forward)
    vec2 distortPoint(vec2 p) {
      float x = p.x;
      float y = p.y;
      
      float r2 = x * x + y * y;
      float r4 = r2 * r2;
      float r6 = r4 * r2;
      
      // Radial distortion
      float radialDistortion = 1.0 + k1 * r2 + k2 * r4 + k3 * r6;
      
      // Tangential distortion
      float dx = 2.0 * p1 * x * y + p2 * (r2 + 2.0 * x * x);
      float dy = p1 * (r2 + 2.0 * y * y) + 2.0 * p2 * x * y;
      
      return vec2(
        x * radialDistortion + dx,
        y * radialDistortion + dy
      );
    }
    
    // Iterative undistortion (inverse)
    vec2 undistortPoint(vec2 distorted) {
      vec2 p = distorted; // Initial guess
      
      // Newton-Raphson iterations
      for (int i = 0; i < 8; i++) {
        vec2 distortedGuess = distortPoint(p);
        vec2 error = distortedGuess - distorted;
        
        if (length(error) < 0.0001) break;
        
        // Approximate Jacobian
        float h = 0.001;
        vec2 dx = (distortPoint(p + vec2(h, 0.0)) - distortedGuess) / h;
        vec2 dy = (distortPoint(p + vec2(0.0, h)) - distortedGuess) / h;
        
        // Jacobian matrix
        mat2 J = mat2(dx.x, dx.y, dy.x, dy.y);
        
        // Update using Newton-Raphson
        float det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
        if (abs(det) > 0.0001) {
          mat2 Jinv = mat2(J[1][1], -J[0][1], -J[1][0], J[0][0]) / det;
          p = p - Jinv * error;
        }
      }
      
      return p;
    }
    
    void main() {
      // Convert UV to centered coordinates (-0.5 to 0.5)
      vec2 coord = (vUv - 0.5) * scale;
      
      vec2 newCoord;
      
      if (inverse) {
        // Undistort: remove distortion from image
        newCoord = undistortPoint(coord);
      } else {
        // Distort: apply distortion to image
        newCoord = distortPoint(coord);
      }
      
      // Convert back to UV coordinates
      vec2 newUv = (newCoord / scale) + 0.5;
      
      // Sample texture with bounds checking
      if (newUv.x >= 0.0 && newUv.x <= 1.0 && newUv.y >= 0.0 && newUv.y <= 1.0) {
        gl_FragColor = texture2D(tDiffuse, newUv);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      }
    }
      

void main1() {
  float cx = 961.968, cy = 555.978; // principal point
  float width = 1920., height=1536.0;

  vec2 uv = vUv * vec2(width, height);
  vec2 delta = uv - vec2(cx, cy);

  float r = length(delta);
  float theta = r; // Approximate for small angles

  float distortedR = k1*theta + k2*pow(theta,3.0) + k3*pow(theta,5.0);

  vec2 distortedDelta = delta * (distortedR / r);
  vec2 distortedUv = vec2(cx, cy) + distortedDelta;

  vec2 finalUv = distortedUv / vec2(width, height);

  if(finalUv.x < 0.0 || finalUv.x > 1.0 || finalUv.y < 0.0 || finalUv.y > 1.0) {
    gl_FragColor = vec4(1.0);
  } else {
    gl_FragColor = texture2D(tDiffuse, finalUv);
  }
}
  void main0() {
  float cx = 961.968, cy = 555.978; // principal point
  float width = 1920., height=1536.0;
  float fx = 555.724474032, fy = 555.978; // focal lengths
  // Convert to pixel coordinates
  float u = vUv.x * width;
  float v = vUv.y * height;

  // Normalize to camera coordinates
  float x = (u - cx) / fx;
  float y = (v - cy) / fy;

  // Radial terms
  float r2 = x*x + y*y;
  float r4 = r2 * r2;
  float r6 = r4 * r2;
  float radial = 1.0 + k1*r2 + k2*r4 + k3*r6;

  // Tangential terms
  float dx = 2.0*p1*x*y + p2*(r2 + 2.0*x*x);
  float dy = p1*(r2 + 2.0*y*y) + 2.0*p2*x*y;

  // Distorted normalized coords
  float x_d = x * radial + dx;
  float y_d = y * radial + dy;

  // Back to pixel coords
  float u_d = fx * x_d + cx;
  float v_d = fy * y_d + cy;

  // Normalize to [0,1]
  vec2 distortedUv = vec2(u_d / width, v_d / height);

  if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
    gl_FragColor = vec4(0.0);
  } else {
    gl_FragColor = texture2D(tDiffuse, distortedUv);
  }
}
  `
};

// Simplified radial-only version (faster, no tangential distortion)
const RadialDistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    k1: { value: 0.0 },
    k2: { value: 0.0 },
    k3: { value: 0.0 },
    scale: { value: 1.0 }
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
    uniform float k1, k2, k3;
    uniform float scale;
    
    varying vec2 vUv;
    
    void main() {
      // Convert to centered coordinates
      vec2 coord = (vUv - 0.5) * scale;
      
      // Calculate radial distance squared
      float r2 = dot(coord, coord);
      float r4 = r2 * r2;
      float r6 = r4 * r2;
      
      // Apply radial distortion
      float distortion = 1.0 + k1 * r2 + k2 * r4 + k3 * r6;
      vec2 distortedCoord = coord * distortion;
      
      // Convert back to UV
      vec2 newUv = (distortedCoord / scale) + 0.5;
      
      if (newUv.x >= 0.0 && newUv.x <= 1.0 && newUv.y >= 0.0 && newUv.y <= 1.0) {
        gl_FragColor = texture2D(tDiffuse, newUv);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    }
  `
};
