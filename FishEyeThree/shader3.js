// Camera Calibration Fisheye Shader using k1, k2, k3, p1, p2 coefficients
// Based on OpenCV camera distortion model

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
    // Camera intrinsic parameters
    fx: { value: 1.0 },
    fy: { value: 1.0 },
    cx: { value: 0.5 },
    cy: { value: 0.5 },
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
    uniform float fx, fy, cx, cy;
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
      for (int i = 0; i < 10; i++) {
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
      // Convert UV to normalized camera coordinates
      vec2 uv = (vUv - vec2(cx, cy)) / vec2(fx, fy);
      uv *= scale;
      
      vec2 newUv;
      
      if (inverse) {
        // Undistort: remove distortion from image
        newUv = undistortPoint(uv);
      } else {
        // Distort: apply distortion to image
        newUv = distortPoint(uv);
      }
      
      // Convert back to texture coordinates
      newUv = newUv / scale;
      newUv = newUv * vec2(fx, fy) + vec2(cx, cy);
      
      // Sample texture with bounds checking
      if (newUv.x >= 0.0 && newUv.x <= 1.0 && newUv.y >= 0.0 && newUv.y <= 1.0) {
        gl_FragColor = texture2D(tDiffuse, newUv);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    }
  `
};

// Simplified version without tangential distortion (p1, p2 = 0)
const RadialDistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    k1: { value: 0.0 },
    k2: { value: 0.0 },
    k3: { value: 0.0 },
    centerX: { value: 0.5 },
    centerY: { value: 0.5 },
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
    uniform float centerX, centerY;
    uniform float scale;
    
    varying vec2 vUv;
    
    void main() {
      vec2 center = vec2(centerX, centerY);
      vec2 coord = (vUv - center) * scale;
      
      float r2 = dot(coord, coord);
      float r4 = r2 * r2;
      float r6 = r4 * r2;
      
      // Radial distortion formula
      float distortion = 1.0 + k1 * r2 + k2 * r4 + k3 * r6;
      
      vec2 distortedCoord = coord * distortion;
      vec2 newUv = (distortedCoord / scale) + center;
      
      if (newUv.x >= 0.0 && newUv.x <= 1.0 && newUv.y >= 0.0 && newUv.y <= 1.0) {
        gl_FragColor = texture2D(tDiffuse, newUv);
      } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    }
  `
};

// Example usage and typical coefficient values
/*
// Setup the shader pass
const distortionPass = new ShaderPass(CameraDistortionShader);

// Example coefficient values for different distortion types:

// Barrel distortion (fisheye effect)
distortionPass.uniforms.k1.value = -0.2;    // Negative for barrel
distortionPass.uniforms.k2.value = 0.1;
distortionPass.uniforms.k3.value = -0.05;

// Pincushion distortion
distortionPass.uniforms.k1.value = 0.1;     // Positive for pincushion
distortionPass.uniforms.k2.value = -0.05;

// Tangential distortion (lens decentering)
distortionPass.uniforms.p1.value = 0.001;
distortionPass.uniforms.p2.value = 0.001;

// Camera intrinsics (normalized to 0-1 range)
distortionPass.uniforms.fx.value = 0.8;     // Focal length X
distortionPass.uniforms.fy.value = 0.8;     // Focal length Y  
distortionPass.uniforms.cx.value = 0.5;     // Principal point X
distortionPass.uniforms.cy.value = 0.5;     // Principal point Y

// Control
distortionPass.uniforms.scale.value = 1.0;
distortionPass.uniforms.inverse.value = false; // false = apply distortion, true = remove distortion

// Real camera calibration example (GoPro-like):
distortionPass.uniforms.k1.value = -0.3;
distortionPass.uniforms.k2.value = 0.12;
distortionPass.uniforms.k3.value = -0.03;
distortionPass.uniforms.p1.value = 0.001;
distortionPass.uniforms.p2.value = 0.0005;
*/

// Utility function to convert OpenCV camera matrix to shader uniforms
function setCameraParameters(pass, cameraMatrix, distCoeffs, imageSize) {
  // Camera matrix: [[fx, 0, cx], [0, fy, cy], [0, 0, 1]]
  pass.uniforms.fx.value = cameraMatrix[0][0] / imageSize.width;
  pass.uniforms.fy.value = cameraMatrix[1][1] / imageSize.height;
  pass.uniforms.cx.value = cameraMatrix[0][2] / imageSize.width;
  pass.uniforms.cy.value = cameraMatrix[1][2] / imageSize.height;
  
  // Distortion coefficients: [k1, k2, p1, p2, k3]
  pass.uniforms.k1.value = distCoeffs[0];
  pass.uniforms.k2.value = distCoeffs[1];
  pass.uniforms.p1.value = distCoeffs[2];
  pass.uniforms.p2.value = distCoeffs[3];
  pass.uniforms.k3.value = distCoeffs[4] || 0.0;
}