import { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useConversationAI';
import { MessageItem } from './MessageItem';
import { StreamingMessage } from './StreamingMessage';
import { WelcomeScreen } from './WelcomeScreen';

interface MessageListProps {
  messages: Message[];
  streamingContent: string;
  isGenerating: boolean;
}

export const MessageList = ({ messages, streamingContent, isGenerating }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isGenerating) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        
        {isGenerating && streamingContent && (
          <StreamingMessage content={streamingContent} />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};