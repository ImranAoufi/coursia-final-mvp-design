import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TeleprompterRecorderProps {
    courseId: string;
    lessonId: string;
    onUploadComplete: (videoUrl: string) => void;
}

export default function TeleprompterRecorder({
    courseId,
    lessonId,
    onUploadComplete,
}: TeleprompterRecorderProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [uploaded, setUploaded] = useState(false);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;

            const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                setRecordedBlob(blob);
                stream.getTracks().forEach((t) => t.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setIsRecording(false);
    };

    const uploadVideo = async () => {
        if (!recordedBlob) return;
        setIsUploading(true);

        try {
            const filePath = `videos/${courseId}/${lessonId}_${Date.now()}.webm`;
            const { error } = await supabase.storage.from("course-branding").upload(filePath, recordedBlob);
            
            if (error) throw error;

            const { data: urlData } = supabase.storage.from("course-branding").getPublicUrl(filePath);
            
            setUploaded(true);
            onUploadComplete(urlData.publicUrl);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <video ref={videoRef} autoPlay muted className="w-full rounded-xl bg-muted aspect-video" />

            <div className="flex gap-3">
                {!isRecording && !recordedBlob && (
                    <Button onClick={startRecording} variant="gradient">
                        <Video className="w-4 h-4 mr-2" /> Start Recording
                    </Button>
                )}
                {isRecording && (
                    <Button onClick={stopRecording} variant="destructive">
                        Stop Recording
                    </Button>
                )}
                {recordedBlob && !uploaded && (
                    <Button onClick={uploadVideo} disabled={isUploading} variant="gradient">
                        {isUploading ? (
                            <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Uploading...</>
                        ) : (
                            "Upload Video"
                        )}
                    </Button>
                )}
                {uploaded && (
                    <div className="flex items-center text-primary gap-2">
                        <CheckCircle className="w-5 h-5" /> Video uploaded successfully
                    </div>
                )}
            </div>
        </div>
    );
}
