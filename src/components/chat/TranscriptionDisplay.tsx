import { cn } from '@/lib/utils';
import { Mic, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TranscriptionDisplayProps {
  transcript: string;
  isListening: boolean;
  error?: string | null;
}

export const TranscriptionDisplay = ({
  transcript,
  isListening,
  error
}: TranscriptionDisplayProps) => {
  if (error) {
    return (
      <div className="fixed bottom-32 left-4 right-4 z-10">
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isListening && !transcript) {
    return null;
  }

  return (
    <div className="fixed bottom-32 left-4 right-4 z-10">
      <div className={cn(
        "p-4 rounded-lg shadow-conversation backdrop-blur-sm border transition-all duration-300 animate-fade-in",
        isListening
          ? "bg-voice-active/10 border-voice-active/30"
          : "bg-card/90 border-border"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isListening ? "bg-voice-active animate-pulse" : "bg-muted-foreground"
          )} />
          <Mic className={cn(
            "w-4 h-4 transition-colors",
            isListening ? "text-voice-active" : "text-muted-foreground"
          )} />
          <span className="text-sm font-medium">
            {isListening ? "Listening..." : "Speech captured"}
          </span>
        </div>
        
        {transcript && (
          <div className="relative">
            <p className="text-foreground leading-relaxed min-h-[1.5rem] bg-background/50 rounded p-2">
              {transcript}
              {isListening && (
                <span className="inline-block w-0.5 h-4 bg-voice-active ml-1 animate-pulse" />
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};