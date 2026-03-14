import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Video } from "lucide-react";

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

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            setRecordedBlob(blob);
            stream.getTracks().forEach((t) => t.stop());

            // Video bleibt in gleicher Größe & Form
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = URL.createObjectURL(blob);
                videoRef.current.controls = true;
                videoRef.current.style.objectFit = "cover";
                videoRef.current.style.width = "500px";
                videoRef.current.style.height = "350px";
            }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setIsRecording(false);
    };

    const uploadVideo = async () => {
        if (!recordedBlob) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("video", recordedBlob, `${lessonId}.webm`);
        formData.append("course_id", courseId);
        formData.append("lesson_id", lessonId);

        const response = await fetch("http://127.0.0.1:8000/api/upload-video", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        setIsUploading(false);
        if (data.video_url) {
            onUploadComplete(data.video_url);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 mt-6 w-full h-full">
            {/* Kamera */}
            <video
                ref={videoRef}
                autoPlay
                muted
                className="rounded-xl shadow-2xl w-[500px] h-[350px] object-cover border-2 border-white bg-black"
            />

            {/* Aufnahme Buttons */}
            <div className="flex gap-3 mt-4">
                {!isRecording && !recordedBlob && (
                    <Button onClick={startRecording} className="bg-blue-600 text-white">
                        <Video className="mr-2 w-4 h-4" /> Start Recording
                    </Button>
                )}

                {isRecording && (
                    <Button onClick={stopRecording} className="bg-red-500 text-white">
                        Stop Recording
                    </Button>
                )}

                {recordedBlob && !isUploading && (
                    <Button onClick={uploadVideo} className="bg-green-600 text-white">
                        <Loader2 className="mr-2 w-4 h-4" /> Upload Video
                    </Button>
                )}

                {isUploading && (
                    <Button disabled className="bg-gray-400 text-white">
                        <Loader2 className="mr-2 animate-spin w-4 h-4" /> Uploading...
                    </Button>
                )}
            </div>

            {recordedBlob && !isUploading && (
                <div className="text-green-600 flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4" /> Recording Complete
                </div>
            )}
        </div>
    );
}

