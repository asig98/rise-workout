/* API ① — DummyJSON Quotes.  https://dummyjson.com/docs/quotes
   No key, no rate limit, CORS open. Feeds the quote card on the Today tab,
   replacing the 36 quotes that used to be hardcoded in the app. */

import { fetchJson } from "./client";

const BASE = "https://dummyjson.com/quotes";

/** One random quote -> { text, author }. */
export async function fetchRandomQuote() {
  const data = await fetchJson(`${BASE}/random`);
  return { text: data.quote, author: data.author };
}

/** A page of quotes, so the "another one" button doesn't need a round trip. */
export async function fetchQuotes(limit = 30, skip = 0) {
  const data = await fetchJson(`${BASE}?limit=${limit}&skip=${skip}`);
  return (data.quotes || []).map((q) => ({ text: q.quote, author: q.author }));
}
