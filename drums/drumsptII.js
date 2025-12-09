// GLAM ROCK DRUM GA 
// 8 bars | 120 BPM | 4/4 | 16 steps per bar

const fs = require("fs"); //writing on JSON file 

// settings
const BPM = 120;
const TIME_SIGNATURE = { num: 4, den: 4 };
const STEPS = 16;
const BARS = 8;

const POPULATION_SIZE = 30;
const GENERATIONS = 20;
const MUTATION_RATE = 0.18; // moderate mutation

// Derived timings (for metadata only)
const secondsPerBeat = 60 / BPM;
const beatsPerBar = TIME_SIGNATURE.num;
const secondsPerBar = secondsPerBeat * beatsPerBar;
const totalDurationSeconds = secondsPerBar * BARS;

//dataset
const dataset = JSON.parse(fs.readFileSync("glam_rock_dataset.json", "utf8"));
const DATASET_BARS = dataset.dataset.flatMap(g => g.bars);

//drums and rules
const DRUMS = ["kick", "snare", "hihat", "crash"];

// Allowed positions (strict rules)
const SNARE_POS = new Set([4, 12]);      // only main backbeat
const HIHAT_EIGHTHS = Array.from({length: 8}, (_,i) => i*2); // 0,2,4,..14
const KICK_PRIMARY = new Set([0, 8]);    // main pulses
const KICK_SYNCOP = new Set([3,6,10]);   // allowed gentle syncopation
const FILL_STEPS = new Set([14,15]);     // allowed fill positions
// CRASH will be added only on section starts after track generation

//create an empty bar 
function emptyBar() {
  return {}; // keep sparse object, only steps with hits are stored
}

// Helper, compact (remove empty arrays)
function compactBar(bar) {
  const out = {};
  for (let i = 0; i < STEPS; i++) {
    if (bar[i] && bar[i].length) out[i] = [...bar[i]];
  }
  return out;
}

//random bar generator
function randomBar() {
  // Start with enforced hi-hat eight-note feel
  const bar = {};
  // hi-hat, default on 8th notes with high probability
  for (const s of HIHAT_EIGHTHS) {
    if (Math.random() < 0.95) { 
      bar[s] = bar[s] ? bar[s].concat("hihat") : ["hihat"];
    }
  }

  // Kick strong at 0 and often at 8
  if (Math.random() < 0.95) bar[0] = (bar[0]||[]).concat("kick");
  if (Math.random() < 0.75) bar[8] = (bar[8]||[]).concat("kick");

  // occasional syncopated kicks
  for (const s of [...KICK_SYNCOP]) {
    if (Math.random() < 0.2) bar[s] = (bar[s]||[]).concat("kick");
  }

  //prefer core backbeat only
  if (Math.random() < 0.95) bar[4] = (bar[4]||[]).concat("snare");
  if (Math.random() < 0.95) bar[12] = (bar[12]||[]).concat("snare");

  // small chance of tasteful extra hi-hat
  if (Math.random() < 0.05) {
    const s = Math.random() < 0.5 ? 2 : 10;
    bar[s] = (bar[s]||[]).concat("hihat");
  }

  return compactBar(bar);
}

//dataset seeder
function datasetSeed() {
  const src = JSON.parse(JSON.stringify(DATASET_BARS[Math.floor(Math.random()*DATASET_BARS.length)] || {}));
  // ensuring snares only at allowed positions
  const bar = {};
  for (let i = 0; i < STEPS; i++) {
    const hits = src[i] ? [...src[i]] : [];
    const sanitized = [];

    // keep kick only if primary or syncop allowed positions
    for (const h of hits) {
      if (h === "kick") {
        if (KICK_PRIMARY.has(i) || KICK_SYNCOP.has(i)) sanitized.push("kick");
      } else if (h === "snare") {
        if (SNARE_POS.has(i) || FILL_STEPS.has(i)) sanitized.push("snare");
      } else if (h === "hihat") {
        // allow hi-hat
        sanitized.push("hihat");
      } else if (h === "crash") {
        // ignore crash in seed
      }
    }

    if (sanitized.length) bar[i] = sanitized;
  }

  // enforce hi-hat 8th-note base
  for (const s of HIHAT_EIGHTHS) {
    if (!bar[s] && Math.random() < 0.9) bar[s] = ["hihat"];
    else if (bar[s] && !bar[s].includes("hihat") && Math.random() < 0.5) bar[s].push("hihat");
  }

  // ensure snare on 4 & 12 if absent
  if (!bar[4]) bar[4] = ["snare", ...(bar[4] || [])].filter(Boolean);
  if (!bar[12]) bar[12] = ["snare", ...(bar[12] || [])].filter(Boolean);

  return compactBar(bar);
}

//fitness function
function fitness(bar) {
  let score = 0;

  // reward kick on primary steps
  if (bar[0]?.includes("kick")) score += 4;
  if (bar[8]?.includes("kick")) score += 3;

  // penalize kicks outside allowed positions
  for (const stepStr of Object.keys(bar)) {
    const step = Number(stepStr);
    if (bar[step]?.includes("kick") && !KICK_PRIMARY.has(step) && !KICK_SYNCOP.has(step) && !FILL_STEPS.has(step)) {
      score -= 1.5;
    }
  }

  // strongly reward snare on 4 & 12 and penalize snares elsewhere
  if (bar[4]?.includes("snare")) score += 6;
  if (bar[12]?.includes("snare")) score += 6;
  for (const stepStr of Object.keys(bar)) {
    const step = Number(stepStr);
    if (bar[step]?.includes("snare") && !SNARE_POS.has(step) && !FILL_STEPS.has(step)) {
      score -= 4; 
    }
  }

  //reward hi-hat presence on 8th-note positions
  let hiHatHits = 0;
  for (const s of HIHAT_EIGHTHS) {
    if (bar[s]?.includes("hihat")) hiHatHits++;
  }
  score += hiHatHits * 0.6; 

  // small reward for tasteful syncopation
  for (const s of KICK_SYNCOP) {
    if (bar[s]?.includes("kick")) score += 0.8;
  }

  // reward small fills (snare at 14/15)
  if (bar[14]?.includes("snare")) score += 1.5;
  if (bar[15]?.includes("snare")) score += 2.5;
  if (bar[15]?.includes("kick")) score += 0.5;

  // penalize crash
  if (Object.values(bar).flat().includes("crash")) score -= 2;

  // density control
  const totalHits = Object.values(bar).flat().length;
  if (totalHits > 24) score -= 4;
  if (totalHits < 6) score -= 2;

  const uniqueSteps = Object.keys(bar).length;
  if (uniqueSteps >= 6 && uniqueSteps <= 12) score += 1.5;

  for (const ref of DATASET_BARS) {
    for (let s = 0; s < STEPS; s++) {
      if (ref[s] && bar[s] && JSON.stringify(ref[s]) === JSON.stringify(bar[s])) {
        score += 0.25;
      }
    }
  }

  return score;
}

//crossover function
function crossover(a, b) {
  const child = {};
  for (let i = 0; i < STEPS; i++) {
    const pick = Math.random();
    if (pick < 0.45 && a[i]) child[i] = [...a[i]];
    else if (pick < 0.9 && b[i]) child[i] = [...b[i]];
  }
  return compactBar(child);
}

//mutation function
function mutate(bar) {
  const newBar = {};
  for (let i = 0; i < STEPS; i++) {
    newBar[i] = bar[i] ? [...bar[i]] : [];
  }

  for (let i = 0; i < STEPS; i++) {
    if (Math.random() < MUTATION_RATE) {
      const action = Math.random();
      if (action < 0.4) {
        if (SNARE_POS.has(i) || FILL_STEPS.has(i)) {
          if (!newBar[i].includes("snare")) newBar[i].push("snare");
        } else if (KICK_PRIMARY.has(i) || KICK_SYNCOP.has(i) || FILL_STEPS.has(i)) {
          if (!newBar[i].includes("kick")) newBar[i].push("kick");
        } else if (HIHAT_EIGHTHS.includes(i)) {
          if (!newBar[i].includes("hihat")) newBar[i].push("hihat");
        }
      } else if (action < 0.75) {
        if (newBar[i].length > 0) {
          newBar[i].splice(Math.floor(Math.random()*newBar[i].length), 1);
        }
      } else {
        const replacement = [];
        if (HIHAT_EIGHTHS.includes(i) && Math.random() < 0.9) replacement.push("hihat");
        if (KICK_PRIMARY.has(i) && Math.random() < 0.8) replacement.push("kick");
        if ((i === 4 || i === 12) && Math.random() < 0.9) replacement.push("snare");
        newBar[i] = replacement;
      }
    }
  }

  return compactBar(newBar);
}

//evolving one bar
function evolveBar() {
  let population = Array.from({length: POPULATION_SIZE}, () =>
    Math.random() < 0.5 ? datasetSeed() : randomBar()
  );

  for (let gen = 0; gen < GENERATIONS; gen++) {
    const scored = population.map(b => ({bar:b, score:fitness(b)}))
      .sort((x,y) => y.score - x.score);

    const survivors = scored.slice(0, Math.max(1, Math.floor(POPULATION_SIZE*0.2))).map(s=>s.bar);
    const newPop = [...survivors];

    while (newPop.length < POPULATION_SIZE) {
      const A = survivors[Math.floor(Math.random()*survivors.length)];
      const B = survivors[Math.floor(Math.random()*survivors.length)];
      let child = crossover(A,B);
      child = mutate(child);
      newPop.push(child);
    }

    population = newPop;
  }

  // returning best bar
  return population.map(b => ({bar:b, score:fitness(b)})).sort((x,y)=>y.score-x.score)[0].bar;
}

function addFill(bar) {
  // ensuring we don't break snare rule
  bar[14] = bar[14] ? Array.from(new Set([...bar[14], "snare"])) : ["snare"];
  bar[15] = bar[15] ? Array.from(new Set([...bar[15], "snare","kick"])) : ["snare","kick"];
  return compactBar(bar);
}

//generate full track
function generateDrumTrack() {
  const bars = Array.from({length: BARS}, () => evolveBar());

  // Controlled fills at bars 4 and 8]
  bars[3] = addFill(bars[3]);
  bars[7] = addFill(bars[7]);

  // Controlled crash accents at section starts
  bars[0] = bars[0] || {};
  bars[0][0] = Array.from(new Set([...(bars[0][0]||[]), "crash", "kick"]));
  bars[4] = bars[4] || {};
  bars[4][0] = Array.from(new Set([...(bars[4][0]||[]), "crash", "kick"]));

  const safeBars = bars.map(b => compactBar(b));

  return {
    instrument: "drums",
    stepsPerBar: STEPS,
    patterns: { full: safeBars },
    bpm: BPM,
    timeSignature: TIME_SIGNATURE,
    bars: BARS,
    secondsPerBar,
    totalDurationSeconds
  };
}

//writing output in JSON
const track = generateDrumTrack();
fs.writeFileSync("drums.json", JSON.stringify(track, null, 2));
console.log("Glam Rock track generated: drums.json");
console.log(`${BPM} BPM • ${BARS} bars • ${totalDurationSeconds}s`);
