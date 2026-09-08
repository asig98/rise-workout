import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/* Two deployment targets, one config.

   Vercel serves the app from the root of its own domain, so the defaults are
   right there: base "/" and output into dist/.

   GitHub Pages serves this repo from a subfolder — asig98.github.io/rise-workout
   — so every asset URL needs that prefix, and Pages reads the built files from
   docs/ on the main branch. Rather than branch on an env var (awkward across
   Windows and CI), that build passes the two differences as CLI flags:

       npm run build:pages   ->  vite build --base=/rise-workout/ --outDir=docs

   Keeping the Pages URL alive matters for a reason that isn't obvious: it's the
   origin people's installed PWAs are pinned to, and localStorage — every
   workout, streak and record — belongs to that origin. Moving hosts silently
   empties their history.

   https://vite.dev/config/ */
export default defineConfig({
  plugins: [react()],
})
