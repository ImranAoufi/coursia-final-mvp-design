import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JobProgressState {
  jobId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useJobProgress() {
  const [state, setState] = useState<JobProgressState>({
    jobId: null,
    isLoading: false,
    error: null,
  });

  const createJob = useCallback(async (jobType: 'preview' | 'full_course') => {
    setState({ jobId: null, isLoading: true, error: null });

    const { data, error } = await supabase
      .from('course_generation_jobs')
      .insert({
        job_type: jobType,
        status: 'processing',
        progress_percent: 0,
        current_step: 'Initializing...',
      })
      .select()
      .single();

    if (error) {
      setState({ jobId: null, isLoading: false, error: error.message });
      return null;
    }

    setState({ jobId: data.id, isLoading: true, error: null });
    return data.id;
  }, []);

  const updateJobProgress = useCallback(async (
    jobId: string, 
    progress: number, 
    step: string
  ) => {
    await supabase
      .from('course_generation_jobs')
      .update({ 
        progress_percent: progress, 
        current_step: step 
      })
      .eq('id', jobId);
  }, []);

  const completeJob = useCallback(async (
    jobId: string, 
    resultData: any
  ) => {
    await supabase
      .from('course_generation_jobs')
      .update({ 
        status: 'completed', 
        progress_percent: 100, 
        current_step: 'Course ready!',
        result_data: resultData
      })
      .eq('id', jobId);

    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const failJob = useCallback(async (
    jobId: string, 
    error: string
  ) => {
    await supabase
      .from('course_generation_jobs')
      .update({ 
        status: 'failed', 
        error 
      })
      .eq('id', jobId);

    setState(prev => ({ ...prev, isLoading: false, error }));
  }, []);

  const resetJob = useCallback(() => {
    setState({ jobId: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    createJob,
    updateJobProgress,
    completeJob,
    failJob,
    resetJob,
  };
}
