import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

// Pages
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ResetPassword from "./pages/Auth/ResetPassword";
import NotesPage from "./pages/Dashboard/NotesPage"; // layout wrapper
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import ShareNotePage from "./pages/ShareNotePage";
import ProfilePage from "./pages/Dashboard/ProfilePage";

// Example child pages
import NotesDashboard from "./pages/Dashboard/NotesDashboard";
import NoteEditor from "./pages/Dashboard/NoteEditor";

// Protected Route Wrapper
function ProtectedRoute({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!session ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/signup"
        element={!session ? <SignUp /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/share/:shareId" element={<ShareNotePage />} />

      {/* Protected Dashboard Layout with nested routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute session={session}>
            <NotesPage session={session!} />
          </ProtectedRoute>
        }
      >
        {/* 👇 Child routes inside the NotesPage layout */}
        <Route index element={<NotesDashboard />} />
        <Route path="note/:id" element={<NoteEditor />} />
        <Route path="profile" element={<ProfilePage session={session!} />} />
      </Route>

      {/* Root & Catch-All */}
      <Route
        path="/"
        element={
          !session ? <LandingPage /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
