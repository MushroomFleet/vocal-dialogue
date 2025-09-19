import { useState, useEffect, useCallback, useRef } from 'react';

type TTSProvider = 'browser' | 'elevenlabs';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category: string;
}

interface TTSSettings {
  enabled: boolean;
  provider: TTSProvider;
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
}

interface TextToSpeechHook {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  elevenLabsVoices: ElevenLabsVoice[];
  settings: TTSSettings;
  updateSettings: (newSettings: Partial<TTSSettings>) => void;
  loadElevenLabsVoices: () => Promise<void>;
}

const DEFAULT_SETTINGS: TTSSettings = {
  enabled: true,
  provider: 'browser',
  voiceId: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  elevenLabsApiKey: '',
  elevenLabsVoiceId: '9BWtsMINqrJLrRacOk9x' // Aria voice
};

const STORAGE_KEY = 'tts_settings';

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>([]);
  const [settings, setSettings] = useState<TTSSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  const loadElevenLabsVoices = useCallback(async () => {
    if (!settings.elevenLabsApiKey) return;
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': settings.elevenLabsApiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setElevenLabsVoices(data.voices || []);
      }
    } catch (error) {
      console.error('Failed to load ElevenLabs voices:', error);
    }
  }, [settings.elevenLabsApiKey]);

  const stop = useCallback(() => {
    if (settings.provider === 'browser' && isSupported) {
      speechSynthesis.cancel();
    } else if (settings.provider === 'elevenlabs' && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, [isSupported, settings.provider]);

  const speak = useCallback(async (text: string) => {
    if (!settings.enabled || !text.trim()) return;

    // Stop any current speech
    stop();

    if (settings.provider === 'browser') {
      if (!isSupported) return;
      
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
    } else if (settings.provider === 'elevenlabs') {
      if (!settings.elevenLabsApiKey || !settings.elevenLabsVoiceId) return;
      
      try {
        setIsSpeaking(true);
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.elevenLabsVoiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': settings.elevenLabsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2_5",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const audio = new Audio(audioUrl);
          audio.volume = settings.volume;
          
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audioRef.current = audio;
          await audio.play();
        } else {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }
      } catch (error) {
        console.error('ElevenLabs TTS Error:', error);
        setIsSpeaking(false);
      }
    }
  }, [settings, voices, stop, isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    elevenLabsVoices,
    settings,
    updateSettings,
    loadElevenLabsVoices
  };
};