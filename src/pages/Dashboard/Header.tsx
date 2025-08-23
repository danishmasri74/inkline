import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Archive, Share2, Eye } from "lucide-react";

type HeaderProps = {
  onNewNote: () => void;
  onArchive: () => void;
  isArchiveDisabled: boolean;
  isNewDisabled: boolean;
  noteLimitReachedMessage?: string;
  showTableMode?: boolean;
  onDeselect?: () => void;
  isIndexPage?: boolean;

  // Sharing
  onToggleShare?: () => void;
  isShared?: boolean;
  shareUrl?: string | null;
  onCopyShareUrl?: () => void;
  isCopyDisabled?: boolean;
};

export default function Header({
  onNewNote,
  onArchive,
  isArchiveDisabled,
  isNewDisabled,
  noteLimitReachedMessage,
  showTableMode,
  onDeselect,
  isIndexPage = false,
  onToggleShare,
  isShared = false,
}: HeaderProps) {
  return (
    <header className="border-b pb-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Heading */}
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        Your Notes
      </h1>

      {/* Actions */}
      <TooltipProvider>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {/* View All Notes */}
          {onDeselect && !isIndexPage && (
            <Button
              variant="ghost"
              onClick={onDeselect}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">View All</span>
            </Button>
          )}

          {/* New Note */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={onNewNote}
                disabled={isNewDisabled}
                aria-label="Create a new note"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Note</span>
              </Button>
            </TooltipTrigger>
            {isNewDisabled && noteLimitReachedMessage && (
              <TooltipContent>
                <span>{noteLimitReachedMessage}</span>
              </TooltipContent>
            )}
          </Tooltip>

          {/* Share */}
          {onToggleShare && (
            <Button
              variant={isShared ? "secondary" : "outline"}
              onClick={onToggleShare}
              aria-label={isShared ? "Unshare this note" : "Share this note"}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isShared ? "Unshare" : "Share"}
              </span>
            </Button>
          )}

          {/* Archive */}
          <Button
            variant="outline"
            onClick={onArchive}
            disabled={isArchiveDisabled}
            aria-label={
              showTableMode ? "Archive selected notes" : "Archive current note"
            }
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
        </div>
      </TooltipProvider>
    </header>
  );
}
