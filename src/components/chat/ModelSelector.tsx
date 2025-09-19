import { Check, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { type AIModel } from '@/services/openRouterService';

interface ModelSelectorProps {
  selectedModel: string;
  availableModels: AIModel[];
  onModelChange: (model: string) => void;
  hasApiKey: boolean;
  onOpenApiKeySettings: () => void;
}

export const ModelSelector = ({ selectedModel, availableModels, onModelChange, hasApiKey, onOpenApiKeySettings }: ModelSelectorProps) => {
  const currentModel = availableModels.find(model => model.id === selectedModel);

  if (!hasApiKey) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          Demo Mode
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenApiKeySettings}
          className="text-primary hover:text-primary-foreground"
        >
          <Zap className="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between gap-2 min-w-[200px]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="truncate">{currentModel?.name || 'Select Model'}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>AI Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex items-start gap-3 p-3 cursor-pointer"
          >
            <div className="flex items-center justify-center w-5 h-5 mt-0.5">
              {selectedModel === model.id && <Check className="w-4 h-4" />}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{model.name}</span>
                <div className="flex gap-1 text-xs text-muted-foreground">
                  <span>{model.pricing.prompt}/1M</span>
                  <span>•</span>
                  <span>{model.pricing.completion}/1M</span>
                </div>
              </div>
              {model.description && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {model.description}
                </div>
              )}
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{model.context_length?.toLocaleString()} ctx</span>
                {model.architecture?.modality && (
                  <>
                    <span>•</span>
                    <span>{model.architecture.modality}</span>
                  </>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="p-2 text-xs text-muted-foreground">
          Pricing shown per 1M input tokens
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};