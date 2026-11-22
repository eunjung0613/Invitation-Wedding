import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getAdminDb, verifyAdminPassword } from "@/lib/firebaseAdmin";

function normalizeTs(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toMillis" in val) {
    return (val as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

function unauthorized() {
  return NextResponse.json(
    { error: "관리자 비밀번호가 일치하지 않습니다." },
    { status: 401 }
  );
}

function notConfigured() {
  return NextResponse.json(
    {
      code: "ADMIN_SDK_NOT_CONFIGURED",
      error:
        "Vercel 환경 변수에 FIREBASE_SERVICE_ACCOUNT_KEY가 아직 설정되지 않았습니다.",
    },
    { status: 501 }
  );
}

export async function GET(request: NextRequest) {
  const pw = request.headers.get("x-admin-password");
  if (!verifyAdminPassword(pw)) return unauthorized();

  const db = getAdminDb();
  if (!db) return notConfigured();

  try {
    const [rsvpSnap, gbSnap, snapSnap, settingsDoc] = await Promise.all([
      db.collection("rsvp").orderBy("createdAt", "desc").get(),
      db.collection("guestbook").orderBy("createdAt", "desc").get(),
      db.collection("guestSnaps").orderBy("createdAt", "desc").get(),
      db.collection("settings").doc("public").get(),
    ]);

    const rsvps = rsvpSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        side: data.side === "bride" ? "bride" : "groom",
        attendance: data.attendance ?? "attending",
        name: String(data.name ?? ""),
        guestCount: Number(data.guestCount ?? 1),
        meal: data.meal ?? "yes",
        phone: String(data.phone ?? ""),
        message: String(data.message ?? ""),
        createdAt: normalizeTs(data.createdAt),
      };
    });

    const guestbook = gbSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: String(data.name ?? ""),
        message: String(data.message ?? ""),
        passwordHash: String(data.passwordHash ?? ""),
        createdAt: normalizeTs(data.createdAt),
      };
    });

    const snaps = snapSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        author: String(data.author ?? ""),
        caption: String(data.caption ?? ""),
        imageUrl: String(data.imageUrl ?? ""),
        storagePath: String(data.storagePath ?? ""),
        createdAt: normalizeTs(data.createdAt),
      };
    });

    const settings = settingsDoc.exists ? settingsDoc.data() : null;

    return NextResponse.json({ rsvps, guestbook, snaps, settings });
  } catch (err) {
    console.error("[GET /api/admin]", err);
    return NextResponse.json(
      { error: "관리자 데이터를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const pw = request.headers.get("x-admin-password");
  if (!verifyAdminPassword(pw)) return unauthorized();

  const db = getAdminDb();
  if (!db) return notConfigured();

  try {
    const body = (await request.json()) as {
      accounts?: unknown;
      contacts?: unknown;
    };
    if (!body?.accounts || !body?.contacts) {
      return NextResponse.json(
        { error: "계좌 및 연락처 데이터가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const payload = {
      accounts: body.accounts,
      contacts: body.contacts,
      updatedAt: Date.now(),
    };

    await db.collection("settings").doc("public").set(payload);
    return NextResponse.json({ ok: true, settings: payload });
  } catch (err) {
    console.error("[PUT /api/admin]", err);
    return NextResponse.json(
      { error: "계좌 및 연락처 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const pw = request.headers.get("x-admin-password");
  if (!verifyAdminPassword(pw)) return unauthorized();

  const db = getAdminDb();
  if (!db) return notConfigured();

  try {
    const body = (await request.json()) as {
      collection?: "rsvp" | "guestbook" | "guestSnaps";
      id?: string;
      imageUrl?: string;
    };

    if (
      !body?.id ||
      !body?.collection ||
      !["rsvp", "guestbook", "guestSnaps"].includes(body.collection)
    ) {
      return NextResponse.json(
        { error: "삭제 대상이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (
      body.collection === "guestSnaps" &&
      body.imageUrl?.startsWith("https://") &&
      process.env.BLOB_READ_WRITE_TOKEN
    ) {
      try {
        await del(body.imageUrl);
      } catch {
        // Blob already deleted
      }
    }

    await db.collection(body.collection).doc(body.id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin]", err);
    return NextResponse.json(
      { error: "삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
