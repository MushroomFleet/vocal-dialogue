import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  hasFinished: boolean;
  ambientLevel: number;
  isCalibrating: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFinished, setHasFinished] = useState(false);
  const [ambientLevel, setAmbientLevel] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const volumeHistoryRef = useRef<number[]>([]);
  const calibrationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeMonitorRef = useRef<number | null>(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Audio volume monitoring and ambient noise detection
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      // Start calibration period (3 seconds)
      setIsCalibrating(true);
      volumeHistoryRef.current = [];
      
      const monitorVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        
        if (isCalibrating) {
          volumeHistoryRef.current.push(average);
        } else {
          // Check if current volume is significantly above ambient level
          const threshold = ambientLevel + 15; // 15 units above ambient
          const isSpeaking = average > threshold;
          
          console.log(`Volume: ${average.toFixed(2)}, Threshold: ${threshold.toFixed(2)}, Speaking: ${isSpeaking}, Transcript: "${transcript.trim()}"`);
          
          if (isSpeaking && transcript.trim()) {
            lastSpeechTimeRef.current = Date.now();
            
            // Clear existing silence timer
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              console.log('Cleared existing silence timer');
            }
          } else if (!isSpeaking && transcript.trim() && Date.now() - lastSpeechTimeRef.current > 1000) {
            // Start silence timer if we have transcript and no speech for 1 second
            if (!silenceTimerRef.current) {
              console.log('Starting silence timer...');
              silenceTimerRef.current = setTimeout(() => {
                console.log('Silence detected - stopping recognition');
                if (recognitionRef.current && isListening && transcript.trim()) {
                  setHasFinished(true);
                  recognitionRef.current.stop();
                }
                silenceTimerRef.current = null;
              }, 1500); // 1.5 seconds of silence after detecting no speech
            }
          }
        }
        
        volumeMonitorRef.current = requestAnimationFrame(monitorVolume);
      };
      
      monitorVolume();
      
      // Complete calibration after 3 seconds
      calibrationTimerRef.current = setTimeout(() => {
        if (volumeHistoryRef.current.length > 0) {
          const avgAmbient = volumeHistoryRef.current.reduce((sum, val) => sum + val, 0) / volumeHistoryRef.current.length;
          setAmbientLevel(avgAmbient);
          console.log(`Ambient noise level calibrated: ${avgAmbient.toFixed(2)}, Threshold will be: ${(avgAmbient + 15).toFixed(2)}`);
        }
        setIsCalibrating(false);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to initialize audio monitoring:', err);
      setError('Microphone access denied');
    }
  }, [ambientLevel, isCalibrating, isListening, transcript]);

  const stopAudioMonitoring = useCallback(() => {
    if (volumeMonitorRef.current) {
      cancelAnimationFrame(volumeMonitorRef.current);
      volumeMonitorRef.current = null;
    }
    
    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current);
      calibrationTimerRef.current = null;
    }
    
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsCalibrating(false);
  }, []);

  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      
      // Update last speech time when we get actual speech recognition results
      if (fullTranscript.trim()) {
        lastSpeechTimeRef.current = Date.now();
        console.log(`Speech recognized: "${fullTranscript.trim()}", updating last speech time`);
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      stopAudioMonitoring();
      
      // Clear any remaining silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      stopAudioMonitoring();
    };
  }, [isSupported, stopAudioMonitoring]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      setHasFinished(false);
      lastSpeechTimeRef.current = 0;
      
      // Initialize audio monitoring for volume-based silence detection
      initializeAudioMonitoring();
      
      recognitionRef.current.start();
    }
  }, [isListening, initializeAudioMonitoring]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setHasFinished(true);
      recognitionRef.current.stop();
      stopAudioMonitoring();
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  }, [isListening, stopAudioMonitoring]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setHasFinished(false);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
    hasFinished,
    ambientLevel,
    isCalibrating
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}