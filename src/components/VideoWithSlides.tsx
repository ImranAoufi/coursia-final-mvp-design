import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  SplitSquareHorizontal, 
  PictureInPicture2, 
  LayoutGrid, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideContent {
  SlideTitle: string;
  KeyPoints: string[];
  IconDescription: string;
  ColorAccent: string;
}

interface VideoWithSlidesProps {
  videoUrl: string;
  videoTitle?: string;
  slides: SlideContent[];
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = "side-by-side" | "pip" | "tabs" | "timeline";

export default function VideoWithSlides({
  videoUrl,
  videoTitle,
  slides,
  isOpen,
  onClose
}: VideoWithSlidesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"video" | "slides">("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];

  // Sync slide with video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || slides.length === 0) return;

    const handleTimeUpdate = () => {
      const progress = video.currentTime / video.duration;
      const slideIndex = Math.min(
        Math.floor(progress * slides.length),
        slides.length - 1
      );
      if (slideIndex !== currentSlideIndex && slideIndex >= 0) {
        setCurrentSlideIndex(slideIndex);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [slides.length, currentSlideIndex]);

  // Handle play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const goToSlide = (index: number) => {
    const video = videoRef.current;
    if (!video || slides.length === 0) return;
    
    const newIndex = Math.max(0, Math.min(slides.length - 1, index));
    setCurrentSlideIndex(newIndex);
    
    // Seek video to corresponding position
    const targetTime = (newIndex / slides.length) * video.duration;
    video.currentTime = targetTime;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  const viewModeOptions = [
    { mode: "side-by-side" as ViewMode, icon: SplitSquareHorizontal, label: "Side by Side" },
    { mode: "pip" as ViewMode, icon: PictureInPicture2, label: "Picture in Picture" },
    { mode: "tabs" as ViewMode, icon: LayoutGrid, label: "Switchable" },
    { mode: "timeline" as ViewMode, icon: Clock, label: "Timeline" },
  ];

  const renderSlideContent = (compact = false) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSlideIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`bg-white rounded-xl ${compact ? 'p-4' : 'p-6'} h-full flex flex-col`}
        style={{
          boxShadow: `0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px ${currentSlide?.ColorAccent}20`
        }}
      >
        {/* Accent bar */}
        <div 
          className={`${compact ? 'h-1 w-12 mb-3' : 'h-1.5 w-16 mb-4'} rounded-full`}
          style={{ backgroundColor: currentSlide?.ColorAccent }}
        />
        
        {/* Title */}
        <h3 className={`font-bold text-neutral-900 ${compact ? 'text-lg mb-3' : 'text-2xl mb-4'} leading-tight`}>
          {currentSlide?.SlideTitle}
        </h3>
        
        {/* Key Points */}
        <div className={`space-y-${compact ? '2' : '3'} flex-1 overflow-auto`}>
          {currentSlide?.KeyPoints.slice(0, compact ? 3 : 6).map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <div 
                className={`${compact ? 'w-1.5 h-1.5 mt-2' : 'w-2 h-2 mt-2.5'} rounded-full shrink-0`}
                style={{ backgroundColor: currentSlide?.ColorAccent }}
              />
              <span className={`${compact ? 'text-sm' : 'text-base'} text-neutral-700 leading-relaxed`}>
                {point}
              </span>
            </div>
          ))}
        </div>
        
        {/* Slide indicator */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-medium">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlideIndex 
                    ? 'bg-neutral-800 w-4' 
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  const renderVideoPlayer = (fullWidth = false) => (
    <div className={`relative ${fullWidth ? 'w-full' : ''} bg-black rounded-xl overflow-hidden`}>
      <video 
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        controls
      />
      
      {/* Video title overlay */}
      {videoTitle && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
          <span className="text-white text-sm font-medium">{videoTitle}</span>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        ref={containerRef}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl w-full overflow-hidden flex flex-col border border-white/10 ${
          isFullscreen ? 'rounded-none max-w-none max-h-none h-full' : 'rounded-3xl max-w-7xl max-h-[90vh]'
        }`}
      >
        {/* Premium frosted header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          {/* Left: Title with icon */}
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10">
              <Layers className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Presentation Playback</h2>
              <p className="text-xs text-white/50 font-medium">Synced video and slides</p>
            </div>
          </div>
          
          {/* Center: View Mode Switcher */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 rounded-2xl p-1.5 border border-white/10">
            {viewModeOptions.map(({ mode, icon: Icon, label }) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode(mode)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  viewMode === mode
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
                title={label}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="activeViewMode"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl"
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </span>
              </motion.button>
            ))}
          </div>
          
          {/* Right: Fullscreen + Close buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Maximize2 className={`w-5 h-5 transition-colors ${isFullscreen ? 'text-violet-400' : 'text-white/70'}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </motion.button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Side by Side View - Premium */}
          {viewMode === "side-by-side" && (
            <div className="grid grid-cols-2 gap-6 h-full min-h-[450px]">
              {/* Video Panel */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/50">
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
                {renderVideoPlayer(true)}
              </div>
              {/* Slide Panel */}
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                {renderSlideContent()}
              </div>
            </div>
          )}

          {/* Picture in Picture View - Premium */}
          {viewMode === "pip" && (
            <div className="relative h-full min-h-[500px]">
              {/* Full-size slide taking most of the space */}
              <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                {renderSlideContent()}
              </div>
              
              {/* PiP Video - Floating in corner */}
              <motion.div
                drag
                dragMomentum={false}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                className="absolute bottom-6 right-6 w-64 rounded-2xl overflow-hidden cursor-move group"
                style={{ aspectRatio: '16/9' }}
              >
                {/* Multi-layer glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl" />
                
                {/* Video container */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/50">
                  {renderVideoPlayer()}
                  
                  {/* Drag indicator */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </div>
          )}

          {/* Tabs View - Premium */}
          {viewMode === "tabs" && (
            <div className="h-full min-h-[500px] flex flex-col">
              {/* Premium Tab Switcher */}
              <div className="flex justify-center mb-6">
                <div className="relative flex items-center gap-1 bg-black/40 rounded-2xl p-1.5 border border-white/10">
                  {[
                    { id: "video" as const, label: "Video", icon: Play },
                    { id: "slides" as const, label: "Slides", icon: Layers }
                  ].map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(id)}
                      className={`relative flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === id
                          ? "text-white"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {activeTab === id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/30"
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Content area - full size */}
              <div className="flex-1 min-h-0">
                <AnimatePresence mode="wait">
                  {activeTab === "video" ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex items-center justify-center"
                    >
                      <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50" style={{ aspectRatio: '16/9' }}>
                        {renderVideoPlayer(true)}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="slides"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50"
                    >
                      {renderSlideContent()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Timeline View - Premium */}
          {viewMode === "timeline" && (
            <div className="flex flex-col gap-6 h-full min-h-[500px]">
              {/* Video - centered with constrained size */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50" style={{ aspectRatio: '16/9' }}>
                  {renderVideoPlayer(true)}
                </div>
              </div>
              
              {/* Premium Timeline Panel */}
              <div className="relative bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl p-5 border border-white/10 backdrop-blur-xl">
                {/* Subtle glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <span className="text-sm font-semibold text-white/70">Slide Timeline</span>
                    </div>
                    <span className="text-xs font-medium text-white/40">
                      {currentSlideIndex + 1} / {slides.length}
                    </span>
                  </div>
                  
                  {/* Progress track */}
                  <div className="relative h-1.5 bg-white/10 rounded-full mb-5 overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      initial={false}
                      animate={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    />
                    {/* Glow on progress */}
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-sm opacity-60"
                      initial={false}
                      animate={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    />
                  </div>
                  
                  {/* Premium Slide Thumbnails */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {slides.map((slide, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToSlide(i)}
                        className="relative group flex-shrink-0"
                      >
                        {/* Active glow */}
                        {i === currentSlideIndex && (
                          <motion.div
                            layoutId="activeSlideGlow"
                            className="absolute -inset-1 bg-gradient-to-r from-violet-500/40 to-fuchsia-500/40 rounded-xl blur-md"
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                          />
                        )}
                        
                        <div 
                          className={`relative w-20 h-14 rounded-xl overflow-hidden transition-all duration-300 ${
                            i === currentSlideIndex 
                              ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/30' 
                              : 'ring-1 ring-white/10 opacity-50 hover:opacity-100 hover:ring-white/20'
                          }`}
                          style={{ backgroundColor: slide.ColorAccent + '15' }}
                        >
                          {/* Mini slide preview */}
                          <div className="w-full h-full flex flex-col items-start justify-center p-2">
                            <div 
                              className="w-6 h-0.5 rounded-full mb-1.5"
                              style={{ backgroundColor: slide.ColorAccent }}
                            />
                            <div className="w-full space-y-1">
                              <div 
                                className="h-0.5 rounded-full w-4/5"
                                style={{ backgroundColor: slide.ColorAccent + '50' }}
                              />
                              <div 
                                className="h-0.5 rounded-full w-3/5"
                                style={{ backgroundColor: slide.ColorAccent + '35' }}
                              />
                              <div 
                                className="h-0.5 rounded-full w-2/5"
                                style={{ backgroundColor: slide.ColorAccent + '25' }}
                              />
                            </div>
                          </div>
                          
                          {/* Slide number badge */}
                          <div className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            i === currentSlideIndex 
                              ? 'bg-violet-500 text-white' 
                              : 'bg-black/40 text-white/60'
                          }`}>
                            {i + 1}
                          </div>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10 shadow-xl">
                            {slide.SlideTitle.length > 25 ? slide.SlideTitle.slice(0, 25) + '...' : slide.SlideTitle}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premium Footer with Navigation */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToSlide(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToSlide(currentSlideIndex + 1)}
              disabled={currentSlideIndex === slides.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Center: Slide indicator */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlideIndex 
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 w-6 shadow-lg shadow-violet-500/50' 
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 font-medium">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlayPause}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isPlaying 
                  ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20' 
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
