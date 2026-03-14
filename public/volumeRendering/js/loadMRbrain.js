export async function loadMRbrainVolume() {
  console.log(" MRbrain LOADING...");

  const width = 256;
  const height = 256;
  const depth = 109;

  const voxelsPerSlice = width * height;      // 65536
  const bytesPerSlice16 = voxelsPerSlice * 2; // 131072

 
  const volumeData = new Uint8Array(voxelsPerSlice * depth);

  
  for (let i = 1; i <= depth; i++) {
    if (i % 10 === 0 || i === 1) console.log("LOADING SLICE:", i);

    const url =`/volumeRendering/data/volume/MRbrain/MRbrain.${i}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch slice ${i}: ${url}`);

    const buffer = await res.arrayBuffer();

    if (buffer.byteLength !== bytesPerSlice16) {
      throw new Error(
       ` Slice ${i} size mismatch. Expected ${bytesPerSlice16} bytes, got ${buffer.byteLength}`
      );
    }

    // Big-endian -> Uint16
    const bytes = new Uint8Array(buffer);
    const slice16 = new Uint16Array(voxelsPerSlice);

    for (let p = 0; p < voxelsPerSlice; p++) {
      slice16[p] = bytes[2 * p] | (bytes[2 * p + 1] << 8);
    }

    
    let minV = 65535;
let maxV = 0;

for (let p = 0; p < voxelsPerSlice; p++) {
  const v = slice16[p];
  if (v < minV) minV = v;
  if (v > maxV) maxV = v;
}

const denom = (maxV - minV) || 1;

const slice8 = new Uint8Array(voxelsPerSlice);
for (let p = 0; p < voxelsPerSlice; p++) {
  slice8[p] = Math.round(((slice16[p] - minV) / denom) * 255);
}

    volumeData.set(slice8, (i - 1) * voxelsPerSlice);
  }

  console.log("MRbrain loaded (converted to 8-bit)", { width, height, depth });
  console.log("volumeData length =", volumeData.length);
  console.log("Expected =", width * height * depth);

  return { data: volumeData, width, height, depth };
}