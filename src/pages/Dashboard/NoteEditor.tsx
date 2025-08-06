import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Note } from "@/types/Notes";
import { supabase } from "@/lib/supabaseClient";

type NoteEditorProps = {
  note: Note | null;
  onUpdate: (updatedNote: Note) => void;
};

const MAX_BODY_LENGTH = 4096;

const NoteEditor = forwardRef(function NoteEditor(
  { note, onUpdate }: NoteEditorProps,
  ref
) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [fontSize, setFontSize] = useState<number>(16); // Font size state
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setCurrentLine(0);
    }
  }, [note]);

  // Auto-save to Supabase on change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (note && (title !== note.title || body !== note.body)) {
        supabase
          .from("notes")
          .update({ title, body })
          .eq("id", note.id)
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error("Auto-save failed:", error.message);
            } else if (data) {
              onUpdate(data);
            }
          });
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, body, note, onUpdate]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Font Size persistence in localStorage
  useEffect(() => {
    const storedFontSize = localStorage.getItem("noteEditorFontSize");
    if (storedFontSize) {
      setFontSize(parseInt(storedFontSize, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("noteEditorFontSize", fontSize.toString());
  }, [fontSize]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadAsTxt = () => {
    if (!note) return;

    const content = `Title: ${title}\n\n${body}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "note"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const focusLine = (lineIndex: number) => {
    if (!textareaRef.current) return;

    const lines = body.split("\n");
    const clampedIndex = Math.max(0, Math.min(lineIndex, lines.length - 1));
    const start = lines
      .slice(0, clampedIndex)
      .reduce((acc, line) => acc + line.length + 1, 0);
    const end = start + lines[clampedIndex].length;

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(start, end);
    setCurrentLine(clampedIndex);
  };

  useImperativeHandle(ref, () => ({
    focusLine,
    focusNextLine: () => focusLine(currentLine + 1),
    focusPrevLine: () => focusLine(currentLine - 1),
    getCurrentLine: () => currentLine,
    getLineCount: () => body.split("\n").length,
  }));

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, 32)); // Max 32px
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 12)); // Min 12px
  };

  if (!note) {
    return (
      <p className="text-muted-foreground italic">Select a note to view/edit</p>
    );
  }

  return (
    <div
      className="relative bg-card text-card-foreground rounded-md border border-border font-typewriter leading-relaxed tracking-wide prose max-w-none p-8 min-h-[75vh] md:shadow-md transition-all"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: "1.8",
        letterSpacing: "0.02em",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        minHeight: "75vh",
        maxWidth: "85ch",
        margin: "0 auto",
        transition: "font-size 0.3s ease", // Smooth font size change
      }}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="text-3xl mb-6 font-bold font-typewriter bg-transparent border-none p-0 focus:outline-none focus:ring-0 shadow-none placeholder:text-muted-foreground"
      />

      <Textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => {
          if (e.target.value.length <= MAX_BODY_LENGTH) {
            setBody(e.target.value);
          }
        }}
        rows={20}
        placeholder="Start typing your note..."
        className="resize-none bg-transparent border-none p-0 focus:outline-none focus:ring-0 shadow-none placeholder:text-muted-foreground font-typewriter text-base"
      />

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {body.length} / {MAX_BODY_LENGTH}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={decreaseFontSize}>
              A-
            </Button>
            <Button variant="outline" size="icon" onClick={increaseFontSize}>
              A+
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={downloadAsTxt}
            disabled={!note || body.trim() === ""}
          >
            Download as .txt
          </Button>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-md hover:bg-primary/90 transition"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
});

export default NoteEditor;
