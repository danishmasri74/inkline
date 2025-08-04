import { Note } from "@/types/Notes";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type SortKey = "title" | "created_at" | "updated_at";
type SortDirection = "asc" | "desc";

type NotesIndexProps = {
  notes: Note[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onSortConfigChange?: (sortConfig: {
    key: SortKey;
    direction: SortDirection;
  }) => void;
};

const STORAGE_KEY = "notes_sort_config";

export default function NotesIndex({
  notes,
  selectedIds,
  setSelectedIds,
  onSortConfigChange,
}: NotesIndexProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: "updated_at",
    direction: "desc",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.key && parsed.direction) {
          setSortConfig(parsed);
        }
      } catch {
        console.warn("Invalid sort config in localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortConfig));
    onSortConfigChange?.(sortConfig);
  }, [sortConfig, onSortConfigChange]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      const direction =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
  };

  const filteredSortedNotes = notes
    .filter((note) =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      const aValue = a[key] ?? "";
      const bValue = b[key] ?? "";

      if (key === "title") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return direction === "asc"
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    });

  const isAllSelected =
    filteredSortedNotes.length > 0 &&
    filteredSortedNotes.every((note) => selectedIds.includes(note.id));

  const toggleSelectAll = () => {
    setSelectedIds(
      isAllSelected ? [] : filteredSortedNotes.map((note) => note.id)
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const renderHeader = (label: string, key: SortKey) => {
    const isActive = sortConfig.key === key;
    const icon =
      isActive && sortConfig.direction === "asc" ? (
        <ArrowUp className="h-3 w-3 ml-1" />
      ) : isActive ? (
        <ArrowDown className="h-3 w-3 ml-1" />
      ) : null;

    return (
      <button
        className="w-full flex items-center justify-between text-left cursor-pointer select-none"
        onClick={() => handleSort(key)}
      >
        <span>{label}</span>
        {icon}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 font-typewriter">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h1 className="text-2xl font-bold tracking-wide text-foreground">
            📜 All Notes
          </h1>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground w-full sm:w-64 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="overflow-x-auto border border-border rounded-md">
          <table className="min-w-full table-auto text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wide border-b border-border">
              <tr>
                <th className="px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="form-checkbox accent-ring"
                  />
                </th>
                <th className="px-3 py-2 w-1/4">
                  {renderHeader("Title", "title")}
                </th>
                <th className="px-3 py-2 w-2/5">Preview</th>
                <th className="px-3 py-2 w-1/6">
                  {renderHeader("Created", "created_at")}
                </th>
                <th className="px-3 py-2 w-1/6">
                  {renderHeader("Last Updated", "updated_at")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSortedNotes.map((note) => {
                const isSelected = selectedIds.includes(note.id);
                const previewText =
                  note.body?.length > 100
                    ? `${note.body.slice(0, 100).trim()}…`
                    : note.body || "—";

                return (
                  <tr
                    key={note.id}
                    onClick={() => navigate(`/notes/${note.id}`)}
                    className={`cursor-pointer border-b border-border transition-all duration-150 ${
                      isSelected
                        ? "bg-accent/20 border-l-4 border-accent"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(note.id)}
                        className="form-checkbox accent-ring"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground truncate max-w-[160px]">
                      {note.title || "Untitled"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[280px] truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{previewText}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs whitespace-pre-wrap">
                            {note.body || "—"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {note.created_at
                        ? new Date(note.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {note.updated_at
                        ? new Date(note.updated_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
