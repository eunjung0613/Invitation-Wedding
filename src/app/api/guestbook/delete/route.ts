import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      {
        code: "ADMIN_SDK_NOT_CONFIGURED",
        error: "서버 삭제 설정이 완료되지 않았습니다.",
      },
      { status: 501 }
    );
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      passwordHash?: string;
    };

    if (!body?.id || !body?.passwordHash) {
      return NextResponse.json(
        { error: "요청 값이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const docRef = db.collection("guestbook").doc(body.id);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "이미 삭제된 메시지입니다." },
        { status: 404 }
      );
    }

    const storedHash = String(snap.data()?.passwordHash ?? "");
    if (storedHash !== body.passwordHash) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    await docRef.delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/guestbook/delete]", err);
    return NextResponse.json(
      { error: "방명록 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
