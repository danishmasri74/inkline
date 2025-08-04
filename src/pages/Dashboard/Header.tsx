import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HeaderProps = {
  onNewNote: () => void;
  onDelete: () => void;
  isDeleteDisabled: boolean;
  isNewDisabled: boolean;
  noteLimitReachedMessage?: string;
  showTableMode?: boolean;
  onDeselect?: () => void; // <-- Added this prop
  isIndexPage?: boolean;   // <-- Optional prop to conditionally hide button
};

export default function Header({
  onNewNote,
  onDelete,
  isDeleteDisabled,
  isNewDisabled,
  noteLimitReachedMessage,
  showTableMode,
  onDeselect,
  isIndexPage = false, // Default to false
}: HeaderProps) {
  return (
    <header className="border-b pb-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Heading */}
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Your Notes
      </h1>

      {/* Actions with TooltipProvider */}
      <TooltipProvider>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto">
          {/* View All Notes Button (only show when not on Index) */}
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
