import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/Notes";
import appLogo from "@/assets/InkLine.png"; // your logo

export default function ShareNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!shareId) {
        setError("Invalid share link.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("share_id", shareId)
        .eq("is_public", true)
        .single();

      if (error) {
        console.error("Error fetching shared note:", error.message);
        setError("This note is private or does not exist.");
      } else {
        setNote(data);
      }
      setLoading(false);
    };

    fetchNote();
  }, [shareId]);

  if (loading) return <div className="p-6 text-center">Loading note...</div>;
  if (error) return <div className="p-6 text-center">{error}</div>;
  if (!note)
    return <div className="p-6 text-center">This note is private or does not exist.</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar like Notion */}
      <header className="flex items-center p-4 border-b bg-white shadow-sm">
        <Link to="/" className="flex items-center space-x-3">
          <img src={appLogo} alt="App Logo" className="h-8 w-8" />
          <span className="font-semibold text-lg">MyNotes</span>
        </Link>
      </header>

      {/* Note content */}
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">{note.title}</h1>
        <pre className="whitespace-pre-wrap text-gray-800 text-lg">{note.body}</pre>
        <p className="mt-6 text-sm text-gray-500">
          Last updated: {new Date(note.updated_at).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
