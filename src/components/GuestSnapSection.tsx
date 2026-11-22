"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import {
  subscribeGuestSnaps,
  uploadGuestSnap,
  type GuestSnapEntry,
} from "@/lib/weddingStore";
import { useToast } from "./ToastProvider";

export function GuestSnapSection() {
  const [snaps, setSnaps] = useState<GuestSnapEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingSnap, setViewingSnap] = useState<GuestSnapEntry | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    return subscribeGuestSnaps(setSnaps);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const resetForm = () => {
    setAuthor("");
    setCaption("");
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      showToast("올리시는 분 성함을 입력해 주세요.");
      return;
    }
    if (!file) {
      showToast("사진을 선택해 주세요.");
      return;
    }

    setUploading(true);
    try {
      await uploadGuestSnap({ author, caption, file });
      showToast("소중한 하객 스냅이 등록되었습니다!");
      resetForm();
      setModalOpen(false);
    } catch {
      showToast("업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section
      id="guest-snaps"
      className="border-t border-sand/80 px-5 py-16 text-center sm:px-8 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
          Guest Snap
        </p>
        <h2 className="font-batang mt-2 text-[21px] font-normal text-ink">
          하객 스냅 포토월
        </h2>
        <p className="mt-2.5 text-[13px] leading-[1.8] text-stone">
          결혼식 날 담아주신 신랑·신부의 반짝이는 순간을
          <br />
          이곳에 공유해 주시면 소중한 추억으로 간직할게요.
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-sage bg-sage px-6 py-2.5 text-[13px] font-medium text-white shadow-xs transition hover:bg-sage-dark active:scale-[0.98]"
          >
            <Camera className="h-4 w-4" />
            <span>하객 스냅 사진 올리기</span>
          </button>
        </div>

        {/* 등록된 하객 스냅 그리드 */}
        {snaps.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {snaps.slice(0, 9).map((snap) => (
              <button
                key={snap.id}
                type="button"
                onClick={() => setViewingSnap(snap)}
                className="group overflow-hidden rounded-2xl border border-sand bg-white p-1.5 text-left shadow-xs transition hover:-translate-y-0.5"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-linen">
                  <img
                    src={snap.imageUrl}
                    alt={`${snap.author}님이 올린 스냅`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="px-1 pt-2 pb-1">
                  <p className="truncate text-[11.5px] font-medium text-ink">
                    {snap.author}
                  </p>
                  {snap.caption && (
                    <p className="truncate text-[10.5px] text-muted">
                      {snap.caption}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-[360px] rounded-2xl border border-dashed border-champagne/60 bg-linen/50 px-5 py-8 text-[12.5px] text-muted">
            아직 등록된 하객 스냅이 없습니다.
            <br />
            결혼식 당일 첫 번째 순간을 남겨주세요!
          </div>
        )}
      </motion.div>

      {/* 업로드 모달 */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[85] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-xs sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[410px] overflow-hidden rounded-3xl bg-ivory text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-sand px-6 py-4">
                <div>
                  <p className="font-editorial text-[11px] tracking-[0.26em] text-sage uppercase">
                    Upload Snap
                  </p>
                  <h3 className="font-batang text-[16px] text-ink">
                    하객 스냅 공유하기
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-1.5 text-stone hover:bg-sand/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4 px-6 py-5">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="guest-snap-file"
                  />
                  <label
                    htmlFor="guest-snap-file"
                    className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-champagne bg-white p-4 transition hover:border-sage"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="미리보기"
                        className="max-h-52 rounded-xl object-contain"
                      />
                    ) : (
                      <div className="py-6 text-center text-stone">
                        <ImagePlus className="mx-auto h-7 w-7 text-sage" />
                        <p className="mt-2 text-[13px] font-medium text-ink">
                          사진 선택하기
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          자동 압축되어 빠르게 업로드됩니다
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-stone">
                    올리시는 분 성함 <span className="text-[#B86A5B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="예: 김민지"
                    className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[13.5px] focus:border-sage focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[12px] font-medium text-stone">
                    짧은 한마디 <span className="text-muted">(선택)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="예: 오늘 너무 예쁘다!!"
                    className="w-full rounded-xl border border-sand bg-white px-3.5 py-2.5 text-[13.5px] focus:border-sage focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage py-3 text-[13.5px] font-medium text-white transition hover:bg-sage-dark disabled:opacity-60"
                >
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{uploading ? "사진 업로드 중..." : "스냅 올리기"}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 스냅 크게 보기 */}
      <AnimatePresence>
        {viewingSnap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingSnap(null)}
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[440px] overflow-hidden rounded-2xl bg-white p-3 text-left shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setViewingSnap(null)}
                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={viewingSnap.imageUrl}
                alt={viewingSnap.caption || viewingSnap.author}
                className="max-h-[70dvh] w-full rounded-xl object-contain"
              />
              <div className="px-1 pt-3 pb-1">
                <p className="text-[13.5px] font-semibold text-ink">
                  {viewingSnap.author}
                </p>
                {viewingSnap.caption && (
                  <p className="mt-1 text-[12.5px] text-stone">
                    {viewingSnap.caption}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
