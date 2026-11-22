"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  ClipboardList,
  Download,
  ExternalLink,
  Lock,
  MessageSquareHeart,
  Phone,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
  Wallet,
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  deleteGuestbookEntry,
  deleteGuestSnap,
  deleteRsvpEntry,
  fetchAdminDashboardData,
  getDefaultWeddingSettings,
  saveWeddingSettings,
  subscribeGuestbook,
  subscribeGuestSnaps,
  subscribeWeddingSettings,
  type GuestbookEntry,
  type GuestSnapEntry,
  type RsvpEntry,
  type WeddingSettings,
} from "@/lib/weddingStore";
import { useToast } from "@/components/ToastProvider";

type AdminTab = "rsvp" | "settings" | "guestbook" | "snaps";

const ATTENDANCE_LABELS: Record<RsvpEntry["attendance"], string> = {
  attending: "참석",
  undecided: "미정",
  declined: "불참",
};

const MEAL_LABELS: Record<RsvpEntry["meal"], string> = {
  yes: "식사 예정",
  no: "식사 안함",
  undecided: "미정",
};

export default function AdminPage() {
  const localExpectedPassword =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "0328";

  const [authenticated, setAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [serverNotice, setServerNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("rsvp");
  const [sideFilter, setSideFilter] = useState<"all" | "groom" | "bride">("all");

  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [snaps, setSnaps] = useState<GuestSnapEntry[]>([]);
  const [settingsForm, setSettingsForm] = useState<WeddingSettings>(() =>
    getDefaultWeddingSettings()
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const { showToast } = useToast();

  const loadDashboard = useCallback(
    async (pw: string) => {
      setLoadingData(true);
      try {
        const data = await fetchAdminDashboardData(pw);
        setRsvps(data.rsvps);
        setGuestbook(data.guestbook);
        setSnaps(data.snaps);
        if (data.settings) {
          setSettingsForm(data.settings);
        }
        setServerNotice(null);
      } catch (err) {
        const typed = err as Error & { status?: number; code?: string };
        if (typed.code === "ADMIN_SDK_NOT_CONFIGURED") {
          setServerNotice(
            "Vercel 환경 변수에 FIREBASE_SERVICE_ACCOUNT_KEY를 추가하고 Redeploy하면 RSVP 조회와 계좌·연락처 저장이 활성화됩니다."
          );
        } else {
          showToast(
            typed.message || "관리자 데이터를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setLoadingData(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!authenticated || isFirebaseConfigured) return;
    // 로컬 미리보기 모드에서는 localStorage 변경을 실시간 구독
    const unsubGb = subscribeGuestbook(setGuestbook);
    const unsubSnaps = subscribeGuestSnaps(setSnaps);
    const unsubSettings = subscribeWeddingSettings(setSettingsForm);
    return () => {
      unsubGb();
      unsubSnaps();
      unsubSettings();
    };
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = passwordInput.trim();
    if (!candidate) return;

    if (!isFirebaseConfigured) {
      if (candidate === localExpectedPassword) {
        setAdminPassword(candidate);
        setAuthenticated(true);
        setPasswordInput("");
        void loadDashboard(candidate);
        return;
      }
      showToast("관리자 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoggingIn(true);
    try {
      const data = await fetchAdminDashboardData(candidate);
      setAdminPassword(candidate);
      setAuthenticated(true);
      setPasswordInput("");
      setRsvps(data.rsvps);
      setGuestbook(data.guestbook);
      setSnaps(data.snaps);
      if (data.settings) setSettingsForm(data.settings);
      setServerNotice(null);
    } catch (err) {
      const typed = err as Error & { status?: number; code?: string };
      if (typed.status === 401) {
        showToast("관리자 비밀번호가 일치하지 않습니다.");
      } else if (typed.code === "ADMIN_SDK_NOT_CONFIGURED") {
        // 비밀번호 검증은 통과(501은 401 이후 발생)했으나 서비스 계정 키가 아직 미등록 상태
        setAdminPassword(candidate);
        setAuthenticated(true);
        setPasswordInput("");
        setServerNotice(
          "비밀번호 인증은 성공했지만 Vercel 환경 변수에 FIREBASE_SERVICE_ACCOUNT_KEY가 아직 없습니다. 키를 추가하고 Redeploy해 주세요."
        );
      } else {
        showToast(typed.message || "로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const updateAccountField = (
    side: "groomSide" | "brideSide",
    index: number,
    field: "bank" | "number" | "kakaoPayUrl" | "holder",
    value: string
  ) => {
    setSettingsForm((prev) => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [side]: prev.accounts[side].map((acc, idx) =>
          idx === index ? { ...acc, [field]: value } : acc
        ),
      },
    }));
  };

  const updateContactPhone = (
    side: "groomSide" | "brideSide",
    index: number,
    value: string
  ) => {
    setSettingsForm((prev) => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        [side]: prev.contacts[side].map((person, idx) =>
          idx === index ? { ...person, phone: value } : person
        ),
      },
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const saved = await saveWeddingSettings(
        {
          accounts: settingsForm.accounts,
          contacts: settingsForm.contacts,
        },
        adminPassword
      );
      setSettingsForm(saved);
      showToast("계좌번호와 연락처가 저장되어 청첩장에 즉시 반영되었습니다.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "저장 중 오류가 발생했습니다.";
      showToast(message);
    } finally {
      setSavingSettings(false);
    }
  };

  const stats = useMemo(() => {
    const attending = rsvps.filter((r) => r.attendance === "attending");
    const attendingHeadcount = attending.reduce(
      (sum, r) => sum + (r.guestCount || 1),
      0
    );
    const mealHeadcount = attending
      .filter((r) => r.meal === "yes")
      .reduce((sum, r) => sum + (r.guestCount || 1), 0);
    const groomHeadcount = attending
      .filter((r) => r.side === "groom")
      .reduce((sum, r) => sum + (r.guestCount || 1), 0);
    const brideHeadcount = attending
      .filter((r) => r.side === "bride")
      .reduce((sum, r) => sum + (r.guestCount || 1), 0);

    return {
      totalResponses: rsvps.length,
      attendingHeadcount,
      mealHeadcount,
      groomHeadcount,
      brideHeadcount,
    };
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    if (sideFilter === "all") return rsvps;
    return rsvps.filter((r) => r.side === sideFilter);
  }, [rsvps, sideFilter]);

  /** 한글 깨짐 방지 BOM 포함 UTF-8 CSV 엑셀 다운로드 */
  const exportCsv = () => {
    const headers = [
      "등록일시",
      "구분",
      "성함",
      "참석여부",
      "인원",
      "식사여부",
      "연락처",
      "메시지",
    ];
    const escapeCell = (val: string | number) =>
      `"${String(val).replace(/"/g, '""')}"`;

    const rows = filteredRsvps.map((r) => [
      new Date(r.createdAt).toLocaleString("ko-KR"),
      r.side === "groom" ? "신랑측" : "신부측",
      r.name,
      ATTENDANCE_LABELS[r.attendance],
      r.attendance === "declined" ? 0 : r.guestCount,
      MEAL_LABELS[r.meal],
      r.phone || "-",
      r.message || "",
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `이호민_김은정_RSVP_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("엑셀(CSV) 파일이 다운로드되었습니다.");
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ivory px-4">
        <div className="w-full max-w-[380px] rounded-3xl border border-sand bg-white p-7 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-linen text-sage">
            <Lock className="h-5 w-5" />
          </div>
          <p className="font-editorial mt-4 text-[11px] tracking-[0.28em] text-sage uppercase">
            Couple Admin
          </p>
          <h1 className="font-batang mt-1 text-[20px] text-ink">
            신랑 · 신부 관리자
          </h1>
          <p className="mt-2 text-[12.5px] text-stone">
            계좌번호·연락처 관리, RSVP 집계, 방명록 및 하객 스냅을 관리합니다.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="관리자 비밀번호 입력"
              className="w-full rounded-xl border border-sand bg-ivory/70 px-4 py-3 text-center text-[14px] tracking-widest focus:border-sage focus:bg-white focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded-full bg-sage py-3 text-[13.5px] font-medium text-white transition hover:bg-sage-dark disabled:opacity-60"
            >
              {loggingIn ? "확인 중..." : "관리자 로그인"}
            </button>
          </form>

          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[12px] text-muted hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>청첩장으로 돌아가기</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-ivory px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand pb-5">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[12px] text-stone hover:text-sage"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>청첩장 메인으로</span>
            </Link>
            <h1 className="font-batang mt-1.5 text-[22px] font-bold text-ink">
              이호민 ♥ 김은정 청첩장 관리자
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${
                isFirebaseConfigured
                  ? "bg-sage/15 text-sage-dark"
                  : "bg-champagne/20 text-stone"
              }`}
            >
              {isFirebaseConfigured
                ? "Firebase 서버 연동 중"
                : "로컬 미리보기 모드"}
            </span>
            <button
              type="button"
              onClick={() => void loadDashboard(adminPassword)}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3.5 py-1.5 text-[12px] text-ink hover:border-sage"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`}
              />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 서비스 계정 키 미등록 안내 배너 */}
        {serverNotice && (
          <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[#E5C5B8] bg-[#FDF6F2] px-4 py-3.5 text-[13px] text-[#8F4A3B]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{serverNotice}</p>
          </div>
        )}

        {/* 요약 KPI 카드 */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-sand bg-white p-4">
            <p className="text-[11.5px] text-muted">참석 확정 인원</p>
            <p className="font-editorial tabular-lining mt-1 text-[28px] font-medium text-sage-dark">
              {stats.attendingHeadcount}
              <span className="ml-1 font-sans text-[13px] text-stone">명</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              총 응답 {stats.totalResponses}건
            </p>
          </div>

          <div className="rounded-2xl border border-sand bg-white p-4">
            <p className="text-[11.5px] text-muted">식사 예정 인원</p>
            <p className="font-editorial tabular-lining mt-1 text-[28px] font-medium text-ink">
              {stats.mealHeadcount}
              <span className="ml-1 font-sans text-[13px] text-stone">명</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              신랑측 {stats.groomHeadcount} · 신부측 {stats.brideHeadcount}
            </p>
          </div>

          <div className="rounded-2xl border border-sand bg-white p-4">
            <p className="text-[11.5px] text-muted">축하 방명록</p>
            <p className="font-editorial tabular-lining mt-1 text-[28px] font-medium text-ink">
              {guestbook.length}
              <span className="ml-1 font-sans text-[13px] text-stone">건</span>
            </p>
          </div>

          <div className="rounded-2xl border border-sand bg-white p-4">
            <p className="text-[11.5px] text-muted">하객 스냅</p>
            <p className="font-editorial tabular-lining mt-1 text-[28px] font-medium text-ink">
              {snaps.length}
              <span className="ml-1 font-sans text-[13px] text-stone">장</span>
            </p>
          </div>
        </div>

        {/* 탭 바 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap rounded-2xl border border-sand bg-white p-1 text-[12px] font-medium sm:rounded-full sm:text-[12.5px]">
            {(
              [
                { id: "rsvp", label: "참석 여부 (RSVP)", icon: ClipboardList },
                { id: "settings", label: "계좌 · 연락처 설정", icon: Settings2 },
                { id: "guestbook", label: "방명록", icon: MessageSquareHeart },
                { id: "snaps", label: "하객 스냅", icon: Camera },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 transition sm:px-4 ${
                    activeTab === tab.id
                      ? "bg-sage text-white"
                      : "text-stone hover:text-ink"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "rsvp" && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sideFilter}
                onChange={(e) =>
                  setSideFilter(e.target.value as "all" | "groom" | "bride")
                }
                className="rounded-full border border-sand bg-white px-3.5 py-2 text-[12px] text-ink"
              >
                <option value="all">전체 보기</option>
                <option value="groom">신랑측만</option>
                <option value="bride">신부측만</option>
              </select>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-ivory hover:bg-sage-dark"
              >
                <Download className="h-3.5 w-3.5" />
                <span>엑셀(CSV) 다운로드</span>
              </button>
            </div>
          )}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="mt-5">
          {activeTab === "rsvp" && (
            <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead className="border-b border-sand bg-linen/70 text-[12px] text-stone">
                  <tr>
                    <th className="px-4 py-3">구분</th>
                    <th className="px-4 py-3">성함</th>
                    <th className="px-4 py-3">참석</th>
                    <th className="px-4 py-3">인원</th>
                    <th className="px-4 py-3">식사</th>
                    <th className="px-4 py-3">연락처</th>
                    <th className="px-4 py-3">메시지</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/70">
                  {filteredRsvps.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-muted"
                      >
                        아직 등록된 참석 여부 응답이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredRsvps.map((r) => (
                      <tr key={r.id} className="hover:bg-ivory/50">
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              r.side === "groom"
                                ? "bg-sage/12 text-sage-dark"
                                : "bg-champagne/20 text-ink"
                            }`}
                          >
                            {r.side === "groom" ? "신랑측" : "신부측"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-ink">
                          {r.name}
                        </td>
                        <td className="px-4 py-3">
                          {ATTENDANCE_LABELS[r.attendance]}
                        </td>
                        <td className="px-4 py-3">
                          {r.attendance === "declined" ? 0 : r.guestCount}명
                        </td>
                        <td className="px-4 py-3">{MEAL_LABELS[r.meal]}</td>
                        <td className="px-4 py-3 text-stone">
                          {r.phone || "-"}
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-stone">
                          {r.message || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteRsvpEntry(r.id, adminPassword);
                                setRsvps((prev) =>
                                  prev.filter((item) => item.id !== r.id)
                                );
                                showToast("응답이 삭제되었습니다.");
                              } catch (err) {
                                showToast(
                                  err instanceof Error
                                    ? err.message
                                    : "삭제에 실패했습니다."
                                );
                              }
                            }}
                            className="rounded-lg p-1.5 text-muted hover:bg-linen hover:text-[#B86A5B]"
                            aria-label="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* 계좌번호 6인 설정 */}
              <div className="rounded-3xl border border-sand bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/80 pb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-sage" />
                    <h2 className="font-batang text-[16.5px] font-bold text-ink">
                      마음 전하실 곳 — 계좌번호 (총 6인)
                    </h2>
                  </div>
                  <p className="text-[11.5px] text-muted">
                    하이픈(-) 포함 입력 가능 · 복사 시 자동으로 숫자만 복사됩니다
                  </p>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  {(
                    [
                      { key: "groomSide", title: "신랑측 계좌번호 (3인)" },
                      { key: "brideSide", title: "신부측 계좌번호 (3인)" },
                    ] as const
                  ).map((group) => (
                    <div key={group.key} className="space-y-3">
                      <p className="text-[13px] font-semibold text-sage-dark">
                        {group.title}
                      </p>
                      {settingsForm.accounts[group.key].map((acc, idx) => (
                        <div
                          key={acc.id}
                          className="space-y-2.5 rounded-2xl border border-sand/80 bg-ivory/50 p-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-sage-dark ring-1 ring-sand">
                              {acc.role}
                            </span>
                            <input
                              type="text"
                              value={acc.holder}
                              onChange={(e) =>
                                updateAccountField(
                                  group.key,
                                  idx,
                                  "holder",
                                  e.target.value
                                )
                              }
                              aria-label={`${group.title} ${acc.role} 예금주`}
                              placeholder="예금주"
                              className="w-28 rounded-lg border border-sand bg-white px-2.5 py-1 text-[13px] font-medium text-ink focus:border-sage focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr]">
                            <input
                              type="text"
                              value={acc.bank}
                              onChange={(e) =>
                                updateAccountField(
                                  group.key,
                                  idx,
                                  "bank",
                                  e.target.value
                                )
                              }
                              aria-label={`${acc.holder} 은행명`}
                              placeholder="은행명 (예: 국민은행)"
                              className="rounded-xl border border-sand bg-white px-3 py-2 text-[13px] text-ink placeholder:text-muted focus:border-sage focus:outline-none"
                            />
                            <input
                              type="text"
                              value={acc.number}
                              onChange={(e) =>
                                updateAccountField(
                                  group.key,
                                  idx,
                                  "number",
                                  e.target.value
                                )
                              }
                              aria-label={`${acc.holder} 계좌번호`}
                              placeholder="계좌번호 (예: 123-456-789012)"
                              className="rounded-xl border border-sand bg-white px-3 py-2 text-[13px] text-ink placeholder:text-muted focus:border-sage focus:outline-none"
                            />
                          </div>

                          <input
                            type="url"
                            value={acc.kakaoPayUrl || ""}
                            onChange={(e) =>
                              updateAccountField(
                                group.key,
                                idx,
                                "kakaoPayUrl",
                                e.target.value
                              )
                            }
                            aria-label={`${acc.holder} 카카오페이 링크`}
                            placeholder="(선택) 카카오페이 송금 링크 (https://qr.kakaopay.com/...)"
                            className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-[12px] text-stone placeholder:text-muted focus:border-sage focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 연락처 6인 설정 */}
              <div className="rounded-3xl border border-sand bg-white p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/80 pb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-sage" />
                    <h2 className="font-batang text-[16.5px] font-bold text-ink">
                      신랑 · 신부 및 혼주 연락처 (총 6인)
                    </h2>
                  </div>
                  <p className="text-[11.5px] text-muted">
                    입력하신 번호는 청첩장 &apos;연락하기&apos; 전화·문자 버튼에 즉시 연결됩니다
                  </p>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  {(
                    [
                      { key: "groomSide", title: "신랑측 연락처 (3인)" },
                      { key: "brideSide", title: "신부측 연락처 (3인)" },
                    ] as const
                  ).map((group) => (
                    <div key={group.key} className="space-y-2.5">
                      <p className="text-[13px] font-semibold text-sage-dark">
                        {group.title}
                      </p>
                      {settingsForm.contacts[group.key].map((person, idx) => (
                        <div
                          key={`${group.key}-${person.role}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sand/80 bg-ivory/50 px-4 py-3"
                        >
                          <div className="min-w-[110px]">
                            <span className="text-[11px] text-muted">
                              {person.role}
                            </span>
                            <p className="font-batang text-[14px] font-bold text-ink">
                              {person.name}
                            </p>
                          </div>
                          <input
                            type="tel"
                            value={person.phone}
                            onChange={(e) =>
                              updateContactPhone(group.key, idx, e.target.value)
                            }
                            aria-label={`${person.name} 연락처`}
                            placeholder="010-0000-0000"
                            className="flex-1 rounded-xl border border-sand bg-white px-3.5 py-2 text-[13px] text-ink placeholder:text-muted focus:border-sage focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className="flex flex-wrap items-center justify-end gap-3">
                {settingsForm.updatedAt > 0 && (
                  <span className="text-[12px] text-muted">
                    최근 저장:{" "}
                    {new Date(settingsForm.updatedAt).toLocaleString("ko-KR")}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 rounded-full bg-sage px-7 py-3 text-[13.5px] font-medium text-white shadow-sm transition hover:bg-sage-dark disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {savingSettings
                      ? "저장 중..."
                      : "계좌 · 연락처 저장 및 즉시 반영"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "guestbook" && (
            <div className="space-y-3">
              {guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-sand bg-white p-4"
                >
                  <div>
                    <p className="font-batang text-[14.5px] font-bold text-ink">
                      {entry.name}
                      <span className="ml-2 font-sans text-[11px] font-normal text-muted">
                        {new Date(entry.createdAt).toLocaleString("ko-KR")}
                      </span>
                    </p>
                    <p className="mt-1.5 whitespace-pre-line text-[13px] text-stone">
                      {entry.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await deleteGuestbookEntry(
                        entry,
                        "",
                        true,
                        adminPassword
                      );
                      if (!res.ok) {
                        showToast(res.reason || "삭제에 실패했습니다.");
                        return;
                      }
                      setGuestbook((prev) =>
                        prev.filter((item) => item.id !== entry.id)
                      );
                      showToast("방명록이 삭제되었습니다.");
                    }}
                    className="shrink-0 rounded-lg p-2 text-muted hover:bg-linen hover:text-[#B86A5B]"
                    aria-label="방명록 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "snaps" && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {snaps.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-sand bg-white py-12 text-center text-[13px] text-muted">
                  아직 업로드된 하객 스냅이 없습니다.
                </div>
              ) : (
                snaps.map((snap) => (
                  <div
                    key={snap.id}
                    className="overflow-hidden rounded-2xl border border-sand bg-white p-2"
                  >
                    <img
                      src={snap.imageUrl}
                      alt={snap.author}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <div className="mt-2 flex items-center justify-between px-1">
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold text-ink">
                          {snap.author}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {snap.caption || "-"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <a
                          href={snap.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-stone hover:bg-linen"
                          aria-label="원본 열기"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteGuestSnap(snap, adminPassword);
                              setSnaps((prev) =>
                                prev.filter((item) => item.id !== snap.id)
                              );
                              showToast("하객 스냅이 삭제되었습니다.");
                            } catch (err) {
                              showToast(
                                err instanceof Error
                                  ? err.message
                                  : "삭제에 실패했습니다."
                              );
                            }
                          }}
                          className="rounded-lg p-1.5 text-muted hover:bg-linen hover:text-[#B86A5B]"
                          aria-label="스냅 삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
