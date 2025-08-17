import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/Notes";

export default function ShareNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*") // 👈 fetch all columns so it matches Note
        .eq("share_id", shareId)
        .eq("is_public", true)
        .single();

      if (error) {
        console.error("Error fetching shared note:", error.message);
      }
      setNote(data);
      setLoading(false);
    };

    fetchNote();
  }, [shareId]);

  if (loading) return <div className="p-6">Loading note...</div>;
  if (!note) return <div className="p-6">This note is private or does not exist.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{note.title}</h1>
      <pre className="whitespace-pre-wrap text-gray-800">{note.body}</pre>
      <p className="mt-4 text-sm text-gray-500">
        Last updated: {new Date(note.updated_at).toLocaleString()}
      </p>
    </div>
  );
}
