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
    <aside className="w-full md:w-64 min-h-[100dvh] flex flex-col bg-background md:border-r font-typewriter z-50 shadow-lg">
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={onDeselect}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && onDeselect?.()
        }
        className="cursor-pointer p-4 flex items-center gap-3 shrink-0 hover:bg-muted/80 transition rounded-b-md"
      >
        <img
          src={inklineIcon}
          alt="InkLine Logo"
          className="h-12 w-12 rounded-md"
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
            className="ml-auto md:hidden hover:bg-accent"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Scrollable Virtualized List */}
      <div ref={parentRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = flatList[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 right-0"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {item.type === "section" ? (
                  <h3 className="sticky top-0 z-10 text-xs font-medium bg-background text-muted-foreground px-3 py-2 uppercase tracking-wide backdrop-blur-sm">
                    {item.label}
                  </h3>
                ) : (
                  <Button
                    variant={
                      item.note!.id === selectedId ? "secondary" : "ghost"
                    }
                    className={`w-full justify-start px-3 py-2 rounded-md truncate transition hover:bg-accent ${
                      item.note!.id === selectedId ? "font-semibold" : ""
                    }`}
                    onClick={() => onSelect(item.note!.id)}
                  >
                    <span className="truncate">
                      {item.note!.title || "Untitled"}
                    </span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 bg-muted/40 rounded-t-md">
        <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Notes</span>
          <span>
            {noteCount} / {noteLimit}
          </span>
        </div>
        <div className="px-4 pb-2">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {progress >= 100 && (
            <p className="text-destructive text-xs mt-1">Note limit reached.</p>
          )}
        </div>
        <Separator />
        <div className="px-4 py-3 flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarFallback>{getInitial(userEmail)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{userEmail}</span>
            <Button
              variant="link"
              className="text-xs text-muted-foreground px-0 h-auto hover:underline"
              onClick={onLogout}
            >
              Log out
            </Button>
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
