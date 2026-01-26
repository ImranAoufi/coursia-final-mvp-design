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
  X,
  Presentation
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

type ViewMode = "side-by-side" | "pip" | "tabs" | "timeline" | "presenter";

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
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
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
    { mode: "presenter" as ViewMode, icon: Presentation, label: "Presenter" },
    { mode: "tabs" as ViewMode, icon: LayoutGrid, label: "Switchable" },
    { mode: "timeline" as ViewMode, icon: Clock, label: "Timeline" },
  ];

  // Compact slide for side-by-side view
  const renderSlideContentCompact = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSlideIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-xl p-6 h-full flex flex-col"
        style={{
          boxShadow: `0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px ${currentSlide?.ColorAccent}20`
        }}
      >
        {/* Accent bar */}
        <div 
          className="h-1.5 w-16 mb-4 rounded-full"
          style={{ backgroundColor: currentSlide?.ColorAccent }}
        />
        
        {/* Title */}
        <h3 className="font-bold text-neutral-900 text-2xl mb-4 leading-tight">
          {currentSlide?.SlideTitle}
        </h3>
        
        {/* Key Points */}
        <div className="space-y-3 flex-1 overflow-auto">
          {currentSlide?.KeyPoints.slice(0, 6).map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <div 
                className="w-2 h-2 mt-2.5 rounded-full shrink-0"
                style={{ backgroundColor: currentSlide?.ColorAccent }}
              />
              <span className="text-base text-neutral-700 leading-relaxed">
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

  // Premium full-size slide (teleprompter style) for PiP and Tabs views
  const renderSlideContentPremium = () => (
    <div className="relative h-full min-h-[400px] bg-gradient-to-br from-white via-white to-neutral-50/50 rounded-xl overflow-hidden">
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative p-10 h-full flex flex-col"
        >
          {/* Gradient accent bar */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-1.5 rounded-full mb-7"
            style={{ 
              background: `linear-gradient(90deg, ${currentSlide?.ColorAccent}, ${currentSlide?.ColorAccent}80)` 
            }}
          />
          
          {/* Title with enhanced typography */}
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-4xl font-extrabold text-neutral-900 tracking-tight mb-8 leading-[1.1]"
          >
            {currentSlide?.SlideTitle}
          </motion.h2>
          
          {/* Key Points - Interactive grid */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-5 flex-1">
            {currentSlide?.KeyPoints.slice(0, 6).map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.2 + i * 0.08, 
                  duration: 0.3,
                  ease: "easeOut"
                }}
                onHoverStart={() => setHoveredPoint(i)}
                onHoverEnd={() => setHoveredPoint(null)}
                className="relative flex items-start gap-4 group cursor-default"
              >
                {/* Animated bullet */}
                <motion.div 
                  animate={{ 
                    scale: hoveredPoint === i ? 1.3 : 1,
                    boxShadow: hoveredPoint === i 
                      ? `0 0 12px ${currentSlide?.ColorAccent}60` 
                      : `0 0 0 ${currentSlide?.ColorAccent}00`
                  }}
                  className="mt-2.5 w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-200"
                  style={{ backgroundColor: currentSlide?.ColorAccent }}
                />
                <motion.span 
                  animate={{ 
                    color: hoveredPoint === i ? 'rgb(23, 23, 23)' : 'rgb(64, 64, 64)'
                  }}
                  className="text-lg leading-relaxed font-medium transition-colors duration-200"
                >
                  {point}
                </motion.span>
              </motion.div>
            ))}
          </div>

          {/* Slide indicator at bottom */}
          <div className="mt-auto pt-6 flex items-center justify-between">
            <span className="text-sm text-neutral-400 font-medium">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentSlideIndex 
                      ? 'w-6' 
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  style={i === currentSlideIndex ? { backgroundColor: currentSlide?.ColorAccent } : undefined}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
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
                {renderSlideContentCompact()}
              </div>
            </div>
          )}

          {/* Picture in Picture View - Premium */}
          {viewMode === "pip" && (
            <div className="relative h-full min-h-[500px]">
              {/* Full-size slide taking most of the space */}
              <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                      {renderSlideContentPremium()}
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

          {/* Presenter View - Billion-Dollar Course Style */}
          {viewMode === "presenter" && (
            <div className="relative h-full min-h-[500px] flex items-center justify-center">
              {/* Main slide - exactly as generated */}
              <div 
                className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
                style={{ aspectRatio: '16/9' }}
              >
                {/* Slide background with gradient */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, white 0%, ${currentSlide?.ColorAccent}08 100%)`
                  }}
                />
                
                {/* Accent bar at top */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: currentSlide?.ColorAccent }}
                />
                
                {/* Slide content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full p-12 flex flex-col"
                  >
                    {/* Title */}
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-4xl md:text-5xl font-bold mb-10 leading-tight"
                      style={{ color: currentSlide?.ColorAccent }}
                    >
                      {currentSlide?.SlideTitle}
                    </motion.h2>
                    
                    {/* Key points in clean list */}
                    <ul className="space-y-5 flex-1">
                      {currentSlide?.KeyPoints.map((point, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.08 }}
                          className="flex items-start gap-4 text-xl text-neutral-800"
                        >
                          <span 
                            className="mt-2.5 w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: currentSlide?.ColorAccent }}
                          />
                          <span className="leading-relaxed">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* Slide number */}
                    <div className="text-right text-sm text-neutral-400 font-medium mt-6">
                      {currentSlideIndex + 1} / {slides.length}
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Facecam video - positioned in bottom right corner */}
                <motion.div
                  drag
                  dragMomentum={false}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.03 }}
                  className="absolute bottom-6 right-6 w-48 rounded-2xl overflow-hidden cursor-move group shadow-2xl"
                  style={{ aspectRatio: '16/9' }}
                >
                  {/* Glow ring */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Video */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/30">
                    <video 
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-cover"
                      controls={false}
                      onClick={togglePlayPause}
                    />
                    
                    {/* Play/Pause overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-white drop-shadow-lg" />
                      ) : (
                        <Play className="w-8 h-8 text-white drop-shadow-lg" />
                      )}
                    </div>
                    
                    {/* Drag indicator */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              </div>
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
                      {renderSlideContentPremium()}
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
