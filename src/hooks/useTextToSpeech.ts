import { useState, useEffect, useCallback, useRef } from 'react';

interface TTSSettings {
  enabled: boolean;
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface TextToSpeechHook {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  settings: TTSSettings;
  updateSettings: (newSettings: Partial<TTSSettings>) => void;
}

const DEFAULT_SETTINGS: TTSSettings = {
  enabled: true,
  voiceId: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8
};

const STORAGE_KEY = 'tts_settings';

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<TTSSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Auto-select first English voice if none selected
      if (!settings.voiceId && availableVoices.length > 0) {
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') || voice.name.toLowerCase().includes('english')
        );
        const defaultVoice = englishVoice || availableVoices[0];
        updateSettings({ voiceId: defaultVoice.name });
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported]);

  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save TTS settings:', error);
    }
  }, [settings]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !settings.enabled || !text.trim()) return;

    // Stop any current speech
    stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the selected voice
      const selectedVoice = voices.find(voice => voice.name === settings.voiceId);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Apply settings
      utterance.rate = Math.max(0.1, Math.min(2.0, settings.rate));
      utterance.pitch = Math.max(0, Math.min(2.0, settings.pitch));
      utterance.volume = Math.max(0, Math.min(1.0, settings.volume));

      // Event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('TTS Error:', event.error);
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak:', error);
      setIsSpeaking(false);
    }
  }, [isSupported, settings, voices, stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    settings,
    updateSettings
  };
};