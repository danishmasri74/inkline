import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import { Note } from "@/types/Notes";

import Sidebar from "./Sidebar";
import Header from "./Header";
import NoteEditor from "./NoteEditor";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesPage({ session }: { session: Session }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    if (!selectedNoteId) return;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", selectedNoteId)
      .eq("user_id", userId);

    if (error) return console.error("Error deleting note:", error.message);

    setNotes((prev) => prev.filter((note) => note.id !== selectedNoteId));
    setSelectedNoteId(null);
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Sliding panel */}
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
        />
      </div>

      <div className="flex-1 p-4 md:p-6">
        {/* Mobile header with menu toggle */}
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
          onDeleteNote={handleDeleteNote}
          isDeleteDisabled={!selectedNoteId}
          isNewDisabled={notes.length >= noteLimit}
        />

        <div className="flex justify-center">
          <div className="w-full max-w-prose">
            <NoteEditor note={selectedNote} onUpdate={handleNoteUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
