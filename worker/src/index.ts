export interface Env {
  REMOVE_BG_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get("image") as File | null;

      if (!file) {
        return new Response(JSON.stringify({ error: "No image file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({ error: "Unsupported file type. Use JPG, PNG, or WebP." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (file.size > MAX_SIZE) {
        return new Response(JSON.stringify({ error: "File too large. Max 10MB." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Call Remove.bg API
      const rbFormData = new FormData();
      rbFormData.append("image_file", file);
      rbFormData.append("size", "regular");

      const rbResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": env.REMOVE_BG_API_KEY },
        body: rbFormData,
      });

      if (!rbResponse.ok) {
        const errText = await rbResponse.text();
        return new Response(JSON.stringify({ error: `Remove.bg error: ${errText}` }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }

      const resultBuffer = await rbResponse.arrayBuffer();

      return new Response(new Uint8Array(resultBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": "inline; filename=\"result.png\"",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
        },
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
