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
import {
  Download,
  ChevronUp,
  Plus,
  Minus,
  Check,
  Loader2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NoteEditorProps = {
  note: Note | null;
  onUpdate: (updatedNote: Note) => void;
};

const MAX_BODY_LENGTH = 4096;

const FONT_SIZES = ["smallest", "small", "regular", "big", "biggest"] as const;
type FontSizeLevel = (typeof FONT_SIZES)[number];

const FONT_SIZE_STYLES: Record<FontSizeLevel, string> = {
  smallest: "14px",
  small: "16px",
  regular: "18px",
  big: "22px",
  biggest: "28px",
};

const LOCAL_STORAGE_KEY = "note-editor-font-size";

const NoteEditor = forwardRef(function NoteEditor(
  { note, onUpdate }: NoteEditorProps,
  ref
) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [fontSize, setFontSize] = useState<FontSizeLevel>("regular");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply formatting around selected text
  const applyFormatting = (before: string, after: string = before) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selectedText = body.substring(start, end);
    const newText =
      body.substring(0, start) +
      before +
      selectedText +
      after +
      body.substring(end);

    setBody(newText);

    // Keep selection around newly formatted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setCurrentLine(0);
    }
  }, [note]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (note && (title !== note.title || body !== note.body)) {
        setSaveStatus("saving");
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
              setSaveStatus("saved");
              setTimeout(() => setSaveStatus("idle"), 2000);
            }
          });
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [title, body, note]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedSize = localStorage.getItem(LOCAL_STORAGE_KEY) as FontSizeLevel;
    if (FONT_SIZES.includes(storedSize)) {
      setFontSize(storedSize);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, fontSize);
  }, [fontSize]);

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1]);
    }
  };

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

  if (!note) {
    return (
      <p className="text-muted-foreground italic">Select a note to view/edit</p>
    );
  }

  return (
    <div
      className="relative bg-card text-card-foreground rounded-md border border-border font-typewriter leading-relaxed tracking-wide p-6 min-h-[75vh] transition-all"
      style={{
        maxWidth: "85ch",
        margin: "0 auto",
      }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* Formatting buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => applyFormatting("**")}
                >
                  <Bold size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => applyFormatting("*")}
                >
                  <Italic size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => applyFormatting("__")}
                >
                  <Underline size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => applyFormatting("~~")}
                >
                  <Strikethrough size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Strikethrough</TooltipContent>
            </Tooltip>

            {/* Font size controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseFontSize}
                  disabled={fontSize === "smallest"}
                >
                  <Minus size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Decrease font size</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseFontSize}
                  disabled={fontSize === "biggest"}
                >
                  <Plus size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Increase font size</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
          )}
          {saveStatus === "saved" && (
            <Check className="w-4 h-4 text-green-500" />
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAsTxt}
                  disabled={!note || body.trim() === ""}
                  className="flex items-center gap-1"
                >
                  <Download size={16} /> .txt
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download as text file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        style={{
          fontSize: FONT_SIZE_STYLES[fontSize],
        }}
        className="text-3xl shadow-none mb-6 font-bold font-typewriter bg-transparent border-none focus:border-primary rounded-none p-0 placeholder:text-muted-foreground"
      />

      {/* Body */}
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
        style={{
          fontSize: FONT_SIZE_STYLES[fontSize],
        }}
        className="resize-none bg-transparent shadow-none border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground font-typewriter leading-loose"
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <div
          className={`text-sm ${
            body.length > MAX_BODY_LENGTH * 0.9
              ? "text-red-500"
              : "text-muted-foreground"
          }`}
        >
          {body.length} / {MAX_BODY_LENGTH}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-all animate-fade-in"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
});

export default NoteEditor;
