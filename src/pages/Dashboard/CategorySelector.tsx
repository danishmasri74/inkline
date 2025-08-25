import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Plus, Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type CategorySelectorProps = {
  noteId: string;
  initialCategoryId?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
};

export default function CategorySelector({
  noteId,
  initialCategoryId = null,
  onCategoryChange = () => {},
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(
    initialCategoryId
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentCategory = categories.find((c) => c.id === categoryId) || null;

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    if (!error && data) setCategories(data);
  };

  const assignCategory = async (id: string | null) => {
    setCategoryId(id);
    await supabase.from("notes").update({ category_id: id }).eq("id", noteId);
    onCategoryChange(id);
    setOpen(false);
    setSearch("");
  };

  const createCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const { data, error } = await supabase.rpc("upsert_category", {
      p_name: trimmed,
    });

    if (error) {
      console.error("Create category failed:", error.message);
      return;
    }

    await fetchCategories();
    assignCategory(data);
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    if (categoryId === id) await assignCategory(null);
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCategoryId(initialCategoryId || null);
  }, [initialCategoryId, noteId]);

  const lowerSearch = search.toLowerCase();
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(lowerSearch)
  );
  const exactMatch = categories.some(
    (c) => c.name.toLowerCase() === lowerSearch
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center gap-2 w-full sm:w-[220px] rounded-md border px-2 py-1 cursor-text"
          onClick={() => setOpen(true)}
        >
          {currentCategory ? (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs px-2 py-0.5"
            >
              {currentCategory.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  assignCategory(null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">Set category…</span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-full sm:w-[220px]">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or create..."
            value={search}
            onValueChange={setSearch}
            className="text-xs"
          />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  onSelect={() => assignCategory(cat.id)}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        cat.id === categoryId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {cat.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(cat.id);
                    }}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </CommandItem>
              ))}

              {search.trim() && !exactMatch && (
                <CommandItem
                  onSelect={() => createCategory(search.trim())}
                  className="flex items-center gap-2 text-primary text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create “{search.trim()}”
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
