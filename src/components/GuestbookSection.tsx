"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Send, Trash2, X } from "lucide-react";
import {
  addGuestbookEntry,
  deleteGuestbookEntry,
  subscribeGuestbook,
  type GuestbookEntry,
} from "@/lib/weddingStore";
import { useToast } from "./ToastProvider";

function formatKoreanDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function GuestbookSection() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    return subscribeGuestbook(setEntries);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !password.trim()) {
      showToast("이름, 비밀번호, 축하 메시지를 모두 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await addGuestbookEntry({ name, message, password });
      setName("");
      setPassword("");
      setMessage("");
      showToast("따뜻한 축하 메시지가 등록되었습니다.");
    } catch {
      showToast("등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget || !deletePw.trim()) return;
    setDeleting(true);
    try {
      const result = await deleteGuestbookEntry(deleteTarget, deletePw);
      if (!result.ok) {
        showToast(result.reason || "비밀번호가 일치하지 않습니다.");
        return;
      }
      showToast("방명록 메시지가 삭제되었습니다.");
      setDeleteTarget(null);
      setDeletePw("");
    } catch {
      showToast("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  const displayed = entries.slice(0, visibleCount);

  return (
    <section
      id="guestbook"
      className="border-t border-sand/80 bg-linen/55 px-5 py-16 sm:px-8 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <div className="text-center">
          <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
            Guestbook
          </p>
          <h2 className="font-batang mt-2 text-[21px] font-normal text-ink">
            축하 방명록
          </h2>
          <p className="mt-2 text-[13px] text-stone">
            두 사람의 새로운 출발에 따뜻한 한마디를 남겨주세요.
          </p>
        </div>

        {/* 작성 폼 */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-7 max-w-[420px] space-y-3 rounded-3xl border border-sand bg-white p-5 shadow-[0_6px_24px_rgba(44,42,39,0.03)]"
        >
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="rounded-xl border border-sand bg-ivory/60 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-sage focus:bg-white focus:outline-none"
            />
            <input
              type="password"
              maxLength={20}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (삭제용)"
              className="rounded-xl border border-sand bg-ivory/60 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-sage focus:bg-white focus:outline-none"
            />
          </div>

          <textarea
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="신랑·신부에게 축하 메시지를 남겨주세요."
            className="w-full resize-none rounded-xl border border-sand bg-ivory/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-muted focus:border-sage focus:bg-white focus:outline-none"
          />

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-3 text-[13px] font-medium text-ivory transition hover:bg-sage-dark disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{submitting ? "등록 중..." : "축하 메시지 남기기"}</span>
          </button>
        </form>

        {/* 메시지 목록 */}
        <div className="mx-auto mt-6 max-w-[420px] space-y-3">
          {displayed.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-sand bg-white px-5 py-4 text-left shadow-[0_3px_14px_rgba(44,42,39,0.025)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3 w-3 fill-champagne/40 text-champagne" />
                  <span className="font-batang text-[14px] font-bold text-ink">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <span>{formatKoreanDate(entry.createdAt)}</span>
                  {entry.passwordHash !== "system-pinned" && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(entry);
                        setDeletePw("");
                      }}
                      aria-label="방명록 삭제"
                      className="rounded-full p-1 text-muted transition hover:bg-linen hover:text-[#B86A5B]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2.5 whitespace-pre-line text-[13px] leading-[1.75] text-stone">
                {entry.message}
              </p>
            </div>
          ))}

          {entries.length > visibleCount && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="rounded-full border border-champagne/60 bg-white px-6 py-2 text-[12.5px] font-medium text-ink transition hover:border-sage hover:text-sage"
              >
                방명록 더보기 ({visibleCount}/{entries.length})
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 비밀번호 확인 삭제 모달 */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-3xl bg-ivory p-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-batang text-[16px] text-ink">
                  방명록 삭제
                </h3>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full p-1 text-stone hover:bg-sand/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[12.5px] text-stone">
                작성 시 입력하신 비밀번호를 입력해 주세요.
              </p>
              <form onSubmit={handleConfirmDelete} className="mt-4 space-y-3">
                <input
                  type="password"
                  required
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[13.5px] focus:border-sage focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={deleting}
                  className="w-full rounded-full bg-[#B86A5B] py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {deleting ? "삭제 중..." : "삭제하기"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
