# Rise — Wireframe & Component Plan

Written **before** the React implementation, as required by the brief. This is the
map the port follows: page regions → components → where state lives → how events
travel back up.

Rise began as a single 2,025-line `index.html` with hand-rolled DOM updates. The
port keeps every feature and the entire visual design, but replaces imperative
`renderList()` / `getElementById` calls with a component tree and one reducer.

---

## 1. Screen sketches

Three tabs, one fixed bottom tab bar, four overlays that can appear above any tab.
Mobile-first — the app is installed to a phone home screen as a PWA.

### Tab 1 — Today

```
┌──────────────────────────────────────┐
│ ● Tuesday, September 8               │  TodayHeader
│ Rise.                    ┌─────────┐ │
│ Your workout, at home.   │ 🔥 5 day│ │  StreakPill
│                          └─────────┘ │
├──────────────────────────────────────┤
│ "It never gets easier. You just get   │  QuoteCard      ← API ① DummyJSON
│  stronger."              — Unknown    │
│                     [ ↻ Another one ] │
├──────────────────────────────────────┤
│ ☀ 82°F, clear · great day to take     │  WeatherCard    ← API ② Open-Meteo
│   the cardio block outside            │
│                    [ Swap in outdoor ]│
├──────────────────────────────────────┤
│    ╭───╮   Almost there               │  ProgressRingCard
│    │68%│   5 of 8 exercises complete  │
│    ╰───╯                              │
├──────────────────────────────────────┤
│ 🎲 Today's a shuffled workout      [x]│  ShuffleNote (conditional)
├──────────────────────────────────────┤
│ [ ▶ Start workout ] [ 🎲 Surprise me ]│  ActionRow
├──────────────────────────────────────┤
│ ☑ Jumping Jacks      1:00      ⏱ 1:00│  ExerciseList
│ ☑ Push-Ups           3 sets × 12   ▲ │    └ ExerciseRow ×n
│ ☐ Bodyweight Squats  3 sets × 15   ▲ │       (Checkbox, TimerChip, GrowthArrow)
│ ☐ Plank Hold         3 sets × 0:45 ⏱ │
├──────────────────────────────────────┤
│      Reset today's workout            │
└──────────────────────────────────────┘
│  ✓ Today   📊 Progress   ☰ Routine   │  TabBar (fixed)
└──────────────────────────────────────┘
```

**Rest-day variant:** `ProgressRingCard`, `ActionRow` and `ExerciseList` are replaced
by a single `RestDayCard` ("🌙 Rest day · your streak is safe · [Work out anyway]").

### Tab 2 — Progress

```
┌──────────────────────────────────────┐
│ ● Your progress                      │
│ Progress.                            │
├──────────────────────────────────────┤
│               5                       │  HeroCard
│           days in a row               │
├──────────────────────────────────────┤
│ Level 3            2 / 3 workouts     │  LevelCard
│ ████████████░░░░░░░░░░░░              │    └ Meter
├──────────────────────────────────────┤
│ ┌────────┐ ┌────────┐                │  StatGrid
│ │   14   │ │    6   │                │    └ StatCard ×2
│ │WORKOUTS│ │THIS MO.│                │
├──────────────────────────────────────┤
│ 🔥 1,240 kcal burned across 14        │  CaloriesCard   ← API ③ API Ninjas
│    finished workouts                  │
├──────────────────────────────────────┤
│ Personal records                      │  SectionTitle
│ ┌──────┐ ┌──────┐ ┌──────┐           │  RecordGrid
│ │🔥  9 │ │📅  5 │ │🗓️ 18 │           │    └ RecordCard ×3
├──────────────────────────────────────┤
│ Last 12 weeks                         │
│ ░▓█░░▓█ ▓█░▓█░░  ← 84 squares        │  Heatmap
│ ░▓█▓░░█ ░░▓█▓█░                       │    └ HeatCell ×84 → ChartTip
│ Rest · Less ░▒▓█ More                 │    └ HeatLegend
├──────────────────────────────────────┤
│ Last 8 weeks                          │
│  6 ┤    ▄   ▄ ▄                       │  WeeklyBars (SVG) → ChartTip
│  4 ┤  ▄ █ ▄ █ █                       │
│  2 ┤▄ █ █ █ █ █                       │
│    └─┴─┴─┴─┴─┴─┴─                     │
├──────────────────────────────────────┤
│ Achievements                          │
│ 🌱 💪 🎯 🏋️ 💯 🔥 ⚡ ✨ 📈 👑          │  BadgeGrid → Badge ×10
└──────────────────────────────────────┘
```

### Tab 3 — Routine

```
┌──────────────────────────────────────┐
│ ● Build your own                     │
│ Routine.                             │
├──────────────────────────────────────┤
│ Rest days                             │  RestDayPicker
│ (S) M  T  W  T  F (S)                 │    └ DayButton ×7
├──────────────────────────────────────┤
│ Your exercises                        │
│ ⠿ Push-Ups        3×12    [✎] [🗑]   │  EditableList
│ ⠿ Squats          3×15    [✎] [🗑]   │    └ EditableRow ×n
│ ⠿ Plank Hold      3×0:45  [✎] [🗑]   │       (DragHandle, IconButton ×2)
│ Hold the handle and drag to reorder.  │
├──────────────────────────────────────┤
│ Browse the exercise library           │  LibraryBrowser ← API ④ wger
│ [ search…        ] [ Chest ▾ ][None ▾]│    └ MuscleFilter, EquipmentFilter
│ ┌────────────────────────────────┐    │    └ LibraryCard ×n
│ │ Incline Push-Up      Chest     │    │       (name, muscles, description,
│ │ Bodyweight · [ + Add to routine]│    │        [+ Add] → prefills the form)
├──────────────────────────────────────┤
│ Add an exercise                       │  ExerciseForm
│ Name  [                          ]    │    └ Field ×4, FieldRow
│ Sets [3] Reps [12] Seconds [  ]       │
│ Add per level [1]                     │
│ Note [each leg               ]        │
│ [ Add exercise ]  [ Cancel ]          │
├──────────────────────────────────────┤
│    Restore the starter routine        │
└──────────────────────────────────────┘
```

### Overlays (above any tab)

```
GuidedPlayer (full screen)      TimerOverlay            Celebration
┌────────────────────┐        ┌──────────────┐        ┌──────────────┐
│ Exercise 3 of 8  ✕ │        │  Plank Hold  │        │      🏆      │
│ ████████░░░░░░░░   │        │ 3 sets × 45s │        │ NEW RECORD!  │
│                    │        │    ╭────╮    │        │ ┌──────────┐ │
│       Now          │        │    │0:32│    │        │ │🔥 5-day  │ │
│    Push-Ups        │        │    ╰────╯    │        │ │⚡ Level 3│ │
│    12 reps         │        │              │        │ └──────────┘ │
│    Set 2 of 3      │        │[Pause][Close]│        │ [Keep going] │
│  ╭──────────╮      │        └──────────────┘        └──────────────┘
│  │   0:45   │      │
│  ╰──────────╯      │        Toast              ConfettiCanvas
│ Up next: Squats    │        ┌────────────┐     (fixed, full-viewport,
│ [ Done ]  [ Skip ] │        │ Nice one!💪│      pointer-events:none)
└────────────────────┘        └────────────┘
```

---

## 2. Component tree

`←` marks the components that consume an API. Indentation is parent → child.

```
<App>                                    activeTab useState
│
├── <WorkoutProvider>                    ★ THE store: useReducer + localStorage
│   │
│   ├── <Aurora />                       decorative background blobs
│   ├── <ConfettiCanvas ref />           imperative: burst(x,y,n) / bigConfetti(gold)
│   ├── <SvgGradients />                 shared <linearGradient> defs
│   │
│   ├── <TodayView>
│   │   ├── <TodayHeader>
│   │   │   └── <StreakPill count />
│   │   ├── <QuoteCard />                ← useQuote()          API ①
│   │   ├── <WeatherCard />              ← useWeather()        API ②
│   │   ├── <RestDayCard onOverride />           (if rest day)
│   │   ├── <ProgressRingCard done total>
│   │   │   └── <Ring pct />
│   │   ├── <ShuffleNote onUndo />               (if todayPlan)
│   │   ├── <ActionRow>
│   │   │   └── <Button /> ×2
│   │   ├── <ExerciseList exercises done level>
│   │   │   └── <ExerciseRow ex checked onToggle onOpenTimer>
│   │   │       ├── <Checkbox />
│   │   │       └── <TimerChip seconds />
│   │   └── <EmptyNote />                        (if routine empty)
│   │
│   ├── <ProgressView>
│   │   ├── <HeroCard streak />
│   │   ├── <LevelCard level into perLevel>
│   │   │   └── <Meter pct />
│   │   ├── <StatGrid>
│   │   │   └── <StatCard value label /> ×2
│   │   ├── <CaloriesCard />             ← useCaloriesBurned() API ③
│   │   ├── <RecordGrid>
│   │   │   └── <RecordCard icon value label /> ×3
│   │   ├── <Heatmap history restDays>
│   │   │   ├── <HeatCell level today onTip /> ×84
│   │   │   └── <HeatLegend />
│   │   ├── <WeeklyBars weeks onTip />           (hand-built SVG)
│   │   ├── <BadgeGrid>
│   │   │   └── <Badge icon name desc earned /> ×10
│   │   └── <ChartTip x y html />                (shared by both charts)
│   │
│   ├── <RoutineView>                    editingId useState
│   │   ├── <RestDayPicker restDays onToggle>
│   │   │   └── <DayButton /> ×7
│   │   ├── <EditableList routine onReorder onEdit onDelete>
│   │   │   └── <EditableRow ex onDragStart onKeyMove>
│   │   │       ├── <DragHandle />
│   │   │       └── <IconButton /> ×2
│   │   ├── <LibraryBrowser onAdd />     ← useExerciseSearch() API ④
│   │   │   ├── <SearchField />
│   │   │   ├── <FilterSelect /> ×2
│   │   │   └── <LibraryCard ex onAdd /> ×n
│   │   └── <ExerciseForm editing onSave onCancel>
│   │       ├── <Field /> ×4
│   │       └── <Button /> ×2
│   │
│   ├── <GuidedPlayer open onClose />    local useReducer (exIdx/setIdx/phase/left)
│   ├── <TimerOverlay ex onClose />      local useState (left/running)
│   ├── <Celebration gains onClose />
│   ├── <Toast />                        via ToastContext
│   └── <TabBar active onChange />
```

### Reusable primitives (`src/components/ui/`)

Pulled out because each is used in three or more places:

| Component | Used by |
|---|---|
| `<Card>` | every section on all three tabs |
| `<Button variant="primary\|quiet">` | ActionRow, RestDayCard, ExerciseForm, overlays |
| `<IconButton>` | EditableRow edit/delete, player exit, quote refresh |
| `<Ring value max gradient>` | ProgressRingCard, TimerOverlay, GuidedPlayer |
| `<Meter pct>` | LevelCard, GuidedPlayer top bar |
| `<Overlay open onClose>` | TimerOverlay, Celebration, GuidedPlayer (Escape + scroll lock) |
| `<Field label hint>` | all six ExerciseForm inputs, LibraryBrowser search |
| `<SectionTitle>` | Progress ×4, Routine ×2 |
| `<EmptyNote>` | ExerciseList, EditableList, LibraryBrowser |

---

## 3. Where state lives

### The store — `WorkoutContext` (`useReducer`, persisted to `localStorage`)

Exactly the shape the vanilla app already saved under the key `rise-v2`, so **existing
users keep their history**. The old migration routine ports over verbatim.

```js
{
  routine:   [ {id, name, sets, reps, seconds, step, note} ],
  todayPlan: null | [ …same shape… ],   // a shuffle; leaves `routine` untouched
  restDays:  [0],                        // 0 = Sunday
  today:     { date:"2026-09-08", done:[ids], override:false },
  history:   { "2026-09-08": { c:5, t:8 } }
}
```

It lives at the top because three separate subtrees read and write it: Today ticks
exercises, Routine edits the list, Progress reads the history. Prop-drilling through
three tab levels would be worse than a context, and the object is small enough that
re-rendering all consumers on change is free.

**Actions:** `toggleExercise` · `resetToday` · `shuffle` · `undoShuffle` ·
`overrideRest` · `toggleRestDay` · `addExercise` · `updateExercise` · `deleteExercise` ·
`reorderRoutine` · `restoreDefault` · `newDay`

Every action ends by recomputing `history[todayKey()]`, exactly as `recordToday()` does now.

### Derived values — never stored

`levelNow` · `currentStreak` · `bestStreak` · `bestWeek` · `bestMonth` · `totalDone` ·
`dayComplete` · `earnedBadges` · `snapshot` · `diffGains` · `hadPerfectWeek`

All pure functions of `(history, restDays)` in `src/lib/stats.js`, called via `useMemo`.
The current app already derives these rather than logging them; that stays.

### Local state — deliberately *not* in the store

| State | Owner | Why local |
|---|---|---|
| `activeTab` | `App` | pure navigation, nothing else reads it |
| `editingId` | `RoutineView` | dies with the tab |
| timer countdown | `TimerOverlay` | ticks once a second — in the store it would re-render all three tabs every second |
| player position | `GuidedPlayer` | same, plus it's meaningless once closed |
| drag position | `EditableList` | transient; only the final order is dispatched |
| toast text | `ToastContext` | tiny, orthogonal, used from everywhere |
| API results | the four hooks | server cache, not app state |

The timer/player exclusion is the one real performance decision here: a 1 Hz tick in
global state would repaint the heatmap 84 cells at a time, once a second.

---

## 4. How events flow upward

```
       ┌──────────────────────── dispatch ────────────────────────┐
       │                                                          ▼
  <ExerciseRow>  ──onToggle(id)──▶  <ExerciseList>  ──▶  <TodayView>  ──▶  WorkoutContext
       ▲                                                                        │
       └────────────────── checked={done.includes(id)} ◀──── state ─────────────┘
```

Three concrete paths:

1. **Tick an exercise.** `ExerciseRow` calls `onToggle(ex.id)` (passed from `ExerciseList`,
   itself given `dispatch` by `TodayView`) → reducer pushes the id into `today.done` and
   rewrites `history[today]` → ring, streak pill, heatmap and stat cards all re-render
   from the same state. Side effects that aren't state — confetti burst, haptic buzz,
   toast — fire in the handler, not the reducer, so the reducer stays pure.

2. **Finish the last exercise.** `TodayView` holds a `useRef` snapshot taken *before* the
   dispatch. An effect compares it to the snapshot after, and when `done === total` on the
   transition it passes `diffGains(before)` to `<Celebration>`. This mirrors the current
   `updateProgress(before)` ordering — and is why the vanilla code has that comment about
   calling it before `renderList()`.

3. **Add from the library.** `LibraryCard` → `onAdd(wgerExercise)` → `LibraryBrowser` →
   `RoutineView` maps the wger record onto Rise's own exercise shape (name, sets 3,
   reps 12, step 1) and prefills `ExerciseForm` rather than dispatching straight away — the
   user still sets their own reps before it lands in the routine.

Drag-to-reorder is the one exception to "children only emit events": `EditableList` mutates
DOM transforms directly during the drag (pointer events, as today) and dispatches
`reorderRoutine(from, to)` only on `pointerup`. Re-rendering mid-drag would destroy the
node holding the pointer capture.

---

## 5. Where the four APIs attach

| # | API | Key? | Hook | Renders in | Degrades to |
|---|---|---|---|---|---|
| ① | [DummyJSON Quotes](https://dummyjson.com/docs/quotes) | no | `useQuote()` | `<QuoteCard>` on Today | the 36 bundled quotes |
| ② | [Open-Meteo](https://open-meteo.com/en/docs) | no | `useWeather()` | `<WeatherCard>` on Today | card hidden |
| ③ | [API Ninjas — Calories Burned](https://api-ninjas.com/api/caloriesburned) | free key | `useCaloriesBurned()` | `<CaloriesCard>` on Progress | card hidden |
| ④ | [wger](https://wger.de/en/software/api) | no | `useExerciseSearch()` | `<LibraryBrowser>` on Routine | bundled 60-exercise `LIBRARY` |

Each hook returns `{ data, loading, error }` and every consumer renders something useful
when `error` is set — the app has to keep working offline, because it's an installed PWA
that people open in a room with no signal. `useWeather` asks for geolocation once and
falls back to a coarse IP-free default rather than blocking the tab on a permission prompt.

---

## 6. File layout

```
src/
├── main.jsx
├── App.jsx
├── styles/            global.css · tokens.css   (ported from the old <style>)
├── state/             WorkoutContext.jsx · workoutReducer.js · storage.js
├── lib/               stats.js · dates.js · exercises.js · library.js · quotes.js
├── hooks/             useQuote · useWeather · useExerciseSearch · useCaloriesBurned
│                      useInterval · useWakeLock
├── api/               client.js · dummyjson.js · openMeteo.js · wger.js · apiNinjas.js
└── components/
    ├── ui/            Card · Button · IconButton · Ring · Meter · Overlay · Field · Toast
    ├── today/         TodayView · QuoteCard · WeatherCard · ExerciseList · …
    ├── progress/      ProgressView · Heatmap · WeeklyBars · BadgeGrid · …
    ├── routine/       RoutineView · EditableList · ExerciseForm · LibraryBrowser · …
    └── overlays/      GuidedPlayer · TimerOverlay · Celebration · ConfettiCanvas
```
