// ============================================================
// Fetches raw volume bytes from Supabase via the API.
// ============================================================

export async function loadVolumeFromDB() {

  const params   = new URLSearchParams(window.location.search);
  const volumeId = params.get("volumeId");
  if (!volumeId) throw new Error("No volumeId in URL");

  const infoRes = await fetch(`/api/volumes/${volumeId}/info`);
  if (!infoRes.ok) throw new Error(`API error: ${infoRes.status}`);
  const info = await infoRes.json();
  if (!info.success) throw new Error(info.error);

  const { width, height, depth } = info;

  if (info.isReady) {
    const fileRes = await fetch(info.processedUrl);
    if (!fileRes.ok) throw new Error(`File fetch error: ${fileRes.status}`);
    const buffer = await fileRes.arrayBuffer();
    const bytes  = new Uint8Array(buffer);
    console.log(`Processed data fetched: ${bytes.length} bytes | dimensions: ${width}x${height}x${depth}`);
    return { bytes, width, height, depth, isReady: true };
  }

  const fileRes = await fetch(info.signedUrl);
  if (!fileRes.ok) throw new Error(`File fetch error: ${fileRes.status}`);
  const buffer = await fileRes.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  console.log(`Raw data fetched: ${bytes.length} bytes | dimensions: ${width}x${height}x${depth}`);
  return { bytes, width, height, depth, isReady: false };
}