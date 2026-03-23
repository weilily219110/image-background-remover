const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
const REMOVE_BG_API_URL = "https://api.remove.bg/v1.0/removebg";

export async function removeBg(imageBuffer: Buffer): Promise<Buffer> {
  if (!REMOVE_BG_API_KEY) {
    throw new Error("REMOVE_BG_API_KEY is not set in environment variables.");
  }

  const formData = new FormData();
  formData.append(
    "image_file",
    new Blob([new Uint8Array(imageBuffer)]),
    "image.png"
  );
  formData.append("size", "regular");

  const response = await fetch(REMOVE_BG_API_URL, {
    method: "POST",
    headers: {
      "X-Api-Key": REMOVE_BG_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Remove.bg API error: ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
