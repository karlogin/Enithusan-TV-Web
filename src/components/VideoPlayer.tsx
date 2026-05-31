import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { proxyStreamUrl } from '../api';
import './watch.css';

interface VideoPlayerProps {
  mp4Url?: string;
  hlsUrl?: string;
  poster?: string;
  startTime?: number;
  onProgress?: (progress: number, duration: number) => void;
}

export default function VideoPlayer({
  mp4Url,
  hlsUrl,
  poster,
  startTime = 0,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    if (mp4Url) {
      const onReady = () => {
        seekToStart();
        setLoading(false);
        video.play().catch(() => undefined);
      };
      const onError = () => {
        setError('Unable to play this stream. Try going back and pressing play again.');
        setLoading(false);
      };

      video.addEventListener('loadedmetadata', onReady, { once: true });
      video.addEventListener('error', onError, { once: true });
      video.src = mp4Url;

      return () => {
        video.removeEventListener('loadedmetadata', onReady);
        video.removeEventListener('error', onError);
      };
    }

    if (!hlsUrl) {
      setError('Stream unavailable for this title.');
      setLoading(false);
      return;
    }

    const src = proxyStreamUrl(hlsUrl);

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
          setError(`${detail} Try going back and pressing play again.`);
          setLoading(false);
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

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [mp4Url, hlsUrl, startTime]);

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
