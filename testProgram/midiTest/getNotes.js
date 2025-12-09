//FOR IMPORTING THE JSON FILE TO THE

import data_getItOn from './midi_json/getItOn.json' with { type: "json" };
import data_jeanGenie from './midi_json/JeanGenie.json' with { type: "json" };
import data_rebelRebel from './midi_json/RebelRebel.json' with { type: "json" };
import data_jeepster from './midi_json/Jeepster.json' with {type: "json" };
import data_jitterbug from './midi_json/JitterBug.json' with {type: "json"};

/*
const data_getItOn = require('./midi_json/getItOn.json');
const data_jeanGenie = require('./midi_json/JeanGenie.json');
const data_rebelRebel = require('./midi_json/RebelRebel.json');
const data_jeepster = require('./midi_json/Jeepster.json');
const data_jitterbug = require('./midi_json/JitterBug.json');
*/

console.log("GET IT ON [DATA]:");
console.log(getAmountNotes(data_getItOn, "acoustic guitar (steel)", 0, 2));
console.log(chordPerTime(data_getItOn, "acoustic guitar (steel)", 0, 2));

let getItOn_Chords = chordPerTime(data_getItOn, "acoustic guitar (steel)", 0, 2);

console.log("JEAN GENIE [DATA]:");
console.log(getAmountNotes(data_jeanGenie, "distortion guitar", 110, 0));
console.log(chordPerTime(data_jeanGenie, "distortion guitar", 110, 0));

let jeanGenie_Chords = chordPerTime(data_jeanGenie, "distortion guitar", 110, 0);

console.log("REBEL REBEL [DATA]:");
console.log(getAmountNotes(data_rebelRebel, "overdriven guitar", 0, 1));
console.log(chordPerTime(data_rebelRebel, "overdriven guitar", 0, 1));

let rebelRebel_Chords = chordPerTime(data_rebelRebel, "overdriven guitar", 0, 1);


console.log("JEEPSTER [DATA]:");
console.log(getAmountNotes(data_jeepster, "overdriven guitar", 49, 0));
console.log(chordPerTime(data_jeepster, "overdriven guitar", 49, 0));

let jeepster_Chords = chordPerTime(data_jeepster, "overdriven guitar", 49, 0);

console.log("JITTERBUG [DATA]:");
console.log(getAmountNotes(data_jitterbug, "distortion guitar", 0, 2));
console.log(chordPerTime(data_jitterbug, "distortion guitar", 0, 2));

let jitterbug_Chords = chordPerTime(data_jitterbug, "distortion guitar", 0, 2);


console.log("MAPS ALL VALUES TO THE NEXT CHORD FOR THE MATRIX");
let mappedChords_getItOn = mapBetweenChords(getItOn_Chords);
let mappedChords_jeanGenie = mapBetweenChords(jeanGenie_Chords);
let mappedChords_rebelRebel = mapBetweenChords(rebelRebel_Chords);
let mappedChords_jeepster = mapBetweenChords(jeepster_Chords);
let mappedChords_jitterbug = mapBetweenChords(jitterbug_Chords);

//GETTING ALL CHAINS
const chain1 = buildMarkovChain(mappedChords_getItOn);
const chain2 = buildMarkovChain(mappedChords_jeanGenie);
const chain3 = buildMarkovChain(mappedChords_rebelRebel);
const chain4 = buildMarkovChain(mappedChords_jeepster);
const chain5 = buildMarkovChain(mappedChords_jitterbug);

mergeChains(chain1, chain2);
mergeChains(chain1, chain3);
mergeChains(chain1, chain4);
mergeChains(chain1, chain5);

const probabilities = computeProbabilities(chain1);

//console.log("Raw Markov Chain:", chain1);
//console.log("Probability Table:", probabilities);

//onsole.log(Object.keys(chain1));
var testChildren = 0;
while(testChildren == 0){
    testChildren = evaluation(20, chain1); //Tests with 20 children
}
var steps_16 = makeIntoBar(testChildren[0]); //Gets the first child
//Makes it into 8 bars x 16 steps 
let bar_8 = [];
for(let i = 0; i < 8; i++){
    bar_8.push(steps_16);
}
console.log("8 BARS X 16 STEPS");
console.log(bar_8);
export {bar_8};



//MAKE THE ENTIRE ARRAY OF 16 NOTES
function makeIntoBar(child){
    var perBar = [];
    for(let s = 0; s < 16; s++){
        var roundIndex = s % child.length;
        var toNum = parseNum(child[roundIndex])
        perBar.push(toNum);
    }
    console.log(perBar);
    return perBar;
}

function parseNum(num){
    console.log("THING TO PARSE: ", num);
    if(Array.isArray(num) && num.length > 1){
        console.log("CHORDS", num);
        for(let x = 0; x < num.length; x++){
            num[x] = parsePitch(num[x]);
        }
    }else{
        console.log("NOTE", num);
        num = parsePitch(num+"");
    }
    return num;
}

function parsePitch(str) {
    console.log("STRING =",str);
    const table = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const base = table[str[0]];
    let semitone = base;
    let octave;
    console.log(base);
    //IF '#' is present, then do the semitone as sharp, else we use the 
    const isSharp = (str[1] === "#");
    if(isSharp){
        semitone += 1;
        octave = parseInt(str[2]); 
    }else{
        octave = parseInt(str[1]);
    }
    console.log(semitone + octave * 12);
    return semitone + octave * 12;
}

function insertRandomGaps(child, gapChance = 0.3) {
    const mutated = [];

    for (let i = 0; i < child.length; i++) {
        // add the original chord
        mutated.push(child[i]);

        // randomly decide to insert a gap AFTER it
        if (Math.random() < gapChance) {
            mutated.push(NaN); // the gap
        }
    }

    return mutated;
}

function hasTripleRepeat(sequence) {
    let count = 1;

    for (let i = 1; i < sequence.length; i++) {
        // Check deep equality
        const prev = JSON.stringify(sequence[i - 1]);
        const curr = JSON.stringify(sequence[i]);

        if (prev === curr) {
            count++;
            if (count >= 3) return false;  // found 3 repeats
        } else {
            count = 1; // reset
        }
    }
    return true;
}


function evaluation(memberSize, chain){
    let counter = 0;
    let children = [];
    while(counter != memberSize){
        const randomItem = randomKey(chain);
        const generated = generateSequence(probabilities, randomItem, 128);
        console.log(`Generated Sequence ${counter+1} :`, generated);
        children.push(generated);
        counter++;
        //var normGeneration = normalizeArray(generated);
    }
    //TESTING LENGTH OF CHORDS == 4
    children = removeDuplicateChildren(children);
    children = children.map(child => insertRandomGaps(child, 0.4));
    children = children.filter(child => child.length > 15);
    children = children.filter(child => countAllNaNs(child) < 5);
    children = children.filter(child => hasTripleRepeat(child));
    console.log("CHILDREN ALIVE:",children.length);
    console.log(children);
    return children;
}

function removeDuplicateChildren(children) {
    const seen = new Set();

    return children.filter(child => {
        const key = JSON.stringify(child);  // deep identity
        
        if (seen.has(key)) {
            return false; // duplicate -> filtered out
        }

        seen.add(key);
        return true;
    });
}

function countAllNaNs(children) {
    let count = 0;

    function scan(value) {
        if (Array.isArray(value)) {
            value.forEach(scan); // recursive for arrays
        } else {
            // Only NaN is not equal to itself
            if (value !== value) count++;
        }
    }

    scan(children);
    return count;
}


function normalizeArray(arr){
    let i = 0;
    for(const data of arr){
        if(Array.isArray(data) && data.length > 1){
            arr[i] = data;
        }else{
            arr[i] = '' + data;
        }
        i++;
    }
    return arr;
}

function mergeChains(chainA, chainB) {
    for (const state in chainB) {
        if (!chainA[state]) chainA[state] = {};

        for (const curr in chainB[state]) {
            if (!chainA[state][curr]) chainA[state][curr] = {};

            for (const next in chainB[state][curr]) {
                chainA[state][curr][next] =
                    (chainA[state][curr][next] || 0) + chainB[state][curr][next];
            }
        }
    }
}


function buildMarkovChain(map) {
    const chain = {}; // final result
    
    for (const [state, sequences] of map) {
        if (!chain[state]) chain[state] = {};

        for (const sequence of sequences) {
            for (let i = 0; i < sequence.length - 1; i++) {
                const current = sequence[i];
                const next = sequence[i + 1];

                // Convert arrays or objects to JSON strings for stability
                const currKey = typeof current === "string" ? current : JSON.stringify(current);
                const nextKey = typeof next === "string" ? next : JSON.stringify(next);

                if (!chain[state][currKey]) chain[state][currKey] = {};
                if (!chain[state][currKey][nextKey]) chain[state][currKey][nextKey] = 0;

                chain[state][currKey][nextKey]++;
            }
        }
    }
    return chain; // only raw counts for now
}

function computeProbabilities(chain) {
    const probs = {};

    for (const state in chain) {
        probs[state] = {};

        for (const curr in chain[state]) {
            const transitions = chain[state][curr];
            const total = Object.values(transitions).reduce((a, b) => a + b, 0);
            probs[state][curr] = {};
            for (const next in transitions) {
                probs[state][curr][next] = transitions[next] / total;
            }
        }
    }

    return probs;
}


// helper: pick a random key from an object
function randomKey(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

function weightedRandom(probTable) {
  const r = Math.random();
  let acc = 0;
  for (const key in probTable) {
    acc += probTable[key];
    if (r <= acc) return key;
  }
  // fallback
  return Object.keys(probTable)[0];
}

/**
 * normalize a nextKey like '["A2","E3"]' into outer-state key "A2,E3"
 * If it is already plain like "A2,E3" return as-is.
 */
function normalizeStateKey(key) {
  if (typeof key !== "string") return String(key);
  key = key.trim();
  if (key.startsWith("[")) {
    try {
      const arr = JSON.parse(key);
      // join with comma to match the outer map keys you showed: "A2,E3"
      return arr.join(",");
    } catch (e) {
      // fallback: remove brackets and quotes
      return key.replace(/[\[\]\s"]/g, "");
    }
  }
  return key;
}

/**
 * Generate a sequence from the probability table.
 * - probTable has shape: probTable[state][curr][next] = probability
 * - startState is a state key (like "E2,B2")
 */
function generateSequence(probTable, startState, length = 16) {
    var firstItem;
    if(startState.match(",")){
        firstItem = startState.split(",");
    }else firstItem = startState;
    const result = [firstItem];
    // ensure startState exists
    if (!probTable[startState]){ 
        console.log("THIS DOESN'T EXIST");
        return result;
    }

    // pick an initial 'curr' (one of the keys inside that state)
    let state = startState;
    let curr = randomKey(probTable[state]); // curr is e.g. '["E2","B2"]' or '["E2"]' etc.

    //MAKES A PATTERN FOR 16 STEPS
    for (let i = 0; i < 16; i++) {
        const transitions = probTable[state] && probTable[state][curr];
        if (!transitions) {
        // if there is no transitions for this curr in this state try to pick a different curr inside state
            if (probTable[state]) {
                curr = randomKey(probTable[state]);
                continue; // attempt again with new curr
            }
            break; // no where to go
        }
        // pick the next (this is a string representation like '["A2","E3"]' or plain)
        const nextKey = weightedRandom(transitions);
        result.push(nextKey);

        // move to the next state (outer key) that corresponds to nextKey
        const nextState = normalizeStateKey(nextKey);

        // set up for the next loop:
        // prefer continuing with the same curr string (nextKey) if it exists inside the nextState
        if (probTable[nextState] && probTable[nextState][nextKey]) {
            state = nextState;
            curr = nextKey;
        } else if (probTable[nextState]) {
            // pick a random curr inside the new state
            state = nextState;
            curr = randomKey(probTable[state]);
        } else {
        // cannot continue to a new state's transitions -> terminate
        break;
        }
    }
    
    // try to parse JSON-looking results, otherwise return as strings
    return result.map(v => {
        try { return JSON.parse(v); } catch { return v; }
    });
}



function mapBetweenChords(mapData_Chords){
    var chordMap = new Map();
    var arrValues = Array.from(mapData_Chords.values());
    let nextValue;
    let i = 0;
    while(i < mapData_Chords.size - 1){
        let currentValue = arrValues[i][0]+"";
        nextValue = arrValues[i+1][0];
        if(chordMap.has(currentValue)){
            let arrNextChords = chordMap.get(currentValue);
            arrNextChords[0].push(nextValue);
        }else{
            chordMap.set(currentValue, [nextValue]);
        }
        i++;
    }
    return chordMap;
}

function getAmountNotes(jsonOBJ, instrument, timeStart, channel){
    var arrNotes = new Map();
    //Starts by knowing which is the Instrument in the JSON file
    
    for(var i = 0; i < jsonOBJ.tracks.length; i++){
        if(
            jsonOBJ.tracks[i].instrument.name == instrument 
            && jsonOBJ.tracks[i].channel == channel
        ){
            //Searches through the notes
            for(var j = timeStart; j < 128 + timeStart; j++){
                var noteName = jsonOBJ.tracks[i].notes[j].name;
                if(arrNotes.has(noteName)){
                    let count = arrNotes.get(noteName);
                    arrNotes.set(noteName, ++count);
                }else{
                    arrNotes.set(noteName, 1);
                }
            }
            break;
        }
    }
    return arrNotes;
}

//To know how chords are stick to each other
function chordPerTime(jsonOBJ, instrument, timeStart, channel){
    var arrChords = new Map();
    const PPQ = jsonOBJ.header.ppq;
    for(var i = 0; i < jsonOBJ.tracks.length; i++){
        if(
            jsonOBJ.tracks[i].instrument.name == instrument 
            && jsonOBJ.tracks[i].channel == channel
        ){
            for(var j = timeStart; j < 128 + timeStart; j++){
                //console.log(data.tracks[i].notes[j].name);
                let time = "TIME: "+jsonOBJ.tracks[i].notes[j].time;
                let noteName = jsonOBJ.tracks[i].notes[j].name;

                let beatDuration = jsonOBJ.tracks[i].notes[j].durationTicks / PPQ;
                let fractDuration = quantizeDur(beatDuration);
                if(arrChords.has(time)){
                    let chordsInside = arrChords.get(time);
                    chordsInside[0].push(noteName);
                    arrChords.set(time, chordsInside);
                }else{
                    arrChords.set(time, [[noteName], fractDuration]);
                }
            }
            break;
        }
    }
    return arrChords;
}

function quantizeDur(d) {
    if (d < 0.20) return "1/8";
    if (d < 0.40) return "1/4";
    if (d < 0.75) return "1/2";
    return "1";
}
