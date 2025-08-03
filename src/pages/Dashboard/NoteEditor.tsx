import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Note } from "@/types/Notes"
import { supabase } from "@/lib/supabaseClient"

type NoteEditorProps = {
  note: Note | null
  onUpdate: (updatedNote: Note) => void
}

const MAX_BODY_LENGTH = 4096

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setBody(note.body)
    }
  }, [note])

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
              console.error("Auto-save failed:", error.message)
            } else if (data) {
              onUpdate(data)
            }
          })
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [title, body, note])

  if (!note) return <p className="text-muted-foreground italic">Select a note to view/edit</p>

  return (
    <div
      className="bg-card text-card-foreground rounded-md border border-border font-typewriter leading-relaxed tracking-wide prose max-w-none p-8 min-h-[75vh] md:shadow-md"
      style={{
        fontSize: "16px",
        lineHeight: "1.8",
        letterSpacing: "0.02em",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        minHeight: "75vh",
      }}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="text-3xl mb-6 font-bold font-typewriter bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
      />

      <Textarea
        value={body}
        onChange={(e) => {
          if (e.target.value.length <= MAX_BODY_LENGTH) {
            setBody(e.target.value)
          }
        }}
        rows={20}
        placeholder="Start typing your note..."
        className="resize-none bg-transparent border-none p-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground font-typewriter text-base"
      />

      <div className="text-right text-sm text-muted-foreground mt-2">
        {body.length} / {MAX_BODY_LENGTH}
      </div>
    </div>
  )
}
