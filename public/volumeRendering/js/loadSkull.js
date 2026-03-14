export async function loadSkullVolume() {

  const width = 256;
  const height = 256;
  const depth = 68;

  const url = "/volumeRendering/data/volume/Skull.vol";

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to load Skull volume");
  }

  const buffer = await res.arrayBuffer();
  const data = new Uint8Array(buffer);

  const expectedSize = width * height * depth;

  if (data.length !== expectedSize) {
    console.warn("Volume size mismatch");
    console.log("Expected:", expectedSize);
    console.log("Actual:", data.length);
  }

  console.log("Skull volume loaded");

  return {
    data,
    width,
    height,
    depth
  };
}