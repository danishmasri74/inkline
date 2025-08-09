import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/Notes";
import { isToday, isYesterday, format } from "date-fns";
import inklineIcon from "@/assets/InkLine.png";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";

type SidebarProps = {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLogout: () => void;
  userEmail: string;
  onClose?: () => void;
};

const getInitial = (email: string) => email?.charAt(0)?.toUpperCase() ?? "?";

export default function Sidebar({
  notes,
  selectedId,
  onSelect,
  onLogout,
  userEmail,
  onClose,
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
    const s = [];
    if (todayNotes.length) s.push({ label: "Today", notes: todayNotes });
    if (yesterdayNotes.length)
      s.push({ label: "Yesterday", notes: yesterdayNotes });
    if (olderNotes.length) s.push({ label: "Older", notes: olderNotes });
    return s;
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

  const noteLimit = 100;
  const noteCount = notes.length;
  const progress = Math.min((noteCount / noteLimit) * 100, 100);

  return (
    <aside className="w-72 max-w-full h-[100dvh] flex flex-col font-typewriter bg-[#f8f5f0] text-[#3b2f2f] shadow-lg fixed md:static z-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#e0d8c3]">
        <img src={inklineIcon} alt="InkLine" className="h-10 w-10 rounded" />
        <div>
          <h2 className="text-lg font-bold">InkLine</h2>
          <p className="text-xs opacity-70">No fuss. Just notes.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto md:hidden p-1">
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Notes */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        <div
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          className="relative"
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
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 py-2 text-xs uppercase tracking-wide opacity-60"
                  >
                    {item.label}
                  </motion.h3>
                ) : (
                  <button
                    onClick={() => onSelect(item.note!.id)}
                    className={`w-full text-left px-4 py-3 text-sm truncate transition
                      ${
                        item.note!.id === selectedId
                          ? "bg-[#e8e3d8] font-bold"
                          : "hover:bg-[#f0ece3]"
                      }`}
                  >
                    <div>{item.note!.title || "Untitled"}</div>
                    <div className="text-[10px] opacity-60">
                      {format(new Date(item.note!.updated_at), "MMM d, yyyy")}
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#e0d8c3]">
        <div className="flex justify-between text-xs mb-2 opacity-70">
          <span>
            {noteCount} / {noteLimit} notes
          </span>
        </div>
        <div className="h-1 bg-[#e0d8c3] overflow-hidden rounded">
          <div
            className="h-full bg-[#3b2f2f] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between items-center text-sm">
          <span className="truncate">{userEmail}</span>
          <button
            onClick={onLogout}
            className="underline text-xs opacity-70 hover:opacity-100"
          >
            Log out
          </button>
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
