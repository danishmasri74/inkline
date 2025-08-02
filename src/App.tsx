import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get current session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(data.session);
    };

    getSession();

    // Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-4">
      <h1 className="text-2xl font-bold mb-4">InkLine</h1>
      {session ? <p>You're logged in!</p> : <p>Please log in or sign up.</p>}
    </div>
  );
}
