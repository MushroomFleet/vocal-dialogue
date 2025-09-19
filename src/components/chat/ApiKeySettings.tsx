import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, TestTube, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { openRouterService } from '@/services/openRouterService';
import { useToast } from '@/hooks/use-toast';

interface ApiKeySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeyUpdate: () => void;
}

export const ApiKeySettings = ({ open, onOpenChange, onApiKeyUpdate }: ApiKeySettingsProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenRouter API key.",
        variant: "destructive",
      });
      return;
    }

    openRouterService.setApiKey(apiKey.trim());
    onApiKeyUpdate();
    toast({
      title: "API Key Saved",
      description: "Your OpenRouter API key has been saved securely in your browser.",
    });
    onOpenChange(false);
    setApiKey('');
    setTestResult(null);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "No API Key",
        description: "Please enter an API key to test.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      // Test the key with a simple request
      const tempService = new (openRouterService.constructor as any)();
      tempService.setApiKey(apiKey.trim());
      
      let testPassed = false;
      await tempService.generateStreamingResponse(
        [{ role: 'user', content: 'Hi' }],
        () => { testPassed = true; },
        (error: string) => { throw new Error(error); }
      );

      setTestResult('success');
      toast({
        title: "Connection Successful",
        description: "Your API key is valid and working!",
      });
    } catch (error) {
      setTestResult('error');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect with this API key.",
        variant: "destructive",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleClearKey = () => {
    openRouterService.clearApiKey();
    onApiKeyUpdate();
    toast({
      title: "API Key Removed",
      description: "Your API key has been removed from local storage.",
    });
    onOpenChange(false);
    setApiKey('');
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            OpenRouter API Key
          </DialogTitle>
          <DialogDescription>
            Enter your OpenRouter API key to unlock real AI conversations with GPT-4, Claude, and other models.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              testResult === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {testResult === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm">
                {testResult === 'success' 
                  ? 'API key is valid and working!' 
                  : 'Failed to connect with this API key.'}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleTestKey}
              disabled={isTestingKey || !apiKey.trim()}
              variant="outline"
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTestingKey ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              onClick={handleSaveKey}
              disabled={!apiKey.trim()}
              className="flex-1"
            >
              Save Key
            </Button>
          </div>

          {openRouterService.hasApiKey && (
            <Button
              onClick={handleClearKey}
              variant="destructive"
              className="w-full"
            >
              Remove Saved Key
            </Button>
          )}

          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-500" />
              <p>Your API key is stored securely in your browser's local storage and never sent to our servers.</p>
            </div>
            <p>
              Don't have an API key?{' '}
              <a 
                href="https://openrouter.ai/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Get one from OpenRouter
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};