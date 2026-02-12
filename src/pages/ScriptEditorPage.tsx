import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft, Film, Play, Pause, Square, SkipBack, SkipForward,
  Video, RefreshCw, X, Layers, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import TeleprompterSlidePanel, { SlideContent } from "@/components/TeleprompterSlidePanel";
import VideoWithSlides from "@/components/VideoWithSlides";

const ScriptEditorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scriptTitle = searchParams.get("title") || "Script";
  const lessonIndex = searchParams.get("lessonIndex");
  const courseId = searchParams.get("courseId") || undefined;
  const lessonId = lessonIndex !== null ? `lesson_${parseInt(lessonIndex, 10) + 1}` : null;

  const [scriptContent, setScriptContent] = useState<string | null>(null);

  // Teleprompter state
  const [isTeleprompterActive, setIsTeleprompterActive] = useState(false);
  const [isTeleprompterPaused, setIsTeleprompterPaused] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const teleprompterScrollRef = useRef<number>(0);
  const [teleprompterScrollProgress, setTeleprompterScrollProgress] = useState(0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  // Slides state
  const [savedSlides, setSavedSlides] = useState<SlideContent[]>([]);
  const [showVideoWithSlides, setShowVideoWithSlides] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("coursia_edit_script");
    if (raw) {
      setScriptContent(raw);
    } else {
      navigate("/my-course");
    }
  }, [navigate]);

  // Smooth teleprompter scrolling using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastTime: number | null = null;

    const getSpeedPxPerSecond = () => {
      switch (scrollSpeed) {
        case 1: return 25;
        case 2: return 50;
        case 3: return 85;
        default: return 50;
      }
    };

    const animate = (currentTime: number) => {
      const inner = document.getElementById("script-scroll-inner");
      if (!inner) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (lastTime === null) lastTime = currentTime;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isTeleprompterPaused) {
        const scrollAmount = getSpeedPxPerSecond() * deltaTime;
        teleprompterScrollRef.current += scrollAmount;
        inner.scrollTop = teleprompterScrollRef.current;

        if (inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 5) {
          if (inner.scrollHeight > inner.clientHeight + 5) {
            setIsTeleprompterPaused(true);
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isTeleprompterActive) {
      const inner = document.getElementById("script-scroll-inner");
      if (inner) teleprompterScrollRef.current = inner.scrollTop;
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isTeleprompterActive, isTeleprompterPaused, scrollSpeed]);

  const skipTeleprompter = (seconds: number) => {
    const inner = document.getElementById("script-scroll-inner");
    if (!inner) return;
    const speedPxPerSecond = scrollSpeed === 1 ? 25 : scrollSpeed === 2 ? 50 : 85;
    const skipAmount = speedPxPerSecond * seconds;
    teleprompterScrollRef.current = Math.max(0, Math.min(
      inner.scrollHeight - inner.clientHeight,
      teleprompterScrollRef.current + skipAmount
    ));
    inner.scrollTop = teleprompterScrollRef.current;
  };

  const startTeleprompter = () => {
    const inner = document.getElementById("script-scroll-inner");
    if (inner) { inner.scrollTop = 0; teleprompterScrollRef.current = 0; }
    setIsTeleprompterPaused(false);
    setIsTeleprompterActive(true);
  };

  const toggleTeleprompterPause = () => setIsTeleprompterPaused(prev => !prev);
  const stopTeleprompter = () => { setIsTeleprompterActive(false); setIsTeleprompterPaused(false); };

  const handleStartRecording = async () => {
    setRecordedBlob(null);
    setVideoURL(null);
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedBlob(blob);
        setVideoURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      setMediaRecorder(recorder);
      recorder.start();
    } catch (err) {
      console.error("Could not start recording:", err);
      alert("Microphone or camera permission denied.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    setIsRecording(false);
    setIsTeleprompterActive(false);
  };

  const handleSaveRecording = () => {
    if (!recordedBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(recordedBlob);
    link.download = `${scriptTitle.replace(/\s+/g, "_")}.webm`;
    link.click();
    toast.success("🎬 Video saved locally!");
  };

  const handleBack = () => {
    sessionStorage.removeItem("coursia_edit_script");
    navigate("/my-course");
  };

  if (!scriptContent) return null;

  if (showVideoWithSlides && videoURL) {
    return (
      <VideoWithSlides
        videoUrl={videoURL}
        videoTitle={scriptTitle}
        slides={savedSlides}
        isOpen={true}
        onClose={() => setShowVideoWithSlides(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 rounded-xl">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Film className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">{scriptTitle}</h1>
              <p className="text-xs text-muted-foreground">Script & Recording Studio</p>
            </div>
          </div>
          {recordedBlob && !isRecording && (
            <Button size="sm" variant="outline" onClick={handleSaveRecording} className="ml-auto gap-2 rounded-xl">
              <Video className="w-3 h-3" /> Save Video
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-row gap-4">
          {/* LEFT PANEL - CONTROLS */}
          <div className="w-[160px] flex flex-col gap-3 shrink-0">
            {/* TELEPROMPTER CONTROLS */}
            <Card className="p-4 glass-strong border border-white/10 shadow-xl">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Teleprompter
              </h3>
              <div className="flex flex-col gap-3">
                {!isTeleprompterActive ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startTeleprompter}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/30 transition-all duration-300"
                  >
                    <Play className="w-4 h-4" /> Start
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleTeleprompterPause}
                      className={`flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                        isTeleprompterPaused
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                          : "bg-muted/50 text-foreground border border-border hover:bg-muted"
                      }`}
                    >
                      {isTeleprompterPaused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopTeleprompter}
                      className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center hover:bg-destructive hover:text-white transition-all duration-300"
                    >
                      <Square className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}

                {isTeleprompterActive && (
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.03, x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => skipTeleprompter(-5)}
                      className="flex-1 py-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-muted/50 hover:border-border transition-all duration-200">
                      <SkipBack className="w-3.5 h-3.5" /> 5s
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03, x: 2 }} whileTap={{ scale: 0.97 }} onClick={() => skipTeleprompter(5)}
                      className="flex-1 py-2 rounded-lg bg-muted/30 border border-border/50 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-muted/50 hover:border-border transition-all duration-200">
                      5s <SkipForward className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                )}

                <div className="pt-2 border-t border-border/30">
                  <span className="text-xs text-muted-foreground mb-2 block">Speed</span>
                  <div className="flex gap-1.5">
                    {[
                      { value: 1, label: "Slow", icon: "🐢" },
                      { value: 2, label: "Med", icon: "🚶" },
                      { value: 3, label: "Fast", icon: "🏃" },
                    ].map((speed) => (
                      <motion.button
                        key={speed.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setScrollSpeed(speed.value)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          scrollSpeed === speed.value
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-muted/20 text-muted-foreground border border-transparent hover:border-border/50"
                        }`}
                      >
                        {speed.icon}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* RECORDING CONTROLS */}
            <Card className="p-4 glass-strong border border-white/10">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Recording
              </h3>
              <div className="flex flex-col gap-3">
                {!isRecording && !recordedBlob && (
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(239,68,68,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartRecording}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 border border-red-400/30"
                  >
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    Start Recording
                  </motion.button>
                )}
                {isRecording && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStopRecording}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg border border-gray-600/50 hover:border-gray-500 transition-all duration-300"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop Recording
                  </motion.button>
                )}
                {!isRecording && recordedBlob && (
                  <div className="space-y-3">
                    {savedSlides.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowVideoWithSlides(true)}
                        className="group relative w-full py-4 rounded-2xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-fuchsia-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/20 to-transparent opacity-60" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        </div>
                        <div className="relative flex items-center justify-center gap-3">
                          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Layers className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <span className="text-white font-bold text-base tracking-wide">Video + Slides</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setRecordedBlob(null); setVideoURL(null); }}
                      className="w-full py-2.5 rounded-xl bg-muted/30 backdrop-blur-sm text-muted-foreground font-medium text-sm flex items-center justify-center gap-2 border border-border/50 hover:border-border hover:bg-muted/50 transition-all duration-300"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Record Again
                    </motion.button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* CENTER PANEL — VIDEO + TELEPROMPTER + SLIDES (STACKED) */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Video Area */}
            <div className={`relative rounded-2xl overflow-hidden border border-border/50 shadow-xl bg-black/95 ${
              recordedBlob && !isRecording ? 'max-w-2xl mx-auto w-full' : 'min-h-[280px]'
            }`}>
              {isRecording ? (
                <video id="liveVideo" autoPlay muted className="w-full h-full object-cover" />
              ) : recordedBlob ? (
                <div className="relative group">
                  <div className="relative aspect-video bg-gradient-to-br from-black via-black/95 to-black">
                    <video src={videoURL || ""} controls className="w-full h-full object-contain rounded-2xl" />
                  </div>
                  <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-white/90 text-sm font-medium">{scriptTitle || "Recorded Video"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Video className="w-7 h-7 text-white/40" />
                  </div>
                  <span className="text-sm font-medium text-white/50">Ready to record</span>
                </div>
              )}

              {/* FLOATING TELEPROMPTER OVERLAY */}
              {scriptContent && isTeleprompterActive && (
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[94%] bg-black/90 backdrop-blur-2xl text-white rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/10 transition-all duration-300 ease-out"
                  style={{ height: "220px", overflow: "hidden" }}
                >
                  <div className="absolute inset-0 pointer-events-none z-10"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.95) 100%)" }}
                  />
                  {isTeleprompterPaused && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-500/90 text-black px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <Pause className="w-3 h-3" /> PAUSED
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={stopTeleprompter}
                    className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors border border-white/20"
                  >
                    <X className="w-3 h-3 text-white/70" />
                  </motion.button>
                  <div
                    id="script-scroll-inner"
                    className="h-full flex flex-col justify-start text-4xl sm:text-5xl lg:text-6xl leading-[1.6] tracking-wide font-medium whitespace-pre-wrap px-8 text-center select-none"
                    style={{ overflowY: "scroll", scrollbarWidth: "none", scrollBehavior: "auto" }}
                    onScroll={(e) => {
                      const target = e.target as HTMLElement;
                      const scrollTop = target.scrollTop;
                      const scrollHeight = target.scrollHeight - target.clientHeight;
                      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
                      setTeleprompterScrollProgress(progress);
                    }}
                  >
                    <div className="h-[20px] shrink-0" />
                    <div className="max-w-3xl mx-auto">
                      {scriptContent.split("\n").map((line, lineIdx) => (
                        <div key={lineIdx} className="py-3">{line || " "}</div>
                      ))}
                    </div>
                    <div className="h-[65px] shrink-0" />
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>

            {/* SLIDES PANEL */}
            <TeleprompterSlidePanel
              lessonId={lessonId}
              scriptText={scriptContent}
              lessonTitle={scriptTitle}
              isVisible={!!scriptContent}
              scrollProgress={teleprompterScrollProgress}
              courseId={courseId}
              onSlidesSaved={(slides) => setSavedSlides(slides)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptEditorPage;
