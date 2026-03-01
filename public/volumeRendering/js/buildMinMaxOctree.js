
/**
 * Build Min/Max Octree for Empty Space Skipping
 * Based on the paper: "Acceleration Techniques for GPU-based Volume Rendering"
 * 
 * Creates a 3D texture with 1/8 resolution in each dimension
 * Each voxel stores: R=min, G=max of the 8x8x8 block
 */

/**
 * Build min/max octree from volume data
 * @param {Uint8Array} volumeData - Original volume data
 * @param {number} width - Volume width
 * @param {number} height - Volume height
 * @param {number} depth - Volume depth
 * @param {number} blockSize - Size of each block (default 8)
 * @returns {Object} {data: Uint8Array, width, height, depth}
 */
export function buildMinMaxOctree(volumeData, width, height, depth, blockSize = 8) {
    console.log("Building Min/Max Octree...");
    
    // Calculate octree dimensions (1/blockSize of original)
    const octreeWidth = Math.ceil(width / blockSize);
    const octreeHeight = Math.ceil(height / blockSize);
    const octreeDepth = Math.ceil(depth / blockSize);
    
    console.log(`Original volume: ${width}x${height}x${depth}`);
    console.log(`Octree volume: ${octreeWidth}x${octreeHeight}x${octreeDepth}`);
    
    // Allocate octree data (RG format: min, max)
    const octreeSize = octreeWidth * octreeHeight * octreeDepth * 2;
    const octreeData = new Uint8Array(octreeSize);
    
    // Process each block
    let blockIndex = 0;
    for (let z = 0; z < octreeDepth; z++) {
        for (let y = 0; y < octreeHeight; y++) {
            for (let x = 0; x < octreeWidth; x++) {
                let minVal = 255;
                let maxVal = 0;
                
                // Sample all voxels in this 8x8x8 block
                for (let bz = 0; bz < blockSize; bz++) {
                    for (let by = 0; by < blockSize; by++) {
                        for (let bx = 0; bx < blockSize; bx++) {
                            const vx = x * blockSize + bx;
                            const vy = y * blockSize + by;
                            const vz = z * blockSize + bz;
                            
                            // Check bounds
                            if (vx >= width || vy >= height || vz >= depth) continue;
                            
                            // Get scalar value
                            const idx = vz * (width * height) + vy * width + vx;
                            const value = volumeData[idx];
                            
                            minVal = Math.min(minVal, value);
                            maxVal = Math.max(maxVal, value);
                        }
                    }
                }
                
                // Store min/max in octree
                const octreeIdx = blockIndex * 2;
                octreeData[octreeIdx + 0] = minVal; // R channel
                octreeData[octreeIdx + 1] = maxVal; // G channel
                
                blockIndex++;
            }
        }
    }
    
    console.log(`Min/Max Octree built: ${blockIndex} blocks processed`);
    
    return {
        data: octreeData,
        width: octreeWidth,
        height: octreeHeight,
        depth: octreeDepth,
        blockSize: blockSize
    };
}

/**
 * Upload Min/Max octree to GPU as 3D texture
 * @param {WebGL2RenderingContext} gl - WebGL2 context
 * @param {Object} octree - Octree data from buildMinMaxOctree
 * @returns {WebGLTexture} - The created 3D texture
 */
export function uploadMinMaxOctreeToGPU(gl, octree) {
    console.log("Uploading Min/Max Octree to GPU...");
    
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, texture);
    
    // Use RG8 format (min in R, max in G)
    gl.texStorage3D(
        gl.TEXTURE_3D,
        1,
        gl.RG8,  // RG format: R=min, G=max
        octree.width,
        octree.height,
        octree.depth
    );
    
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // Use NEAREST for accurate min/max
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    
    // Upload data
    gl.texSubImage3D(
        gl.TEXTURE_3D,
        0,
        0, 0, 0,
        octree.width,
        octree.height,
        octree.depth,
        gl.RG,
        gl.UNSIGNED_BYTE,
        octree.data
    );
     
    console.log("Min/Max Octree uploaded to GPU");
    
    return texture;
}