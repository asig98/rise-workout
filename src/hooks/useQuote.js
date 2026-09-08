/* Quote card state. Pulls a page of quotes from DummyJSON once, then walks
   through them locally so "another one" is instant.

   Falls back to the 36 quotes bundled with the app if the request fails —
   which is the whole point of keeping them: an installed PWA opened offline
   should still greet you with something. */

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchQuotes } from "../api/dummyjson";
import { QUOTES } from "../lib/content";

const BUNDLED = QUOTES.map((q) => ({ text: q.t, author: q.a }));

export function useQuote() {
  const [pool, setPool] = useState(BUNDLED);
  const [index, setIndex] = useState(
    // Same quote all day, different each day — deterministic, not random.
    () => Math.floor(Date.now() / 86400000) % BUNDLED.length
  );
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    fetchQuotes(30, Math.floor(Math.random() * 60))
      .then((quotes) => {
        if (!alive.current || !quotes.length) return;
        setPool(quotes);
        setIndex(Math.floor(Date.now() / 86400000) % quotes.length);
        setLive(true);
      })
      .catch(() => {
        /* stay on the bundled set */
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    return () => {
      alive.current = false;
    };
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % pool.length);
  }, [pool.length]);

  return { quote: pool[index % pool.length], next, live, loading };
}
