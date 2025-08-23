import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArchiveIcon, RotateCcwIcon, TrashIcon } from "lucide-react";
import { Note } from "@/types/Notes";
import { supabase } from "@/lib/supabaseClient";

type ArchiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
};

export default function ArchiveDialog({
  open,
  onOpenChange,
  setNotes,
}: ArchiveDialogProps) {
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      supabase
        .from("notes")
        .select("*")
        .eq("archived", true)
        .order("updated_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setArchivedNotes(data as Note[]);
        });
    }
  }, [open]);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return archivedNotes;
    return archivedNotes.filter((note) =>
      (note.title || "Untitled").toLowerCase().includes(search.toLowerCase())
    );
  }, [search, archivedNotes]);

  const restoreNote = async (note: Note) => {
    await supabase.from("notes").update({ archived: false }).eq("id", note.id);
    setArchivedNotes((prev) => prev.filter((n) => n.id !== note.id));
    setNotes((prev) => [{ ...note, archived: false }, ...prev]);
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setArchivedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 rounded-xl border bg-background hover:bg-accent/40"
        >
          <ArchiveIcon className="h-4 w-4" />
          View Archived
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md rounded-2xl border">
        <DialogHeader>
          <DialogTitle className="text-base">Archived Notes</DialogTitle>
        </DialogHeader>

        {/* Searchbar */}
        <Input
          placeholder="Search archived notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 rounded-xl"
        />

        {/* List */}
        <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
          {filteredNotes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {archivedNotes.length === 0
                ? "No archived notes."
                : "No notes match your search."}
            </p>
          )}
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-muted/60"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 shrink-0" />
                <span className="truncate">{note.title || "Untitled"}</span>
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => restoreNote(note)}
                  title="Restore"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                  onClick={() => deleteNote(note.id)}
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
