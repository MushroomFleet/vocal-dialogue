import { useConversationAI } from '@/hooks/useConversationAI';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { MessageList } from './MessageList';
import { VoiceControls } from './VoiceControls';
import { TranscriptionDisplay } from './TranscriptionDisplay';
import { ChatHeader } from './ChatHeader';
import { useEffect, useState } from 'react';

export const ChatContainer = () => {
  const { speak, stop: stopTTS, isSpeaking: isTTSSpeaking } = useTextToSpeech();
  
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

  // Stop TTS when user starts speaking
  useEffect(() => {
    if (isListening && isTTSSpeaking) {
      stopTTS();
    }
  }, [isListening, isTTSSpeaking, stopTTS]);

  // Speak AI responses
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === 'assistant' && !isGenerating && !latestMessage.isStreaming) {
      speak(latestMessage.content);
    }
  }, [messages, isGenerating, speak]);

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      <ChatHeader 
        onClearChat={clearConversation}
        isSupported={isSupported}
        selectedModel={selectedModel}
        availableModels={availableModels}
        onModelChange={setSelectedModel}
        hasApiKey={hasApiKey}
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
    </div>
  );
};