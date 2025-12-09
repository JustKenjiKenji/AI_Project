// bass_ga.js
// Genetic algorithm bassline generator for 15 bars, A minor, 4/4, 16 steps per bar
// No external libraries
//lol
// ----------------------------
// 1) Project configuration
// ----------------------------
const CONFIG = {
  tempo: 130,
  timeSignature: "4/4",
  stepsPerBar: 16,
  key: "A minor",
  sections: [
    { name: "A", bars: 8 },
    { name: "B", bars: 8 }
  ],
  playOrder: ["A", "B", "A"],
  totalBars: 16
};

// ----------------------------
// 2) Musical constants
// ----------------------------
const SCALE = [
  "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3"
];
const ROOT_NOTE = "A2";
const STRONG_STEPS = new Set([0, 4, 8, 12]); // beats 1, 2, 3, 4 in 16 step grid

// section profiles
const PROFILE_A = {
  name: "A",
  pStrong: 0.75,
  pOff: 0.30,
  targetMin: 5,
  targetMax: 9,
  syncMin: 0.15,
  syncMax: 0.35,
  leapWeight: 0.5
};

const PROFILE_B = {
  name: "B",
  pStrong: 0.65,
  pOff: 0.40,
  targetMin: 6,
  targetMax: 10,
  syncMin: 0.25,
  syncMax: 0.50,
  leapWeight: 0.9
};

function profileFor(name) {
  return name === "B" ? PROFILE_B : PROFILE_A;
}


// map note names in SCALE to MIDI numbers
function noteToMidi(note) {
  switch (note) {
    case "A2": return 45;
    case "B2": return 47;
    case "C3": return 48;
    case "D3": return 50;
    case "E3": return 52;
    case "F3": return 53;
    case "G3": return 55;
    case "A3": return 57;
    default:   return null; // for "--" or anything unknown
  }
}


// ----------------------------
// 3) Utilities
// ----------------------------
function rng() { return Math.random(); }
function choice(arr) { return arr[Math.floor(rng() * arr.length)]; }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function scaleIndex(note) { return SCALE.indexOf(note); }
function noteFromIndex(i) { return SCALE[clamp(i, 0, SCALE.length - 1)]; }
function barToString(tokens) { return tokens.join(" "); }

function lastNoteBefore(tokens, idx) {
  for (let i = idx - 1; i >= 0; i--) {
    if (tokens[i] !== "--") return tokens[i];
  }
  return ROOT_NOTE;
}

// ----------------------------
// 4) Random bar generation building blocks
// ----------------------------
function wantHit(step, profile) {
  const onStrong = STRONG_STEPS.has(step);
  const pStrong = profile.pStrong;
  const pOff = profile.pOff;
  return rng() < (onStrong ? pStrong : pOff);
}

function nextPitch(prevNote, profile) {
  const prevIdx = prevNote ? scaleIndex(prevNote) : scaleIndex(ROOT_NOTE);
  const candidates = [];

  const neighbors = [prevIdx - 1, prevIdx, prevIdx + 1].filter(
    i => i >= 0 && i < SCALE.length
  );
  neighbors.forEach(i => candidates.push({ idx: i, w: 3 }));

  const leaps = [prevIdx - 2, prevIdx + 2].filter(
    i => i >= 0 && i < SCALE.length
  );
  leaps.forEach(i => candidates.push({ idx: i, w: profile.leapWeight }));

  let total = candidates.reduce((s, c) => s + c.w, 0);
  let t = rng() * total;
  for (const c of candidates) {
    t -= c.w;
    if (t <= 0) return noteFromIndex(c.idx);
  }
  return noteFromIndex(candidates[candidates.length - 1].idx);
}

function adjustDensity(tokens, targetMin, targetMax, profile) {
  let hits = tokens.filter(t => t !== "--").length;

  if (hits > targetMax) {
    const removable = [];
    for (let i = tokens.length - 1; i >= 1; i--) {
      if (tokens[i] !== "--" && !STRONG_STEPS.has(i)) removable.push(i);
    }
    while (hits > targetMax && removable.length) {
      const i = removable.shift();
      if (tokens[i] !== "--") {
        tokens[i] = "--";
        hits--;
      }
    }
  }

  if (hits < targetMin) {
    const addable = [];
    for (let i = 1; i < tokens.length; i++) {
      if (tokens[i] === "--") addable.push(i);
    }
    while (hits < targetMin && addable.length) {
      const i = addable.shift();
      const prev = lastNoteBefore(tokens, i);
      tokens[i] = nextPitch(prev, profile);
      hits++;
    }
  }

  return tokens;
}

function randomBar(profile) {
  const steps = CONFIG.stepsPerBar;
  const tokens = Array.from({ length: steps }, () => "--");
  tokens[0] = ROOT_NOTE;

  let lastNote = ROOT_NOTE;
  for (let i = 1; i < steps; i++) {
    if (wantHit(i, profile)) {
      const n = nextPitch(lastNote, profile);
      tokens[i] = n;
      lastNote = n;
    }
  }

  adjustDensity(tokens, profile.targetMin, profile.targetMax, profile);

  for (let i = 2; i < steps; i++) {
    if (
      tokens[i] !== "--" &&
      tokens[i - 1] === tokens[i] &&
      tokens[i - 2] === tokens[i]
    ) {
      tokens[i] = nextPitch(tokens[i - 1], profile);
    }
  }

  return tokens;
}

// ----------------------------
// 5) Fitness function
// ----------------------------
// Scores between roughly 0 and 1
function fitness(bar, profile) {
  const steps = bar.length;
  let hits = 0;
  let rootOnFirst = 0;
  let extraRoots = 0;

  for (let i = 0; i < steps; i++) {
    if (bar[i] !== "--") {
      hits++;
      if (i === 0 && bar[i] === ROOT_NOTE) rootOnFirst = 1;
      if (STRONG_STEPS.has(i) && i !== 0 && bar[i] === ROOT_NOTE) extraRoots++;
    }
  }

  if (hits === 0) return 0.01;

  const strongPositions = [4, 8, 12];
  const rootSupport = extraRoots / strongPositions.length;
  const rootScore = 0.7 * rootOnFirst + 0.3 * rootSupport;

  const density = hits / steps;
  const idealMin = profile.targetMin / steps;
  const idealMax = profile.targetMax / steps;
  const idealCenter = (idealMin + idealMax) / 2;
  const halfSpan = (idealMax - idealMin) / 2 || 0.01;
  let densityScore = 1 - Math.abs(density - idealCenter) / halfSpan;
  densityScore = Math.max(0, Math.min(1, densityScore));

  const notePositions = [];
  for (let i = 0; i < steps; i++) {
    if (bar[i] !== "--") notePositions.push(i);
  }
  const intervals = [];
  for (let k = 1; k < notePositions.length; k++) {
    const a = bar[notePositions[k - 1]];
    const b = bar[notePositions[k]];
    const ia = scaleIndex(a);
    const ib = scaleIndex(b);
    if (ia >= 0 && ib >= 0) intervals.push(Math.abs(ib - ia));
  }
  let intervalScore = 0.6;
  if (intervals.length > 0) {
    const meanInt = intervals.reduce((s, x) => s + x, 0) / intervals.length;
    intervalScore = 1 / (1 + Math.max(0, meanInt - 1));
  }

  let offHits = 0;
  for (let i = 0; i < steps; i++) {
    if (bar[i] !== "--" && !STRONG_STEPS.has(i)) offHits++;
  }
  const syncRatio = offHits / hits;
  const center = (profile.syncMin + profile.syncMax) / 2;
  const span = (profile.syncMax - profile.syncMin) / 2 || 0.01;
  let syncScore = 1 - Math.abs(syncRatio - center) / span;
  syncScore = Math.max(0, Math.min(1, syncScore));

  const fit =
    0.30 * rootScore +
    0.25 * densityScore +
    0.25 * intervalScore +
    0.20 * syncScore;

  return fit;
}

// ----------------------------
// 6) Genetic operators
// ----------------------------
function crossover(parentA, parentB) {
  const steps = parentA.length;
  const cp = 1 + Math.floor(rng() * (steps - 1));
  const child = new Array(steps);
  for (let i = 0; i < steps; i++) {
    child[i] = i < cp ? parentA[i] : parentB[i];
  }
  return child;
}

function mutate(bar, profile, rate) {
  const steps = bar.length;
  for (let i = 0; i < steps; i++) {
    if (rng() < rate) {
      if (i === 0) continue;
      if (bar[i] === "--") {
        const prev = lastNoteBefore(bar, i);
        bar[i] = nextPitch(prev, profile);
      } else {
        if (rng() < 0.5) {
          bar[i] = "--";
        } else {
          const prev = lastNoteBefore(bar, i);
          bar[i] = nextPitch(prev, profile);
        }
      }
    }
  }
  return bar;
}

// ----------------------------
// 7) Evolve one section template bar with GA
// ----------------------------
const POP_SIZE = 40;
const GENERATIONS = 40;
const ELITE_COUNT = 6;
const MUT_RATE = 0.08;

function evolveSection(profile) {
  let population = [];
  for (let i = 0; i < POP_SIZE; i++) {
    population.push(randomBar(profile));
  }

  for (let g = 0; g < GENERATIONS; g++) {
    const scored = population.map(bar => ({
      bar,
      fit: fitness(bar, profile)
    }));
    scored.sort((a, b) => b.fit - a.fit);

    const newPop = [];
    for (let i = 0; i < ELITE_COUNT; i++) {
      newPop.push(scored[i].bar.slice());
    }

    while (newPop.length < POP_SIZE) {
      const half = Math.max(1, Math.floor(POP_SIZE / 2));
      const pa = scored[Math.floor(rng() * half)].bar;
      const pb = scored[Math.floor(rng() * half)].bar;
      let child = crossover(pa, pb);
      child = mutate(child, profile, MUT_RATE);
      newPop.push(child);
    }
    population = newPop;
  }

  const finalScored = population.map(bar => ({
    bar,
    fit: fitness(bar, profile)
  }));
  finalScored.sort((a, b) => b.fit - a.fit);

  return finalScored[0].bar;
}

// ----------------------------
// 8) Build bar plan from sections and play order, capped at totalBars
// ----------------------------
function buildPlan() {
  const sectionMap = {};
  CONFIG.sections.forEach(s => (sectionMap[s.name] = s.bars));

  const plan = [];
  while (plan.length < CONFIG.totalBars) {
    for (const tag of CONFIG.playOrder) {
      const count = sectionMap[tag] || 0;
      const remaining = CONFIG.totalBars - plan.length;
      const toAdd = Math.min(count, remaining);
      for (let i = 0; i < toAdd; i++) plan.push(tag);
      if (plan.length >= CONFIG.totalBars) break;
    }
  }
  return plan;
}

// ----------------------------
// 9) Generate full bass score from GA templates
// ----------------------------
function generateBassScore() {
  const templateA = evolveSection(PROFILE_A);
  const templateB = evolveSection(PROFILE_B);

  const plan = buildPlan();
  const bars = [];
  let sectionCounts = { A: 0, B: 0 };

  for (let i = 0; i < plan.length; i++) {
    const sec = plan[i];
    sectionCounts[sec] = (sectionCounts[sec] || 0) + 1;
    const prof = profileFor(sec);
    const baseTemplate = sec === "B" ? templateB : templateA;

    let barTokens;
    if (sectionCounts[sec] === 1) {
      barTokens = baseTemplate.slice();
    } else {
      barTokens = mutate(baseTemplate.slice(), prof, 0.10);
    }

    bars.push({
      section: sec,
      index: i + 1,
      pattern: barToString(barTokens)
    });
  }

  return {
    config: {
      tempo: CONFIG.tempo,
      timeSignature: CONFIG.timeSignature,
      stepsPerBar: CONFIG.stepsPerBar,
      key: CONFIG.key,
      sections: CONFIG.sections,
      playOrder: CONFIG.playOrder,
      totalBars: CONFIG.totalBars
    },
    bass: bars
  };
}

// ----------------------------
// 10) Run and print
// ----------------------------
// ----------------------------
// 10) Run and print
// ----------------------------
// ----------------------------
// 10) Run and print
// ----------------------------
const finalScore = generateBassScore();

console.log("\n=== Bass, 16 bars, A minor, 4/4, 16 steps (GA based) ===\n");
for (const b of finalScore.bass) {
  console.log(
    `[${b.index.toString().padStart(2, "0")}] ${b.section} | ${b.pattern}`
  );
}

// one array of bar strings
const allBarsArray = finalScore.bass.map(b => b.pattern);
console.log("\nONE ARRAY OF BASS BARS:");
console.log(JSON.stringify(allBarsArray));

// noteToMidi helper (if you have not added it yet)


// write JSON file for later use
const fs = require("fs");

const midiScore = {
  config: finalScore.config,
  bass: finalScore.bass.map(barObj => {
    const tokens = barObj.pattern.split(" ");
    const midiNotes = tokens.map(t => (t === "--" ? null : noteToMidi(t)));
    return {
      section: barObj.section,
      index: barObj.index,
      notes: midiNotes
    };
  })
};

fs.writeFileSync(
  "bass_score_midi.json",
  JSON.stringify(midiScore, null, 2),
  "utf8"
);

console.log("Wrote bass_score_midi.json to disk.");
