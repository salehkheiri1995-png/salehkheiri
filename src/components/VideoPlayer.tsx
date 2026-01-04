import { useMemo } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  onEnded?: () => void;
  className?: string;
}

export function VideoPlayer({ videoUrl, poster, onEnded, className = "" }: VideoPlayerProps) {
  const videoInfo = useMemo(() => {
    if (!videoUrl) return null;

    // Aparat embed detection
    // Format: https://www.aparat.com/video/video/{hash} or https://www.aparat.com/v/{hash}
    const aparatMatch = videoUrl.match(/aparat\.com\/(?:video\/video|v)\/([a-zA-Z0-9]+)/);
    if (aparatMatch) {
      return {
        type: "aparat",
        embedUrl: `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame`,
      };
    }

    // YouTube detection
    // Format: https://www.youtube.com/watch?v={id} or https://youtu.be/{id}
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      };
    }

    // Vimeo detection
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return {
        type: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      };
    }

    // Check if it's already an embed URL (iframe src)
    if (videoUrl.includes("/embed/") || videoUrl.includes("player.")) {
      return {
        type: "embed",
        embedUrl: videoUrl,
      };
    }

    // Direct video file (mp4, webm, etc.)
    return {
      type: "direct",
      videoUrl,
    };
  }, [videoUrl]);

  if (!videoInfo) {
    return null;
  }

  // For embed videos (Aparat, YouTube, Vimeo)
  if (videoInfo.type !== "direct") {
    return (
      <iframe
        src={videoInfo.embedUrl}
        className={`w-full h-full ${className}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="Video Player"
      />
    );
  }

  // For direct video files
  return (
    <video
      controls
      className={`w-full h-full ${className}`}
      poster={poster}
      onEnded={onEnded}
    >
      <source src={videoInfo.videoUrl} type="video/mp4" />
      مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
    </video>
  );
}
