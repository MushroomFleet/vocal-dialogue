import { Check, ChevronDown, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useState } from 'react';

interface ModelSelectorProps {
  selectedModel: string;
  availableModels: AIModel[];
  onModelChange: (model: string) => void;
  hasApiKey: boolean;
  onOpenApiKeySettings: () => void;
}

export const ModelSelector = ({ selectedModel, availableModels, onModelChange, hasApiKey, onOpenApiKeySettings }: ModelSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const currentModel = availableModels.find(model => model.id === selectedModel);

  // Filter models based on search term
  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

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
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto bg-popover border shadow-md z-50">
        <DropdownMenuLabel className="text-sm">AI Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-64 overflow-y-auto">
          {filteredModels.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No models found matching "{searchTerm}"
            </div>
          ) : (
            filteredModels.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className="flex items-start gap-2 p-2 cursor-pointer hover:bg-accent"
            >
              <div className="flex items-center justify-center w-4 h-4 mt-0.5">
                {selectedModel === model.id && <Check className="w-3 h-3" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{model.name}</span>
                  <div className="flex gap-1 text-xs text-muted-foreground">
                    <span>{model.pricing.prompt}</span>
                    <span>•</span>
                    <span>{model.pricing.completion}</span>
                  </div>
                </div>
                {model.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
          ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};