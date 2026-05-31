import { useCallback, useEffect, useRef, useState } from 'react';
import { proxyStreamUrl } from '../api';
import './watch.css';

type HlsModule = typeof import('hls.js');

interface VideoPlayerProps {
  mp4Url?: string;
  hlsUrl?: string;
  poster?: string;
  startTime?: number;
  onProgress?: (progress: number, duration: number) => void;
  onStreamError?: () => Promise<{ mp4Url?: string; hlsUrl?: string } | null>;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function VideoPlayer({
  mp4Url,
  hlsUrl,
  poster,
  startTime = 0,
  onProgress,
  onStreamError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const scrubbing = useRef(false);
  const flashTimer = useRef<number | null>(null);
  const refreshAttempt = useRef(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [srcMp4, setSrcMp4] = useState(mp4Url);
  const [srcHls, setSrcHls] = useState(hlsUrl);

  // Controls state
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [centerFlash, setCenterFlash] = useState<'play' | 'pause' | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    setSrcMp4(mp4Url);
    setSrcHls(hlsUrl);
    refreshAttempt.current = 0;
  }, [mp4Url, hlsUrl]);

  // ── Stream loading (unchanged logic) ────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoading(true);
    setError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.removeAttribute('src');
    video.load();

    const seekToStart = () => {
      if (startTime > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(startTime, video.duration - 5);
      }
    };

    const handleFatalError = async (detail: string) => {
      if (onStreamError && refreshAttempt.current < 2) {
        refreshAttempt.current += 1;
        const fresh = await onStreamError();
        if (fresh?.mp4Url || fresh?.hlsUrl) {
          setSrcMp4(fresh.mp4Url);
          setSrcHls(fresh.hlsUrl);
          return;
        }
      }
      setError(`${detail} Try going back and pressing play again.`);
      setLoading(false);
    };

    if (srcMp4) {
      const onReady = () => {
        seekToStart();
        setLoading(false);
        video.play().catch(() => undefined);
      };
      const onError = () => void handleFatalError('Unable to play this stream.');

      video.addEventListener('loadedmetadata', onReady, { once: true });
      video.addEventListener('error', onError, { once: true });
      video.src = srcMp4;

      return () => {
        video.removeEventListener('loadedmetadata', onReady);
        video.removeEventListener('error', onError);
      };
    }

    if (!srcHls) {
      setError('Stream unavailable for this title.');
      setLoading(false);
      return;
    }

    const src = proxyStreamUrl(srcHls);
    let cancelled = false;

    (async () => {
      const Hls = (await import('hls.js')).default as HlsModule['default'];
      if (cancelled) return;

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          seekToStart();
          setLoading(false);
          video.play().catch(() => undefined);
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            const detail =
              data.type === Hls.ErrorTypes.NETWORK_ERROR
                ? 'Network error while loading the stream.'
                : 'Unable to play this stream.';
            void handleFatalError(detail);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          seekToStart();
          setLoading(false);
        }, { once: true });
        video.play().catch(() => undefined);
      } else {
        setError('HLS playback is not supported in this browser.');
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [srcMp4, srcHls, startTime, onStreamError]);

  // ── Progress reporting ───────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    const tick = () => {
      if (video.duration && !video.paused) {
        onProgress(video.currentTime, video.duration);
      }
    };

    const interval = window.setInterval(tick, 5000);
    const onPause = () => onProgress(video.currentTime, video.duration || 0);
    video.addEventListener('pause', onPause);

    return () => {
      clearInterval(interval);
      video.removeEventListener('pause', onPause);
    };
  }, [onProgress]);

  // ── Controls state sync with video element ───────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => {
      if (Number.isFinite(video.duration)) setDuration(video.duration);
    };
    const onVolumeChange = () => {
      setVolume(video.volume);
      setMuted(video.muted);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  // ── Fullscreen change ────────────────────────────────────────────────────────
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // ── Auto-hide controls ───────────────────────────────────────────────────────
  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!scrubbing.current) setShowControls(false);
    }, 3000);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const doFlash = useCallback((type: 'play' | 'pause') => {
    setCenterFlash(type);
    setFlashKey((k) => k + 1);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setCenterFlash(null), 600);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => undefined);
      doFlash('play');
    } else {
      video.pause();
      doFlash('pause');
    }
    revealControls();
  }, [doFlash, revealControls]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    revealControls();
  }, [revealControls]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  }, []);

  const changeVolume = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  // ── Progress bar scrubbing ───────────────────────────────────────────────────
  const getTimeFromMouseX = useCallback((clientX: number): number => {
    const bar = progressRef.current;
    if (!bar || !duration) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const startScrub = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    scrubbing.current = true;
    const video = videoRef.current;
    if (video) video.currentTime = getTimeFromMouseX(e.clientX);

    const onMove = (ev: MouseEvent) => {
      const v = videoRef.current;
      if (!scrubbing.current || !v) return;
      v.currentTime = getTimeFromMouseX(ev.clientX);
    };
    const onUp = () => {
      scrubbing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      revealControls();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    revealControls();
  }, [getTimeFromMouseX, revealControls]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault();
          skip(10);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, (videoRef.current?.volume ?? 1) + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, (videoRef.current?.volume ?? 0) - 0.1));
          break;
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [togglePlay, skip, toggleMute, toggleFullscreen, changeVolume]);

  // ── Computed values ──────────────────────────────────────────────────────────
  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
  const volIcon = muted || volume === 0 ? 'muted' : volume < 0.5 ? 'low' : 'high';

  if (error) {
    return (
      <div className="player-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`vp-root ${showControls || paused ? 'vp-controls-visible' : ''}`}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (!paused && !scrubbing.current) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        playsInline
        poster={poster}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Loading spinner */}
      {loading && (
        <div className="player-loading">
          <div className="loading-spinner" />
        </div>
      )}

      {/* Center flash icon */}
      {centerFlash && (
        <div className="vp-center-flash" key={flashKey}>
          {centerFlash === 'play' ? (
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          )}
        </div>
      )}

      {/* Controls overlay */}
      <div className="vp-controls">
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="vp-progress"
          onMouseDown={startScrub}
        >
          <div className="vp-progress-track">
            <div className="vp-progress-buffered" style={{ width: `${bufferedPct}%` }} />
            <div className="vp-progress-played" style={{ width: `${playedPct}%` }}>
              <div className="vp-progress-thumb" />
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="vp-bottom">
          {/* Left controls */}
          <div className="vp-left">
            <button
              type="button"
              className="vp-btn"
              onClick={togglePlay}
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused ? (
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              )}
            </button>

            <button
              type="button"
              className="vp-btn vp-btn-skip"
              onClick={() => skip(-10)}
              aria-label="Rewind 10 seconds"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12.5 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3z" />
                <path d="M12.5 1L8.5 5l4 4V1z" />
                <text x="12" y="14" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">10</text>
              </svg>
            </button>

            <button
              type="button"
              className="vp-btn vp-btn-skip"
              onClick={() => skip(10)}
              aria-label="Forward 10 seconds"
            >
              <svg viewBox="0 0 24 24">
                <path d="M11.5 3a9 9 0 1 1-9 9h2a7 7 0 1 0 7-7V3z" />
                <path d="M11.5 1l4 4-4 4V1z" />
                <text x="12" y="14" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">10</text>
              </svg>
            </button>

            {/* Volume */}
            <div className="vp-volume">
              <button
                type="button"
                className="vp-btn"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {volIcon === 'muted' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                )}
                {volIcon === 'low' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                )}
                {volIcon === 'high' && (
                  <svg viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <div className="vp-volume-slider-wrap">
                <input
                  type="range"
                  className="vp-volume-slider"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  aria-label="Volume"
                />
              </div>
            </div>

            {/* Time display */}
            <span className="vp-time">
              {formatTime(currentTime)}
              <span className="vp-time-sep"> / </span>
              {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="vp-right">
            <button
              type="button"
              className="vp-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
