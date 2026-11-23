import { NextRequest, NextResponse } from "next/server";
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
    const [rsvpSnap, gbSnap, settingsDoc] = await Promise.all([
      db.collection("rsvp").orderBy("createdAt", "desc").get(),
      db.collection("guestbook").orderBy("createdAt", "desc").get(),
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

    const settings = settingsDoc.exists ? settingsDoc.data() : null;

    return NextResponse.json({ rsvps, guestbook, snaps: [], settings });
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
    if (!body?.accounts) {
      return NextResponse.json(
        { error: "계좌 데이터가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const payload = {
      accounts: body.accounts,
      contacts: body.contacts ?? { groomSide: [], brideSide: [] },
      updatedAt: Date.now(),
    };

    await db.collection("settings").doc("public").set(payload);
    return NextResponse.json({ ok: true, settings: payload });
  } catch (err) {
    console.error("[PUT /api/admin]", err);
    return NextResponse.json(
      { error: "계좌 저장 중 오류가 발생했습니다." },
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
      collection?: "rsvp" | "guestbook";
      id?: string;
    };

    if (
      !body?.id ||
      !body?.collection ||
      !["rsvp", "guestbook"].includes(body.collection)
    ) {
      return NextResponse.json(
        { error: "삭제 대상이 올바르지 않습니다." },
        { status: 400 }
      );
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

function isSafeDocId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    id.trim().length > 0 &&
    id.trim().length <= 128 &&
    !id.includes("/")
  );
}

export async function POST(request: NextRequest) {
  const pw = request.headers.get("x-admin-password");
  if (!verifyAdminPassword(pw)) return unauthorized();

  const db = getAdminDb();
  if (!db) return notConfigured();

  try {
    const body = (await request.json()) as {
      settings?: { accounts?: unknown; contacts?: unknown } | null;
      rsvps?: Array<Record<string, unknown>>;
      guestbook?: Array<Record<string, unknown>>;
    };

    const hasSettings = Boolean(body?.settings?.accounts);
    const rsvpList = Array.isArray(body?.rsvps) ? body.rsvps : [];
    const guestbookList = Array.isArray(body?.guestbook) ? body.guestbook : [];

    if (!hasSettings && rsvpList.length === 0 && guestbookList.length === 0) {
      return NextResponse.json(
        { error: "복원할 백업 데이터가 없습니다." },
        { status: 400 }
      );
    }

    let restoredSettings = false;
    let restoredRsvps = 0;
    let restoredGuestbook = 0;

    if (hasSettings && body.settings?.accounts) {
      await db.collection("settings").doc("public").set({
        accounts: body.settings.accounts,
        contacts: body.settings.contacts ?? { groomSide: [], brideSide: [] },
        updatedAt: Date.now(),
      });
      restoredSettings = true;
    }

    const writeDocsInBatches = async (
      collectionName: "rsvp" | "guestbook",
      entries: Array<{ id?: string; data: Record<string, unknown> }>
    ) => {
      const BATCH_SIZE = 400;
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const chunk = entries.slice(i, i + BATCH_SIZE);
        const batch = db.batch();
        for (const item of chunk) {
          const ref = item.id
            ? db.collection(collectionName).doc(item.id)
            : db.collection(collectionName).doc();
          batch.set(ref, item.data, { merge: true });
        }
        await batch.commit();
      }
    };

    const normalizedRsvps: Array<{ id?: string; data: Record<string, unknown> }> = [];
    for (const item of rsvpList) {
      const name = String(item?.name ?? "").trim().slice(0, 30);
      if (!name) continue;
      const side = item.side === "bride" ? "bride" : "groom";
      const attendance = ["attending", "declined", "undecided"].includes(
        String(item.attendance)
      )
        ? String(item.attendance)
        : "attending";
      const meal = ["yes", "no", "undecided"].includes(String(item.meal))
        ? String(item.meal)
        : "yes";
      normalizedRsvps.push({
        id: isSafeDocId(item.id) ? item.id.trim() : undefined,
        data: {
          side,
          attendance,
          name,
          guestCount: Math.max(1, Math.min(20, Number(item.guestCount) || 1)),
          meal,
          phone: String(item.phone ?? "").trim().slice(0, 30),
          message: String(item.message ?? "").trim().slice(0, 300),
          createdAt: normalizeTs(item.createdAt),
        },
      });
    }
    if (normalizedRsvps.length > 0) {
      await writeDocsInBatches("rsvp", normalizedRsvps);
      restoredRsvps = normalizedRsvps.length;
    }

    const normalizedGuestbook: Array<{
      id?: string;
      data: Record<string, unknown>;
    }> = [];
    for (const item of guestbookList) {
      if (item?.passwordHash === "system-pinned" || item?.id === "welcome-1") {
        continue;
      }
      const name = String(item?.name ?? "").trim().slice(0, 30);
      const message = String(item?.message ?? "").trim().slice(0, 500);
      if (!name || !message) continue;
      normalizedGuestbook.push({
        id: isSafeDocId(item.id) ? item.id.trim() : undefined,
        data: {
          name,
          message,
          passwordHash:
            String(item.passwordHash ?? "").trim().slice(0, 128) || "restored",
          createdAt: normalizeTs(item.createdAt),
        },
      });
    }
    if (normalizedGuestbook.length > 0) {
      await writeDocsInBatches("guestbook", normalizedGuestbook);
      restoredGuestbook = normalizedGuestbook.length;
    }

    return NextResponse.json({
      ok: true,
      restored: {
        settings: restoredSettings,
        rsvps: restoredRsvps,
        guestbook: restoredGuestbook,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin]", err);
    return NextResponse.json(
      { error: "백업 복원 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
