/* API ① lives here — DummyJSON quotes, with the app's own 36 as the fallback.

   The `key` on the <p> is what makes the swap animation replay: React reuses
   the node otherwise and the CSS animation never restarts. The vanilla app did
   the same thing by hand with `void el.offsetWidth`. */

import { Card, GhostButton } from "../ui/Primitives";
import { useQuote } from "../../hooks/useQuote";

export function QuoteCard() {
  const { quote, next, live } = useQuote();

  return (
    <Card className="quote-card rise" style={{ "--d": ".15s" }}>
      <p id="quote" key={quote.text} className="quote-swap">
        {quote.text}
      </p>
      <p id="author">— {quote.author}</p>
      <GhostButton
        className="newquote"
        onClick={next}
        title={live ? "Quotes from the DummyJSON API" : "Showing built-in quotes (offline)"}
      >
        ↻ Another one
      </GhostButton>
    </Card>
  );
}
