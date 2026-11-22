import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  WEDDING_CONFIG,
  type BankAccount,
  type ContactPerson,
} from "@/config/wedding";
import { db, isFirebaseConfigured } from "./firebase";

export interface WeddingSettings {
  accounts: {
    groomSide: BankAccount[];
    brideSide: BankAccount[];
  };
  contacts: {
    groomSide: ContactPerson[];
    brideSide: ContactPerson[];
  };
  updatedAt: number;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  passwordHash: string;
  createdAt: number;
}

export type RsvpSide = "groom" | "bride";
export type RsvpAttendance = "attending" | "declined" | "undecided";
export type RsvpMeal = "yes" | "no" | "undecided";

export interface RsvpEntry {
  id: string;
  side: RsvpSide;
  attendance: RsvpAttendance;
  name: string;
  guestCount: number;
  meal: RsvpMeal;
  phone: string;
  message: string;
  createdAt: number;
}

export interface GuestSnapEntry {
  id: string;
  author: string;
  caption: string;
  imageUrl: string;
  storagePath: string;
  createdAt: number;
}

const LS_GUESTBOOK = "wedding_demo_guestbook_v1";
const LS_RSVP = "wedding_demo_rsvp_v1";
const LS_SNAPS = "wedding_demo_snaps_v1";
const LS_SETTINGS = "wedding_demo_settings_v1";

export function getDefaultWeddingSettings(): WeddingSettings {
  return {
    accounts: {
      groomSide: WEDDING_CONFIG.accounts.groomSide.map((a) => ({ ...a })),
      brideSide: WEDDING_CONFIG.accounts.brideSide.map((a) => ({ ...a })),
    },
    contacts: {
      groomSide: WEDDING_CONFIG.contacts.groomSide.map((c) => ({ ...c })),
      brideSide: WEDDING_CONFIG.contacts.brideSide.map((c) => ({ ...c })),
    },
    updatedAt: 0,
  };
}

function normalizeWeddingSettings(raw: unknown): WeddingSettings {
  const defaults = getDefaultWeddingSettings();
  if (!raw || typeof raw !== "object") return defaults;
  const data = raw as Partial<WeddingSettings>;

  const mergeAccounts = (
    fallback: BankAccount[],
    incoming?: BankAccount[]
  ): BankAccount[] => {
    if (!Array.isArray(incoming) || incoming.length === 0) return fallback;
    return fallback.map((def, idx) => {
      const item = incoming[idx];
      if (!item || typeof item !== "object") return def;
      return {
        id: def.id,
        role: String(item.role ?? def.role).trim().slice(0, 20) || def.role,
        holder: String(item.holder ?? def.holder).trim().slice(0, 30) || def.holder,
        bank: String(item.bank ?? def.bank).trim().slice(0, 30),
        number: String(item.number ?? def.number).trim().slice(0, 40),
        kakaoPayUrl: String(item.kakaoPayUrl ?? "").trim().slice(0, 300),
      };
    });
  };

  const mergeContacts = (
    fallback: ContactPerson[],
    incoming?: ContactPerson[]
  ): ContactPerson[] => {
    if (!Array.isArray(incoming) || incoming.length === 0) return fallback;
    return fallback.map((def, idx) => {
      const item = incoming[idx];
      if (!item || typeof item !== "object") return def;
      return {
        role: String(item.role ?? def.role).trim().slice(0, 20) || def.role,
        name: String(item.name ?? def.name).trim().slice(0, 30) || def.name,
        phone: String(item.phone ?? "").trim().slice(0, 30),
      };
    });
  };

  return {
    accounts: {
      groomSide: mergeAccounts(
        defaults.accounts.groomSide,
        data.accounts?.groomSide
      ),
      brideSide: mergeAccounts(
        defaults.accounts.brideSide,
        data.accounts?.brideSide
      ),
    },
    contacts: {
      groomSide: mergeContacts(
        defaults.contacts.groomSide,
        data.contacts?.groomSide
      ),
      brideSide: mergeContacts(
        defaults.contacts.brideSide,
        data.contacts?.brideSide
      ),
    },
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

function readLocalSettings(): WeddingSettings {
  if (typeof window === "undefined") return getDefaultWeddingSettings();
  try {
    const raw = window.localStorage.getItem(LS_SETTINGS);
    if (!raw) return getDefaultWeddingSettings();
    return normalizeWeddingSettings(JSON.parse(raw));
  } catch {
    return getDefaultWeddingSettings();
  }
}

export function subscribeWeddingSettings(
  onUpdate: (settings: WeddingSettings) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, "settings", "public");
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(normalizeWeddingSettings(snap.data()));
        } else {
          onUpdate(getDefaultWeddingSettings());
        }
      },
      () => {
        onUpdate(readLocalSettings());
      }
    );
  }

  const emit = () => onUpdate(readLocalSettings());
  emit();
  const handler = () => emit();
  window.addEventListener(`local-sync:${LS_SETTINGS}`, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(`local-sync:${LS_SETTINGS}`, handler);
    window.removeEventListener("storage", handler);
  };
}

export async function saveWeddingSettings(
  settings: Omit<WeddingSettings, "updatedAt">
): Promise<WeddingSettings> {
  const normalized = normalizeWeddingSettings({
    ...settings,
    updatedAt: Date.now(),
  });
  const payload: WeddingSettings = {
    ...normalized,
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, "settings", "public"), payload);
    return payload;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LS_SETTINGS, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(`local-sync:${LS_SETTINGS}`));
  }
  return payload;
}

const DEFAULT_GUESTBOOK: GuestbookEntry[] = [
  {
    id: "welcome-1",
    name: "호민 ♥ 은정",
    message:
      "저희의 소중한 봄날에 함께해 주시는 모든 분들께 감사드립니다. 따뜻한 축하 한마디 남겨주시면 오래오래 간직할게요!",
    passwordHash: "system-pinned",
    createdAt: new Date("2026-11-22T09:00:00+09:00").getTime(),
  },
];

export async function hashPassword(plain: string): Promise<string> {
  const clean = plain.trim();
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(clean);
    const buffer = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return `fallback-${Math.abs(hash)}`;
}

function readLocal<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(`local-sync:${key}`));
  } catch {
    // localStorage quota exceeded
  }
}

function normalizeTimestamp(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toMillis" in val) {
    return (val as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

// ============================================================
// 방명록 (Guestbook)
// ============================================================
export function subscribeGuestbook(
  onUpdate: (entries: GuestbookEntry[]) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "guestbook"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const rows: GuestbookEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: String(data.name ?? ""),
            message: String(data.message ?? ""),
            passwordHash: String(data.passwordHash ?? ""),
            createdAt: normalizeTimestamp(data.createdAt),
          };
        });
        onUpdate(rows);
      },
      () => {
        onUpdate(readLocal<GuestbookEntry>(LS_GUESTBOOK, DEFAULT_GUESTBOOK));
      }
    );
  }

  const emit = () => {
    const rows = readLocal<GuestbookEntry>(LS_GUESTBOOK, DEFAULT_GUESTBOOK);
    onUpdate([...rows].sort((a, b) => b.createdAt - a.createdAt));
  };
  emit();
  const handler = () => emit();
  window.addEventListener(`local-sync:${LS_GUESTBOOK}`, handler);
  return () => window.removeEventListener(`local-sync:${LS_GUESTBOOK}`, handler);
}

export async function addGuestbookEntry(input: {
  name: string;
  message: string;
  password: string;
}): Promise<void> {
  const passwordHash = await hashPassword(input.password);
  const payload = {
    name: input.name.trim().slice(0, 30),
    message: input.message.trim().slice(0, 500),
    passwordHash,
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, "guestbook"), payload);
    return;
  }

  const current = readLocal<GuestbookEntry>(LS_GUESTBOOK, DEFAULT_GUESTBOOK);
  writeLocal(LS_GUESTBOOK, [
    { id: `local-${Date.now()}`, ...payload },
    ...current,
  ]);
}

export async function deleteGuestbookEntry(
  entry: GuestbookEntry,
  password: string,
  isAdmin = false
): Promise<{ ok: boolean; reason?: string }> {
  if (!isAdmin) {
    const inputHash = await hashPassword(password);
    if (inputHash !== entry.passwordHash) {
      return { ok: false, reason: "비밀번호가 일치하지 않습니다." };
    }
  }

  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "guestbook", entry.id));
    return { ok: true };
  }

  const current = readLocal<GuestbookEntry>(LS_GUESTBOOK, DEFAULT_GUESTBOOK);
  writeLocal(
    LS_GUESTBOOK,
    current.filter((item) => item.id !== entry.id)
  );
  return { ok: true };
}

// ============================================================
// 참석 여부 (RSVP)
// ============================================================
export async function submitRsvp(input: {
  side: RsvpSide;
  attendance: RsvpAttendance;
  name: string;
  guestCount: number;
  meal: RsvpMeal;
  phone: string;
  message: string;
}): Promise<void> {
  const payload = {
    side: input.side,
    attendance: input.attendance,
    name: input.name.trim().slice(0, 30),
    guestCount: Math.max(1, Math.min(20, Number(input.guestCount) || 1)),
    meal: input.meal,
    phone: input.phone.trim().slice(0, 30),
    message: input.message.trim().slice(0, 300),
    createdAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, "rsvp"), payload);
    return;
  }

  const current = readLocal<RsvpEntry>(LS_RSVP, []);
  writeLocal(LS_RSVP, [{ id: `rsvp-${Date.now()}`, ...payload }, ...current]);
}

export async function fetchAllRsvps(): Promise<RsvpEntry[]> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "rsvp"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        side: (data.side === "bride" ? "bride" : "groom") as RsvpSide,
        attendance: (data.attendance ?? "attending") as RsvpAttendance,
        name: String(data.name ?? ""),
        guestCount: Number(data.guestCount ?? 1),
        meal: (data.meal ?? "yes") as RsvpMeal,
        phone: String(data.phone ?? ""),
        message: String(data.message ?? ""),
        createdAt: normalizeTimestamp(data.createdAt),
      };
    });
  }
  return readLocal<RsvpEntry>(LS_RSVP, []).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}

export async function deleteRsvpEntry(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "rsvp", id));
    return;
  }
  const current = readLocal<RsvpEntry>(LS_RSVP, []);
  writeLocal(
    LS_RSVP,
    current.filter((item) => item.id !== id)
  );
}

// ============================================================
// 하객 스냅 포토월 (Guest Snaps — Vercel Blob + Firebase Firestore)
// ============================================================
export async function compressImageFile(
  file: File,
  maxSide = 1280,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("지원되지 않는 이미지 형식입니다."));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("이미지 압축을 초기화할 수 없습니다."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("이미지 변환에 실패했습니다."));
              return;
            }
            resolve({ blob, dataUrl });
          },
          "image/jpeg",
          quality
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function subscribeGuestSnaps(
  onUpdate: (entries: GuestSnapEntry[]) => void
): Unsubscribe {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, "guestSnaps"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const rows: GuestSnapEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            author: String(data.author ?? ""),
            caption: String(data.caption ?? ""),
            imageUrl: String(data.imageUrl ?? ""),
            storagePath: String(data.storagePath ?? ""),
            createdAt: normalizeTimestamp(data.createdAt),
          };
        });
        onUpdate(rows);
      },
      () => {
        onUpdate(readLocal<GuestSnapEntry>(LS_SNAPS, []));
      }
    );
  }

  const emit = () => {
    const rows = readLocal<GuestSnapEntry>(LS_SNAPS, []);
    onUpdate([...rows].sort((a, b) => b.createdAt - a.createdAt));
  };
  emit();
  const handler = () => emit();
  window.addEventListener(`local-sync:${LS_SNAPS}`, handler);
  return () => window.removeEventListener(`local-sync:${LS_SNAPS}`, handler);
}

export async function uploadGuestSnap(input: {
  author: string;
  caption: string;
  file: File;
}): Promise<void> {
  // 1) 고화질(최대 1280px) 브라우저 압축 후 Vercel Blob API로 업로드 시도
  const { blob } = await compressImageFile(input.file, 1280, 0.84);
  const formData = new FormData();
  formData.append("file", blob, "guest-snap.jpg");

  let uploadedUrl = "";
  let uploadedPathname = "";

  try {
    const res = await fetch("/api/guest-snaps", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = (await res.json()) as { url: string; pathname: string };
      uploadedUrl = data.url;
      uploadedPathname = data.pathname;
    } else if (res.status === 501) {
      // Vercel Blob 미연결 상태
      if (isFirebaseConfigured) {
        throw new Error(
          "Vercel Blob이 아직 연결되지 않았습니다. Vercel 대시보드 > Storage > Blob을 연결해 주세요."
        );
      }
    } else {
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(errBody.error || "사진 업로드에 실패했습니다.");
    }
  } catch (err) {
    if (isFirebaseConfigured) {
      throw err;
    }
  }

  // 2) Vercel Blob 업로드 성공 + Firebase Firestore 연동 시 메타데이터를 Firestore에 저장
  if (isFirebaseConfigured && db && uploadedUrl) {
    await addDoc(collection(db, "guestSnaps"), {
      author: input.author.trim().slice(0, 30),
      caption: input.caption.trim().slice(0, 120),
      imageUrl: uploadedUrl,
      storagePath: uploadedPathname,
      createdAt: Date.now(),
    });
    return;
  }

  // 3) 로컬 미리보기 모드: Blob URL이 있으면 그대로, 없으면 640px 압축본을 localStorage에 저장
  const imageUrl =
    uploadedUrl || (await compressImageFile(input.file, 640, 0.74)).dataUrl;
  const current = readLocal<GuestSnapEntry>(LS_SNAPS, []);
  writeLocal(LS_SNAPS, [
    {
      id: `snap-${Date.now()}`,
      author: input.author.trim().slice(0, 30),
      caption: input.caption.trim().slice(0, 120),
      imageUrl,
      storagePath: uploadedPathname,
      createdAt: Date.now(),
    },
    ...current.slice(0, 11),
  ]);
}

export async function deleteGuestSnap(
  entry: GuestSnapEntry,
  adminPassword = ""
): Promise<void> {
  // Vercel Blob 이미지 파일도 함께 삭제
  if (entry.imageUrl.startsWith("https://")) {
    try {
      await fetch("/api/guest-snaps", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ url: entry.imageUrl }),
      });
    } catch {
      // Blob 삭제 실패 시에도 DB 레코드 삭제는 진행
    }
  }

  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, "guestSnaps", entry.id));
    return;
  }

  const current = readLocal<GuestSnapEntry>(LS_SNAPS, []);
  writeLocal(
    LS_SNAPS,
    current.filter((item) => item.id !== entry.id)
  );
}
