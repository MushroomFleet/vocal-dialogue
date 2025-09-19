import { useState, useCallback } from 'react';
import { openRouterService } from '../services/openRouterService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ConversationAIHook {
  messages: Message[];
  isGenerating: boolean;
  streamingContent: string;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  error: string | null;
}

export const useConversationAI = (): ConversationAIHook => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isGenerating) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setStreamingContent('');
    setError(null);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let accumulatedContent = '';
      
      await openRouterService.generateStreamingResponse(
        conversationHistory,
        (token: string) => {
          accumulatedContent += token;
          setStreamingContent(accumulatedContent);
        }
      );

      // Add the complete AI response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: accumulatedContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
    } catch (err) {
      console.error('AI generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  }, [messages, isGenerating]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, []);

  return {
    messages,
    isGenerating,
    streamingContent,
    sendMessage,
    clearConversation,
    error
  };
};