export interface Env {
  REMOVE_BG_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

// MIME type whitelist
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

async function validateRequest(request: Request): Promise<{ error: string; status: number } | null> {
  if (request.method !== 'POST') {
    return { error: 'Method not allowed', status: 405 };
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return { error: 'Content-Type must be multipart/form-data', status: 400 };
  }

  return null;
}

async function handleRemoveBg(file: File, env: Env): Promise<ArrayBuffer> {
  const formData = new FormData();
  formData.append('image_file', file);
  formData.append('size', 'regular');

  const rbResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': env.REMOVE_BG_API_KEY,
    },
    body: formData,
  });

  if (!rbResponse.ok) {
    const errText = await rbResponse.text();
    throw new Error(`Remove.bg API error: ${errText}`);
  }

  return rbResponse.arrayBuffer();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 校验请求方法
    const validation = await validateRequest(request);
    if (validation) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: validation.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('image') as File;

      // 校验文件
      if (!file) {
        return new Response(JSON.stringify({ error: 'No image file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'Unsupported file type. Use JPG, PNG, or WebP.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (file.size > MAX_SIZE) {
        return new Response(JSON.stringify({ error: 'File too large. Max 10MB.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 调用 Remove.bg
      const resultBuffer = await handleRemoveBg(file, env);

      return new Response(resultBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'inline; filename="result.png"',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
        },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
