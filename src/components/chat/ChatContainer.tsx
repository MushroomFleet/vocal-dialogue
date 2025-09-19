import { useConversationAI } from '@/hooks/useConversationAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { MessageList } from './MessageList';
import { VoiceControls } from './VoiceControls';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { ChatHeader } from './ChatHeader';
import { ApiKeySettings } from './ApiKeySettings';
import { useEffect, useState } from 'react';

export const ChatContainer = () => {
  const [isApiKeySettingsOpen, setIsApiKeySettingsOpen] = useState(false);
  
  const {
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
    error: aiError
  } = useConversationAI();

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    hasFinished,
    error: speechError
  } = useSpeechRecognition();

  // Auto-send transcript when speech finishes with silence detection
  useEffect(() => {
    if (hasFinished && transcript && transcript.trim().length > 0) {
      sendMessage(transcript);
      resetTranscript();
    }
  }, [hasFinished, transcript, sendMessage, resetTranscript]);

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <ChatHeader 
        onClearChat={clearConversation}
        isSupported={isSupported}
        selectedModel={selectedModel}
        availableModels={availableModels}
        onModelChange={setSelectedModel}
        hasApiKey={hasApiKey}
        onOpenApiKeySettings={() => setIsApiKeySettingsOpen(true)}
        isListening={isListening}
        onStartListening={startListening}
        onStopListening={stopListening}
        isProcessing={isGenerating}
      />

      <main className="flex-1 overflow-hidden relative">
        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          isGenerating={isGenerating}
        />
        
        <TranscriptionDisplay
          transcript={transcript}
          isListening={isListening}
          error={speechError || aiError}
        />
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <VoiceControls
          isListening={isListening}
          isProcessing={isGenerating}
          onStartListening={startListening}
          onStopListening={stopListening}
          isSupported={isSupported}
        />
      </footer>

      <ApiKeySettings
        open={isApiKeySettingsOpen}
        onOpenChange={setIsApiKeySettingsOpen}
        onApiKeyUpdate={refreshApiKeyStatus}
      />
    </div>
  );
};