import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoPlaceholderProps {
  title: string;
  videoUrl?: string | null;
}

export default function VideoPlaceholder({ title, videoUrl }: VideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // If no video URL, show placeholder
  if (!videoUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden group cursor-pointer"
      >
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center shadow-button group-hover:scale-110 transition-transform duration-300">
            <Play size={32} className="ml-1" />
          </div>
        </div>
        
        {/* Label */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-3">
            <p className="text-sm text-muted-foreground">Preview Lesson</p>
            <p className="font-display font-semibold">{title}</p>
          </div>
        </div>
        
        {/* Coming soon badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      </motion.div>
    );
  }

  // Video player with controls
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative aspect-video bg-black rounded-2xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />
      
      {/* Controls overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Center play/pause button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={togglePlay}
              className="bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center shadow-button hover:scale-110 transition-transform duration-300"
            >
              <Play size={32} className="ml-1" />
            </button>
          </div>
        )}
        
        {/* Bottom controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-medium">{title}</span>
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-primary transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
