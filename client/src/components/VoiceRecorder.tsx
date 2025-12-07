import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Mic, Square, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";

/**
 * VoiceRecorder Component
 * 
 * Allows users to record audio and transcribe it to text using Whisper API.
 * Perfect for quick capture of thoughts, meeting notes, or task lists.
 * 
 * Features:
 * - Real-time recording with visual feedback
 * - Automatic transcription via Whisper
 * - File size validation (16MB limit)
 * - Error handling and user feedback
 */

interface VoiceRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
  className?: string;
}

export function VoiceRecorder({ onTranscriptionComplete, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const transcribeMutation = trpc.ai.transcribeAudio.useMutation({
    onSuccess: (data: { text: string; language: string }) => {
      setIsTranscribing(false);
      if (data.text) {
        toast.success("Transcription complete!");
        onTranscriptionComplete?.(data.text);
      } else {
        toast.error("No speech detected in recording");
      }
    },
    onError: (error) => {
      setIsTranscribing(false);
      toast.error(`Transcription failed: ${error.message}`);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Use webm format for better compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        // Check file size (16MB limit)
        const fileSizeMB = audioBlob.size / (1024 * 1024);
        if (fileSizeMB > 16) {
          toast.error("Recording too large (max 16MB). Please record shorter audio.");
          return;
        }

        // Convert blob to base64 for API transmission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          transcribeMutation.mutate({
            audioData: base64Audio,
            format: mimeType.split('/')[1] as 'webm' | 'mp4',
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast.info("Processing recording...");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          {!isRecording && !isTranscribing && (
            <Button
              onClick={startRecording}
              variant="default"
              size="lg"
              className="gap-2"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="h-5 w-5" />
                  Stop Recording
                </Button>
              </div>
            </>
          )}

          {isTranscribing && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Transcribing...</span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-sm">
          {!isRecording && !isTranscribing && "Click to start recording. Perfect for quick notes, meeting minutes, or task lists."}
          {isRecording && "Recording... Click stop when finished."}
          {isTranscribing && "Converting speech to text..."}
        </p>
      </div>
    </Card>
  );
}
