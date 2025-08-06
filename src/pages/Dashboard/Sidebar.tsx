import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Note } from "@/types/Notes";
import { isToday, isYesterday } from "date-fns";
import inklineIcon from "@/assets/InkLine.png";
import { useVirtualizer } from "@tanstack/react-virtual";

type SidebarProps = {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLogout: () => void;
  loading: boolean;
  userEmail: string;
  onClose?: () => void;
  onDeselect?: () => void;
  onCreateNote?: () => void; // New optional prop
};

const getInitial = (email: string) => email?.charAt(0)?.toUpperCase() ?? "?";

export default function Sidebar({
  notes,
  selectedId,
  onSelect,
  onLogout,
  loading,
  userEmail,
  onClose,
  onDeselect,
  onCreateNote,
}: SidebarProps) {
  const parentRef = useRef<HTMLDivElement>(null);

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
      for (const note of section.notes) {
        list.push({ type: "note", note });
      }
    }
    return list;
  }, [sections]);

  const rowVirtualizer = useVirtualizer({
    count: flatList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // estimate row height (adjust if needed)
    overscan: 10,
  });

  const noteLimit = 100;
  const noteCount = notes.length;
  const progress = Math.min((noteCount / noteLimit) * 100, 100);
  const progressColor =
    progress >= 100
      ? "bg-destructive"
      : progress >= 80
      ? "bg-warning"
      : "bg-primary";

  return (
    <aside className="w-full md:w-64 min-h-[100dvh] sticky top-0 flex flex-col bg-background md:border-r font-typewriter z-50 transition-transform md:translate-x-0">
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onDeselect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onDeselect?.();
        }}
        className="cursor-pointer p-4 flex items-center gap-4 shrink-0 bg-muted/5 border-b w-full hover:bg-muted/10 transition focus-visible:outline-2 focus-visible:outline-primary"
      >
        <img
          src={inklineIcon}
          alt="InkLine Logo"
          className="h-10 w-10 rounded-sm"
        />
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-foreground tracking-wide">
            InkLine
          </h2>
          <p className="text-xs text-muted-foreground leading-tight">
            No fuss. Just notes.
          </p>
        </div>
        {onClose && (
          <div className="ml-auto md:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close sidebar"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Virtualized Scrollable Notes */}
      <nav
        aria-label="Notes"
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        <div ref={parentRef} className="flex-1 overflow-y-auto">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = flatList[virtualRow.index];
              const isSection = item.type === "section";
              const note = item.note;

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={`absolute top-0 left-0 right-0 translate-y-[${virtualRow.start}px]`}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  {isSection ? (
                    <h3 className="text-xs font-medium text-muted-foreground mt-4 mb-1 px-3 uppercase tracking-wide">
                      {item.label}
                    </h3>
                  ) : (
                    <button
                      onClick={() => onSelect(note!.id)}
                      aria-current={
                        note!.id === selectedId ? "page" : undefined
                      }
                      className={`relative text-left px-3 py-2 rounded transition-colors truncate w-full flex items-center gap-2 ${
                        note!.id === selectedId
                          ? "bg-muted font-semibold text-foreground"
                          : "hover:bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      {note!.id === selectedId && (
                        <span className="absolute left-0 h-full w-1 bg-primary rounded-r"></span>
                      )}
                      <span className="truncate">
                        {note!.title || "Untitled"}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between shrink-0">
          <span>Notes</span>
          <span>
            {noteCount} / {noteLimit}
          </span>
        </div>
        <div className="px-4 pb-2 shrink-0">
          <div className="w-full bg-muted h-1.5 rounded overflow-hidden">
            <div
              className={`h-full ${progressColor}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {progress >= 100 && (
            <p className="text-destructive text-xs mt-1">Note limit reached.</p>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-3 shrink-0 flex items-center">
        <div className="flex items-center gap-3 truncate w-full">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            {getInitial(userEmail)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-foreground truncate">
              {userEmail}
            </span>
            <button
              onClick={onLogout}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-destructive text-left"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
