import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Note } from "@/types/Notes";
import { isToday, isYesterday } from "date-fns";
import { Progress } from "@/components/ui/progress";
import inklineIcon from "@/assets/InkLine.png";
import { Link } from "react-router-dom";

type SidebarProps = {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLogout: () => void;
  loading: boolean;
  userEmail: string;
  onClose?: () => void;
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
}: SidebarProps) {
  const todayNotes = notes.filter((n) => isToday(new Date(n.updated_at)));
  const yesterdayNotes = notes.filter((n) =>
    isYesterday(new Date(n.updated_at))
  );
  const olderNotes = notes.filter(
    (n) =>
      !isToday(new Date(n.updated_at)) && !isYesterday(new Date(n.updated_at))
  );

  const noteLimit = 100;
  const noteCount = notes.length;
  const progress = Math.min((noteCount / noteLimit) * 100, 100);

  const renderSection = (label: string, sectionNotes: Note[]) => (
    <>
      <h3 className="text-xs font-medium text-muted-foreground mt-4 mb-1 px-3 uppercase tracking-wide">
        {label}
      </h3>
      {sectionNotes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelect(note.id)}
          className={`text-left px-3 py-2 rounded transition-colors truncate w-full ${
            note.id === selectedId
              ? "bg-muted font-semibold text-foreground"
              : "hover:bg-muted/50 text-muted-foreground"
          }`}
        >
          {note.title || "Untitled"}
        </button>
      ))}
    </>
  );

  return (
    <aside className="w-full md:w-64 h-screen sticky top-0 flex flex-col bg-background md:border-r font-typewriter z-50">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 shrink-0 bg-muted/5 border-b">
        <Link to="/" className="shrink-0">
          <img
            src={inklineIcon}
            alt="InkLine Logo"
            className="h-10 w-10 rounded-sm hover:opacity-80 transition-opacity"
          />
        </Link>
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
              onClick={onClose}
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

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 text-[15px] leading-snug space-y-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded" />
            ))
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground italic px-3">No notes yet</p>
          ) : (
            <>
              {todayNotes.length > 0 && renderSection("Today", todayNotes)}
              {yesterdayNotes.length > 0 &&
                renderSection("Yesterday", yesterdayNotes)}
              {olderNotes.length > 0 && renderSection("Older", olderNotes)}
            </>
          )}
        </div>

        {/* Progress */}
        <div className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-between shrink-0">
          <span>Notes</span>
          <span>
            {noteCount} / {noteLimit}
          </span>
        </div>
        <div className="px-4 pb-2 shrink-0">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Minimal Footer with logout under email */}
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
