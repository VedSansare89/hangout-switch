import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && (!url || !anonKey)) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project's credentials — Create Room / Join Room won't work until then."
  );
}

// Fall back to obviously-invalid placeholders rather than throwing, so the
// module can still be evaluated during server-side builds/prerendering
// (which never actually call Supabase) even before real credentials exist.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
