

export async function loadCTheadVolume() {
    console.log("🔥🔥🔥 CTHEAD LOADED SUCCESSFULLY 🔥🔥🔥");
  const width = 256;
  const height = 256;
  const depth = 113;

  const voxelsPerSlice = width * height;     // 65536 voxel
  const bytesPerSlice16 = voxelsPerSlice * 2; // 131072 bytes (16-bit)

  // راح نرجّع Volume 8-bit عشان ما نغيّر شغل البنات (R8 + UNSIGNED_BYTE)
  const volumeData = new Uint8Array(voxelsPerSlice * depth);

  for (let i = 1; i <= depth; i++) {
    if (i % 10 === 0 || i === 1) console.log("LOADING SLICE:", i);
    const url = `/volumeRendering/data/volume/CThead/CThead.${i}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Failed to fetch slice ${i}: ${url}`);

    const buffer = await res.arrayBuffer();

    // نتأكد: CThead سلايس 16-bit
    if (buffer.byteLength !== bytesPerSlice16) {
      throw new Error(
        `Slice ${i} size mismatch. Expected ${bytesPerSlice16} bytes, got ${buffer.byteLength}`
      );
    }

  
const bytes = new Uint8Array(buffer);
const slice16 = new Uint16Array(voxelsPerSlice);  

for (let p = 0; p < voxelsPerSlice; p++) {
  slice16[p] = (bytes[2*p] << 8) | bytes[2*p + 1];  // Big-endian swap
}

    // تحويل 16-bit -> 8-bit (Normalization/Windowing أوضح)
const slice8 = new Uint8Array(voxelsPerSlice);

// 1) احسبي min/max داخل السلايس
// Windowing ثابت للـ CT (أوضح عادة)
const low = 0;
const high = 1500;   // لو ما ضبط جرّبي 1500 أو 2500
const denom = high - low || 1;

for (let p = 0; p < voxelsPerSlice; p++) {
  let v = slice16[p];
  if (v < low) v = low;
  if (v > high) v = high;
  slice8[p] = Math.round(((v - low) / denom) * 255);
}

    volumeData.set(slice8, (i - 1) * voxelsPerSlice);
  }

  console.log("CThead volume loaded (converted to 8-bit)", { width, height, depth });
  console.log("✅ DONE. volumeData length =", volumeData.length);
console.log("✅ Expected =", width * height * depth);
  return { data: volumeData, width, height, depth };
}