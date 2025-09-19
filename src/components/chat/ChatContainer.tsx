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
    error: speechError,
    ambientLevel,
    isCalibrating
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

  const exportChat = () => {
    if (messages.length === 0) return;

    const chatText = messages
      .map(message => {
        const prefix = message.role === 'user' ? 'Human:' : 'Assistant:';
        return `${prefix} ${message.content}`;
      })
      .join('\n\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `CC-${timestamp}.txt`;

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

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
        onExportChat={exportChat}
        hasMessages={messages.length > 0}
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
          isCalibrating={isCalibrating}
          ambientLevel={ambientLevel}
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