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
    <div className="p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Button
            onClick={handleToggleListening}
            disabled={isProcessing}
            size="lg"
            className={cn(
              "w-16 h-16 rounded-full transition-all duration-300",
              isListening
                ? "bg-destructive hover:bg-destructive/90 shadow-glow animate-pulse-glow"
                : "bg-gradient-primary hover:opacity-90 shadow-conversation",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : isListening ? (
              <Square className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </Button>
          
          {isListening && (
            <div className="absolute inset-0 rounded-full border-2 border-destructive animate-ping" />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isProcessing
              ? "Processing..."
              : isListening
              ? "Listening... Speak now"
              : "Tap to start speaking"
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isListening
              ? "Tap the button or stop speaking to send"
              : "Voice-driven conversations made simple"
            }
          </p>
        </div>

        {isListening && (
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-8 bg-voice-active rounded-full animate-voice-wave"
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