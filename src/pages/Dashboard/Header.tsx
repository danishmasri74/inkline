import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Archive, Share2, Home } from "lucide-react";

type HeaderProps = {
  onArchive: () => void;
  isArchiveDisabled: boolean;
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
  onArchive,
  isArchiveDisabled,
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
          {/* Home */}
          {onDeselect && !isIndexPage && (
            <Button
              variant="ghost"
              onClick={onDeselect}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          )}

          {/* Archive */}
          {!isIndexPage && (
            <Button
              variant="outline"
              onClick={onArchive}
              disabled={isArchiveDisabled}
              aria-label={
                showTableMode
                  ? "Archive selected notes"
                  : "Archive current note"
              }
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Archive</span>
            </Button>
          )}

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
        </div>
      </TooltipProvider>
    </header>
  );
}
