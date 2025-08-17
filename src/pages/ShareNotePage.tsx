import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/Notes";
import appLogo from "@/assets/InkLine.png"; // replace with your logo path
import { Button } from "@/components/ui/button"; // optional, for styled back button

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

  if (loading) return <div className="p-6">Loading note...</div>;
  if (error) return <div className="p-6">{error}</div>;
  if (!note)
    return <div className="p-6">This note is private or does not exist.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between p-4 border-b bg-muted shadow-sm">
        {/* Clickable logo goes to landing page */}
        <Link to="/" className="flex items-center">
          <img
            src={appLogo}
            alt="App Logo"
            className="h-10 w-10 mr-3 cursor-pointer"
          />
          <span className="font-bold text-lg">MyNotes</span>
        </Link>

        {/* Optional small text link instead of a button */}
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          Go to landing page
        </Link>
      </header>

      {/* Note content */}
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{note.title}</h1>
        <pre className="whitespace-pre-wrap text-gray-800">{note.body}</pre>
        <p className="mt-4 text-sm text-gray-500">
          Last updated: {new Date(note.updated_at).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
