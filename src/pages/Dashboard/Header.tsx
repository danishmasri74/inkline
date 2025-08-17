import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  onNewNote: () => void;
  onDelete: () => void;
  isDeleteDisabled: boolean;
  isNewDisabled: boolean;
  noteLimitReachedMessage?: string;
  showTableMode?: boolean;
  onDeselect?: () => void;
  isIndexPage?: boolean;

  onToggleShare?: () => void;
  isShared?: boolean;
  shareUrl?: string | null;
};

export default function Header({
  onNewNote,
  onDelete,
  isDeleteDisabled,
  isNewDisabled,
  noteLimitReachedMessage,
  showTableMode,
  onDeselect,
  isIndexPage = false,
  onToggleShare,
  isShared = false,
  shareUrl,
}: HeaderProps) {
  return (
    <header className="border-b pb-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Your Notes
      </h1>

      <TooltipProvider>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
          {onDeselect && !isIndexPage && (
            <Button
              variant="secondary"
              onClick={onDeselect}
              className="w-full sm:w-auto"
            >
              View All Notes
            </Button>
          )}

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

          {onToggleShare && (
            <>
              {isShared && shareUrl ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto"
                      aria-label="Share options"
                    >
                      Shared
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem
                      onClick={async () => {
                        await navigator.clipboard.writeText(shareUrl);
                      }}
                    >
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onToggleShare}>
                      Stop Sharing
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  onClick={onToggleShare}
                  className="w-full sm:w-auto"
                  aria-label="Share this note"
                >
                  Share
                </Button>
              )}
            </>
          )}

          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleteDisabled}
            aria-label={
              showTableMode ? "Delete selected notes" : "Delete current note"
            }
            className="w-full sm:w-auto"
          >
            Delete
          </Button>
        </div>
      </TooltipProvider>
    </header>
  );
}
