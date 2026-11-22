"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy, ExternalLink } from "lucide-react";
import { WEDDING_CONFIG, type BankAccount } from "@/config/wedding";
import {
  getDefaultWeddingSettings,
  subscribeWeddingSettings,
} from "@/lib/weddingStore";
import { useToast } from "./ToastProvider";

interface AccountAccordionProps {
  title: string;
  subtitle: string;
  accounts: BankAccount[];
  defaultOpen?: boolean;
}

function AccountAccordion({
  title,
  subtitle,
  accounts,
  defaultOpen = false,
}: AccountAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { showToast } = useToast();

  /** 하이픈(-)과 공백을 제거하고 순수 숫자만 클립보드에 복사 */
  const copyDigitsOnly = async (account: BankAccount) => {
    const digitsOnly = account.number.replace(/\D/g, "");
    if (!digitsOnly) {
      showToast("계좌번호가 아직 설정되지 않았습니다.");
      return;
    }
    try {
      await navigator.clipboard.writeText(digitsOnly);
      showToast(`${account.holder}님 계좌번호(숫자만)가 복사되었습니다.`);
    } catch {
      // 클립보드 권한 제한 환경 폴백
      const textarea = document.createElement("textarea");
      textarea.value = digitsOnly;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showToast(`${account.holder}님 계좌번호(숫자만)가 복사되었습니다.`);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-white text-left shadow-[0_4px_18px_rgba(44,42,39,0.03)]">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-ivory/60"
        aria-expanded={isOpen}
      >
        <div>
          <span className="font-batang text-[15px] font-bold text-ink">
            {title}
          </span>
          <span className="ml-2 text-[11.5px] text-muted">{subtitle}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-stone transition-transform duration-300 ${
            isOpen ? "rotate-180 text-sage" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-sand/70 border-t border-sand/80 px-5">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-linen px-1.5 py-0.5 text-[10.5px] font-medium text-sage-dark">
                        {acc.role}
                      </span>
                      <span className="font-batang text-[14px] font-bold text-ink">
                        {acc.holder}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] text-stone">
                      <span className="font-medium text-ink/85">{acc.bank}</span>{" "}
                      <span className="tracking-wide">{acc.number}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyDigitsOnly(acc)}
                      className="inline-flex items-center gap-1 rounded-full border border-sand bg-ivory px-3 py-1.5 text-[11.5px] font-medium text-ink transition hover:border-sage hover:bg-sage hover:text-white active:scale-95"
                      title="하이픈 없이 숫자만 복사"
                    >
                      <Copy className="h-3 w-3" />
                      <span>복사</span>
                    </button>

                    {acc.kakaoPayUrl && (
                      <a
                        href={acc.kakaoPayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-[#FEE500] px-3 py-1.5 text-[11.5px] font-semibold text-[#191919] transition hover:brightness-95"
                      >
                        <span>페이</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AccountsSection() {
  const [accounts, setAccounts] = useState(
    () => getDefaultWeddingSettings().accounts
  );

  useEffect(() => {
    return subscribeWeddingSettings((settings) => {
      setAccounts(settings.accounts);
    });
  }, []);

  return (
    <section
      id="accounts"
      className="border-t border-sand/80 bg-linen/55 px-5 py-16 text-center sm:px-8 sm:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75 }}
      >
        <p className="font-editorial text-[12px] tracking-[0.32em] text-sage uppercase">
          Account
        </p>
        <h2 className="font-batang mt-2 text-[21px] font-normal text-ink">
          마음 전하실 곳
        </h2>
        <p className="mt-3 whitespace-pre-line text-[13px] leading-[1.85] text-stone">
          {WEDDING_CONFIG.accounts.description}
        </p>

        <div className="mx-auto mt-8 max-w-[400px] space-y-3.5">
          <AccountAccordion
            title="신랑측 계좌번호"
            subtitle="아버지 · 어머니 · 신랑"
            accounts={accounts.groomSide}
            defaultOpen={false}
          />
          <AccountAccordion
            title="신부측 계좌번호"
            subtitle="아버지 · 어머니 · 신부"
            accounts={accounts.brideSide}
            defaultOpen={false}
          />
        </div>

        <p className="mt-4 text-[11.5px] text-muted">
          * 복사 버튼을 누르시면 은행 앱에 바로 붙여넣을 수 있도록 숫자만 복사됩니다.
        </p>
      </motion.div>
    </section>
  );
}
