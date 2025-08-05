import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { Note } from "@/types/Notes";

import Sidebar from "./Sidebar";
import Header from "./Header";
import NoteEditor from "./NoteEditor";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotesIndex from "./NotesIndex";

export default function NotesPage({ session }: { session: Session }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedTableNoteIds, setSelectedTableNoteIds] = useState<string[]>(
    []
  );
  const [refetchTableNotes, setRefetchTableNotes] = useState<() => void>(
    () => () => {}
  );

  const noteEditorRef = useRef<{
    focusNextLine: () => void;
    focusPrevLine: () => void;
    getCurrentLine: () => number;
    getLineCount: () => number;
  } | null>(null);

  const userId = session.user.id;
  const noteLimit = 100;

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error.message);
      } else {
        setNotes(data || []);
        if (data && data.length > 0) setSelectedNoteId(data[0].id);
      }
      setLoading(false);
    };

    fetchNotes();
  }, [userId]);

  const handleNewNote = async () => {
    if (notes.length >= noteLimit) {
      alert("You have reached the maximum of 100 notes.");
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({ title: "Untitled", body: "", user_id: userId })
      .select()
      .single();

    if (error) return console.error("Error creating note:", error.message);

    setNotes((prev) => [data, ...prev]);
    setSelectedNoteId(data.id);
  };

  const handleDeleteNote = async () => {
    const idsToDelete = selectedNoteId
      ? [selectedNoteId]
      : selectedTableNoteIds;

    if (idsToDelete.length === 0) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .in("id", idsToDelete)
      .eq("user_id", userId);

    if (error) return console.error("Error deleting note(s):", error.message);

    setNotes((prev) => prev.filter((note) => !idsToDelete.includes(note.id)));

    if (idsToDelete.includes(selectedNoteId!)) {
      setSelectedNoteId(null);
    }

    setSelectedTableNoteIds([]);
    refetchTableNotes();
  };

  const handleDeleteSelectedNotes = async () => {
    if (selectedTableNoteIds.length === 0) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .in("id", selectedTableNoteIds)
      .eq("user_id", userId);

    if (error)
      return console.error("Error deleting selected notes:", error.message);

    setNotes((prev) =>
      prev.filter((note) => !selectedTableNoteIds.includes(note.id))
    );
    setSelectedTableNoteIds([]);
    refetchTableNotes();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNoteUpdate = (updated: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
    );
  };

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-background shadow-lg transition-transform duration-300 ease-in-out transform translate-x-0">
            <Sidebar
              notes={notes}
              selectedId={selectedNoteId}
              onSelect={(id) => {
                setSelectedNoteId(id);
                setMobileSidebarOpen(false);
              }}
              onLogout={handleLogout}
              loading={loading}
              userEmail={session.user.email!}
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          notes={notes}
          selectedId={selectedNoteId}
          onSelect={setSelectedNoteId}
          onLogout={handleLogout}
          loading={loading}
          userEmail={session.user.email!}
          onDeselect={() => setSelectedNoteId(null)}
        />
      </div>

      <div className="flex-1 p-4 md:p-6 relative">
        {/* Mobile header */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <Header
          onNewNote={handleNewNote}
          onDelete={selectedNote ? handleDeleteNote : handleDeleteSelectedNotes}
          isDeleteDisabled={
            selectedNote ? !selectedNoteId : selectedTableNoteIds.length === 0
          }
          isNewDisabled={notes.length >= noteLimit}
          noteLimitReachedMessage="You’ve reached the maximum of 100 notes."
          onDeselect={() => setSelectedNoteId(null)}
          isIndexPage={!selectedNoteId}
        />

        {selectedNote ? (
          <>
            <div className="flex justify-center">
              <div className="w-full max-w-[85ch]">
                <NoteEditor
                  ref={noteEditorRef}
                  note={selectedNote}
                  onUpdate={handleNoteUpdate}
                />
              </div>
            </div>

            {/* Floating line navigation buttons (visible only on desktop) */}
            <div
              className="fixed z-50 hidden md:flex flex-col items-center gap-2 p-2 bg-white border border-neutral-200 rounded-lg shadow-md"
              style={{
                bottom: "1.5rem",
                right: "1.5rem",
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => noteEditorRef.current?.focusPrevLine()}
                disabled={noteEditorRef.current?.getCurrentLine?.() === 0}
                className="w-9 h-9 text-base border border-neutral-300 rounded-md bg-neutral-50 text-neutral-700 hover:bg-neutral-100 active:translate-y-px active:shadow-inner transition-all"
              >
                ←
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => noteEditorRef.current?.focusNextLine()}
                disabled={
                  noteEditorRef.current?.getCurrentLine?.() ===
                  (noteEditorRef.current?.getLineCount?.() ?? 1) - 1
                }
                className="w-9 h-9 text-base border border-neutral-300 rounded-md bg-neutral-50 text-neutral-700 hover:bg-neutral-100 active:translate-y-px active:shadow-inner transition-all"
              >
                →
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full">
            <NotesIndex
              selectedIds={selectedTableNoteIds}
              setSelectedIds={setSelectedTableNoteIds}
              notes={notes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
