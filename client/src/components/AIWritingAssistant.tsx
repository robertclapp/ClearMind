import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';

interface AIWritingAssistantProps {
  onInsert: (text: string) => void;
  selectedText?: string;
}

/**
 * AIWritingAssistant provides AI-powered writing help.
 * 
 * Features:
 * - Continue writing
 * - Improve writing
 * - Summarize
 * - Expand
 * - Change tone
 * - Fix grammar
 */
export function AIWritingAssistant({ onInsert, selectedText = '' }: AIWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<string>('continue');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');

  const aiMutation = trpc.ai.improveWriting.useMutation({
    onSuccess: (data: any) => {
      setResult(data.improved);
    },
    onError: (error: any) => {
      toast.error(`AI error: ${error.message}`);
    },
  });

  const handleGenerate = async () => {
    if (!selectedText && action !== 'custom') {
      toast.error('Please select some text first');
      return;
    }

    // Map action to prompt
    let prompt = '';
    switch (action) {
      case 'continue':
        prompt = `Continue writing this text naturally: ${selectedText}`;
        break;
      case 'improve':
        prompt = `Improve this writing: ${selectedText}`;
        break;
      case 'summarize':
        prompt = `Summarize this text concisely: ${selectedText}`;
        break;
      case 'expand':
        prompt = `Expand on this text with more details: ${selectedText}`;
        break;
      case 'professional':
        prompt = `Rewrite this in a professional tone: ${selectedText}`;
        break;
      case 'casual':
        prompt = `Rewrite this in a casual, friendly tone: ${selectedText}`;
        break;
      case 'grammar':
        prompt = `Fix grammar and spelling in this text: ${selectedText}`;
        break;
      case 'custom':
        prompt = `${customPrompt}\n\nText: ${selectedText}`;
        break;
    }

    await aiMutation.mutateAsync({
      text: selectedText,
      instruction: prompt,
    });
  };

  const handleInsert = () => {
    onInsert(result);
    setIsOpen(false);
    setResult('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Writing Assistant</DialogTitle>
          <DialogDescription>
            Let AI help you write better content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What would you like to do?</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="continue">Continue writing</SelectItem>
                <SelectItem value="improve">Improve writing</SelectItem>
                <SelectItem value="summarize">Summarize</SelectItem>
                <SelectItem value="expand">Expand</SelectItem>
                <SelectItem value="professional">Make more professional</SelectItem>
                <SelectItem value="casual">Make more casual</SelectItem>
                <SelectItem value="grammar">Fix grammar</SelectItem>
                <SelectItem value="custom">Custom prompt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Text */}
          {selectedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected text:</label>
              <div className="p-3 bg-muted rounded-lg text-sm max-h-32 overflow-y-auto">
                {selectedText}
              </div>
            </div>
          )}

          {/* Custom Prompt */}
          {action === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom instructions:</label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Tell the AI what you want to do..."
                rows={3}
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={aiMutation.isPending}
            className="w-full"
          >
            {aiMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Result:</label>
              <div className="p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                <Streamdown>{result}</Streamdown>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {result && (
            <Button onClick={handleInsert}>
              Insert into document
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
