import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/Notes";
import appLogo from "@/assets/InkLine.png";
import { Loader2, AlertCircle, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DOMPurify from "dompurify";

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

  // Notion-like Fallback Wrapper
  const Fallback = ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <Card className="w-full max-w-lg border-muted bg-background">
        <CardContent className="flex flex-col items-center text-center p-12">
          <div className="mb-6">{icon}</div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <Link to="/">
            <Button variant="outline" className="rounded-xl">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading note…</span>
      </div>
    );

  if (error)
    return (
      <Fallback
        icon={<AlertCircle className="h-12 w-12 text-destructive" />}
        title="Unable to load note"
        description={error}
      />
    );

  if (!note)
    return (
      <Fallback
        icon={<FileQuestion className="h-12 w-12 text-muted-foreground" />}
        title="Note not found"
        description="This note is private or does not exist."
      />
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center p-4 border-b bg-muted/40">
        <Link to="/" className="flex items-center space-x-3">
          <img src={appLogo} alt="App Logo" className="h-7 w-7" />
          <span className="font-semibold text-base">MyNotes</span>
        </Link>
      </header>

      {/* Note content */}
      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">{note.title}</h1>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.body) }}
        />
        <p className="mt-8 text-sm text-muted-foreground">
          Last updated {new Date(note.updated_at).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
