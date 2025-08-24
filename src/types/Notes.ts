export type Note = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  share_id: string;
  archived: boolean;
  view_count: number;
  last_viewed_at: string | null;
  category_id: string | null;

  // optional relation if joined in query
  category?: {
    id: string;
    name: string;
  } | null;
};
