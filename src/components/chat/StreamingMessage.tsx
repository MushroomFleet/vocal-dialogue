import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface StreamingMessageProps {
  content: string;
}

export const StreamingMessage = ({ content }: StreamingMessageProps) => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="bg-muted text-muted-foreground animate-pulse">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 max-w-[80%]">
        <div className="inline-block px-4 py-3 rounded-lg rounded-bl-sm bg-card text-card-foreground shadow-conversation">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
            <span className="inline-block w-2 h-4 bg-primary/60 ml-1 animate-pulse" />
          </p>
        </div>
      </div>
    </div>
  );
};