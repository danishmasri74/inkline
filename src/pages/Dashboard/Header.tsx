import { Button } from "@/components/ui/button";

type HeaderProps = {
  onNewNote: () => void;
  onDelete: () => void;
  isDeleteDisabled: boolean;
  isNewDisabled: boolean;
  noteLimitReachedMessage?: string;
  showTableMode?: boolean;
};

export default function Header({
  onNewNote,
  onDelete,
  isDeleteDisabled,
  isNewDisabled,
  noteLimitReachedMessage,
  showTableMode,
}: HeaderProps) {
  return (
    <div className="border-b pb-3 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
        Your Notes
      </h1>
      <div className="flex gap-2 justify-center sm:justify-end flex-wrap">
        <Button
          variant="outline"
          onClick={onNewNote}
          disabled={isNewDisabled}
          className="w-full sm:w-auto"
        >
          + New Note
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleteDisabled}
          title={showTableMode ? "Delete selected notes" : "Delete this note"}
          className="w-full sm:w-auto"
        >
          Delete
        </Button>
      </div>
      {isNewDisabled && noteLimitReachedMessage && (
        <p className="text-xs text-red-500 text-center sm:text-right">
          {noteLimitReachedMessage}
        </p>
      )}
    </div>
  );
}
