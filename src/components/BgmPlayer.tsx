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
  const pendingPlayRef = useRef(false);
  const synthRef = useRef<SunlitWaltzSynth | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const videoId = WEDDING_CONFIG.bgm.youtubeVideoId;

    const initPlayer = () => {
      if (!mounted || !window.YT?.Player || playerRef.current) return;
      playerRef.current = new window.YT.Player(YT_CONTAINER_ID, {
        height: 200,
        width: 200,
        videoId,
        playerVars: {
          autoplay: 0,
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
            if (pendingPlayRef.current) {
              pendingPlayRef.current = false;
              e.target.playVideo();
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
            if (pendingPlayRef.current) {
              pendingPlayRef.current = false;
              if (!synthRef.current) synthRef.current = new SunlitWaltzSynth();
              synthRef.current.start();
              setIsPlaying(true);
            }
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

    return () => {
      mounted = false;
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
      pendingPlayRef.current = false;
      try {
        playerRef.current?.pauseVideo();
      } catch {
        // ignore
      }
      synthRef.current?.stop();
      setIsPlaying(false);
      return;
    }

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

    // YouTube IFrame API가 아직 로딩 중이면 준비되자마자 자동 재생 예약
    if (!ytFailed) {
      pendingPlayRef.current = true;
      setIsPlaying(true);
      showToast("BGM 재생 준비 중...");
      return;
    }

    // 오프라인 또는 임베드 제한 시 폴백
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
