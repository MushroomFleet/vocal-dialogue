import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Play, Square, Settings } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface TTSSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TTSSettings = ({ open, onOpenChange }: TTSSettingsProps) => {
  const { 
    settings, 
    updateSettings, 
    voices, 
    isSupported, 
    speak, 
    stop, 
    isSpeaking 
  } = useTextToSpeech();
  
  const [testText] = useState("Hello! This is a test of the text-to-speech feature. How does it sound?");

  const handleTestSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(testText);
    }
  };

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              Text-to-Speech Not Supported
            </DialogTitle>
            <DialogDescription>
              Your browser doesn't support text-to-speech functionality.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Text-to-Speech Settings
          </DialogTitle>
          <DialogDescription>
            Configure voice settings for AI responses. The AI will speak responses automatically when enabled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enable/Disable TTS */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tts-enabled" className="text-base">
                Enable Text-to-Speech
              </Label>
              <p className="text-sm text-muted-foreground">
                AI responses will be spoken aloud
              </p>
            </div>
            <Switch
              id="tts-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Voice Selection */}
              <div className="space-y-2">
                <Label htmlFor="voice-select">Voice</Label>
                <Select
                  value={settings.voiceId}
                  onValueChange={(voiceId) => updateSettings({ voiceId })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {voices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        <div className="flex flex-col">
                          <span>{voice.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {voice.lang} {voice.localService ? '(Local)' : '(Online)'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speech Rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="rate-slider">Speech Rate</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.rate.toFixed(1)}x
                  </span>
                </div>
                <Slider
                  id="rate-slider"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[settings.rate]}
                  onValueChange={([rate]) => updateSettings({ rate })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="pitch-slider">Pitch</Label>
                  <span className="text-sm text-muted-foreground">
                    {settings.pitch.toFixed(1)}
                  </span>
                </div>
                <Slider
                  id="pitch-slider"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[settings.pitch]}
                  onValueChange={([pitch]) => updateSettings({ pitch })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="volume-slider">Volume</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.volume * 100)}%
                  </span>
                </div>
                <Slider
                  id="volume-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[settings.volume]}
                  onValueChange={([volume]) => updateSettings({ volume })}
                  className="w-full"
                />
              </div>

              {/* Test Voice */}
              <div className="space-y-2">
                <Label>Test Voice</Label>
                <Button
                  onClick={handleTestSpeak}
                  variant="outline"
                  className="w-full"
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Test
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Test Voice
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            <p>• TTS will automatically stop when you start speaking</p>
            <p>• Settings are saved locally in your browser</p>
            <p>• Uses your system's built-in voices (Windows SAPI)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};