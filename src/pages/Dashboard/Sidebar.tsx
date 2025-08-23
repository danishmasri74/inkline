import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Note } from "@/types/Notes";
import { isToday, isYesterday } from "date-fns";
import inklineIcon from "@/assets/InkLine.png";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ArchiveIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ArchiveDialog from "./ArchiveDialog";

type SidebarProps = {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLogout: () => void;
  userEmail: string;
  onClose?: () => void;
  onDeselect?: () => void;
  onCreateNote?: () => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
};

const getInitial = (email: string) => email?.charAt(0)?.toUpperCase() ?? "?";

export default function Sidebar({
  notes,
  selectedId,
  onSelect,
  onLogout,
  userEmail,
  onClose,
  onDeselect,
  onCreateNote,
  setNotes,
}: SidebarProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [openArchive, setOpenArchive] = useState(false);

  useEffect(() => {
    if (openArchive) {
      supabase
        .from("notes")
        .select("*")
        .eq("archived", true)
        .order("updated_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setArchivedNotes(data as Note[]);
        });
    }
  }, [openArchive]);

  const { todayNotes, yesterdayNotes, olderNotes } = useMemo(() => {
    const today: Note[] = [];
    const yesterday: Note[] = [];
    const older: Note[] = [];
    for (const note of notes) {
      if (note.archived) continue;
      const updatedAt = new Date(note.updated_at);
      if (isToday(updatedAt)) today.push(note);
      else if (isYesterday(updatedAt)) yesterday.push(note);
      else older.push(note);
    }
    return { todayNotes: today, yesterdayNotes: yesterday, olderNotes: older };
  }, [notes]);

  const sections = useMemo(() => {
    const data = [];
    if (todayNotes.length) data.push({ label: "Today", notes: todayNotes });
    if (yesterdayNotes.length)
      data.push({ label: "Yesterday", notes: yesterdayNotes });
    if (olderNotes.length) data.push({ label: "Older", notes: olderNotes });
    return data;
  }, [todayNotes, yesterdayNotes, olderNotes]);

  const flatList = useMemo(() => {
    const list: { type: "section" | "note"; label?: string; note?: Note }[] =
      [];
    for (const section of sections) {
      list.push({ type: "section", label: section.label });
      section.notes.forEach((note) => list.push({ type: "note", note }));
    }
    return list;
  }, [sections]);

  const rowVirtualizer = useVirtualizer({
    count: flatList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 8,
  });

  return (
    <aside className="w-full md:w-64 h-[100dvh] flex flex-col bg-background font-typewriter border-r border-border z-50 md:fixed md:left-0 md:top-0">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 shrink-0 select-none cursor-pointer hover:bg-accent/30 transition-colors"
        role="button"
        onClick={onDeselect}
      >
        <img
          src={inklineIcon}
          alt="InkLine Logo"
          className="h-10 w-10 rounded-lg"
        />
        <h2 className="text-lg font-semibold tracking-wide">InkLine</h2>
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="ml-auto md:hidden"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Notes list (scrollable only) */}
      <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar">
        {!notes.length ? (
          <div className="flex flex-col items-center justify-center text-sm text-muted-foreground p-6">
            <p className="mb-3">You don’t have any notes yet.</p>
            {onCreateNote && (
              <Button size="sm" onClick={onCreateNote}>
                Create a Note
              </Button>
            )}
          </div>
        ) : (
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            className="relative w-full"
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = flatList[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 right-0"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {item.type === "section" ? (
                    <div className="px-4 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground bg-muted sticky top-0 z-10">
                      {item.label}
                    </div>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className={`group w-full flex items-center justify-between px-4 py-2 text-sm rounded-md transition-colors ${
                        item.note!.id === selectedId
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => onSelect(item.note!.id)}
                    >
                      <span className="truncate">
                        {item.note!.title || "Untitled"}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition h-6 w-6"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await supabase
                              .from("notes")
                              .update({ archived: true })
                              .eq("id", item.note!.id);

                            setNotes((prev) =>
                              prev.filter((n) => n.id !== item.note!.id)
                            );
                            setArchivedNotes((prev) => [
                              { ...item.note!, archived: true },
                              ...prev,
                            ]);
                            onDeselect?.();
                          } catch (err) {
                            console.error("Failed to archive note:", err);
                          }
                        }}
                      >
                        <ArchiveIcon className="h-4 w-4" />
                      </Button>
                    </motion.button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer (always visible) */}
      <Separator />
      <div className="p-4 space-y-4 shrink-0 bg-background">
        {/* Notes usage progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Notes usage</span>
            <span>{notes.length}/100</span>
          </div>
          <Progress
            value={(notes.length / 100) * 100}
            className={`h-2 rounded-full ${
              notes.length >= 90
                ? "bg-destructive/20 [&>div]:bg-destructive"
                : ""
            }`}
          />
        </div>

        {/* Archived Notes Dialog */}
        <ArchiveDialog
          open={openArchive}
          onOpenChange={setOpenArchive}
          setNotes={setNotes}
        />

        {/* User info */}
        <div className="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/40">
          <Avatar className="h-8 w-8 border">
            <AvatarFallback>{getInitial(userEmail)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col truncate">
            <span className="truncate font-medium">{userEmail}</span>
            <button
              onClick={onLogout}
              className="text-xs text-muted-foreground hover:underline text-left"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
