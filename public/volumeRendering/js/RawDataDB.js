// ============================================================
// Fetches raw volume bytes from Supabase via the API.
// ============================================================

export async function loadVolumeFromDB() {

  // 1. Read volumeId from URL 
  const params   = new URLSearchParams(window.location.search);
  const volumeId = params.get("volumeId");
  if (!volumeId) throw new Error("No volumeId in URL");

  // 2. Fetch signed URL + dimensions from API 
  const infoRes = await fetch(`/api/volumes/${volumeId}/info`);
  if (!infoRes.ok) throw new Error(`API error: ${infoRes.status}`);
  const { signedUrl, width, height, depth } = await infoRes.json();
  if (!signedUrl || !width || !height || !depth) throw new Error("Invalid API response");

  // 3. Fetch raw file bytes 
  const fileRes = await fetch(signedUrl);
  if (!fileRes.ok) throw new Error(`File fetch error: ${fileRes.status}`);
  const buffer = await fileRes.arrayBuffer();
  const bytes  = new Uint8Array(buffer);

  console.log(`Raw data fetched: ${bytes.length} bytes | dimensions: ${width}x${height}x${depth}`);

  // Return raw bytes + dimensions to main() 
  return { bytes, width, height, depth };
}