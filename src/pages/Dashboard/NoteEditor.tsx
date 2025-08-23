import { forwardRef, useEffect, useRef, useState } from "react";
import { Note } from "@/types/Notes";
import { supabase } from "@/lib/supabaseClient";
import { ChevronUp } from "lucide-react";
import DOMPurify from "dompurify";
import NoteToolbar from "./NoteToolbar";

type NoteEditorProps = {
  note?: Note | null;
  onUpdate?: (updatedNote: Note) => void;
};

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
const MAX_CHARS = 4096;

const NoteEditor = forwardRef(function NoteEditor(
  { note = null, onUpdate = () => {} }: NoteEditorProps,
  _ref
) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(""); // always sanitized HTML
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [fontSize, setFontSize] = useState<FontSizeLevel>("regular");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Track last-saved values
  const lastSavedTitleRef = useRef<string>("");
  const lastSavedBodyRef = useRef<string>("");
  const initializingRef = useRef<boolean>(false);

  // Adjust textarea height
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title, fontSize]);

  const toPlainText = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.innerText;
  };

  const updateBodyFromHtml = (html: string) => {
    const sanitized = DOMPurify.sanitize(html);
    const plainText = toPlainText(sanitized);

    if (plainText.length <= MAX_CHARS) {
      setBody(sanitized);
      setCharCount(plainText.length);
      setWordCount(
        plainText.trim() === "" ? 0 : plainText.trim().split(/\s+/).length
      );
    } else {
      const trimmedText = plainText.slice(0, MAX_CHARS);
      if (editorRef.current) {
        editorRef.current.innerText = trimmedText;
      }
      setBody(DOMPurify.sanitize(editorRef.current?.innerHTML || ""));
      setCharCount(MAX_CHARS);
      setWordCount(
        trimmedText.trim() === "" ? 0 : trimmedText.trim().split(/\s+/).length
      );
    }
  };

  // Formatting (still using execCommand for now)
  const formatText = (command: string) => {
    document.execCommand(command, false, "");
    if (editorRef.current) {
      updateBodyFromHtml(editorRef.current.innerHTML);
    }
  };

  // Enter → line break
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      document.execCommand("insertLineBreak");
      e.preventDefault();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      updateBodyFromHtml(editorRef.current.innerHTML);
    }
  };

  // Load note
  useEffect(() => {
    if (!note) return;

    initializingRef.current = true;

    setTitle(note.title);
    lastSavedTitleRef.current = note.title;

    if (editorRef.current) {
      editorRef.current.innerHTML = note.body || "";
    }

    updateBodyFromHtml(note.body || "");
    lastSavedBodyRef.current = DOMPurify.sanitize(note.body || "");

    initializingRef.current = false;
  }, [note?.id]);

  // Autosave
  useEffect(() => {
    if (!note) return;
    if (initializingRef.current) return;

    const deb = setTimeout(async () => {
      const titleChanged = title !== lastSavedTitleRef.current;
      const bodyChanged = body !== lastSavedBodyRef.current;
      if (!titleChanged && !bodyChanged) return;

      setSaveStatus("saving");

      const { data, error } = await supabase
        .from("notes")
        .update({ title, body })
        .eq("id", note.id)
        .select()
        .single();

      if (error) {
        console.error("Auto-save failed:", error.message);
        setSaveStatus("idle");
        return;
      }

      lastSavedTitleRef.current = title;
      lastSavedBodyRef.current = body;

      if (data) {
        onUpdate({
          ...note,
          title,
          body,
          updated_at: data.updated_at,
        });
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    }, 800);

    return () => clearTimeout(deb);
  }, [title, body, note?.id, onUpdate]);

  // Scroll-to-top visibility (optimized with rAF)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 200);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Font size persistence
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as FontSizeLevel;
    if (stored && (FONT_SIZES as readonly string[]).includes(stored)) {
      setFontSize(stored as FontSizeLevel);
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

  // Safe TXT download
  const downloadAsTxt = () => {
    if (!note) return;
    const plainText = toPlainText(editorRef.current?.innerHTML || body || "");
    const safeTitle = (title || "note").replace(/[<>:"/\\|?*]+/g, "_");
    const content = `Title: ${title}\n\n${plainText}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.txt`;
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
      <NoteToolbar
        formatText={formatText}
        decreaseFontSize={decreaseFontSize}
        increaseFontSize={increaseFontSize}
        fontSize={fontSize}
        saveStatus={saveStatus}
        onDownload={downloadAsTxt}
        canDownload={
          !!note && (editorRef.current?.innerText?.trim() ?? "") !== ""
        }
      />

      {/* Title */}
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        rows={1}
        style={{ fontSize: FONT_SIZE_STYLES[fontSize] }}
        className="w-full resize-none overflow-hidden text-3xl mb-6 font-bold font-typewriter bg-transparent border-none p-0 focus:outline-none break-words"
      />

      {/* Body */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Note body editor"
        data-gramm="false"
        data-placeholder="Start typing your note..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: FONT_SIZE_STYLES[fontSize],
          outline: "none",
          minHeight: "300px",
          whiteSpace: "pre-wrap",
        }}
        className="bg-transparent leading-loose placeholder"
      />

      {/* Counter */}
      <div className="mt-2 text-sm text-muted-foreground text-right">
        {wordCount} words • {charCount}/{MAX_CHARS} chars
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90"
        >
          <ChevronUp size={20} />
        </button>
      )}

      <style>
        {`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: var(--muted-foreground);
            pointer-events: none;
          }
        `}
      </style>
    </div>
  );
});

export default NoteEditor;
