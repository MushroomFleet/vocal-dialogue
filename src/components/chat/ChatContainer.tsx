import { useConversationAI } from '@/hooks/useConversationAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { MessageList } from './MessageList';
import { VoiceControls } from './VoiceControls';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { ChatHeader } from './ChatHeader';
import { useEffect } from 'react';

export const ChatContainer = () => {
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
    error: aiError
  } = useConversationAI();

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition();

  // Auto-send transcript when speech ends
  useEffect(() => {
    if (transcript && !isListening && transcript.trim().length > 0) {
      sendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, sendMessage, resetTranscript]);

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <ChatHeader 
        onClearChat={clearConversation}
        isSupported={isSupported}
        selectedModel={selectedModel}
        availableModels={availableModels}
        onModelChange={setSelectedModel}
        hasApiKey={hasApiKey}
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
    </div>
  );
};