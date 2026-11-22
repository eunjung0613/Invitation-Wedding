import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";

const MAX_FILE_BYTES = 4.5 * 1024 * 1024; // 4.5MB (브라우저 자동 압축 후 보통 150~400KB)

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        code: "BLOB_NOT_CONFIGURED",
        error:
          "Vercel Blob 토큰(BLOB_READ_WRITE_TOKEN)이 설정되지 않았습니다.",
      },
      { status: 501 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "업로드할 이미지 파일이 없습니다." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "이미지 용량이 너무 큽니다. (최대 4.5MB)" },
        { status: 413 }
      );
    }

    const safeName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.jpg`;

    const blob = await put(`guest-snaps/${safeName}`, file, {
      access: "public",
      contentType: file.type || "image/jpeg",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("[Vercel Blob Upload Error]", error);
    return NextResponse.json(
      { error: "사진 업로드 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const expectedAdminPw =
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    "0328";
  const providedPw = request.headers.get("x-admin-password") || "";

  if (providedPw !== expectedAdminPw) {
    return NextResponse.json(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as { url?: string };
    if (!body?.url || !body.url.startsWith("https://")) {
      return NextResponse.json(
        { error: "삭제할 Blob URL이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    await del(body.url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Vercel Blob Delete Error]", error);
    return NextResponse.json(
      { error: "Blob 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
