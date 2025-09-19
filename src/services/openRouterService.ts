interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

class OpenRouterService {
  private apiKey: string | null = null;
  private baseURL = 'https://openrouter.ai/api/v1';
  private readonly STORAGE_KEY = 'openrouter_api_key';
  private modelsCache: AIModel[] | null = null;
  private modelsCacheExpiry: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    // Check localStorage first, then environment variables
    this.apiKey = this.getStoredApiKey() || import.meta.env.VITE_OPENROUTER_API_KEY || null;
  }

  private getStoredApiKey(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  get hasApiKey(): boolean {
    return !!this.apiKey;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    try {
      localStorage.setItem(this.STORAGE_KEY, key);
    } catch (error) {
      console.warn('Failed to store API key in localStorage:', error);
    }
  }

  clearApiKey(): void {
    this.apiKey = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove API key from localStorage:', error);
    }
  }

  async getAllModels(): Promise<AIModel[]> {
    // Return cached models if still valid
    if (this.modelsCache && Date.now() < this.modelsCacheExpiry) {
      return this.modelsCache;
    }

    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Careless-Convo',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match our interface
      const models: AIModel[] = data.data.map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        architecture: model.architecture,
        pricing: {
          prompt: `$${(parseFloat(model.pricing.prompt) * 1000000).toFixed(2)}`,
          completion: `$${(parseFloat(model.pricing.completion) * 1000000).toFixed(2)}`
        },
        top_provider: model.top_provider,
        per_request_limits: model.per_request_limits
      }));

      // Cache the results
      this.modelsCache = models;
      this.modelsCacheExpiry = Date.now() + this.CACHE_DURATION;

      return models;
    } catch (error) {
      console.error('Failed to fetch models from OpenRouter:', error);
      // Fallback to popular models if API fails
      return this.getPopularModels();
    }
  }

  getPopularModels(): AIModel[] {
    return [
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        description: 'Latest GPT-4 with vision capabilities',
        context_length: 128000,
        architecture: {
          modality: 'text+vision',
          tokenizer: 'cl100k_base',
          instruct_type: 'none'
        },
        pricing: { prompt: '$5.00', completion: '$15.00' },
        top_provider: {
          max_completion_tokens: 4096,
          is_moderated: true
        }
      },
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Advanced reasoning and analysis',
        context_length: 200000,
        architecture: {
          modality: 'text+vision',
          tokenizer: 'claude',
          instruct_type: 'none'
        },
        pricing: { prompt: '$3.00', completion: '$15.00' },
        top_provider: {
          max_completion_tokens: 4096,
          is_moderated: true
        }
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective',
        context_length: 16385,
        architecture: {
          modality: 'text',
          tokenizer: 'cl100k_base',
          instruct_type: 'none'
        },
        pricing: { prompt: '$0.50', completion: '$1.50' },
        top_provider: {
          max_completion_tokens: 4096,
          is_moderated: true
        }
      }
    ];
  }

  async getModels(): Promise<AIModel[]> {
    try {
      return await this.getAllModels();
    } catch (error) {
      console.error('Error fetching models:', error);
      return this.getPopularModels();
    }
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    onError?: (error: string) => void,
    model = 'openai/gpt-4o'
  ): Promise<void> {
    // Demo mode - simulate streaming response
    if (!this.apiKey) {
      await this.simulateStreamingResponse(messages, onToken);
      return;
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Careless-Convo',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API Error (${response.status})`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorMessage;
        } catch {
          // Use default error message
        }
        
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                onToken(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
      console.error('OpenRouter API error:', errorMessage);
      onError?.(errorMessage);
      
      // Don't fallback to demo mode if we have an API key but got an error
      if (this.hasApiKey) {
        throw error;
      }
      
      // Only fallback to demo mode if no API key
      await this.simulateStreamingResponse(messages, onToken);
    }
  }

  private async simulateStreamingResponse(
    messages: ChatMessage[],
    onToken: (token: string) => void
  ): Promise<void> {
    const demoResponses = [
      "I understand you're speaking to me! This is a demo of Careless-Convo, your voice-driven AI companion. To unlock real AI conversations, add your OpenRouter API key as VITE_OPENROUTER_API_KEY in your environment.",
      "That's an interesting point you've made. I'm currently running in demo mode - connect your OpenRouter API key to chat with GPT-4, Claude, and other advanced models.",
      "I noticed you're testing the voice features. The speech recognition is working great! Add an OpenRouter API key to enable real AI conversations with voice input and response.",
      "Thanks for trying out Careless-Convo! Add your OpenRouter API key to unlock the full conversational AI experience with your choice of models."
    ];

    const response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
    
    // Simulate typing effect
    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
      onToken(response[i]);
    }
  }
}

export const openRouterService = new OpenRouterService();