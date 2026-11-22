"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { SunlitWaltzSynth } from "@/lib/waltzSynth";
import { useToast } from "./ToastProvider";

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YTPlayerEvent {
  data: number;
  target: YTPlayerInstance;
}

interface YTNamespace {
  Player: new (
    elementId: string,
    options: {
      height?: string | number;
      width?: string | number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayerInstance }) => void;
        onStateChange?: (e: YTPlayerEvent) => void;
        onError?: (e: { data: number }) => void;
      };
    }
  ) => YTPlayerInstance;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_CONTAINER_ID = "wedding-yt-bgm-player";

export function BgmPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [ytFailed, setYtFailed] = useState(false);

  const playerRef = useRef<YTPlayerInstance | null>(null);
  // 페이지 진입 시 기본 자동 재생 의도 유지 (사용자가 직접 일시정지 누르기 전까지)
  const wantAutoPlayRef = useRef(true);
  const isPlayingRef = useRef(false);
  const synthRef = useRef<SunlitWaltzSynth | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    let mounted = true;
    const videoId = WEDDING_CONFIG.bgm.youtubeVideoId;

    const tryAutoStart = () => {
      if (!mounted || !wantAutoPlayRef.current || isPlayingRef.current) return;
      if (playerRef.current) {
        try {
          playerRef.current.setVolume(65);
          playerRef.current.playVideo();
        } catch {
          // autoplay blocked until first gesture
        }
      }
    };

    const initPlayer = () => {
      if (!mounted || !window.YT?.Player || playerRef.current) return;
      playerRef.current = new window.YT.Player(YT_CONTAINER_ID, {
        height: 200,
        width: 200,
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          playlist: videoId,
          rel: 0,
          ...(typeof window !== "undefined"
            ? { origin: window.location.origin }
            : {}),
        },
        events: {
          onReady: (e) => {
            if (!mounted) return;
            e.target.setVolume(65);
            setYtReady(true);
            if (wantAutoPlayRef.current) {
              try {
                e.target.playVideo();
              } catch {
                // will start on first user gesture
              }
            }
          },
          onStateChange: (e) => {
            if (!mounted || !window.YT) return;
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              e.target.playVideo();
            }
          },
          onError: () => {
            if (!mounted) return;
            setYtFailed(true);
          },
        },
      });
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        initPlayer();
      };
      if (
        !document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.onerror = () => {
          if (mounted) setYtFailed(true);
        };
        document.head.appendChild(script);
      }
    }

    // 모바일/크롬 등 브라우저 자동재생 정책으로 즉시 재생이 차단된 경우,
    // 화면의 첫 터치/클릭 순간 즉시 BGM이 시작되도록 자동 보조
    const handleFirstInteraction = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (target?.closest('[data-bgm-toggle="true"]')) return;
      if (!wantAutoPlayRef.current || isPlayingRef.current) return;
      tryAutoStart();
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      passive: true,
    });
    window.addEventListener("touchstart", handleFirstInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", handleFirstInteraction, {
      passive: true,
    });

    return () => {
      mounted = false;
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      synthRef.current?.stop();
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore cleanup error
      }
      playerRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      wantAutoPlayRef.current = false;
      try {
        playerRef.current?.pauseVideo();
      } catch {
        // ignore
      }
      synthRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    wantAutoPlayRef.current = true;

    if (!ytFailed && playerRef.current && ytReady) {
      try {
        playerRef.current.playVideo();
        setIsPlaying(true);
        showToast("BGM 재생 중");
        return;
      } catch {
        setYtFailed(true);
      }
    }

    if (!ytFailed) {
      setIsPlaying(true);
      showToast("BGM 재생 중");
      return;
    }

    if (!synthRef.current) {
      synthRef.current = new SunlitWaltzSynth();
    }
    synthRef.current.start();
    setIsPlaying(true);
    showToast("BGM 재생 중");
  };

  return (
    <>
      {/* 공식 YouTube IFrame Player (모바일 iOS 인라인 재생 및 백그라운드 오디오 유지용 오프스크린 컨테이너) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 h-[200px] w-[200px] overflow-hidden opacity-0"
      >
        <div id={YT_CONTAINER_ID} />
      </div>

      <button
        type="button"
        data-bgm-toggle="true"
        onClick={togglePlay}
        aria-label={isPlaying ? "배경음악 일시정지" : "배경음악 재생"}
        className="group flex items-center gap-1.5 rounded-full border border-white/40 bg-ivory/82 px-3 py-1.5 text-[11px] font-medium text-ink shadow-sm backdrop-blur-md transition-all hover:bg-white active:scale-95"
      >
        {isPlaying ? (
          <span
            className="flex h-3.5 items-end gap-[2px] px-0.5"
            aria-hidden="true"
          >
            <span className="sound-bar-1 w-[2px] rounded-full bg-sage" />
            <span className="sound-bar-2 w-[2px] rounded-full bg-sage" />
            <span className="sound-bar-3 w-[2px] rounded-full bg-sage" />
          </span>
        ) : (
          <Music2 className="h-3.5 w-3.5 text-sage" />
        )}
        <span className="text-[11px] font-medium tracking-[0.08em] text-ink/90">
          BGM
        </span>
        {isPlaying && <Pause className="h-3 w-3 text-stone" />}
      </button>
    </>
  );
}
