import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  shareUrl,
  onCopyShareUrl,
  isCopyDisabled = true,
}: HeaderProps) {
  return (
    <header className="border-b pb-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Heading */}
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Your Notes
      </h1>

      {/* Actions */}
      <TooltipProvider>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
          {/* View All Notes */}
          {onDeselect && !isIndexPage && (
            <Button
              variant="secondary"
              onClick={onDeselect}
              className="w-full sm:w-auto"
            >
              View All Notes
            </Button>
          )}

          {/* New Note */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onNewNote}
                disabled={isNewDisabled}
                aria-label="Create a new note"
                className="w-full sm:w-auto"
              >
                + New Note
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
              className="w-full sm:w-auto"
            >
              {isShared ? "Unshare" : "Share"}
            </Button>
          )}

          {/* Archive */}
          <Button
            variant="secondary"
            onClick={onArchive}
            disabled={isArchiveDisabled}
            aria-label={
              showTableMode ? "Archive selected notes" : "Archive current note"
            }
            className="w-full sm:w-auto"
          >
            Archive
          </Button>
        </div>
      </TooltipProvider>
    </header>
  );
}
