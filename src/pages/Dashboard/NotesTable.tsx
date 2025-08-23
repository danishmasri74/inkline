import NotesIndex from "./NotesIndex";
import { Note } from "@/types/Notes";
import { Dispatch, SetStateAction } from "react";

type NotesTableProps = {
  notes: Note[];
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  onSelectNote: (id: string) => void;
};

export default function NotesTable({
  notes,
  selectedIds,
  setSelectedIds,
  onSelectNote,
}: NotesTableProps) {
  return (
    <div className="w-full mt-6">
      <h2 className="text-sm font-medium mb-2">All Notes</h2>
      <div className="border rounded-lg">
        <NotesIndex
          notes={notes}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onSelectNote={onSelectNote}
        />
      </div>
    </div>
  );
}
