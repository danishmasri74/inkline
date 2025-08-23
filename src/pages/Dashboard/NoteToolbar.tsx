import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Minus,
  Plus,
  Loader2,
  Check,
  Download,
} from "lucide-react";

type NoteToolbarProps = {
  formatText: (command: string) => void;
  decreaseFontSize: () => void;
  increaseFontSize: () => void;
  fontSize: "smallest" | "small" | "regular" | "big" | "biggest";
  saveStatus: "idle" | "saving" | "saved";
  onDownload: () => void;
  canDownload: boolean;
};

export default function NoteToolbar({
  formatText,
  decreaseFontSize,
  increaseFontSize,
  fontSize,
  saveStatus,
  onDownload,
  canDownload,
}: NoteToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => formatText("bold")}
              >
                <Bold size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => formatText("italic")}
              >
                <Italic size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => formatText("underline")}
              >
                <Underline size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => formatText("strikeThrough")}
              >
                <Strikethrough size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseFontSize}
                disabled={fontSize === "smallest"}
              >
                <Minus size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrease font size</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseFontSize}
                disabled={fontSize === "biggest"}
              >
                <Plus size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Increase font size</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center gap-3">
        {saveStatus === "saving" && (
          <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
        )}
        {saveStatus === "saved" && (
          <Check className="w-4 h-4 text-green-500" />
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                disabled={!canDownload}
                className="flex items-center gap-1"
              >
                <Download size={16} /> .txt
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download as text file</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
