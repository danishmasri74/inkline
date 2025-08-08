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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const editorRef = useRef<HTMLDivElement>(null);

  // Toolbar formatting
  const formatText = (command: string) => {
    document.execCommand(command, false, "");
    if (editorRef.current) {
      setBody(editorRef.current.innerHTML);
    }
  };

  // Load note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body); // HTML now
      setCurrentLine(0);
    }
  }, [note]);

  // Auto-save
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

  // Scroll button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Font size storage
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
    const idx = FONT_SIZES.indexOf(fontSize);
    if (idx < FONT_SIZES.length - 1) setFontSize(FONT_SIZES[idx + 1]);
  };

  const decreaseFontSize = () => {
    const idx = FONT_SIZES.indexOf(fontSize);
    if (idx > 0) setFontSize(FONT_SIZES[idx - 1]);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadAsTxt = () => {
    if (!note) return;
    const temp = document.createElement("div");
    temp.innerHTML = body;
    const plainText = temp.innerText;
    const content = `Title: ${title}\n\n${plainText}`;
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

  if (!note) {
    return (
      <p className="text-muted-foreground italic">Select a note to view/edit</p>
    );
  }

  return (
    <div
      className="relative bg-card text-card-foreground rounded-md border border-border font-typewriter leading-relaxed tracking-wide p-6 min-h-[75vh]"
      style={{ maxWidth: "85ch", margin: "0 auto" }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* Formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => formatText("bold")}
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
                  onClick={() => formatText("italic")}
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
                  onClick={() => formatText("underline")}
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
                  onClick={() => formatText("strikeThrough")}
                >
                  <Strikethrough size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Strikethrough</TooltipContent>
            </Tooltip>

            {/* Font size */}
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

        {/* Save + Download */}
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
        style={{ fontSize: FONT_SIZE_STYLES[fontSize] }}
        className="text-3xl shadow-none mb-6 font-bold font-typewriter bg-transparent border-none p-0"
      />

      {/* Rich Text Body */}
      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: body }}
        onInput={(e) => setBody((e.target as HTMLDivElement).innerHTML)}
        style={{
          fontSize: FONT_SIZE_STYLES[fontSize],
          outline: "none",
          minHeight: "300px",
          whiteSpace: "pre-wrap",
        }}
        className="bg-transparent leading-loose"
      />

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
});
export default NoteEditor;
