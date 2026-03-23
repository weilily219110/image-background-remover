import { NextRequest, NextResponse } from "next/server";
import { removeBg } from "@/lib/remove-bg";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resultBuffer = await removeBg(buffer);

    return new Response(new Uint8Array(resultBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=\"result.png\"",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/remove-bg]", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
