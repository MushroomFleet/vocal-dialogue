import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Mic, MicOff, Settings, Square, Loader2 } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { AIModel } from '@/services/openRouterService';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  onClearChat: () => void;
  isSupported: boolean;
  selectedModel: string;
  availableModels: AIModel[];
  onModelChange: (model: string) => void;
  hasApiKey: boolean;
  onOpenApiKeySettings: () => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isProcessing: boolean;
}

export const ChatHeader = ({ 
  onClearChat, 
  isSupported, 
  selectedModel, 
  availableModels, 
  onModelChange, 
  hasApiKey,
  onOpenApiKeySettings,
  isListening,
  onStartListening,
  onStopListening,
  isProcessing
}: ChatHeaderProps) => {
  const handleToggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            Careless-Convo
          </h1>
          
          <Badge 
            variant={isSupported ? "default" : "destructive"} 
            className="text-xs"
          >
            {isSupported ? <Mic className="w-3 h-3 mr-1" /> : <MicOff className="w-3 h-3 mr-1" />}
            {isSupported ? "Speech Ready" : "No Speech"}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Voice Control Button */}
          {isSupported && (
            <Button
              onClick={handleToggleListening}
              disabled={isProcessing}
              size="sm"
              className={cn(
                "transition-all duration-300 min-w-[120px]",
                isListening
                  ? "bg-destructive hover:bg-destructive/90 shadow-glow"
                  : "bg-gradient-primary hover:opacity-90",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing
                </>
              ) : isListening ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Talk
                </>
              )}
            </Button>
          )}
          
          <ModelSelector
            selectedModel={selectedModel}
            availableModels={availableModels}
            onModelChange={onModelChange}
            hasApiKey={hasApiKey}
            onOpenApiKeySettings={onOpenApiKeySettings}
          />
          
          {hasApiKey && (
            <Button 
              onClick={onOpenApiKeySettings}
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            onClick={onClearChat} 
            variant="outline" 
            size="sm"
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};