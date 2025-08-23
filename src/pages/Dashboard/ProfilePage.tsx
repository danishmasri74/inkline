import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, User } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  public_notes_count?: number;
}

export default function ProfilePage({ session }: { session: Session }) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const userId = id || session.user.id;

      const { data, error } = await supabase
        .from("public_profiles_overview")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data as Profile);
        setIsOwner(userId === session.user.id);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [id, session.user.id]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        is_public: profile.is_public,
      })
      .eq("id", session.user.id);

    if (error) console.error("Error updating profile:", error.message);

    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-center text-muted-foreground">Profile not found.</p>
    );
  }

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl font-semibold">
            {isOwner
              ? "My Profile"
              : `${profile.display_name || profile.username}'s Profile`}
          </CardTitle>
          <CardDescription>
            {isOwner
              ? "Manage your personal information here"
              : "User details and bio"}
          </CardDescription>
          {isOwner && (
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            {isOwner ? (
              <Input
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
              />
            ) : (
              <p className="text-sm font-mono text-muted-foreground">
                @{profile.username}
              </p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            {isOwner ? (
              <Input
                value={profile.display_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground">
                {profile.display_name || "—"}
              </p>
            )}
          </div>

          {/* Bio with counter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex justify-between items-center">
              <span>Bio</span>
              {isOwner && (
                <span className="text-xs text-muted-foreground">
                  {profile.bio?.length || 0} / 160
                </span>
              )}
            </label>
            {isOwner ? (
              <Textarea
                className="min-h-[100px]"
                maxLength={160}
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-line">
                {profile.bio || "No bio yet."}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">
                {profile.public_notes_count ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Public Notes</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Joined</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {new Date(profile.updated_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Last Updated</p>
            </div>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Logout</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will log you out of your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
