import { useState, useCallback } from 'react';
import { openRouterService, type AIModel } from '../services/openRouterService';

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
  selectedModel: string;
  availableModels: AIModel[];
  hasApiKey: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  setSelectedModel: (model: string) => void;
  refreshApiKeyStatus: () => void;
  error: string | null;
}

export const useConversationAI = (): ConversationAIHook => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [error, setError] = useState<string | null>(null);

  const availableModels = openRouterService.getPopularModels();
  const hasApiKey = openRouterService.hasApiKey;

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
        },
        (errorMessage: string) => {
          setError(errorMessage);
        },
        selectedModel
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

  const refreshApiKeyStatus = useCallback(() => {
    // Force re-render by updating hasApiKey state
    setMessages(prev => [...prev]);
  }, []);

  return {
    messages,
    isGenerating,
    streamingContent,
    selectedModel,
    availableModels,
    hasApiKey,
    sendMessage,
    clearConversation,
    setSelectedModel,
    refreshApiKeyStatus,
    error
  };
};