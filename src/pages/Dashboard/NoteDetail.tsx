import { useParams } from "react-router-dom";
import NoteEditor from "./NoteEditor";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();

  // Fetch note based on id or receive via props/context
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[85ch]">
        {/* NoteEditor Component */}
        <NoteEditor noteId={id} />
      </div>
    </div>
  );
}
