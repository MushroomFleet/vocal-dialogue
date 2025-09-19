import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface VoiceControlsProps {
  isListening: boolean;
  isProcessing: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isSupported: boolean;
}

export const VoiceControls = ({
  isListening,
  isProcessing,
  onStartListening,
  onStopListening,
  isSupported
}: VoiceControlsProps) => {
  const handleToggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Speech recognition is not supported in this browser
        </p>
        <Badge variant="destructive">Unsupported Browser</Badge>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isProcessing
              ? "Processing your message..."
              : isListening
              ? "Click to send speech to convo"
              : "Use the 'Talk' button in the header to start"
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isListening
              ? "AI will respond automatically when you finish speaking"
              : "Voice conversations powered by AI"
            }
          </p>
        </div>

        {isListening && (
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-6 bg-voice-active rounded-full animate-voice-wave"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};