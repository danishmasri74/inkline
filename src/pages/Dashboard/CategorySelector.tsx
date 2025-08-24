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
import { Check, ChevronsUpDown, Plus, Trash, X } from "lucide-react";
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

    // data is the new/updated category id
    await fetchCategories();
    assignCategory(data);
    setSearch("");
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);

    if (categoryId === id) {
      await assignCategory(null);
    }

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
    <div className="mb-4 flex items-center gap-2">
      {currentCategory ? (
        <Badge
          variant="secondary"
          className="text-sm px-3 py-1 flex items-center gap-2"
        >
          {currentCategory.name}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => assignCategory(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ) : (
        <Badge variant="outline" className="text-sm px-3 py-1">
          No Category
        </Badge>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-[200px] justify-between"
          >
            {currentCategory ? currentCategory.name : "Set Category"}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[220px]">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              <CommandGroup>
                {filteredCategories.map((cat) => (
                  <CommandItem
                    key={cat.id}
                    onSelect={() => assignCategory(cat.id)}
                    className="flex justify-between items-center"
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
                      className="h-4 w-4 p-0 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategory(cat.id);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </CommandItem>
                ))}

                {/* Create new category option if no exact match */}
                {search.trim() && !exactMatch && (
                  <CommandItem
                    onSelect={() => createCategory(search.trim())}
                    className="flex items-center gap-2 text-primary"
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
    </div>
  );
}
