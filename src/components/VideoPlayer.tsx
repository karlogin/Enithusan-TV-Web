import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { proxyStreamUrl } from '../api';
import './watch.css';

interface VideoPlayerProps {
  hlsUrl: string;
  poster?: string;
}

export default function VideoPlayer({ hlsUrl, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = proxyStreamUrl(hlsUrl);
    setLoading(true);
    setError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
      video.addEventListener('loadedmetadata', () => setLoading(false), { once: true });
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
  }, [hlsUrl]);

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
