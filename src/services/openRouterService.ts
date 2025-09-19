// Placeholder OpenRouter service - will be enhanced when API key is available
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class OpenRouterService {
  private apiKey: string | null = null;
  private baseURL = 'https://openrouter.ai/api/v1';

  constructor() {
    // In a real implementation, this would come from environment variables
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || null;
  }

  async generateStreamingResponse(
    messages: ChatMessage[],
    onToken: (token: string) => void,
    model = 'openai/gpt-3.5-turbo'
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
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
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
      console.error('Streaming error:', error);
      // Fallback to demo mode
      await this.simulateStreamingResponse(messages, onToken);
    }
  }

  private async simulateStreamingResponse(
    messages: ChatMessage[],
    onToken: (token: string) => void
  ): Promise<void> {
    const lastMessage = messages[messages.length - 1];
    const demoResponses = [
      "I understand you're speaking to me! This is a demo of Careless-Convo, your voice-driven AI companion. I can hear your speech and respond naturally through text-to-speech.",
      "That's an interesting point you've made. I'm currently running in demo mode, but once you connect an OpenRouter API key, I'll be powered by advanced language models for more sophisticated conversations.",
      "I noticed you're testing the voice features. The speech recognition is working great! Soon you'll be able to have seamless voice conversations with AI models through the OpenRouter integration.",
      "Thanks for trying out Careless-Convo! This application demonstrates the future of voice-driven AI interactions. Feel free to speak naturally - I'm listening and ready to respond."
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