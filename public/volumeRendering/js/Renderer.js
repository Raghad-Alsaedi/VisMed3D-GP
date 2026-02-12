import { Camera } from './Common/Camera.js';
import { loadCTheadVolume } from './loadCThead.js';
import { buildMinMaxOctree, uploadMinMaxOctreeToGPU } from './buildMinMaxOctree.js';


// ================= VOLUME LOADER =================
async function loadVolume(url, width, height, depth) {

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load volume");

  const buffer = await res.arrayBuffer();
  const data = new Uint8Array(buffer);

  // if (datatype != ???) {
  //throw new Error(`Volume: datatype '${datatype}' not supported`);
    
  return {
    data,
    width,
    height,
    depth
  };
}  
/**   program = await initShaders(gl, "/volumeRendering/shaders/vs.glsl", "/volumeRendering/shaders/fs.glsl");
    final_program = await initShaders(gl, "/volumeRendering/shaders/final_pass_vs.glsl", "/volumeRendering/shaders/final_pass_fs.glsl"); */
// Helper: save a texture to image (PNG/JPEG)
function saveTextureAsImage(gl, texture, width, height, filename = 'texture.png') {
    // Create framebuffer and attach the texture
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer incomplete for saving texture!');
        return;
    }

    // Read pixels
    const pixels = new Float32Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, pixels);

    // Convert FLOAT [0,1] -> 0-255
    const pixelsUint8 = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < pixels.length; i++) {
        let v = Math.round(Math.max(0, Math.min(1, pixels[i])) * 255);
        pixelsUint8[i] = v;
    }

    // Flip vertically
    const rowSize = width * 4;
    for (let y = 0; y < Math.floor(height / 2); y++) {
        const topOffset = y * rowSize;
        const bottomOffset = (height - y - 1) * rowSize;
        for (let i = 0; i < rowSize; i++) {
            const tmp = pixelsUint8[topOffset + i];
            pixelsUint8[topOffset + i] = pixelsUint8[bottomOffset + i];
            pixelsUint8[bottomOffset + i] = tmp;
        }
    }

    // Create a temporary canvas to convert pixels to image
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = width;
    imageCanvas.height = height;
    const ctx = imageCanvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixelsUint8);
    ctx.putImageData(imageData, 0, 0);

    // Download as PNG
    imageCanvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Cleanup
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
}

/** Load a shader from a URL, compile it, and return it */
async function loadShader(gl, url, type) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load shader: ${url}`);
  const source = await response.text();

  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader compile error (${url}): ${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}
//===============================================================================
/** Initialize a shader program from vertex & fragment shader files */
async function initShaders(gl, vertexUrl, fragmentUrl) {
  const vertexShader = await loadShader(gl, vertexUrl, gl.VERTEX_SHADER);
  const fragmentShader = await loadShader(gl, fragmentUrl, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
  }

  return program;
}

//===================================
// Function to compute normals for entire volume (pre-processing)
// هذه الـ function تحسب النورمالز لكل voxels في الـ volume مرة واحدة
function computeNormalsFromVolume(volume) {
  const width = volume.width;
  const height = volume.height;
  const depth = volume.depth;
  
  // نخزن النورمالز في array (3 قيم لكل voxel: x, y, z)
  const normals = new Float32Array(width * height * depth * 3);
  
  console.log("Computing normals for volume...");
  
  // نمر على كل voxel في الـ volume
  for (let z = 0; z < depth; z++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        
        // حساب الـ gradient (الفرق بين القيم المجاورة)
        const step = 1;
        
        // dx: الفرق في اتجاه X
        const x_plus = Math.min(x + step, width - 1);
        const x_minus = Math.max(x - step, 0);
        const dx = getVoxelValue(volume, x_plus, y, z) - getVoxelValue(volume, x_minus, y, z);
        
        // dy: الفرق في اتجاه Y
        const y_plus = Math.min(y + step, height - 1);
        const y_minus = Math.max(y - step, 0);
        const dy = getVoxelValue(volume, x, y_plus, z) - getVoxelValue(volume, x, y_minus, z);
        
        // dz: الفرق في اتجاه Z
        const z_plus = Math.min(z + step, depth - 1);
        const z_minus = Math.max(z - step, 0);
        const dz = getVoxelValue(volume, x, y, z_plus) - getVoxelValue(volume, x, y, z_minus);
        
        // تطبيع النورمال (normalize)
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        let nx = 0, ny = 0, nz = 0;
        if (length > 0.0001) {
          nx = dx / length;
          ny = dy / length;
          nz = dz / length;
        }
        
        // تخزين النورمال في الـ array
        // نحول من [-1, 1] إلى [0, 1] عشان نخزنه في texture
        const index = (z * width * height + y * width + x) * 3;
        normals[index + 0] = nx * 0.5 + 0.5;  // x component
        normals[index + 1] = ny * 0.5 + 0.5;  // y component
        normals[index + 2] = nz * 0.5 + 0.5;  // z component
      }
    }
  }
  
  console.log("Normals computed!");
  return normals;
}

// Helper function: قراءة قيمة voxel معين
function getVoxelValue(volume, x, y, z) {
  const index = z * volume.width * volume.height + y * volume.width + x;
  return volume.data[index] / 255.0;  // نحول من [0, 255] إلى [0, 1]
}
//===================================

//===================================================================================
/** Main function to draw a triangle */
async function main() {
    let enableEmptySpaceSkipping = 0;

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "e"||e.key.toLowerCase() === "E") {
        if(enableEmptySpaceSkipping==0){
            enableEmptySpaceSkipping=1;
            console.log("Empty Space Skipping ENABLED..");
        }
        else
        {
            enableEmptySpaceSkipping=0;
            console.log("Empty Space Skipping DISABLED..");
        }
      }});
  //================================
  const canvas = document.getElementById('demo-canvas');
  if (!canvas) {
    throw new Error('Could not find HTML canvas element');
    return;
  }

  const gl = canvas.getContext('webgl2');
  const camera = new Camera(canvas);
  if (!gl) {
    throw new Error('WebGL2 not supported');
    return;
  }
  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) {
  throw new Error('EXT_color_buffer_float not supported');
   }
//======== Setup canvas ==================
  // HD resolution 1280x720 pixels
  //2K resolution is 2048×1080
  canvas.width = 1280;
  canvas.height = 720;
  //=========================================
 // =========================================
// Volume bounding box (cube)
const cubeVertices = new Float32Array([
  // back face
  0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 1.0, 0.0,
  0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   0.0, 1.0, 0.0,

  // front face
  0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0,
  0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0,

  // left face
  0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0,
  0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 1.0,

  // right face
  1.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0,
  1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0,

  // top face
  0.0, 1.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0,
  0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0,

  // bottom face
  0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 0.0, 0.0,
  0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0
]);

const nbCubeVertices=36;

 // =========================================
  // Upload vertex data to GPU
const cubeVBO = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
//=================================================
///===================================

const DATASET = "CTHEAD"; // غيريها لـ "CURRENT" وقت تبين الحالي

let volume;
console.log("MAIN REACHED - ABOUT TO LOAD CTHEAD");
if (DATASET === "CTHEAD") {
  volume = await loadCTheadVolume();
} else {
  volume = await loadVolume("/volumeRendering/data/volume/head256x256x109", 256, 256, 109);
}

//const volume = await loadVolume( "/volumeRendering/data/volume/foot183x255x125.row",   // غيري الاسم حسب ملفك
 // 183, 255, 125);

  // =========================================
  // Compute Normals (مباشرة بعد loading الـ volume!)
  console.log("Computing normals from volume...");
  const normalsData = computeNormalsFromVolume(volume);
  console.log("Normals computed successfully!");
  // =========================================
 
  // =========================================
  // Build Min/Max Octree
  console.log("Building Min/Max Octree for empty space skipping...");
  const octree = buildMinMaxOctree(volume.data, volume.width, volume.height, volume.depth, 8);
  
  // =========================================
  // Upload Volume Texture
const volumeTexture = gl.createTexture();
//gl.activeTexture(gl.TEXTURE2);   // نستخدم TEXTURE2
gl.bindTexture(gl.TEXTURE_3D, volumeTexture);
gl.texStorage3D(
  gl.TEXTURE_3D,
  1,
  gl.R8,
  volume.width,
  volume.height,
  volume.depth
);

gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

gl.texSubImage3D(
  gl.TEXTURE_3D,
  0,
  0,0,0,
  volume.width,
  volume.height,
  volume.depth,
  gl.RED,
  gl.UNSIGNED_BYTE,
  volume.data
);

console.log(" Volume uploaded to GPU");

  // =========================================
  // Create Normal Texture 3D (استخدام النورمالز اللي حسبناها قبل)
  console.log("Creating normal texture...");

  // إنشاء Normal Texture
  const normalTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_3D, normalTexture);
  gl.texStorage3D(
    gl.TEXTURE_3D,
    1,
    gl.RGB8,  // RGB لأن النورمال له 3 مكونات (x, y, z)
    volume.width,
    volume.height,
    volume.depth
  );

  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

  // رفع النورمالز للـ GPU (استخدام normalsData اللي حسبناها بعد loading الـ volume)
  // نحول Float32Array إلى Uint8Array
  const normalsUint8 = new Uint8Array(normalsData.length);
  for (let i = 0; i < normalsData.length; i++) {
    normalsUint8[i] = Math.floor(normalsData[i] * 255);
  }

  gl.texSubImage3D(
    gl.TEXTURE_3D,
    0,
    0, 0, 0,
    volume.width,
    volume.height,
    volume.depth,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    normalsUint8
  );

  console.log("Normal texture uploaded to GPU");
  // =========================================

  // =========================================
  // Upload Min/Max Octree Texture
  const minMaxOctreeTexture = uploadMinMaxOctreeToGPU(gl, octree);

  // =========================================
//===================================
// create to render to
const frontFaceTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, frontFaceTexture);
const level = 0;
{
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,                  // level
   gl.RGBA,       // internal format (float texture)
    canvas.width,
    canvas.height,
  0,                // border
  gl.RGBA,          // format
  gl.UNSIGNED_BYTE,         // type
    null                // no initial data
);

// VERY IMPORTANT for float textures:
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
// Create and bind the framebuffer
const frontFace_framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, frontFace_framebuffer);
 
// attach the texture as the first color attachment
const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(
    gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, frontFaceTexture, level);

gl.bindTexture(gl.TEXTURE_2D, null);
//=====================================================
// create to render to
const backFaceTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, backFaceTexture);
{
  // define size and format of level 0
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,                  // level
   gl.RGBA,       // internal format (float texture)
    canvas.width,
    canvas.height,
  0,                // border
  gl.RGBA,          // format
  gl.UNSIGNED_BYTE,         // type
    null                // no initial data
);

  // set the filtering so we don't need mips
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
// Create and bind the framebuffer
const backFace_framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, backFace_framebuffer);
 
// attach the texture as the first color attachment
//const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(
    gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, backFaceTexture, level);
// Debug: Framebuffer sizes
  console.log("=== FRAMEBUFFER INFO ===");
  console.log("Front face texture:", canvas.width, "x", canvas.height);
  console.log("Back face texture:", canvas.width, "x", canvas.height);

 
//=====================================================
  // Load shaders from files and create program
  let program;
  try {
    program = await initShaders(gl, "/volumeRendering/shaders/vs.glsl", "/volumeRendering/shaders/fs.glsl");
  } catch (e) {
    throw new Error(e.message);
    return;
  }
    let final_program;
  try {
    final_program = await initShaders(gl, "/volumeRendering/shaders/final_pass_vs.glsl", "/volumeRendering/shaders/final_pass_fs.glsl");
  } catch (e) {
    throw new Error(e.message);
    return;
  }
  
  //=========================================
  // Get attribute location and enable it
  const vertexPositionAttributeLocation = gl.getAttribLocation(program, 'vertexPosition');
  if (vertexPositionAttributeLocation < 0) {
    throw new Error('Failed to get attribute location for vertexPosition');
    return;
  }
  gl.enableVertexAttribArray(vertexPositionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
  gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
   //=========================================
  //=========================================
let modelMatrix = mat4();
//let angle= 20;
//  modelMatrix = mult(modelMatrix, rotate(angle, vec3(0, 1, 0)));

//===================================
let mvpMatrix = mat4();


let mvpInverseMatrix = mat4();
mvpInverseMatrix = inverse4(mvpMatrix);

function render() {
  
    const modelMatrix = camera.getModelMatrix();
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = camera.getProjectionMatrix();

    let mvpMatrix = mult(projectionMatrix, mult(viewMatrix, modelMatrix));
    let mvpInverseMatrix = inverse4(mvpMatrix);

  //==============================================
// First Pass: Render Front Faces into frontFaceTexture
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, frontFace_framebuffer);
    
    // Ensure framebuffer is complete
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error("FrontFace framebuffer incomplete!");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear color and depth buffers
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // black background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT); // Cull back faces, render only front faces

    gl.useProgram(program);

    // Set uniforms
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMatrix"), false, flatten(viewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    // Draw cube
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    gl.drawArrays(gl.TRIANGLES, 0, nbCubeVertices);
}

//==============================================
// Second Pass: Render Back Faces into backFaceTexture
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, backFace_framebuffer);

    // Ensure framebuffer is complete
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error("BackFace framebuffer incomplete!");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear color and depth buffers
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // black background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK); // Cull front faces, render only back faces

    gl.useProgram(program);

    // Set uniforms
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelMatrix"), false, flatten(modelMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "viewMatrix"), false, flatten(viewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    // Draw cube
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.vertexAttribPointer(vertexPositionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    gl.drawArrays(gl.TRIANGLES, 0, nbCubeVertices);
}

//==============================================
// Final Pass: Render to Screen
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // default framebuffer
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(final_program);
    gl.uniformMatrix4fv(gl.getUniformLocation(final_program, "uMvpInverseMatrix"), false, flatten(mvpInverseMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, frontFaceTexture);
    gl.uniform1i(gl.getUniformLocation(final_program, "uFrontFaceTexture"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, backFaceTexture);
    gl.uniform1i(gl.getUniformLocation(final_program, "uBackFaceTexture"), 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_3D, volumeTexture);
    gl.uniform1i(gl.getUniformLocation(final_program, "uVolumeTexture"), 2);

    // Bind Min/Max Octree texture
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_3D, minMaxOctreeTexture);
    gl.uniform1i(gl.getUniformLocation(final_program, "uMinMaxOctree"), 3);

    // Bind Normal Texture (التكستشر الجديد!)
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_3D, normalTexture);
    gl.uniform1i(gl.getUniformLocation(final_program, "uNormalTexture"), 4);

    // Send block size uniform
    gl.uniform1f(gl.getUniformLocation(final_program, "uBlockSize"), octree.blockSize);
    gl.uniform1i(gl.getUniformLocation(final_program, "uEnableEmptySpaceSkipping"), enableEmptySpaceSkipping);

    // fullscreen triangle
   
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
}
}
    render(); 

// Save front-face texture
//saveTextureAsImage(gl, frontFaceTexture, canvas.width, canvas.height, 'front_face.png');
//
}//<<=== end of main ()
//===============================================================================
// Run the main function
main().catch(e => { throw new Error(`Uncaught JS exception: ${e}`); });
