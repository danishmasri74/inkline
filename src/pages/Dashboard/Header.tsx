import { Button } from "@/components/ui/button";

type HeaderProps = {
  onNewNote: () => void;
  onDeleteNote: () => void;
  isDeleteDisabled: boolean;
  isNewDisabled: boolean;
};

export default function Header({
  onNewNote,
  onDeleteNote,
  isDeleteDisabled,
  isNewDisabled,
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
          onClick={onDeleteNote}
          disabled={isDeleteDisabled}
          className="w-full sm:w-auto"
        >
          Delete
        </Button>
      </div>
      {isNewDisabled && (
        <p className="text-xs text-red-500 text-center sm:text-right">
          You’ve reached the maximum of 100 notes.
        </p>
      )}
    </div>
  );
}
