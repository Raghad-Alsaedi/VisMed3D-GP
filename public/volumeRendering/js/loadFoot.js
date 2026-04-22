export async function loadFootVolume() {
 const width  = 256;
const height = 256;
const depth  = 256;
  const url = "/volumeRendering/data/volume/Foot_fixed.raw";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load Foot volume");
  }

  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let minV8 = 255;
  let maxV8 = 0;

  for (let i = 0; i < bytes.length; i++) {
    const v = bytes[i];
    if (v < minV8) minV8 = v;
    if (v > maxV8) maxV8 = v;
  }

  console.log("FOOT raw byte min/max =", minV8, maxV8);

  const voxels = width * height * depth;
  const expectedSize8 = voxels;
  const expectedSize16 = voxels * 2;

  console.log("Foot raw bytes:", bytes.length);

  // 8-bit dataset
  if (bytes.length === expectedSize8) {
    console.log("Detected 8-bit Foot dataset");
    return {
      data: bytes,
      width,
      height,
      depth,
    };
  }

  // 16-bit dataset
  if (bytes.length === expectedSize16) {
    console.log("Detected 16-bit Foot dataset");

    const values = new Uint16Array(voxels);
    const data = new Uint8Array(voxels);

    let minV = 65535;
    let maxV = 0;

    // little-endian decode
    for (let i = 0, j = 0; i < voxels; i++, j += 2) {
      const v = bytes[j] | (bytes[j + 1] << 8);
      values[i] = v;

      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }

    console.log("Foot 16-bit min/max:", minV, maxV);

    const denom = (maxV - minV) || 1;

    for (let i = 0; i < voxels; i++) {
      data[i] = Math.round(((values[i] - minV) / denom) * 255);
    }

    return {
      data,
      width,
      height,
      depth,
    };
  }

  throw new Error(
   ` Foot volume size mismatch. Got ${bytes.length}, expected ${expectedSize8} (8-bit) or ${expectedSize16} (16-bit)`
  );
}