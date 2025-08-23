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
import { ArchiveIcon, HomeIcon, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ArchiveDialog from "./ArchiveDialog";
import { useNavigate } from "react-router-dom";

type SidebarProps = {
  notes: Note[]; // 🟢 now ONLY active notes
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
  const navigate = useNavigate();

  // fetch archived notes once
  useEffect(() => {
    const fetchArchived = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("archived", true)
        .order("updated_at", { ascending: false });

      if (!error && data) setArchivedNotes(data as Note[]);
    };

    fetchArchived();
  }, []);

  // group active notes
  const { todayNotes, yesterdayNotes, olderNotes } = useMemo(() => {
    const today: Note[] = [];
    const yesterday: Note[] = [];
    const older: Note[] = [];
    for (const note of notes) {
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
    estimateSize: () => 40,
    overscan: 6,
  });

  // ✅ total unique notes count
  const totalNotes = notes.length + archivedNotes.length;

  return (
    <>
      <aside className="w-full md:w-56 h-[100dvh] flex flex-col bg-background border-r border-border z-50 md:fixed md:left-0 md:top-0">
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0 cursor-pointer hover:bg-accent/30 transition-colors"
          role="button"
          onClick={onDeselect}
        >
          <img
            src={inklineIcon}
            alt="InkLine Logo"
            className="h-8 w-8 rounded-md"
          />
          <h2 className="text-sm font-semibold tracking-wide">InkLine</h2>
          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="ml-auto md:hidden h-6 w-6"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="p-2 space-y-1 text-xs">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-7 px-2 text-xs"
            onClick={onDeselect}
          >
            <HomeIcon className="h-3.5 w-3.5" /> Home
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-7 px-2 text-xs"
            onClick={() => setOpenArchive(true)}
          >
            <ArchiveIcon className="h-3.5 w-3.5" /> Archive
          </Button>

          {onCreateNote && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-7 px-2 text-xs"
              onClick={onCreateNote}
            >
              <PlusCircle className="h-3.5 w-3.5" /> New Note
            </Button>
          )}
        </div>

        <Separator />

        {/* Notes list */}
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          {!notes.length ? (
            <div className="flex flex-col items-center justify-center text-xs text-muted-foreground p-4">
              <p className="mb-2">No notes yet</p>
              {onCreateNote && (
                <Button size="sm" onClick={onCreateNote}>
                  Create Note
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
                      <div className="px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40 sticky top-0 z-10">
                        {item.label}
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className={`group w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors text-left truncate
                        ${
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
                          className="opacity-0 group-hover:opacity-100 transition h-5 w-5"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await supabase
                                .from("notes")
                                .update({ archived: true })
                                .eq("id", item.note!.id);

                              // remove from active
                              setNotes((prev) =>
                                prev.filter((n) => n.id !== item.note!.id)
                              );

                              // add to archived
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
                          <ArchiveIcon className="h-3.5 w-3.5" />
                        </Button>
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <Separator />
        <div className="p-3 space-y-3 shrink-0 bg-background">
          {/* Notes usage */}
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
              <span>Usage</span>
              <span>{totalNotes}/100</span>
            </div>
            <Progress
              value={(totalNotes / 100) * 100}
              className={`h-1.5 rounded-full ${
                totalNotes >= 90
                  ? "bg-destructive/20 [&>div]:bg-destructive"
                  : ""
              }`}
            />
          </div>

          {/* User */}
          <div className="flex items-center gap-2 text-xs p-1.5 rounded-md bg-muted/40">
            <Avatar className="h-7 w-7 border">
              <AvatarFallback>{getInitial(userEmail)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="truncate font-medium text-[11px]">
                {userEmail}
              </span>
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="text-[10px] text-muted-foreground hover:underline text-left"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Archive dialog */}
      <ArchiveDialog
        open={openArchive}
        onOpenChange={setOpenArchive}
        setNotes={setNotes}
        archivedNotes={archivedNotes}
        setArchivedNotes={setArchivedNotes}
      />
    </>
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
