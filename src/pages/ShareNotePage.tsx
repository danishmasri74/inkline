import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/Notes";
import appLogo from "@/assets/InkLine.png"; // your logo
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, FileQuestion } from "lucide-react";

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading note...</span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="flex flex-col items-center p-8">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <Alert className="w-full mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Link
              to="/"
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );

  if (!note)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="flex flex-col items-center p-8">
            <FileQuestion className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-center text-muted-foreground">
              This note is private or does not exist.
            </p>
            <Link
              to="/"
              className="mt-4 text-sm font-medium text-blue-600 hover:underline"
            >
              Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center p-4 border-b bg-muted shadow-sm">
        <Link to="/" className="flex items-center space-x-3">
          <img src={appLogo} alt="App Logo" className="h-8 w-8" />
          <span className="font-semibold text-lg">MyNotes</span>
        </Link>
      </header>

      {/* Note content */}
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">{note.title}</h1>
        <pre className="whitespace-pre-wrap text-foreground text-lg">
          {note.body}
        </pre>
        <p className="mt-6 text-sm text-gray-400">
          Last updated: {new Date(note.updated_at).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
