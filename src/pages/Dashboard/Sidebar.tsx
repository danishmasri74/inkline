import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  onCreateNote?: () => void;
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
    estimateSize: () => 44,
    overscan: 10,
  });

  const noteLimit = 100;
  const noteCount = notes.length;
  const progress = Math.min((noteCount / noteLimit) * 100, 100);
  const progressColor =
    progress >= 100
      ? "bg-destructive"
      : progress >= 80
      ? "bg-yellow-500"
      : "bg-primary";

  return (
    <aside className="w-full md:w-64 min-h-[100dvh] sticky top-0 flex flex-col bg-background md:border-r font-typewriter z-50">
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onDeselect}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && onDeselect?.()
        }
        className="cursor-pointer p-4 flex items-center gap-4 shrink-0 hover:bg-muted transition"
      >
        <img
          src={inklineIcon}
          alt="InkLine Logo"
          className="h-10 w-10 rounded-sm"
        />
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold tracking-wide">InkLine</h2>
          <p className="text-xs text-muted-foreground">No fuss. Just notes.</p>
        </div>
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close sidebar"
            className="ml-auto md:hidden"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Scrollable Virtualized Notes */}
      <div className="flex-1 min-h-0 overflow-y-auto" ref={parentRef}>
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
                className="absolute top-0 left-0 right-0"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {isSection ? (
                  <h3 className="text-xs font-medium text-muted-foreground mt-4 mb-1 px-3 uppercase tracking-wide">
                    {item.label}
                  </h3>
                ) : (
                  <Button
                    variant={note!.id === selectedId ? "secondary" : "ghost"}
                    className={`w-full justify-start px-3 py-2 truncate ${
                      note!.id === selectedId ? "font-semibold" : ""
                    }`}
                    onClick={() => onSelect(note!.id)}
                  >
                    <span className="truncate">
                      {note!.title || "Untitled"}
                    </span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Notes</span>
        <span>
          {noteCount} / {noteLimit}
        </span>
      </div>
      <div className="px-4 pb-2">
        <div className="w-full bg-muted h-1.5 rounded">
          <div
            className={`h-full ${progressColor}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {progress >= 100 && (
          <p className="text-destructive text-xs mt-1">Note limit reached.</p>
        )}
      </div>

      <Separator />

      {/* Footer */}
      <div className="px-4 py-3 flex items-center gap-3 shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitial(userEmail)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium truncate">{userEmail}</span>
          <Button
            variant="link"
            className="text-xs text-muted-foreground px-0 h-auto"
            onClick={onLogout}
          >
            Log out
          </Button>
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
