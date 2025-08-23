// components/DashboardLayout.tsx
import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";
import Header from "./Header";
import type { Session } from "@supabase/supabase-js";
import { Note } from "@/types/Notes";

export default function DashboardLayout({
  session,
  notes,
  setNotes,
  onCreateNote,
  onLogout,
  children,
}: {
  session: Session;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  onCreateNote: () => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-background shadow-lg">
            <Sidebar
              notes={notes}
              selectedId={null}
              onSelect={() => setMobileSidebarOpen(false)}
              onLogout={onLogout}
              userEmail={session.user.email!}
              onClose={() => setMobileSidebarOpen(false)}
              setNotes={setNotes}
              onCreateNote={onCreateNote}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          notes={notes}
          selectedId={null}
          onSelect={() => {}}
          onLogout={onLogout}
          userEmail={session.user.email!}
          setNotes={setNotes}
          onCreateNote={onCreateNote}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 relative md:ml-30">
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

        {/* Shared Header */}
        <Header
          onNewNote={onCreateNote}
          onArchive={() => {}}
          isArchiveDisabled
          isNewDisabled={false}
          noteLimitReachedMessage=""
          onDeselect={() => {}}
          isIndexPage={false}
        />

        <div className="flex justify-center">
          <div className="w-full max-w-[85ch]">{children}</div>
        </div>
      </div>
    </div>
  );
}
