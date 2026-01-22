import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, BookOpen, FileText, Brain, CheckCircle, Loader2 } from 'lucide-react';

interface GenerationLoadingScreenProps {
  jobId: string;
  onComplete: (resultData: any) => void;
  onError?: (error: string) => void;
  title?: string;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  'Initializing...': <Loader2 className="w-6 h-6 animate-spin" />,
  'Analyzing your requirements...': <Brain className="w-6 h-6" />,
  'Crafting course outline...': <BookOpen className="w-6 h-6" />,
  'Generating lesson content...': <FileText className="w-6 h-6" />,
  'Creating interactive quizzes...': <Sparkles className="w-6 h-6" />,
  'Building workbook materials...': <FileText className="w-6 h-6" />,
  'Finalizing your course...': <CheckCircle className="w-6 h-6" />,
  'Course ready!': <CheckCircle className="w-6 h-6" />,
};

export const GenerationLoadingScreen = ({ 
  jobId, 
  onComplete, 
  onError,
  title = "Creating Your Course" 
}: GenerationLoadingScreenProps) => {
  const [jobStatus, setJobStatus] = useState({
    progress: 0,
    step: 'Initializing...',
    status: 'processing'
  });

  useEffect(() => {
    // Initial fetch of job status
    const fetchInitialStatus = async () => {
      const { data } = await supabase
        .from('course_generation_jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (data) {
        setJobStatus({
          progress: data.progress_percent || 0,
          step: data.current_step || 'Initializing...',
          status: data.status || 'processing'
        });

        if (data.status === 'completed' && data.result_data) {
          onComplete(data.result_data);
        } else if (data.status === 'failed') {
          onError?.(data.error || 'Generation failed');
        }
      }
    };

    fetchInitialStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`job-updates-${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'course_generation_jobs',
        filter: `id=eq.${jobId}`
      }, (payload) => {
        const { progress_percent, current_step, status, result_data, error } = payload.new as any;
        
        setJobStatus({ 
          progress: progress_percent || 0, 
          step: current_step || 'Processing...', 
          status: status || 'processing' 
        });
        
        if (status === 'completed' && result_data) {
          setTimeout(() => onComplete(result_data), 500);
        } else if (status === 'failed') {
          onError?.(error || 'Generation failed');
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [jobId, onComplete, onError]);

  const currentIcon = STEP_ICONS[jobStatus.step] || <Loader2 className="w-6 h-6 animate-spin" />;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-6">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]"
          animate={{
            x: ['-20%', '20%', '-20%'],
            y: ['-10%', '10%', '-10%'],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '20%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[100px]"
          animate={{
            x: ['20%', '-20%', '20%'],
            y: ['10%', '-10%', '10%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '20%', right: '20%' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center relative z-10"
      >
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 
            border border-white/10 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            animate={{ rotate: jobStatus.status === 'processing' ? 360 : 0 }}
            transition={{ duration: 3, repeat: jobStatus.status === 'processing' ? Infinity : 0, ease: 'linear' }}
            className="text-primary"
          >
            <Sparkles className="w-10 h-10" />
          </motion.div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-foreground mb-2"
        >
          {title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-10"
        >
          This will only take a moment
        </motion.p>
        
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6 backdrop-blur-sm"
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]"
            initial={{ width: 0 }}
            animate={{ 
              width: `${jobStatus.progress}%`,
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
            }}
            transition={{ 
              width: { duration: 0.5, ease: 'easeOut' },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
            }}
          />
        </motion.div>

        {/* Current Step with Icon */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={jobStatus.step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-primary"
            >
              {currentIcon}
            </motion.div>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={jobStatus.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-primary font-medium text-lg"
            >
              {jobStatus.step}
            </motion.p>
          </AnimatePresence>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground/60 text-sm"
        >
          {jobStatus.progress}% Complete
        </motion.p>

        {/* Step indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-2 mt-8"
        >
          {[20, 40, 60, 80, 100].map((step, i) => (
            <motion.div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                jobStatus.progress >= step 
                  ? 'bg-primary shadow-glow' 
                  : 'bg-white/10'
              }`}
              animate={jobStatus.progress >= step ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GenerationLoadingScreen;
