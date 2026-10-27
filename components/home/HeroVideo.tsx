"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { heroVideo } from "@/lib/content/images";

/**
 * Looping background video. The poster renders immediately (and is all that
 * loads for reduced-motion users); the video picks a mobile or desktop source
 * after mount and fades in once it is actually playing.
 */
export function HeroVideo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    // Choose the source once on mount (the browser APIs are only available on the client).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(mobile ? heroVideo.mobile : heroVideo.desktop);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    // Pause when the hero scrolls out of view to save battery and bandwidth.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <Image src={heroVideo.poster} alt="" fill preload loading="eager" sizes="100vw" className="object-cover" />
      {src && (
        <video
          ref={videoRef}
          src={src}
          poster={heroVideo.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
