import { useEffect, useRef, useState } from 'react';
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

export default function VideoPlayer({
  mp4Url,
  hlsUrl,
  poster,
  startTime = 0,
  onProgress,
  onStreamError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<import('hls.js').default | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [srcMp4, setSrcMp4] = useState(mp4Url);
  const [srcHls, setSrcHls] = useState(hlsUrl);
  const refreshAttempt = useRef(0);

  useEffect(() => {
    setSrcMp4(mp4Url);
    setSrcHls(hlsUrl);
    refreshAttempt.current = 0;
  }, [mp4Url, hlsUrl]);

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
      const onError = () => {
        void handleFatalError('Unable to play this stream.');
      };

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

  if (error) {
    return (
      <div className="player-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="player-loading">
          <div className="loading-spinner" />
        </div>
      )}
      <video ref={videoRef} controls playsInline poster={poster} />
    </>
  );
}
