import { timingSafeEqual } from "node:crypto";
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedDb: Firestore | null = null;
let initAttempted = false;

function parseServiceAccount(raw: string): ServiceAccount | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const tryJson = (str: string): ServiceAccount | null => {
    try {
      const parsed = JSON.parse(str) as Record<string, unknown>;
      const projectId = String(parsed.project_id ?? parsed.projectId ?? "");
      const clientEmail = String(
        parsed.client_email ?? parsed.clientEmail ?? ""
      );
      const privateKeyRaw = String(
        parsed.private_key ?? parsed.privateKey ?? ""
      );
      if (!projectId || !clientEmail || !privateKeyRaw) return null;
      return {
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
      };
    } catch {
      return null;
    }
  };

  // 1) 일반 JSON 문자열 그대로 붙여넣은 경우
  const direct = tryJson(trimmed);
  if (direct) return direct;

  // 2) Base64로 인코딩해 넣은 경우
  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf8");
    const fromBase64 = tryJson(decoded);
    if (fromBase64) return fromBase64;
  } catch {
    // ignore
  }

  return null;
}

export function getAdminDb(): Firestore | null {
  if (initAttempted) return cachedDb;
  initAttempted = true;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  const serviceAccount = parseServiceAccount(raw);
  if (!serviceAccount) {
    console.error(
      "[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_KEY 형식을 파싱할 수 없습니다."
    );
    return null;
  }

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({ credential: cert(serviceAccount) });

  cachedDb = getFirestore(app);
  return cachedDb;
}

export function getExpectedAdminPassword(): string {
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    "0328"
  );
}

export function verifyAdminPassword(provided: string | null): boolean {
  if (!provided) return false;
  const expected = getExpectedAdminPassword();
  const a = Buffer.from(provided.trim());
  const b = Buffer.from(expected.trim());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
