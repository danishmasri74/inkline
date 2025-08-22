import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

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
  const [copied, setCopied] = useState(false);
  const userId = session.user.id;
  const noteLimit = 100;

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("archived", false) // ✅ only fetch active notes
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error.message);
      } else {
        setNotes(data || []);
        if (data && data.length > 0) {
          if (id) {
            const exists = data.find((n) => n.id === id);
            setSelectedNoteId(exists ? id : data[0].id);
          } else {
            setSelectedNoteId(data[0].id);
          }
        }
      }
      setLoading(false);
    };

    fetchNotes();
  }, [userId, id]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;

  const shareUrl = selectedNote?.is_public
    ? `${window.location.origin}/share/${selectedNote.share_id}`
    : null;

  const handleSelectNote = (noteId: string | null) => {
    setSelectedNoteId(noteId);
    if (noteId) {
      navigate(`/dashboard/note/${noteId}`);
    } else {
      navigate(`/dashboard`);
    }
  };

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
    handleSelectNote(data.id);
  };

  // ✅ Archive single note
  const handleArchiveNote = async () => {
    const idsToArchive = selectedNoteId
      ? [selectedNoteId]
      : selectedTableNoteIds;
    if (idsToArchive.length === 0) return;

    const { error } = await supabase
      .from("notes")
      .update({ archived: true })
      .in("id", idsToArchive)
      .eq("user_id", userId);

    if (error) return console.error("Error archiving note(s):", error.message);

    setNotes((prev) => prev.filter((note) => !idsToArchive.includes(note.id)));

    if (idsToArchive.includes(selectedNoteId!)) {
      handleSelectNote(null);
    }

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

  const handleToggleShare = async () => {
    if (!selectedNote) return;

    const newStatus = !selectedNote.is_public;
    const { data, error } = await supabase
      .from("notes")
      .update({ is_public: newStatus })
      .eq("id", selectedNote.id)
      .select()
      .single();

    if (error) return console.error("Error toggling share:", error.message);

    setNotes((prev) =>
      prev.map((n) => (n.id === selectedNote.id ? { ...n, ...data } : n))
    );
    setCopied(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
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
                handleSelectNote(id);
                setMobileSidebarOpen(false);
              }}
              onLogout={handleLogout}
              userEmail={session.user.email!}
              onClose={() => setMobileSidebarOpen(false)}
              setNotes={setNotes}
            />
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <Sidebar
          notes={notes}
          selectedId={selectedNoteId}
          onSelect={handleSelectNote}
          onLogout={handleLogout}
          userEmail={session.user.email!}
          onDeselect={() => handleSelectNote(null)}
          setNotes={setNotes}
        />
      </div>

      <div className="flex-1 p-4 md:p-6 relative md:ml-64">
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
          onArchive={handleArchiveNote} // ✅ now archives instead of deletes
          isArchiveDisabled={
            selectedNote ? !selectedNoteId : selectedTableNoteIds.length === 0
          }
          isNewDisabled={notes.length >= noteLimit}
          noteLimitReachedMessage="You’ve reached the maximum of 100 notes."
          onDeselect={() => handleSelectNote(null)}
          isIndexPage={!selectedNoteId}
          onToggleShare={selectedNote ? handleToggleShare : undefined}
          isShared={selectedNote?.is_public}
          shareUrl={shareUrl}
          isCopyDisabled={!shareUrl}
          onCopyShareUrl={async () => {
            if (shareUrl) {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
        />

        {/* Share Link Panel */}
        {shareUrl && (
          <div className="flex items-center justify-between gap-2 mb-4 p-3 border rounded-lg bg-muted">
            <span className="truncate text-sm">{shareUrl}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}

        {selectedNote ? (
          <div className="flex justify-center">
            <div className="w-full max-w-[85ch]">
              <NoteEditor note={selectedNote} onUpdate={handleNoteUpdate} />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <NotesIndex
              selectedIds={selectedTableNoteIds}
              setSelectedIds={setSelectedTableNoteIds}
              notes={notes}
              onSelectNote={handleSelectNote}
            />
          </div>
        )}
      </div>
    </div>
  );
}
