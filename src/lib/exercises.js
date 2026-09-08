/* The bundled exercise library — the offline fallback for the wger API (src/api/wger.js).
   `cat` groups them so a shuffled workout comes out balanced instead of six ab moves. */
export const LIBRARY = [
  // ---- warm up ----
  { id:"wu1", cat:"warmup", name:"Arm Circles",        sets:1, reps:null, seconds:45,  step:5, note:"forwards then back" },
  { id:"wu2", cat:"warmup", name:"Jumping Jacks",      sets:1, reps:null, seconds:60,  step:5, note:"" },
  { id:"wu3", cat:"warmup", name:"March in Place",     sets:1, reps:null, seconds:60,  step:5, note:"knees high" },
  { id:"wu4", cat:"warmup", name:"Leg Swings",         sets:1, reps:null, seconds:45,  step:5, note:"each leg" },
  { id:"wu5", cat:"warmup", name:"Shoulder Rolls",     sets:1, reps:null, seconds:40,  step:5, note:"" },
  { id:"wu6", cat:"warmup", name:"Hip Circles",        sets:1, reps:null, seconds:45,  step:5, note:"" },
  { id:"wu7", cat:"warmup", name:"Torso Twists",       sets:1, reps:null, seconds:45,  step:5, note:"" },
  { id:"wu8", cat:"warmup", name:"Butt Kicks",         sets:1, reps:null, seconds:45,  step:5, note:"" },

  // ---- cardio ----
  { id:"ca1", cat:"cardio", name:"High Knees",         sets:3, reps:null, seconds:40,  step:5, note:"" },
  { id:"ca2", cat:"cardio", name:"Mountain Climbers",  sets:3, reps:null, seconds:30,  step:5, note:"" },
  { id:"ca3", cat:"cardio", name:"Burpees",            sets:3, reps:8,    seconds:null,step:1, note:"" },
  { id:"ca4", cat:"cardio", name:"Skater Hops",        sets:3, reps:null, seconds:40,  step:5, note:"side to side" },
  { id:"ca5", cat:"cardio", name:"Star Jumps",         sets:3, reps:null, seconds:35,  step:5, note:"" },
  { id:"ca6", cat:"cardio", name:"Fast Feet",          sets:3, reps:null, seconds:30,  step:5, note:"" },
  { id:"ca7", cat:"cardio", name:"Shadow Boxing",      sets:3, reps:null, seconds:60,  step:5, note:"" },
  { id:"ca8", cat:"cardio", name:"Squat Jumps",        sets:3, reps:10,   seconds:null,step:1, note:"" },
  { id:"ca9", cat:"cardio", name:"Plank Jacks",        sets:3, reps:null, seconds:30,  step:5, note:"" },

  // ---- upper body ----
  { id:"up1", cat:"push",   name:"Push-Ups",           sets:3, reps:12,   seconds:null,step:1, note:"" },
  { id:"up2", cat:"push",   name:"Knee Push-Ups",      sets:3, reps:12,   seconds:null,step:1, note:"" },
  { id:"up3", cat:"push",   name:"Incline Push-Ups",   sets:3, reps:12,   seconds:null,step:1, note:"hands on a chair" },
  { id:"up4", cat:"push",   name:"Diamond Push-Ups",   sets:3, reps:8,    seconds:null,step:1, note:"" },
  { id:"up5", cat:"push",   name:"Wide Push-Ups",      sets:3, reps:12,   seconds:null,step:1, note:"" },
  { id:"up6", cat:"push",   name:"Pike Push-Ups",      sets:3, reps:8,    seconds:null,step:1, note:"shoulders" },
  { id:"up7", cat:"push",   name:"Tricep Dips",        sets:3, reps:12,   seconds:null,step:1, note:"off a chair" },
  { id:"up8", cat:"push",   name:"Wall Push-Ups",      sets:3, reps:15,   seconds:null,step:2, note:"" },
  { id:"up9", cat:"push",   name:"Plank Shoulder Taps",sets:3, reps:20,   seconds:null,step:2, note:"" },
  { id:"up10",cat:"push",   name:"Superman Hold",      sets:3, reps:null, seconds:30,  step:5, note:"back" },
  { id:"up11",cat:"push",   name:"Arm Haulers",        sets:3, reps:null, seconds:30,  step:5, note:"" },
  { id:"up12",cat:"push",   name:"Prone Y-Raise",      sets:3, reps:12,   seconds:null,step:1, note:"upper back" },

  // ---- legs ----
  { id:"lg1", cat:"legs",   name:"Bodyweight Squats",  sets:3, reps:15,   seconds:null,step:2, note:"" },
  { id:"lg2", cat:"legs",   name:"Forward Lunges",     sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"lg3", cat:"legs",   name:"Reverse Lunges",     sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"lg4", cat:"legs",   name:"Split Squats",       sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"lg5", cat:"legs",   name:"Glute Bridges",      sets:3, reps:15,   seconds:null,step:2, note:"" },
  { id:"lg6", cat:"legs",   name:"Single-Leg Bridge",  sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"lg7", cat:"legs",   name:"Wall Sit",           sets:3, reps:null, seconds:45,  step:5, note:"" },
  { id:"lg8", cat:"legs",   name:"Calf Raises",        sets:3, reps:20,   seconds:null,step:2, note:"" },
  { id:"lg9", cat:"legs",   name:"Sumo Squats",        sets:3, reps:15,   seconds:null,step:2, note:"wide stance" },
  { id:"lg10",cat:"legs",   name:"Step-Ups",           sets:3, reps:12,   seconds:null,step:1, note:"each leg" },
  { id:"lg11",cat:"legs",   name:"Curtsy Lunges",      sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"lg12",cat:"legs",   name:"Donkey Kicks",       sets:3, reps:15,   seconds:null,step:2, note:"each leg" },
  { id:"lg13",cat:"legs",   name:"Fire Hydrants",      sets:3, reps:15,   seconds:null,step:2, note:"each leg" },
  { id:"lg14",cat:"legs",   name:"Side Lunges",        sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"lg15",cat:"legs",   name:"Chair Squats",       sets:3, reps:12,   seconds:null,step:1, note:"" },

  // ---- core ----
  { id:"co1", cat:"core",   name:"Plank Hold",         sets:3, reps:null, seconds:45,  step:5, note:"" },
  { id:"co2", cat:"core",   name:"Side Plank",         sets:3, reps:null, seconds:30,  step:5, note:"each side" },
  { id:"co3", cat:"core",   name:"Bicycle Crunches",   sets:3, reps:20,   seconds:null,step:2, note:"" },
  { id:"co4", cat:"core",   name:"Dead Bug",           sets:3, reps:12,   seconds:null,step:1, note:"each side" },
  { id:"co5", cat:"core",   name:"Bird Dog",           sets:3, reps:12,   seconds:null,step:1, note:"each side" },
  { id:"co6", cat:"core",   name:"Russian Twists",     sets:3, reps:20,   seconds:null,step:2, note:"" },
  { id:"co7", cat:"core",   name:"Leg Raises",         sets:3, reps:12,   seconds:null,step:1, note:"" },
  { id:"co8", cat:"core",   name:"Flutter Kicks",      sets:3, reps:null, seconds:30,  step:5, note:"" },
  { id:"co9", cat:"core",   name:"Hollow Hold",        sets:3, reps:null, seconds:30,  step:5, note:"" },
  { id:"co10",cat:"core",   name:"Crunches",           sets:3, reps:20,   seconds:null,step:2, note:"" },
  { id:"co11",cat:"core",   name:"Reverse Crunches",   sets:3, reps:15,   seconds:null,step:2, note:"" },
  { id:"co12",cat:"core",   name:"Toe Touches",        sets:3, reps:20,   seconds:null,step:2, note:"" },
  { id:"co13",cat:"core",   name:"V-Ups",              sets:3, reps:10,   seconds:null,step:1, note:"" },

  // ---- cool down ----
  { id:"cd1", cat:"cooldown",name:"Hamstring Stretch", sets:1, reps:null, seconds:60,  step:0, note:"each leg" },
  { id:"cd2", cat:"cooldown",name:"Quad Stretch",      sets:1, reps:null, seconds:60,  step:0, note:"each leg" },
  { id:"cd3", cat:"cooldown",name:"Child's Pose",      sets:1, reps:null, seconds:60,  step:0, note:"" },
  { id:"cd4", cat:"cooldown",name:"Cat-Cow",           sets:1, reps:null, seconds:45,  step:0, note:"" },
  { id:"cd5", cat:"cooldown",name:"Chest Opener",      sets:1, reps:null, seconds:45,  step:0, note:"" },
  { id:"cd6", cat:"cooldown",name:"Figure-Four Stretch",sets:1,reps:null, seconds:60,  step:0, note:"each side" },
  { id:"cd7", cat:"cooldown",name:"Downward Dog",      sets:1, reps:null, seconds:45,  step:0, note:"" },
  { id:"cd8", cat:"cooldown",name:"Neck Rolls",        sets:1, reps:null, seconds:40,  step:0, note:"slow" }
];

// The starter routine everyone begins with
export const DEFAULT_ROUTINE = [
  { id:"e1", name:"Jumping Jacks",       sets:1, reps:null, seconds:60,  step:5, note:"warm up" },
  { id:"e2", name:"Push-Ups",            sets:3, reps:12,   seconds:null,step:1, note:"" },
  { id:"e3", name:"Bodyweight Squats",   sets:3, reps:15,   seconds:null,step:2, note:"" },
  { id:"e4", name:"Plank Hold",          sets:3, reps:null, seconds:45,  step:5, note:"" },
  { id:"e5", name:"Forward Lunges",      sets:3, reps:10,   seconds:null,step:1, note:"each leg" },
  { id:"e6", name:"Glute Bridges",       sets:3, reps:15,   seconds:null,step:2, note:"" },
  { id:"e7", name:"Mountain Climbers",   sets:3, reps:null, seconds:30,  step:5, note:"" },
  { id:"e8", name:"Child's Pose",        sets:1, reps:null, seconds:300, step:0, note:"cool down" }
];

/* Build a balanced workout instead of picking at random from the whole
   list — random alone gives you three warm-ups and no legs. */
export const RECIPE = [
  ["warmup",1], ["cardio",1], ["push",2], ["legs",2], ["core",2], ["cooldown",1]
];
export function shuffled(arr){
  const a = arr.slice();
  for(let i = a.length-1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function generateWorkout(){
  const plan = [];
  RECIPE.forEach(([cat, n]) => {
    shuffled(LIBRARY.filter(e => e.cat === cat)).slice(0, n)
      .forEach(e => plan.push(Object.assign({}, e)));   // a copy, so edits can't touch the library
  });
  return plan;
}

/* A weather-driven variant, used by the "take it outside" button on the
   Today tab when Open-Meteo says conditions are good. Weighted towards
   cardio and legs — the parts of a home routine that actually benefit from
   a park — and it skips floor work you would not want to do on wet grass. */
const OUTDOOR_RECIPE = [
  ["warmup", 1], ["cardio", 3], ["legs", 3], ["push", 1], ["cooldown", 1]
];
const FLOOR_WORK = /plank|dead bug|bird dog|hollow|crunch|flutter|russian|superman|child|cat-cow|downward/i;

export function generateOutdoorWorkout(){
  const plan = [];
  OUTDOOR_RECIPE.forEach(([cat, n]) => {
    shuffled(LIBRARY.filter(e => e.cat === cat && !FLOOR_WORK.test(e.name)))
      .slice(0, n)
      .forEach(e => plan.push(Object.assign({}, e)));
  });
  return plan;
}
