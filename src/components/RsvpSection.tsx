"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck, X } from "lucide-react";
import {
  submitRsvp,
  type RsvpAttendance,
  type RsvpMeal,
  type RsvpSide,
} from "@/lib/weddingStore";
import { useToast } from "./ToastProvider";

export function RsvpSection() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<RsvpSide>("groom");
  const [attendance, setAttendance] = useState<RsvpAttendance>("attending");
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [meal, setMeal] = useState<RsvpMeal>("yes");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("성함을 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await submitRsvp({
        side,
        attendance,
        name,
        guestCount: attendance === "declined" ? 0 : guestCount,
        meal: attendance === "declined" ? "no" : meal,
        phone: "",
        message,
      });
      setSubmitted(true);
      showToast("소중한 참석 여부가 전달되었습니다.");
      window.setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setName("");
        setMessage("");
        setGuestCount(1);
      }, 1300);
    } catch {
      showToast("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp"
      className="border-t border-sand/80 px-5 py-16 text-center sm:px-8 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
        className="mx-auto max-w-[380px] rounded-3xl border border-sand bg-white px-6 py-9 shadow-[0_10px_30px_rgba(44,42,39,0.04)]"
      >
        <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
          R.S.V.P
        </p>
        <h2 className="font-batang mt-2 text-[20px] font-normal text-ink">
          참석 의사 전달
        </h2>
        <p className="mt-3 text-[13px] leading-[1.8] text-stone">
          축하의 마음으로 참석해 주시는 모든 분들을
          <br />
          더욱 정성껏 모실 수 있도록
          <br />
          참석 및 식사 여부를 알려주시면 감사하겠습니다.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage px-6 py-3.5 text-[13.5px] font-medium text-white shadow-sm transition hover:bg-sage-dark active:scale-[0.98]"
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>참석 여부 전달하기</span>
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[85] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-xs sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] overflow-hidden rounded-3xl bg-ivory text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-sand px-6 py-4">
                <div>
                  <p className="font-editorial text-[11px] tracking-[0.26em] text-sage uppercase">
                    R.S.V.P
                  </p>
                  <h3 className="font-batang text-[16.5px] text-ink">
                    참석 의사 전달하기
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                  className="rounded-full p-1.5 text-stone transition hover:bg-sand/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <CheckCircle2 className="h-11 w-11 text-sage" />
                  <p className="font-batang mt-3 text-[17px] text-ink">
                    참석 의사가 등록되었습니다
                  </p>
                  <p className="mt-1.5 text-[13px] text-stone">
                    따뜻한 마음 전해 주셔서 진심으로 감사합니다.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="max-h-[78dvh] space-y-4 overflow-y-auto px-6 py-5"
                >
                  {/* 구분 */}
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-stone">
                      어느 측 하객이신가요?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { value: "groom", label: "신랑측 (이호민)" },
                          { value: "bride", label: "신부측 (김은정)" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSide(opt.value)}
                          className={`rounded-xl border py-2.5 text-[13px] font-medium transition ${
                            side === opt.value
                              ? "border-sage bg-sage text-white"
                              : "border-sand bg-white text-stone hover:border-champagne"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 참석 여부 */}
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-stone">
                      참석 여부
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { value: "attending", label: "참석 가능" },
                          { value: "undecided", label: "미정" },
                          { value: "declined", label: "불참" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAttendance(opt.value)}
                          className={`rounded-xl border py-2 text-[12.5px] font-medium transition ${
                            attendance === opt.value
                              ? "border-sage bg-sage/12 text-sage-dark"
                              : "border-sand bg-white text-stone"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 성함 */}
                  <div>
                    <label
                      htmlFor="rsvp-name"
                      className="mb-1.5 block text-[12px] font-medium text-stone"
                    >
                      성함 <span className="text-[#B86A5B]">*</span>
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      required
                      maxLength={30}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 홍길동"
                      className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:border-sage focus:outline-none"
                    />
                  </div>

                  {/* 참석 시: 동행 인원 & 식사 여부 */}
                  {attendance !== "declined" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="rsvp-count"
                          className="mb-1.5 block text-[12px] font-medium text-stone"
                        >
                          참석 인원 (본인 포함)
                        </label>
                        <select
                          id="rsvp-count"
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-[13.5px] text-ink focus:border-sage focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}명
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="rsvp-meal"
                          className="mb-1.5 block text-[12px] font-medium text-stone"
                        >
                          식사 여부
                        </label>
                        <select
                          id="rsvp-meal"
                          value={meal}
                          onChange={(e) => setMeal(e.target.value as RsvpMeal)}
                          className="w-full rounded-xl border border-sand bg-white px-3 py-2.5 text-[13.5px] text-ink focus:border-sage focus:outline-none"
                        >
                          <option value="yes">식사 예정</option>
                          <option value="no">식사 안함</option>
                          <option value="undecided">미정</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* 메시지 (선택) */}
                  <div>
                    <label
                      htmlFor="rsvp-msg"
                      className="mb-1.5 block text-[12px] font-medium text-stone"
                    >
                      전하고 싶은 말 <span className="text-muted">(선택)</span>
                    </label>
                    <textarea
                      id="rsvp-msg"
                      rows={2}
                      maxLength={300}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="동행인 성함이나 축하 말씀을 남겨주세요."
                      className="w-full resize-none rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:border-sage focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-sage py-3.5 text-[14px] font-medium text-white transition hover:bg-sage-dark disabled:opacity-60"
                  >
                    {submitting ? "전달 중..." : "참석 의사 전달 완료"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
