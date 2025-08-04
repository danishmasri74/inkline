import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

// Pages
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ResetPassword from "./pages/Auth/ResetPassword";
import NotesPage from "./pages/Dashboard/NotesPage";
import LandingPage from "./pages/LandingPage";

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

      {/* Protected Route */}
      <Route
        path="/dashboard"
        element={
          session ? (
            <NotesPage session={session} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch All */}
      <Route
        path="/"
        element={
          !session ? <LandingPage /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="*"
        element={<Navigate to={session ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}
