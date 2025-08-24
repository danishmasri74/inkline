import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/Notes";
import { PlusCircle, FileText, BarChart3 } from "lucide-react";
import NotesTable from "./NotesTable";
import { Dispatch, SetStateAction } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

type NotesDashboardProps = {
  notes: Note[];
  archivedNotes: Note[];
  onCreateNote: () => void;
  onSelectNote: (id: string) => void;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
};

export default function NotesDashboard({
  notes,
  archivedNotes,
  onCreateNote = () => {},
  onSelectNote = () => {},
  selectedIds = [],
  setSelectedIds = () => {},
}: NotesDashboardProps) {
  // --- helpers ---
  const getWordCount = (html: string = ""): number => {
    const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text ? text.split(" ").filter(Boolean).length : 0;
  };

  const avgWordCount = (list: Note[]): number => {
    if (!list.length) return 0;
    return Math.round(
      list.reduce((acc, n) => acc + getWordCount(n.body), 0) / list.length
    );
  };

  const allNotes = [...notes, ...archivedNotes];
  const totalNotes = allNotes.length;
  const remaining = 100 - totalNotes;

  const now = new Date();
  const month = now.getMonth();
  const notesThisMonth = allNotes.filter((n) => {
    const d = new Date(n.created_at);
    return d.getMonth() === month && d.getFullYear() === now.getFullYear();
  });

  const weekdayCounts = Array(7).fill(0);
  notesThisMonth.forEach((n) => {
    const d = new Date(n.created_at);
    if (!isNaN(d.getTime())) weekdayCounts[d.getDay()]++;
  });
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const mostActiveDayIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const mostActiveDay =
    mostActiveDayIndex >= 0 ? weekdays[mostActiveDayIndex] : "—";

  const mostViewed = [...notes].sort(
    (a, b) => (b.view_count || 0) - (a.view_count || 0)
  )[0];

  const avgThisMonth = avgWordCount(notesThisMonth);
  const prevMonth = (month - 1 + 12) % 12;
  const avgPrevMonth = avgWordCount(
    allNotes.filter((n) => {
      const d = new Date(n.created_at);
      return (
        d.getMonth() === prevMonth && d.getFullYear() === now.getFullYear()
      );
    })
  );

  // --- Pie chart data ---
  const categoryCounts: Record<string, number> = {};
  allNotes.forEach((n) => {
    const cat = n.category?.name || "Unassigned";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));
  const COLORS = [
    "#4f46e5",
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
    "#f97316",
    "#3b82f6",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={onCreateNote} className="gap-2 w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Insights */}
      <section>
        <h2 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground uppercase">
          <BarChart3 className="h-4 w-4" /> Insights
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Notes This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{notesThisMonth.length}</p>
              <p className="text-xs text-muted-foreground">
                Includes active + archived — most on{" "}
                <span className="font-semibold">{mostActiveDay}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalNotes}</p>
              <p className="text-xs text-muted-foreground">
                {notes.length} active, {archivedNotes.length} archived
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining Space
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{remaining}</p>
              <p className="text-xs text-muted-foreground">Up to 100 notes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Note Length
              </CardTitle>
            </CardHeader>
            <CardContent>
              {avgThisMonth > 0 ? (
                <>
                  <p className="text-3xl font-bold">
                    {avgThisMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {avgPrevMonth > 0 ? (
                      <>
                        Growing: {avgPrevMonth.toLocaleString()} →{" "}
                        {avgThisMonth.toLocaleString()} words
                      </>
                    ) : (
                      <>Average length this month</>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No notes yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Notes by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="w-full h-64 sm:h-72 overflow-x-auto">
                  <div className="min-w-[300px] h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={3}
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${
                              percent !== undefined
                                ? (percent * 100).toFixed(0)
                                : 0
                            }%`
                          }
                        >
                          {categoryData.map((_, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} notes`, name]}
                          contentStyle={{
                            borderRadius: "0.5rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ fontSize: "0.75rem" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No notes available
                </p>
              )}
            </CardContent>
          </Card>

          {mostViewed && (
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Viewed Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base">
                  <span className="font-semibold">
                    {mostViewed.title || "Untitled"}
                  </span>{" "}
                  — {mostViewed.view_count ?? 0} views
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Recent notes */}
      <section>
        <h2 className="text-sm font-medium mb-2">Recent Notes</h2>
        <div className="space-y-1">
          {notes.slice(0, 5).map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left rounded-md hover:bg-accent/50 transition"
            >
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-sm">
                {note.title || "Untitled"}
              </span>
            </button>
          ))}
          {!notes.length && (
            <p className="text-sm text-muted-foreground italic">
              No notes yet. Create your first one!
            </p>
          )}
        </div>
      </section>

      {/* Notes table */}
      <div className="overflow-x-auto">
        <NotesTable
          notes={notes}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onSelectNote={onSelectNote}
        />
      </div>
    </div>
  );
}
