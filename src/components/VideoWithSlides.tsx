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
  const videoRef = useRef<HTMLVideoElement>(null);

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
        <div className={`space-y-${compact ? '2' : '3'} flex-1`}>
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-semibold">Video with Slides</span>
          </div>
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {viewModeOptions.map(({ mode, icon: Icon, label }) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </motion.button>
            ))}
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {/* Side by Side View */}
          {viewMode === "side-by-side" && (
            <div className="grid grid-cols-2 gap-4 h-full min-h-[400px]">
              <div className="flex flex-col">
                {renderVideoPlayer(true)}
              </div>
              <div className="flex flex-col">
                {renderSlideContent()}
              </div>
            </div>
          )}

          {/* Picture in Picture View */}
          {viewMode === "pip" && (
            <div className="relative h-full min-h-[500px]">
              {/* Full screen slides */}
              <div className="w-full h-full">
                {renderSlideContent()}
              </div>
              
              {/* PiP Video */}
              <motion.div
                drag
                dragMomentum={false}
                className="absolute bottom-4 right-4 w-64 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-move"
                style={{ aspectRatio: '16/9' }}
              >
                {renderVideoPlayer()}
              </motion.div>
            </div>
          )}

          {/* Tabs View */}
          {viewMode === "tabs" && (
            <div className="h-full min-h-[500px] flex flex-col">
              {/* Tab buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "video"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Video
                </button>
                <button
                  onClick={() => setActiveTab("slides")}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    activeTab === "slides"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Slides
                </button>
              </div>
              
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  {activeTab === "video" ? (
                    <motion.div
                      key="video"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="h-full"
                    >
                      {renderVideoPlayer(true)}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="slides"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      {renderSlideContent()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Timeline View */}
          {viewMode === "timeline" && (
            <div className="flex flex-col gap-4 h-full min-h-[500px]">
              {/* Video */}
              <div className="flex-1">
                {renderVideoPlayer(true)}
              </div>
              
              {/* Timeline with slide thumbnails */}
              <div className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Slide Timeline</span>
                </div>
                
                <div className="relative">
                  {/* Progress bar background */}
                  <div className="h-2 bg-muted rounded-full mb-4" />
                  
                  {/* Current progress */}
                  <motion.div
                    className="absolute top-0 h-2 bg-primary rounded-full"
                    style={{ 
                      width: `${((currentSlideIndex + 1) / slides.length) * 100}%` 
                    }}
                  />
                  
                  {/* Slide markers */}
                  <div className="flex justify-between">
                    {slides.map((slide, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToSlide(i)}
                        className={`relative group`}
                      >
                        <div 
                          className={`w-14 h-10 rounded-lg overflow-hidden transition-all ${
                            i === currentSlideIndex 
                              ? 'ring-2 ring-primary shadow-lg' 
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: slide.ColorAccent + '20' }}
                        >
                          <div className="w-full h-full flex flex-col items-start justify-center p-1.5">
                            <div 
                              className="w-4 h-0.5 rounded-full mb-1"
                              style={{ backgroundColor: slide.ColorAccent }}
                            />
                            <div className="w-full space-y-0.5">
                              <div 
                                className="h-0.5 rounded-full w-3/4"
                                style={{ backgroundColor: slide.ColorAccent + '40' }}
                              />
                              <div 
                                className="h-0.5 rounded-full w-1/2"
                                style={{ backgroundColor: slide.ColorAccent + '30' }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {slide.SlideTitle.slice(0, 30)}...
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToSlide(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToSlide(currentSlideIndex + 1)}
              disabled={currentSlideIndex === slides.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
