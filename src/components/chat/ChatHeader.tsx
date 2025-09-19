import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  onClearChat: () => void;
  isSupported: boolean;
}

export const ChatHeader = ({ onClearChat, isSupported }: ChatHeaderProps) => {
  return (
    <header className="p-4 border-b bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Careless Convo
              </h1>
              <p className="text-xs text-muted-foreground">
                Voice-driven AI conversations
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isSupported ? "default" : "destructive"}
              className="text-xs"
            >
              {isSupported ? "Speech Ready" : "Speech Unavailable"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};