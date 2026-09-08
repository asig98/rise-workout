/* Gives every component a way to fire confetti without threading a ref down
   through five layers. The canvas itself is rendered here, once. */

import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { ConfettiCanvas } from "./ConfettiCanvas";

const ConfettiContext = createContext({ burst: () => {}, bigConfetti: () => {} });

export function ConfettiProvider({ children }) {
  const ref = useRef(null);

  const burst = useCallback((x, y, count) => ref.current?.burst(x, y, count), []);
  const bigConfetti = useCallback((gold) => ref.current?.bigConfetti(gold), []);
  const value = useMemo(() => ({ burst, bigConfetti }), [burst, bigConfetti]);

  return (
    <ConfettiContext.Provider value={value}>
      <ConfettiCanvas ref={ref} />
      {children}
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  return useContext(ConfettiContext);
}
