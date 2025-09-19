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
  const streamRef = useRef<MediaStream | null>(null);
  const volumeHistoryRef = useRef<number[]>([]);
  const calibrationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeMonitorRef = useRef<number | null>(null);
  const transcriptRef = useRef('');
  const hasFinishedRef = useRef(false);
  const isVoiceActiveRef = useRef(false);
  const aboveCountRef = useRef(0);
  const belowCountRef = useRef(0);
  const smoothedRmsRef = useRef(0);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Audio volume monitoring and ambient noise detection
  const initializeAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 1024;
      const bufferLength = analyserRef.current.fftSize;
      const timeDomain = new Uint8Array(bufferLength);
      
      microphoneRef.current.connect(analyserRef.current);
      
      // Calibration period (1.5s) to measure ambient RMS
      setIsCalibrating(true);
      volumeHistoryRef.current = [];
      isVoiceActiveRef.current = false;
      aboveCountRef.current = 0;
      belowCountRef.current = 0;
      smoothedRmsRef.current = 0;
      lastSpeechTimeRef.current = Date.now();

      const SMOOTHING = 0.15; // exponential smoothing factor
      const MIN_SILENCE_MS = 1200; // required silence duration
      const ACTIVATE_FRAMES = 6; // ~100ms
      const DEACTIVATE_FRAMES = 18; // ~300ms

      const monitorVolume = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteTimeDomainData(timeDomain);
        // Compute RMS from time domain data (0..1)
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = (timeDomain[i] - 128) / 128; // center at 0
          sumSquares += v * v;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        // Smooth RMS
        smoothedRmsRef.current = SMOOTHING * rms + (1 - SMOOTHING) * smoothedRmsRef.current;

        if (isCalibrating) {
          volumeHistoryRef.current.push(smoothedRmsRef.current);
        } else {
          const startThresh = (ambientLevel || 0.005) + 0.03; // voice start
          const stopThresh = (ambientLevel || 0.005) + 0.015; // voice stop (hysteresis)

          if (smoothedRmsRef.current > startThresh) {
            aboveCountRef.current++;
            belowCountRef.current = 0;
          } else if (smoothedRmsRef.current < stopThresh) {
            belowCountRef.current++;
          }

          if (!isVoiceActiveRef.current && aboveCountRef.current >= ACTIVATE_FRAMES) {
            isVoiceActiveRef.current = true;
            aboveCountRef.current = 0;
            belowCountRef.current = 0;
            lastSpeechTimeRef.current = Date.now();
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
            // console.debug('Voice activity detected');
          }

          if (isVoiceActiveRef.current && belowCountRef.current >= DEACTIVATE_FRAMES) {
            isVoiceActiveRef.current = false;
            belowCountRef.current = 0;
            // Start silence timer only if we have transcript content
            if (!silenceTimerRef.current && transcript.trim()) {
              silenceTimerRef.current = setTimeout(() => {
                if (recognitionRef.current && isListening && transcript.trim()) {
                  setHasFinished(true);
                  hasFinishedRef.current = true;
                  recognitionRef.current.stop();
                }
                silenceTimerRef.current = null;
              }, MIN_SILENCE_MS);
            }
          }

          // Fallback: stop if no voice activity for prolonged period but transcript exists
          if (!isVoiceActiveRef.current && transcript.trim() && Date.now() - lastSpeechTimeRef.current > MIN_SILENCE_MS * 2) {
            if (recognitionRef.current && isListening) {
              setHasFinished(true);
              hasFinishedRef.current = true;
              recognitionRef.current.stop();
            }
          }
        }

        volumeMonitorRef.current = requestAnimationFrame(monitorVolume);
      };

      monitorVolume();

      // Complete calibration after 1.5 seconds
      calibrationTimerRef.current = setTimeout(() => {
        if (volumeHistoryRef.current.length > 0) {
          const avgAmbient = volumeHistoryRef.current.reduce((s, v) => s + v, 0) / volumeHistoryRef.current.length;
          setAmbientLevel(avgAmbient);
          // console.debug(`Ambient RMS calibrated: ${avgAmbient.toFixed(4)}`);
        }
        setIsCalibrating(false);
      }, 1500);

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

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
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
      transcriptRef.current = fullTranscript;
      
      // Update last speech time when we get actual speech recognition results
      if (fullTranscript.trim()) {
        lastSpeechTimeRef.current = Date.now();
        // console.debug(`Speech recognized: "${fullTranscript.trim()}"`);
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

      // Safety net: if we still have transcript and not marked finished, finish now
      if (transcriptRef.current.trim() && !hasFinishedRef.current) {
        setHasFinished(true);
        hasFinishedRef.current = true;
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
      transcriptRef.current = '';
      setError(null);
      setHasFinished(false);
      hasFinishedRef.current = false;
      lastSpeechTimeRef.current = 0;
      
      // Initialize audio monitoring for volume-based silence detection
      initializeAudioMonitoring();
      
      recognitionRef.current.start();
    }
  }, [isListening, initializeAudioMonitoring]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setHasFinished(true);
      hasFinishedRef.current = true;
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