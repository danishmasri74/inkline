import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Note } from "@/types/Notes";
import appLogo from "@/assets/InkLine.png";
import {
  Loader2,
  AlertCircle,
  FileQuestion,
  Copy,
  Check,
  Volume2,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DOMPurify from "dompurify";

// --- Reading Time Utility ---
function calculateReadingTime(html: string): {
  readingTime: string;
  words: number;
} {
  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  if (words < 50) {
    return { readingTime: "Quick read", words };
  }

  const wordsPerMinute = 225;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  const readingTime = minutes === 1 ? "1 min read" : `${minutes} mins read`;

  return { readingTime, words };
}

export default function ShareNotePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [readingTime, setReadingTime] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number | null>(null);

  // --- TTS States ---
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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
      } else if (data) {
        setNote(data);
        const { readingTime, words } = calculateReadingTime(data.body);
        setReadingTime(readingTime);
        setWordCount(words);
      }
      setLoading(false);
    };

    fetchNote();
  }, [shareId]);

  // Load available voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        setSelectedVoice(v[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // --- TTS Handlers ---
  const handleSpeak = () => {
    if (!note) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      DOMPurify.sanitize(note.body, { ALLOWED_TAGS: [] })
    );

    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // --- Fallback UI ---
  const Fallback = ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <Card className="w-full max-w-lg border-muted bg-background">
        <CardContent className="flex flex-col items-center text-center p-6 sm:p-12">
          <div className="mb-6">{icon}</div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {description}
          </p>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground text-sm sm:text-base">
          Loading note…
        </span>
      </div>
    );

  if (error)
    return (
      <Fallback
        icon={
          <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive" />
        }
        title="Unable to load note"
        description={error}
      />
    );

  if (!note)
    return (
      <Fallback
        icon={
          <FileQuestion className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        }
        title="Note not found"
        description="This note is private or does not exist."
      />
    );

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b bg-muted/40">
        <Link to="/" className="flex items-center space-x-3">
          <img src={appLogo} alt="App Logo" className="h-7 w-7" />
          <span className="font-semibold text-base sm:text-lg">InkLine</span>
        </Link>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <select
            className="border rounded-xl px-3 py-2 text-sm bg-background w-full sm:w-auto"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name}{" "}
                {voice.lang.includes("en") ? "" : `(${voice.lang})`}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeak}
            className="flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto"
          >
            {isSpeaking ? (
              isPaused ? (
                <Play size={16} />
              ) : (
                <Pause size={16} />
              )
            ) : (
              <Volume2 size={16} />
            )}
            {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Listen"}
          </Button>

          {isSpeaking && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStop}
              className="flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto"
            >
              <Square size={16} />
              Stop
            </Button>
          )}
        </div>
      </header>

      {/* Note content */}
      <main className="max-w-3xl mx-auto p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
          {note.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {readingTime}
          {wordCount !== null &&
            wordCount >= 50 &&
            ` (${formatNumber(wordCount)} words)`}{" "}
          • Last updated {new Date(note.updated_at).toLocaleString()}
        </p>
        <div
          className="prose prose-sm sm:prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap break-all"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.body) }}
        />
      </main>
    </div>
  );
}
